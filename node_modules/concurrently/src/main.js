#!/usr/bin/env node

var Rx = require('rx');
var path = require('path');
var Promise = require('bluebird');
var moment = require('moment');
var program = require('commander');
var _ = require('lodash');
var chalk = require('chalk');
var spawn = Promise.promisifyAll(require('cross-spawn'));
var isWindows = /^win/.test(process.platform);

var config = {
    // Kill other processes if one dies
    killOthers: false,

    // How much in ms we wait before killing other processes
    killDelay: 1000,

    // Return success or failure of the 'first' child to terminate, the 'last' child,
    // or succeed only if 'all' children succeed
    success: 'all',

    // Prefix logging with pid
    // Possible values: 'pid', 'none', 'time', 'command', 'index', 'name'
    prefix: 'index',

    // List of custom names to be used in prefix template
    names: '',

    // What to split the list of custom names on
    nameSeparator: ',',

    // Comma-separated list of chalk color paths to use on prefixes.
    prefixColors: 'gray.dim',

    // moment format
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',

    // How many characters to display from start of command in prefix if
    // command is defined. Note that also '..' will be added in the middle
    prefixLength: 10,

    // By default, color output
    color: true,

    // If true, the output will only be raw output of processes, nothing more
    raw: false
};

function main() {
    var firstBase = path.basename(process.argv[0]);
    var secondBase = path.basename(process.argv[1]);
    if (firstBase === 'concurrent' || secondBase === 'concurrent') {
        console.error('"concurrent" command is deprecated, use "concurrently" instead.\n');
    }

    parseArgs();
    config = mergeDefaultsWithArgs(config);
    run(program.args);
}

function parseArgs() {
    program
        .version(require('../package.json').version)
        .usage('[options] <command ...>')
        .option(
            '-k, --kill-others',
            'kill other processes if one exits or dies'
        )
        .option(
            '--no-color',
            'disable colors from logging'
        )
        .option(
            '-p, --prefix <prefix>',
            'prefix used in logging for each process.\n' +
            'Possible values: index, pid, time, command, name, none, or a template. Default: ' +
            config.prefix + '. Example template: "{time}-{pid}"\n'
        )
        .option(
            '-n, --names <names>',
            'List of custom names to be used in prefix template.\n' +
            'Example names: "main,browser,server"\n'
        )
        .option(
            '--name-separator <char>',
            'The character to split <names> on.\n' +
            'Default: "' + config.nameSeparator + '". Example usage: ' +
            'concurrently -n "styles,scripts|server" --name-separator "|" <command ...>\n'
        )
        .option(
            '-c, --prefix-colors <colors>',
            'Comma-separated list of chalk colors to use on prefixes. If there are more commands than colors, the last color will be repeated.\n' +
            'Available modifiers: reset, bold, dim, italic, underline, inverse, hidden, strikethrough\n' +
            'Available colors: black, red, green, yellow, blue, magenta, cyan, white, gray\n' +
            'Available background colors: bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite\n' +
            'See https://www.npmjs.com/package/chalk for more information.\n' +
            'Default: "' + config.prefixColors + '". Example: "black.bgWhite,cyan,gray.dim"\n'
        )
        .option(
            '-t, --timestamp-format <format>',
            'specify the timestamp in moment format. Default: ' +
            config.timestampFormat + '\n'
        )
        .option(
            '-r, --raw',
            'output only raw output of processes,' +
            ' disables prettifying and concurrently coloring'
        )
        .option(
            '-s, --success <first|last|all>',
            'Return exit code of zero or one based on the success or failure ' +
            'of the "first" child to terminate, the "last" child, or succeed ' +
            ' only if "all" child processes succeed. Default: ' +
            config.success + '\n'
        )
        .option(
            '-l, --prefix-length <length>',
            'limit how many characters of the command is displayed in prefix.\n' +
            'The option can be used to shorten long commands.\n' +
            'Works only if prefix is set to "command". Default: ' +
            config.prefixLength + '\n'
        );

    program.on('--help', function() {
        var help = [
            '  Examples:',
            '',
            '   - Kill other processes if one exits or dies',
            '',
            '       $ concurrently --kill-others "grunt watch" "http-server"',
            '',
            '   - Output nothing more than stdout+stderr of child processes',
            '',
            '       $ concurrently --raw "npm run watch-less" "npm run watch-js"',
            '',
            '   - Normal output but without colors e.g. when logging to file',
            '',
            '       $ concurrently --no-color "grunt watch" "http-server" > log',
            '',
            '   - Custom prefix',
            '',
            '       $ concurrently --prefix "{time}-{pid}" "grunt watch" "http-server"',
            ''
        ];
        console.log(help.join('\n'));

        var url = 'https://github.com/kimmobrunfeldt/concurrently';
        console.log('  For more details, visit ' + url);
        console.log('');
    });

    program.parse(process.argv);
}

