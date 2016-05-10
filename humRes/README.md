# Human Resources Machine comment parsing library

This library parses the compressed comment structure used in the game [Human Resources Machine](http://tomorrowcorporation.com/humanresourcemachine) by [Tomorrow Corporation](http://tomorrowcorporation.com/).

In addition, there are also functions to build new comment strings from line lists, and to convert line lists into both SVG and EPS documents.

## Parsing comments

To parse a comment string, use the `parse` function:

Example:
```js
var humRes = require("./humRes");
var comment = "";

humRes.parse("eJxjYmBgqBGQVWcYBaNgFIxIAABLegDT;", function(err, lines) {
    if (err) {
	    console.log("Error parsing comment string:", err);
	} else {
	    // Do something interesting with the lines
		console.log("Found %d line(s)", lines.length);
	}
});
```

The returned `lines` list is an array of arrays, containing point objects with x and y properties in the range 0.0 - 1.0.

## Using line lists

Line lists can be converted to either SVG or EPS documents using the `asSVG` and `asEPS` methods respectively

Example:
```js
var svg = humRes.asSVG(lines);
var eps = humRes.asEPS(lines);
```

## Creating comments

Comments can also be built from line lists using the `stringify` function:

Example:
```js
humRes.stringify(lines, function(err, str) {
    if (err) {
	    console.log("Failed to build comment string:", err);
	} else {
	    // Do something interesting with string here
		console.log(str);
	}
```
