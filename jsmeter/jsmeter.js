exports.jsmeter = (function () {
	var basePath = process.cwd(),
		fs = require("fs"),
		tokens = require("./tokens"),
		results = [],
		events = require("events");
	tokens.setup();
	
	var SimpleEventedObject = function () {
		events.EventEmitter.call(this);
	};
	SimpleEventedObject.super_ = events.EventEmitter;
	SimpleEventedObject.prototype = Object.create(events.EventEmitter.prototype, {
		constructor : {
			value : SimpleEventedObject,
			enumerable : false
		}
	});
	
	var runJsmeter = function (source, name) {
		var result = [];
		try {
			var parse = require("./parse").make_parse(),
				tree = parse(source),
				complexity = require("./complexity").make_complexity();
				out = {
					text : "",
					write : function (data) {
						this.text += data;
					}
				};
			complexity.complexity(tree, name);
			complexity.renderStats(out, "JSON");
						
			result = JSON.parse(out.text);
		} catch (ex) {
			console.log("exception: " + ex);
			console.dir(tree);
		}
		delete parse;
		delete source;
		delete tree;
		
		return result;
	};
	
	start();
	
	return {
		run : runJsmeter
	};
})();