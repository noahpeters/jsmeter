exports.jsmeter = (function () {
	var tokens = require("./tokens"),
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
				complexity = require("./complexity").make_complexity(),
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
        
		return result;
	};
	
	return {
		run : runJsmeter
	};
})();