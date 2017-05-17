"use strict";
var extend = require('xtend');
var pick = require('object.pick');
var querystring_1 = require('querystring');
var url_1 = require('url');
var fs_1 = require('./utils/fs');
var rc_1 = require('./utils/rc');
function tidyParams(params) {
    var result = extend(params);
    for (var _i = 0, _a = Object.keys(result); _i < _a.length; _i++) {
        var key = _a[_i];
        if (result[key] == null) {
            delete result[key];
        }
    }
    return result;
}
function search(options) {
    if (options === void 0) { options = {}; }
    var query = tidyParams(pick(options, [
        'query',
        'name',
        'source',
        'offset',
        'limit',
        'order',
        'sort'
    ]));
    return fs_1.readJsonFrom(url_1.resolve(rc_1.default.registryURL, "search?" + querystring_1.stringify(query)));
}
exports.search = search;
//# sourceMappingURL=search.js.map