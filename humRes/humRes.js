"use strict";

(function(exports) {
	var zlib = require("zlib");
	
	/**
	 * Parses a Human Resource Machine comment string into a line list
	 * Coordinates are normalised into 0.0 - 1.0 range
	 * @param {string} data Comment string
	 * @param {function(Error, Buffer)} cb Callback
	 */
	exports.parse = function(data, cb) {
		// Decode and decompress
		zlib.inflate(new Buffer(data.replace(/[\r\n;]+/g, ""), "base64"), function(err, buf) {
			if (err) { return cb(err); }
			
			// Grab point count
			var pointCount = buf.readUInt32LE(0);
			if (pointCount === 0) { cb(null, []); }
			
			var lines = [], points = [];
			
			// Read lines
			for (var i = 0, pos = 4; i < pointCount; ++i, pos += 4) {
				var x = buf.readUInt16LE(pos + 0);
				var y = buf.readUInt16LE(pos + 2);
				
				if ((x | y) === 0) {
					// End of line
					lines.push(points);
					points = [];
				} else {
					// Add point
					points.push({ x: x / 0xFFFF, y: y / 0xFFFF });
				}
			}
			
			cb(null, lines);
		});
	};
	
	/**
	 * Builds a Human Resource Machine comment string from a line list
	 * @param {{x: number, y: number}[][]} lines Line list
	 * @param {function(Error, string)} cb Callback
	*/
	exports.stringfy = function(lines, cb) {
		var buf = new Buffer(1028);
		var pos = 4;
		
		// Write lines
		for (var i = 0; i < lines.length; ++i, pos += 4) {
			var line = lines[i];
			
			if (line.length > 0) {
				// Guard against buffer overrun
				var toWrite = Math.min(line.length, ((buf.length - pos) / 4) - 1);
				
				// Write point data
				for (var j = 0; j < toWrite; ++j, pos += 4) {
					buf.writeUInt16LE(Math.round(Math.min(Math.max(line[j].x, 0.0), 1.0) * 0xFFFF), pos);
					buf.writeUInt16LE(Math.round(Math.min(Math.max(line[j].y, 0.0), 1.0) * 0xFFFF), pos + 2);
				}
				
				buf.writeUInt32LE(0, pos);
			}
		}
		
		// Write point count header
		buf.writeUInt32LE((pos - 4) / 4, 0);
		
		// Compress buffer
		zlib.deflate(buf, { level: zlib.Z_BEST_COMPRESSION }, function(err, zbuf) {
			if (err) { return cb(err); }
			
			// Base64 encode, and fix line terminator
			var zstr = zbuf.toString("base64").replace(/=*$/, ";");
			var res = "";
			
			// Format into lines
			for (var i = 0; i < zstr.length; i += 80) {
				res += zstr.substr(i, 80) + "\n";
			}
			
			cb(null, res);
		});
	};
	
	/**
	 * Converts a line list into an SVG document
	 * @param {{x: number, y: number}[][]} lines Line list
	 * @param {Object} [options] Options
	 * @param {number} [options.width=780] Document width
	 * @param {number} [options.height=256] Document height
	 * @param {number} [options.penWidth=23] Pen width
	 * @return {string} SVG document
	 */
	exports.asSVG = function(lines, options) {
		var d = "";
		options = options || { };
		options.width = Math.abs(parseFloat(options.width)) || 780;
		options.height = Math.abs(parseFloat(options.height)) || 256;
		
		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];
			
			if (line.length > 1) {
				for (var j = 0; j < line.length; ++j) {
					d += (j ? "L" : "M") + (line[j].x * options.width).toFixed(2) + "," + (line[j].y * options.height).toFixed(2) + (j === (line.length - 1) ? "" : " ");
				}
			} else if (line.length === 1) {
				d += "M" + (line[0].x * options.width).toFixed(2) + "," + (line[0].y * options.height).toFixed(2) + "z";
			}
		}
		
		return ("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + options.width + "px\" height=\"" + options.height + "px\">\n<path d=\"") + d +
			("\" fill=\"none\" stroke=\"black\" stroke-width=\"" + Math.abs(parseFloat(options.penWidth) || 23) + "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />\n</svg>");
	};
	
	/**
	 * Converts a line list into an EPS document
	 * @param {{x: number, y: number}[][]} lines Line list
	 * @param {Object} [options] Options
	 * @param {number} [options.width=780] Document width
	 * @param {number} [options.height=256] Document height
	 * @param {number} [options.penWidth=23] Pen width
	 * @return {string} EPS document
	 */
	exports.asEPS = function(lines, options) {
		var d = "";
		options = options || { };
		options.width = Math.abs(parseFloat(options.width)) || 780;
		options.height = Math.abs(parseFloat(options.height)) || 256;
		
		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];
			
			if (line.length > 1) {
				for (var j = 0; j < line.length; ++j) {
					d += (line[j].x * options.width).toFixed(2) + " " + (options.height + (line[j].y * -options.height)).toFixed(2) + (j ? " L " : " M ");
				}
			} else if (line.length === 1) {
				d += (line[0].x * options.width).toFixed(2) + " " + (options.height + (line[0].y * -options.height)).toFixed(2) + " M z ";
			}
		}
		
		return ("%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 " + options.width + " " + options.height +
			"\n%%BeginProlog\n/M { moveto } bind def\n/L { lineto } bind def\n/z { closepath } bind def\n%%EndProlog\n0 setgray\n1 setlinecap\n1 setlinejoin\n" +
			Math.round(Math.abs(parseFloat(options.penWidth) || 23)) + " setlinewidth\n") + d + "\nstroke\n%%EOF\n";
	};
}(exports));
