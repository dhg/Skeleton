"use strict";
var path_1 = require('path');
var isAbsolute = require('is-absolute');
var path_2 = require('./path');
exports.REFERENCE_REGEXP = /^\/\/\/[ \t]*<reference[ \t]+path[ \t]*=("|')(.*?)\1.*?\/>[ \t]*\r?\n?/gm;
function extractReferences(contents, cwd) {
    var refs = [];
    var m;
    while ((m = exports.REFERENCE_REGEXP.exec(contents)) != null) {
        refs.push({
            start: m.index,
            end: m.index + m[0].length,
            path: path_1.resolve(cwd, m[2])
        });
    }
    return refs;
}
exports.extractReferences = extractReferences;
function parseReferences(contents, cwd) {
    return extractReferences(contents, cwd).map(function (ref) { return path_1.resolve(cwd, ref.path); });
}
exports.parseReferences = parseReferences;
function stringifyReferences(paths, cwd) {
    return paths.map(function (path) { return toReference(path, cwd); }).join(path_2.EOL) + path_2.EOL;
}
exports.stringifyReferences = stringifyReferences;
function toReference(path, cwd) {
    return "/// <reference path=\"" + path_2.normalizeSlashes(isAbsolute(path) ? path_1.relative(cwd, path) : path_1.normalize(path)) + "\" />";
}
exports.toReference = toReference;
//# sourceMappingURL=references.js.map