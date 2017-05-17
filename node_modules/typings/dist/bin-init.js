#!/usr/bin/env node
"use strict";
var typings_core_1 = require('typings-core');
function help() {
    return "\ntypings init\n\nOptions:\n  [--upgrade]    Upgrade `tsd.json` to `typings.json`\n";
}
exports.help = help;
function exec(args, options) {
    return typings_core_1.init(options);
}
exports.exec = exec;
//# sourceMappingURL=bin-init.js.map