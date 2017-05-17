#!/usr/bin/env node
var startOpts  = require("../lib/cli/opts.start.json");
var reloadOpts = require("../lib/cli/opts.reload.json");
var recipeOpts = require("../lib/cli/opts.recipe.json");
var pkg        = require("../package.json");
var utils      = require("../lib/utils");

/**
 * Handle cli input
 */
if (!module.parent) {
    var yargs = require("yargs")
        .command("start", "Start the server")
        .command("init", "Create a configuration file")
        .command("reload", "Send a reload event over HTTP protocol")
        .command("recipe", "Generate the files for a recipe")
        .version(function () {
            return pkg.version;
        })
        .epilogue("For help running a certain command, type <command> --help\neg: $0 start --help");

    var argv    = yargs.argv;
    var command = argv._[0];
    var valid   = ["start", "init", "reload", "recipe"];

    if (valid.indexOf(command) > -1) {
        handleIncoming(command, yargs.reset());
    } else {
        yargs.showHelp();
    }
}

/**
 * @param {{cli: object, [whitelist]: array, [cb]: function}} opts
 * @returns {*}
 */
function handleCli(opts) {

    opts.cb = opts.cb || utils.defaultCallback;
    return require("../lib/cli/command." + opts.cli.input[0])(opts);
}

module.exports = handleCli;

/**
 * @param {string} command
 * @param {object} yargs
 */
function handleIncoming(command, yargs) {
    var out;
    if (command === "start") {
        out = yargs
            .usage("Usage: $0 start [options]")
            .options(startOpts)
            .example("$0 start -s app", "- Use the App directory to serve files")
            .example("$0 start -p www.bbc.co.uk", "- Proxy an existing website")
            .help()
            .argv;
    }
    if (command === "init") {
        out = yargs
            .usage("Usage: $0 init")
            .example("$0 init")
            .help()
            .argv;
    }
    if (command === "reload") {
        out = yargs
            .usage("Usage: $0 reload")
            .options(reloadOpts)
            .example("$0 reload")
            .example("$0 reload --port 4000")
            .help()
            .argv;
    }
    if (command === "recipe") {
        out = yargs
            .usage("Usage: $0 recipe <recipe-name>")
            .option(recipeOpts)
            .example("$0 recipe ls", "list the recipes")
            .example("$0 recipe gulp.sass", "use the gulp.sass recipe")
            .help()
            .argv;
    }

    if (out.help) {
        return yargs.showHelp();
    }

    handleCli({cli: {flags: out, input: out._}});
}
