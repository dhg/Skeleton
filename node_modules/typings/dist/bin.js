#!/usr/bin/env node
"use strict";
var minimist = require('minimist');
var wordwrap = require('wordwrap');
var path_1 = require('path');
var updateNotifier = require('update-notifier');
var extend = require('xtend');
var events_1 = require('events');
var cli_1 = require('./support/cli');
var aliases_1 = require('./aliases');
var pkg = require('../package.json');
var IS_PRODUCTION = process.env.NODE_ENV === 'production';
var argv = minimist(process.argv.slice(2), {
    boolean: ['version', 'save', 'saveDev', 'savePeer', 'ambient', 'verbose', 'dev', 'production'],
    string: ['cwd', 'out', 'name'],
    alias: {
        ambient: ['A'],
        version: ['v'],
        save: ['S'],
        saveDev: ['save-dev', 'D'],
        savePeer: ['savePeer', 'P'],
        verbose: ['V'],
        out: ['o'],
        help: ['h']
    }
});
var cwd = process.cwd();
var emitter = new events_1.EventEmitter();
var isDev = IS_PRODUCTION ? argv.dev : !argv.production;
var args = extend({ cwd: cwd, emitter: emitter }, argv, { dev: isDev, production: !isDev });
updateNotifier({ pkg: pkg }).notify();
exec(args);
emitter.on('enoent', function (_a) {
    var path = _a.path;
    cli_1.logWarning("Path \"" + path + "\" is missing", 'enoent');
});
emitter.on('hastypings', function (_a) {
    var name = _a.name, typings = _a.typings;
    cli_1.logWarning(("Typings for \"" + name + "\" already exist in \"" + path_1.relative(cwd, typings) + "\". You should ") +
        "let TypeScript resolve the packaged typings and uninstall the copy installed by Typings", 'hastypings');
});
emitter.on('postmessage', function (_a) {
    var message = _a.message, name = _a.name;
    cli_1.logInfo(name + ": " + message, 'postmessage');
});
emitter.on('badlocation', function (_a) {
    var raw = _a.raw;
    cli_1.logWarning("\"" + raw + "\" is a mutable location and may change, consider specifying a commit hash", 'badlocation');
});
emitter.on('deprecated', function (_a) {
    var date = _a.date, raw = _a.raw, parent = _a.parent;
    if (parent == null) {
        cli_1.logWarning(date.toLocaleString() + ": \"" + raw + "\" is deprecated (outdated or removed)", 'deprecated');
    }
    else if (parent.raw) {
        cli_1.logWarning(date.toLocaleString() + ": \"" + raw + "\" has been deprecated (used by \"" + parent.raw + "\")", 'deprecated');
    }
    else {
        cli_1.logWarning(date.toLocaleString() + ": \"" + raw + "\" has been deprecated", 'deprecated');
    }
});
function exec(options) {
    if (options._.length) {
        var command = aliases_1.aliases[options._[0]];
        var args_1 = options._.slice(1);
        if (command != null) {
            if (options.help) {
                return console.log(command.help());
            }
            return cli_1.handle(command.exec(args_1, options), options);
        }
    }
    else if (options.version) {
        console.log(pkg.version);
        return;
    }
    var wrap = wordwrap(4, 80);
    console.log("\nUsage: typings <command>\n\nCommands:\n" + wrap(Object.keys(aliases_1.aliases).sort().join(', ')) + "\n\ntypings <command> -h   Get help for <command>\ntypings <command> -V   Enable verbose logging\n\ntypings --version      Print the CLI version\n\ntypings@" + pkg.version + " " + path_1.join(__dirname, '..') + "\n");
}
//# sourceMappingURL=bin.js.map