"use strict";
var parse_1 = require('./utils/parse');
function open(raw, options) {
    if (options === void 0) { options = {}; }
    var dependency = parse_1.parseDependency(raw);
    return dependency.location;
}
exports.open = open;
//# sourceMappingURL=open.js.map