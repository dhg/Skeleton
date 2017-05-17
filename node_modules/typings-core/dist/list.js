"use strict";
var events_1 = require('events');
var dependencies_1 = require('./lib/dependencies');
function list(options) {
    var cwd = options.cwd;
    var dev = !options.production;
    var emitter = options.emitter || new events_1.EventEmitter();
    return dependencies_1.resolveTypeDependencies({ cwd: cwd, ambient: true, dev: dev, emitter: emitter });
}
exports.list = list;
//# sourceMappingURL=list.js.map