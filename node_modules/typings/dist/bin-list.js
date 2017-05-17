#!/usr/bin/env node
"use strict";
var cli_1 = require('./support/cli');
var typings_core_1 = require('typings-core');
function help() {
    return "\ntypings list\n\nOptions:\n  [--production] List only production dependencies (omit dev dependencies)\n\nAliases: la, ll, ls\n";
}
exports.help = help;
function exec(args, options) {
    return typings_core_1.list(options)
        .then(function (tree) {
        console.log(cli_1.archifyDependencyTree({ tree: tree }));
    });
}
exports.exec = exec;
//# sourceMappingURL=bin-list.js.map