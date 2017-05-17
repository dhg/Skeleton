"use strict";
var extend = require('xtend');
var Promise = require('any-promise');
var promise_finally_1 = require('promise-finally');
var events_1 = require('events');
var fs_1 = require('./utils/fs');
var find_1 = require('./utils/find');
var path_1 = require('./utils/path');
function uninstallDependency(name, options) {
    var emitter = options.emitter || new events_1.EventEmitter();
    function uninstall(name, options) {
        return removeDependency(name, options).then(function () { return writeToConfig(name, options); });
    }
    return find_1.findProject(options.cwd)
        .then(function (cwd) { return uninstall(name, extend({ emitter: emitter }, options, { cwd: cwd })); }, function () { return uninstall(name, extend({ emitter: emitter }, options)); });
}
exports.uninstallDependency = uninstallDependency;
function writeToConfig(name, options) {
    if (options.save || options.saveDev) {
        return fs_1.transformConfig(options.cwd, function (config) {
            if (options.save) {
                if (options.ambient) {
                    if (config.ambientDependencies && config.ambientDependencies[name]) {
                        delete config.ambientDependencies[name];
                    }
                    else {
                        return Promise.reject(new TypeError("Typings for \"" + name + "\" are not listed in ambient dependencies"));
                    }
                }
                else {
                    if (config.dependencies && config.dependencies[name]) {
                        delete config.dependencies[name];
                    }
                    else {
                        return Promise.reject(new TypeError("Typings for \"" + name + "\" are not listed in dependencies"));
                    }
                }
            }
            if (options.saveDev) {
                if (options.ambient) {
                    if (config.ambientDevDependencies && config.ambientDevDependencies[name]) {
                        delete config.ambientDevDependencies[name];
                    }
                    else {
                        return Promise.reject(new TypeError("Typings for \"" + name + "\" are not listed in ambient dev dependencies"));
                    }
                }
                else {
                    if (config.devDependencies && config.devDependencies[name]) {
                        delete config.devDependencies[name];
                    }
                    else {
                        return Promise.reject(new TypeError("Typings for \"" + name + "\" are not listed in dev dependencies"));
                    }
                }
            }
            if (options.savePeer) {
                if (config.peerDependencies && config.peerDependencies[name]) {
                    delete config.peerDependencies[name];
                }
                else {
                    return Promise.reject(new TypeError("Typings for \"" + name + "\" are not listed in peer dependencies"));
                }
            }
            return config;
        });
    }
}
function removeDependency(name, options) {
    var cwd = options.cwd, ambient = options.ambient;
    var location = path_1.getDependencyLocation({ name: name, cwd: cwd, ambient: ambient });
    function remove(dir, path, dtsPath) {
        return fs_1.isFile(path)
            .then(function (exists) {
            if (!exists) {
                options.emitter.emit('enoent', { path: path });
            }
            return promise_finally_1.default(fs_1.rimraf(dir), function () {
                return fs_1.transformDtsFile(dtsPath, function (typings) {
                    return typings.filter(function (x) { return x !== path; });
                });
            });
        });
    }
    return Promise.all([
        remove(location.mainPath, location.mainFile, location.mainDtsFile),
        remove(location.browserPath, location.browserFile, location.browserDtsFile)
    ]).then(function () { return undefined; });
}
//# sourceMappingURL=uninstall.js.map