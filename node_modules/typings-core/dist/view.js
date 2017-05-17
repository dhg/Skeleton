"use strict";
var Promise = require('any-promise');
var url_1 = require('url');
var fs_1 = require('./utils/fs');
var parse_1 = require('./utils/parse');
var rc_1 = require('./utils/rc');
function viewEntry(raw, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve) {
        var meta = parse_1.parseDependency(parse_1.expandRegistry(raw, options)).meta;
        var path = "entries/" + encodeURIComponent(meta.source) + "/" + encodeURIComponent(meta.name);
        return resolve(fs_1.readJsonFrom(url_1.resolve(rc_1.default.registryURL, path)));
    });
}
exports.viewEntry = viewEntry;
function viewVersions(raw, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve) {
        var meta = parse_1.parseDependency(parse_1.expandRegistry(raw, options)).meta;
        var path = "entries/" + encodeURIComponent(meta.source) + "/" + encodeURIComponent(meta.name) + "/versions";
        if (meta.version) {
            path += "/" + encodeURIComponent(meta.version);
        }
        return resolve(fs_1.readJsonFrom(url_1.resolve(rc_1.default.registryURL, path)));
    });
}
exports.viewVersions = viewVersions;
//# sourceMappingURL=view.js.map