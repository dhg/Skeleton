"use strict";
var typings_core_1 = require('typings-core');
var cli_1 = require('./support/cli');
function help() {
    return "\ntypings open <location>\n\n  <location>  A known Typings location with scheme (see typings install -h)\n";
}
exports.help = help;
function exec(args) {
    if (args.length === 0) {
        cli_1.logError(help());
        return;
    }
    console.log(typings_core_1.open(args[0]));
}
exports.exec = exec;
//# sourceMappingURL=bin-open.js.map