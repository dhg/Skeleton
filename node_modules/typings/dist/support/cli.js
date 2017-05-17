"use strict";
var chalk = require('chalk');
var Promise = require('any-promise');
var archy = require('archy');
var os = require('os');
var pkg = require('../../package.json');
function log(message) {
    console.error(message);
}
exports.log = log;
function formatLine(color, type, line, prefix) {
    return chalk.bgBlack.white('typings') + " " + color(type) + " " + (prefix ? chalk.magenta(prefix + " ") : '') + line;
}
function logInfo(message, prefix) {
    var output = message.split(/\r?\n/g).map(function (line) {
        return formatLine(chalk.bgBlack.cyan, 'INFO', line, prefix);
    }).join('\n');
    log(output);
}
exports.logInfo = logInfo;
function logWarning(message, prefix) {
    var output = message.split(/\r?\n/g).map(function (line) {
        return formatLine(chalk.bgYellow.black, 'WARN', line, prefix);
    }).join('\n');
    log(output);
}
exports.logWarning = logWarning;
function logError(message, prefix) {
    var output = message.split(/\r?\n/g).map(function (line) {
        return formatLine(chalk.bgBlack.red, 'ERR!', line, prefix);
    }).join('\n');
    log(output);
}
exports.logError = logError;
function handle(promise, options) {
    return Promise.resolve(promise).catch(function (err) { return handleError(err, options); });
}
exports.handle = handle;
function handleError(error, options) {
    var cause = error;
    logError(error.message, 'message');
    while (cause = cause.cause) {
        logError(cause.message, 'caused by');
    }
    if (options.verbose && error.stack) {
        log('');
        logError(error.stack, 'stack');
    }
    log('');
    logError(process.cwd(), 'cwd');
    logError(os.type() + " " + os.release(), 'system');
    logError(process.argv.map(JSON.stringify).join(' '), 'command');
    logError(process.version, 'node -v');
    logError(pkg.version, "typings -v");
    if (error.code) {
        logError(error.code, 'code');
    }
    log('');
    logError('If you need help, you may report this error at:');
    logError("  <https://github.com/typings/typings/issues>");
    process.exit(1);
}
exports.handleError = handleError;
function toDependencyName(name, node, suffix) {
    var fullname = node.version ? name + "@" + node.version : name;
    return suffix ? fullname + " " + suffix : fullname;
}
function archifyDependencyTree(options) {
    var result = {
        label: options.name ? toDependencyName(options.name, options.tree) : '',
        nodes: []
    };
    function children(nodes, dependencies, suffix) {
        for (var _i = 0, _a = Object.keys(dependencies).sort(); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            var tree = dependencies[name_1];
            nodes.push(traverse({
                label: toDependencyName(name_1, tree, suffix),
                nodes: []
            }, tree));
        }
    }
    function traverse(result, tree) {
        var nodes = result.nodes;
        children(nodes, tree.dependencies);
        children(nodes, tree.devDependencies, chalk.gray('(dev)'));
        children(nodes, tree.peerDependencies, chalk.gray('(peer)'));
        children(nodes, tree.ambientDependencies, chalk.gray('(ambient)'));
        children(nodes, tree.ambientDevDependencies, chalk.gray('(ambient dev)'));
        return result;
    }
    var archyTree = traverse(result, options.tree);
    if (archyTree.nodes.length === 0) {
        archyTree.nodes.push(chalk.gray('(No dependencies)'));
    }
    return archy(archyTree);
}
exports.archifyDependencyTree = archifyDependencyTree;
//# sourceMappingURL=cli.js.map