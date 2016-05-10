"use strict";

var humRes = require("./humRes");
var comment = "eJyrZmBg0OOKsArltU3wFbBdCuQyyAr0ZLsKf8zrFF9S8Fi+KR8kpisTYcUh9z2gUIFp0lvFzEUgsata\n" +
			  "n6s36HyuVjHUKm02bMr/aiCbs1tvevoDnZ0Zk7Xtc8u0dpe+0ORqFNcqnJiifXoGv+7BOY5Gj+f2GhvM\n" +
			  "AelfZJ5k5mdZmjbJdtV0EL/CcbfBF6cod2k36xkg/iT/7KxnvjNLInw3tYn58fYl+U+eVB6cPvVIyJbJ\n" +
			  "58JWdPWE3ymLCW/Kzw/7k5Uawpa+M6g0DaTvfy6bUmSZ9Yxd1U9Tj9QWR26qOxju3MLQWttWOHFWO2+f\n" +
			  "QvcWP4m+O4Ygtf3TzyY8ntqQdHPyupyeSaK1eybtbXKa9rrnx8yoHqY5E1snznlZnzhnevri2QuTZ86M\n" +
			  "S2SYDsRAsHm5RkbIcr9mxxUBEx4t98zUX/k0dcbqkNSrm6ang+TP79IyENz1uVpvt+sUcPid/ZPVdFoj\n" +
			  "o/ykRsaZ49lZpUe8y34e4mr8eWhT26Sjc/u6TgRMeHg6qkf3rHP7xYsB3vsu9RkvvKhj+/jCwuT4Syu6\n" +
			  "ai4zTQKZo//EU+Xowyj31/c5SkD81/frZoFoCQnru6uVai6tMrl3Qs814kh1fvKBK50tB9+v23v88ynx\n" +
			  "82HPO24zjIJRgAUAAJwT0cs;"

var fs = require("fs");

// Read example comment
humRes.parse(comment, function(err, lines) {
	if (err) {
		console.log("Error parsing comment:", err);
	} else {
		// Build EPS and save
		fs.writeFile("comment.eps", humRes.asEPS(lines), function(err) {
			console.log(err ? "Failed to write EPS: " + err : "EPS written OK");
		});
		
		// Build SVG and save
		fs.writeFile("comment.svg", humRes.asSVG(lines), function(err) {
			console.log(err ? "Failed to write SVG: " + err : "SVG written OK");
		});
		
		// Build new comment and save
		humRes.stringfy(lines, function(err, str) {
			if (err) {
				console.log("Error building comment:", err);
			} else {
				fs.writeFile("comment.asm", str, function(err) {
					console.log(err ? "Failed to write Comment: " + err : "Comment written OK");
				});
			}
		});
	}
});
