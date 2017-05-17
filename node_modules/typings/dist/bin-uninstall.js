#!/usr/bin/env node
"use strict";
var Promise = require('any-promise');
var typings_core_1 = require('typings-core');
var cli_1 = require('./support/cli');
function help() {
    return "\ntypings uninstall <name> [--save|--save-dev|--save-peer] [--ambient]\n\nOptions:\n  [--save|-S]       Remove from \"dependencies\"\n  [--save-dev|-D]   Remove from \"devDependencies\"\n  [--save-peer|-P]  Remove from \"peerDependencies\"\n  [--ambient|-A]    Remove from the ambient version of dependencies\n    [-SA]           Remove from \"ambientDependencies\"\n    [-DA]           Remove from \"ambientDevDependencies\"\n\nAliases: r, rm, remove, un\n";
}
exports.help = help;
function exec(args, options) {
    if (args.length === 0) {
        cli_1.logError(help());
        return;
    }
    return Promise.all(args.map(function (name) {
        return typings_core_1.uninstallDependency(name, options);
    }));
}
exports.exec = exec;
//# sourceMappingURL=bin-uninstall.js.map