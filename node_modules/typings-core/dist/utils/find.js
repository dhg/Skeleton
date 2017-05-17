"use strict";
var path_1 = require('path');
var Promise = require('any-promise');
var fs_1 = require('../utils/fs');
var config_1 = require('./config');
function findProject(dir) {
    return findConfigFile(dir).then(path_1.dirname);
}
exports.findProject = findProject;
function findConfigFile(dir) {
    return findUp(dir, config_1.CONFIG_FILE);
}
exports.findConfigFile = findConfigFile;
function findUp(dir, filename, from) {
    if (from === void 0) { from = dir; }
    var path = path_1.join(dir, filename);
    return fs_1.isFile(path)
        .then(function (exists) {
        return exists ? path : findUpParent(dir, filename, from);
    });
}
exports.findUp = findUp;
function findUpParent(dir, filename, from) {
    var parentDir = path_1.dirname(dir);
    if (dir === parentDir) {
        return Promise.reject(new Error("Unable to find \"" + filename + "\" from \"" + from + "\""));
    }
    return findUp(parentDir, filename, from);
}
//# sourceMappingURL=find.js.map