function mergeDefaultsWithArgs(config) {
    // This will pollute config object with other attributes from program too
    return _.merge(config, program);
}

function stripCmdQuotes(cmd) {
    // Removes the quotes surrounding a command.
    if (cmd[0] === '"' || cmd[0] === '\'') {
        return cmd.substr(1, cmd.length - 2);
    } else {
        return cmd;
    }
}

function separateCmdArgs(cmd) {
    // We're splitting up the command into space-separated parts.
    // The first item is the command, all remaining items are the
    // arguments. To permit commands with spaces in the name
    // (or directory name), double slashes is a usable escape sequence.
    var escape = cmd.search('\\\s'),
        divide = cmd.search(/[^\\]\s/),
        path, args, parts;

    if (escape === -1) {
        // Not an escaped path. Most common case.
        parts = cmd.split(' ');
    } else if (escape > -1 && divide === -1) {
        // Escaped path without arguments.
        parts = [cmd.replace('\\ ', ' ')];
    } else {
        // Escaped path with arguments.
        path = cmd.substr(0, divide + 1).replace('\\ ', ' ');
        args = cmd.substr(divide + 1).split(' ').filter(function(part) {
            return part.trim() != '';
        });
        parts = [path].concat(args);
    }

    // Parts contains the command as the first item and any arguments
    // as subsequent items.
    return parts;
}

function run(commands) {
    var childrenInfo = {};
    var lastPrefixColor = _.get(chalk, chalk.gray.dim);
    var prefixColors = config.prefixColors.split(',');
    var names = config.names.split(config.nameSeparator);
    var children = _.map(commands, function(cmd, index) {
        // Remove quotes.
        cmd = stripCmdQuotes(cmd);

        // Split the command up in the command path and its arguments.
        var parts = separateCmdArgs(cmd);

        var spawnOpts = config.raw ? {stdio: 'inherit'} : {};
        if (isWindows) {
            spawnOpts.detached = false;
        }
        var child;
        try {
            child = spawn(_.head(parts), _.tail(parts), spawnOpts);
        } catch (e) {
            logError('', chalk.gray.dim, 'Error occured when executing command: ' + cmd);
            logError('', chalk.gray.dim, e.stack);
            process.exit(1);
        }

        if (index < prefixColors.length) {
            var prefixColorPath = prefixColors[index];
            lastPrefixColor = _.get(chalk, prefixColorPath);
        }

        var name = index < names.length ? names[index] : '';
        childrenInfo[child.pid] = {
            command: cmd,
            index: index,
            name: name,
            prefixColor: lastPrefixColor
        };
        return child;
    });

    // Transform all process events to rx streams
    var streams = _.map(children, function(child) {
        var childStreams = {
            error: Rx.Node.fromEvent(child, 'error'),
            close: Rx.Node.fromEvent(child, 'close')
        };
        if (!config.raw) {
            childStreams.stdout = Rx.Node.fromReadableStream(child.stdout);
            childStreams.stderr = Rx.Node.fromReadableStream(child.stderr);
        }

        return _.reduce(childStreams, function(memo, stream, key) {
            memo[key] = stream.map(function(data) {
                return {child: child, data: data};
            });

            return memo;
        }, {});
    });

    handleClose(streams, children, childrenInfo);
    handleError(streams, childrenInfo);
    if (!config.raw) {
        handleOutput(streams, childrenInfo, 'stdout');
        handleOutput(streams, childrenInfo, 'stderr');
    }
}

function handleOutput(streams, childrenInfo, source) {
    var sourceStreams = _.map(streams, source);
    var combinedSourceStream = Rx.Observable.merge.apply(this, sourceStreams);

    combinedSourceStream.subscribe(function(event) {
        var prefix = getPrefix(childrenInfo, event.child);
        var prefixColor = childrenInfo[event.child.pid].prefixColor;
        log(prefix, prefixColor, event.data.toString());
    });
}

