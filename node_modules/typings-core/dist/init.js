"use strict";
var Promise = require('any-promise');
var extend = require('xtend');
var path_1 = require('path');
var fs_1 = require('./utils/fs');
var config_1 = require('./utils/config');
var TSD_JSON_FILE = 'tsd.json';
var DEFINITELYTYPED_REPO = 'DefinitelyTyped/DefinitelyTyped';
var OLD_DEFINITELYTYPED_REPO = 'borisyankov/DefinitelyTyped';
var DEFAULT_CONFIG = {
    dependencies: {}
};
var PACKAGE_FILES = [
    'package.json',
    'bower.json'
];
function upgradeTsdJson(tsdJson, config) {
    var typingsJson = extend(config);
    var repo = tsdJson.repo || DEFINITELYTYPED_REPO;
    if (repo === OLD_DEFINITELYTYPED_REPO) {
        repo = DEFINITELYTYPED_REPO;
    }
    if (tsdJson.installed) {
        typingsJson.ambientDependencies = {};
        Object.keys(tsdJson.installed).forEach(function (path) {
            var dependency = tsdJson.installed[path];
            var name = path_1.basename(path, '.d.ts');
            var location = "github:" + repo + "/" + path + "#" + dependency.commit;
            typingsJson.ambientDependencies[name] = location;
        });
    }
    return typingsJson;
}
function upgrade(options, config) {
    return fs_1.readJson(path_1.join(options.cwd, TSD_JSON_FILE)).then(function (tsdJson) { return upgradeTsdJson(tsdJson, config); });
}
function getProjectName(options) {
    if (options.name) {
        return Promise.resolve(options.name);
    }
    return PACKAGE_FILES.reduce(function (promise, packageFileName) {
        return promise.then(function (name) {
            if (name != null) {
                return name;
            }
            return fs_1.readJson(path_1.join(options.cwd, packageFileName))
                .then(function (packageJson) { return packageJson.name; }, function () { return undefined; });
        });
    }, Promise.resolve(undefined));
}
function init(options) {
    var path = path_1.join(options.cwd, config_1.CONFIG_FILE);
    var main = options.main, version = options.version;
    return fs_1.isFile(path)
        .then(function (exists) {
        if (exists) {
            return Promise.reject(new TypeError("A " + config_1.CONFIG_FILE + " file already exists"));
        }
    })
        .then(function () { return getProjectName(options); })
        .then(function (name) {
        if (options.upgrade) {
            return upgrade(options, { name: name, main: main, version: version });
        }
        return extend({ name: name, main: main, version: version }, DEFAULT_CONFIG);
    })
        .then(function (config) {
        return fs_1.writeJson(path, config, 2);
    });
}
exports.init = init;
//# sourceMappingURL=init.js.map