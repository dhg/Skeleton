#!/usr/bin/env node
"use strict";
var Promise = require('any-promise');
var typings_core_1 = require('typings-core');
var listify = require('listify');
var cli_1 = require('./support/cli');
function help() {
    return "\ntypings install (with no arguments, in package directory)\ntypings install [<name>=]<location>\n\n  <name>      Module name of the installed definition\n  <location>  The location to read from (described below)\n\nValid Locations:\n  [<source>!]<pkg>[@<version>][#<tag>]\n  file:<path>\n  github:<org>/<repo>[/<path>][#<commitish>]\n  bitbucket:<org>/<repo>[/<path>][#<commitish>]\n  npm:<pkg>[/<path>]\n  bower:<pkg>[/<path>]\n  http(s)://<host>/<path>\n\n  <source>    The registry mirror (E.g. \"npm\", \"bower\", \"env\", \"global\", \"dt\", ...)\n  <path>      Path to a `.d.ts` file or `typings.json`\n  <host>      A domain name (with optional port)\n  <version>   A semver range (E.g. \">=4.0\")\n  <tag>       The specific tag of a registry entry\n  <commitish> A git commit, tag or branch\n\nOptions:\n  [--save|-S]       Persist to \"dependencies\"\n  [--save-dev|-D]   Persist to \"devDependencies\"\n  [--save-peer|-P]  Persist to \"peerDependencies\"\n  [--ambient|-A]    Install and persist as an ambient definition\n    [-SA]           Persist to \"ambientDependencies\"\n    [-DA]           Persist to \"ambientDevDependencies\"\n  [--production]    Install only production dependencies (omits dev dependencies)\n\nAliases: i, in\n";
}
exports.help = help;
function exec(args, options) {
    var emitter = options.emitter;
    if (args.length === 0) {
        return typings_core_1.install(options)
            .then(function (result) {
            console.log(cli_1.archifyDependencyTree(result));
        });
    }
    var references = [];
    emitter.on('reference', function (_a) {
        var reference = _a.reference, name = _a.name;
        if (references.indexOf(reference) === -1) {
            cli_1.logInfo("Stripped reference \"" + reference + "\" during installation from \"" + name + "\"", 'reference');
            references.push(reference);
        }
    });
    emitter.on('ambientdependencies', function (_a) {
        var name = _a.name, dependencies = _a.dependencies;
        var deps = Object.keys(dependencies).map(function (x) { return JSON.stringify(x); });
        if (deps.length) {
            cli_1.logInfo("\"" + name + "\" lists ambient dependencies on " + listify(deps) + " and should be installed", 'ambientdependencies');
        }
    });
    return Promise.all(args.map(function (arg) {
        return typings_core_1.installDependencyRaw(arg, options);
    }))
        .then(function (results) {
        for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
            var result = results_1[_i];
            console.log(cli_1.archifyDependencyTree(result));
        }
    });
}
exports.exec = exec;
//# sourceMappingURL=bin-install.js.map