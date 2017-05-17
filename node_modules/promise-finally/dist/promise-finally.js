"use strict";
var Promise = require('any-promise');
function promiseFinally(value, cb) {
    return Promise.resolve(value)
        .then(function (value) { return Promise.resolve(cb()).then(function () { return value; }); }, function (reason) { return Promise.resolve(cb()).then(function () { return Promise.reject(reason); }); });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = promiseFinally;
//# sourceMappingURL=promise-finally.js.map