function handleClose(streams, children, childrenInfo) {
    var aliveChildren = _.clone(children);
    var exitCodes = [];
    var closeStreams = _.map(streams, 'close');
    var closeStream = Rx.Observable.merge.apply(this, closeStreams);

    // TODO: Is it possible that amount of close events !== count of spawned?
    closeStream.subscribe(function(event) {
        var exitCode = event.data;
        exitCodes.push(exitCode);

        var prefix = getPrefix(childrenInfo, event.child);
        var prefixColor = childrenInfo[event.child.pid].prefixColor;
        var command = childrenInfo[event.child.pid].command;
        logEvent(prefix, prefixColor, command + ' exited with code ' + exitCode);

        aliveChildren = _.filter(aliveChildren, function(child) {
            return child.pid !== event.child.pid;
        });

        if (aliveChildren.length === 0) {
            exit(exitCodes);
        }
    });

    if (config.killOthers) {
        // Give other processes some time to stop cleanly before killing them
        var delayedExit = closeStream.delay(config.killDelay);

        delayedExit.subscribe(function() {
            logEvent('--> ', chalk.gray.dim, 'Sending SIGTERM to other processes..');

            // Send SIGTERM to alive children
            _.each(aliveChildren, function(child) {
                if (isWindows) {
                    spawn('taskkill', ["/pid", child.pid, '/f', '/t']);
                } else {
                    child.kill('SIGINT');
                }
            });
        });
    }
}

function exit(childExitCodes) {
    var success;
    switch (config.success) {
        case 'first':
            success = _.first(childExitCodes) === 0;
            break;
        case 'last':
            success = _.last(childExitCodes) === 0;
            break;
        default:
            success = _.every(childExitCodes, function(code) {
                return code === 0;
            });
    }
    process.exit(success ? 0 : 1);
}

function handleError(streams, childrenInfo) {
    // Output emitted errors from child process
    var errorStreams = _.map(streams, 'error');
    var processErrorStream = Rx.Observable.merge.apply(this, errorStreams);

    processErrorStream.subscribe(function(event) {
        var command = childrenInfo[event.child.pid].command;
        logError('', chalk.gray.dim, 'Error occured when executing command: ' + command);
        logError('', chalk.gray.dim, event.data.stack);
    });
}

function colorText(text, color) {
    if (!config.color) {
        return text;
    } else {
        return color(text);
    }
}

function getPrefix(childrenInfo, child) {
    var prefixes = getPrefixes(childrenInfo, child);
    if (_.includes(_.keys(prefixes), config.prefix)) {
        return '[' + prefixes[config.prefix] + '] ';
    }

    return _.reduce(prefixes, function(memo, val, key) {
        var re = new RegExp('{' + key + '}', 'g');
        return memo.replace(re, val);
    }, config.prefix) + ' ';
}

function getPrefixes(childrenInfo, child) {
    var prefixes = {};

    prefixes.none = '';
    prefixes.pid = child.pid;
    prefixes.index = childrenInfo[child.pid].index;
    prefixes.name = childrenInfo[child.pid].name;
    prefixes.time = moment().format(config.timestampFormat);

    var command = childrenInfo[child.pid].command;
    prefixes.command = shortenText(command, config.prefixLength);
    return prefixes;
}

function shortenText(text, length, cut) {
    if (text.length <= length) {
        return text;
    }
    cut = _.isString(cut) ? cut : '..';

    var endLength = Math.floor(length / 2);
    var startLength = length - endLength;

    var first = text.substring(0, startLength);
    var last = text.substring(text.length - endLength, text.length);
    return first + cut + last;
}

function log(prefix, prefixColor, text) {
    logWithPrefix(prefix, prefixColor, text);
}

function logEvent(prefix, prefixColor, text) {
    if (config.raw) return;

    logWithPrefix(prefix, prefixColor, text, chalk.gray.dim);
}

function logError(prefix, prefixColor, text) {
    // This is for now same as log, there might be separate colors for stderr
    // and stdout
    logWithPrefix(prefix, prefixColor, text, chalk.red.bold);
}

function logWithPrefix(prefix, prefixColor, text, color) {
    var lastChar = text[text.length - 1];
    if (config.raw) {
        if (lastChar !== '\n') {
            text += '\n';
        }

        process.stdout.write(text);
        return;
    }

    if (lastChar === '\n') {
        // Remove extra newline from the end to prevent extra newlines in input
        text = text.slice(0, text.length - 1);
    }

    var lines = text.split('\n');
    // Do not bgColor trailing space
    var coloredPrefix = colorText(prefix.replace(/ $/, ''), prefixColor) + ' ';
    var paddedLines = _.map(lines, function(line, i) {
        var coloredLine = color ? colorText(line, color) : line;
        return coloredPrefix + coloredLine;
    });

    console.log(paddedLines.join('\n'));
}

main();
