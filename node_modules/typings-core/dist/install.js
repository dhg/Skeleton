"use strict";
var extend = require('xtend');
var Promise = require('any-promise');
var path_1 = require('path');
var events_1 = require('events');
var dependencies_1 = require('./lib/dependencies');
var compile_1 = require('./lib/compile');
var find_1 = require('./utils/find');
var fs_1 = require('./utils/fs');
var path_2 = require('./utils/path');
var parse_1 = require('./utils/parse');
function install(options) {
    var cwd = options.cwd, production = options.production;
    var emitter = options.emitter || new events_1.EventEmitter();
    return dependencies_1.resolveTypeDependencies({ cwd: cwd, emitter: emitter, ambient: true, peer: true, dev: !production })
        .then(function (tree) {
        var cwd = path_1.dirname(tree.src);
        var queue = [];
        function addToQueue(deps, ambient) {
            for (var _i = 0, _a = Object.keys(deps); _i < _a.length; _i++) {
                var name = _a[_i];
                var tree_1 = deps[name];
                queue.push(installDependencyTree(tree_1, { cwd: cwd, name: name, ambient: ambient, emitter: emitter, meta: true }));
            }
        }
        addToQueue(tree.dependencies, false);
        addToQueue(tree.devDependencies, false);
        addToQueue(tree.peerDependencies, false);
        addToQueue(tree.ambientDependencies, true);
        addToQueue(tree.ambientDevDependencies, true);
        return Promise.all(queue)
            .then(function (installed) {
            if (installed.length === 0) {
                var _a = path_2.getTypingsLocation({ cwd: cwd }), typingsDir = _a.typingsDir, mainDtsFile_1 = _a.mainDtsFile, browserDtsFile_1 = _a.browserDtsFile;
                return fs_1.mkdirp(typingsDir)
                    .then(function () {
                    return Promise.all([
                        fs_1.touch(mainDtsFile_1, {}),
                        fs_1.touch(browserDtsFile_1, {})
                    ]);
                });
            }
        })
            .then(function () { return ({ tree: tree }); });
    });
}
exports.install = install;
function installDependencyRaw(raw, options) {
    return new Promise(function (resolve) {
        return resolve(installDependency(parse_1.parseDependencyExpression(raw, options), options));
    });
}
exports.installDependencyRaw = installDependencyRaw;
function installDependency(expression, options) {
    return find_1.findProject(options.cwd)
        .then(function (cwd) { return installTo(expression, extend(options, { cwd: cwd })); }, function () { return installTo(expression, options); });
}
exports.installDependency = installDependency;
function installTo(expression, options) {
    var dependency = parse_1.parseDependency(expression.location);
    var cwd = options.cwd, ambient = options.ambient;
    var emitter = options.emitter || new events_1.EventEmitter();
    return checkTypings(dependency, options)
        .then(function () { return dependencies_1.resolveDependency(dependency, { cwd: cwd, emitter: emitter, dev: false, peer: false, ambient: false }); })
        .then(function (tree) {
        var name = expression.name || dependency.meta.name || tree.name;
        if (!name) {
            return Promise.reject(new TypeError("Unable to install dependency from \"" + tree.raw + "\" without a name"));
        }
        return installDependencyTree(tree, {
            cwd: cwd,
            name: name,
            ambient: ambient,
            emitter: emitter,
            meta: true
        })
            .then(function (result) {
            return writeToConfig(name, tree.raw, options)
                .then(function () {
                if (tree.postmessage) {
                    emitter.emit('postmessage', { name: name, message: tree.postmessage });
                }
                return result;
            });
        });
    });
}
function installDependencyTree(tree, options) {
    return compile_1.default(tree, options).then(function (result) { return writeDependency(result, options); });
}
function writeToConfig(name, raw, options) {
    if (options.save || options.saveDev || options.savePeer) {
        return fs_1.transformConfig(options.cwd, function (config) {
            if (options.save) {
                if (options.ambient) {
                    config.ambientDependencies = extend(config.ambientDependencies, (_a = {}, _a[name] = raw, _a));
                }
                else {
                    config.dependencies = extend(config.dependencies, (_b = {}, _b[name] = raw, _b));
                }
            }
            else if (options.saveDev) {
                if (options.ambient) {
                    config.ambientDevDependencies = extend(config.ambientDevDependencies, (_c = {}, _c[name] = raw, _c));
                }
                else {
                    config.devDependencies = extend(config.devDependencies, (_d = {}, _d[name] = raw, _d));
                }
            }
            else if (options.savePeer) {
                if (options.ambient) {
                    return Promise.reject(new TypeError('Unable to use `savePeer` with the `ambient` flag'));
                }
                else {
                    config.peerDependencies = extend(config.peerDependencies, (_e = {}, _e[name] = raw, _e));
                }
            }
            return config;
            var _a, _b, _c, _d, _e;
        });
    }
    return Promise.resolve();
}
function writeDependency(output, options) {
    var location = path_2.getDependencyLocation(options);
    function create(path, file, contents, dtsFile) {
        return fs_1.mkdirp(path)
            .then(function () { return fs_1.writeFile(file, contents); })
            .then(function () { return fs_1.transformDtsFile(dtsFile, function (typings) { return typings.concat([file]); }); });
    }
    return Promise.all([
        create(location.mainPath, location.mainFile, output.main, location.mainDtsFile),
        create(location.browserPath, location.browserFile, output.browser, location.browserDtsFile)
    ]).then(function () { return output; });
}
function checkTypings(dependency, options) {
    var type = dependency.type, meta = dependency.meta;
    if (type === 'registry' && meta.source === 'npm') {
        return find_1.findUp(options.cwd, path_1.join('node_modules', meta.name, 'package.json'))
            .then(function (path) {
            return fs_1.readJson(path)
                .then(function (packageJson) {
                if (packageJson && typeof packageJson.typings === 'string') {
                    options.emitter.emit('hastypings', {
                        name: meta.name,
                        source: meta.source,
                        path: path,
                        typings: path_2.resolveFrom(path, packageJson.typings)
                    });
                }
            });
        })
            .catch(function (err) { return undefined; });
    }
    return Promise.resolve();
}
//# sourceMappingURL=install.js.map