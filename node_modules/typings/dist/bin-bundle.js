#!/usr/bin/env node
"use strict";
var typings_core_1 = require('typings-core');
function help() {
    return "\ntypings bundle --out <directory>\n\nOptions:\n  [--out|-o] <directory> The bundled output directory\n  [--name] <name>        Bundle module name\n  [--ambient|-A]         Bundle as an ambient definition\n";
}
exports.help = help;
function exec(args, options) {
    return typings_core_1.bundle(options);
}
exports.exec = exec;
//# sourceMappingURL=bin-bundle.js.map