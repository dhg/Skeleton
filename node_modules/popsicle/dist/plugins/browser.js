function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./common'));
var common_2 = require('./common');
exports.defaults = [common_2.stringify(), common_2.headers(), common_2.parse()];
//# sourceMappingURL=browser.js.map