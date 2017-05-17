"use strict";
var columnify = require('columnify');
var typings_core_1 = require('typings-core');
var cli_1 = require('./support/cli');
function help() {
    return "\ntypings view <pkg>\n\n  <pkg>  A registry expression like `[<source>!]<pkg>`\n\nOptions:\n  [--versions]    List all package versions\n  [--ambient|-A]  View `<pkg>` from the default ambient source\n\nAliases: info\n";
}
exports.help = help;
function exec(args, options) {
    if (args.length === 0) {
        cli_1.logError(help());
        return;
    }
    if (options.versions) {
        return typings_core_1.viewVersions(args[0], options)
            .then(function (versions) { return console.log(columnify(versions)); });
    }
    return typings_core_1.viewEntry(args[0], options)
        .then(function (entry) { return console.log(columnify(entry)); });
}
exports.exec = exec;
//# sourceMappingURL=bin-view.js.map