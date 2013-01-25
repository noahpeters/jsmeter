	(function () {
		var verbose = false;
		var args = process.argv;
		var fs = require("fs");
		var jsmeter = require("jsmeter").jsmeter;
		for (var a = 2; a < args.length; a++) {
			if (args[a] === "--verbose") {
				verbose = true;
				continue;
			}
			fs.readFile(args[a], "utf8", (function (name) {
				return function (err, data) {
					if (err) throw err;
					var result = jsmeter.run(data, name.match(/([^\/])\.js$/)[1]);
					for (var i = 0; i < result.length; i++) {
						if (verbose) {
							console.dir(result[i]);
						}
						console.log(name, result[i].name.replace(/^\[\[[^\]]*\]\]\.?/, ""));
						console.log(" line start: %d", result[i].lineStart);
						console.log(" lines:      %d", result[i].lines);
						console.log(" statements: %d", result[i].s);
						console.log(" comments:   %d", result[i].comments);
						console.log(" complexity: %d", result[i].complexity);
						console.log(" M.I.:       %d", result[i].mi);
					}
				};
			})(args[a]));
		}
	})();