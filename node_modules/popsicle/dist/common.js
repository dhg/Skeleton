var extend = require('xtend');
var request_1 = require('./request');
exports.Request = request_1.default;
var response_1 = require('./response');
exports.Response = response_1.default;
var plugins = require('./plugins/index');
exports.plugins = plugins;
var form_1 = require('./form');
exports.form = form_1.default;
var jar_1 = require('./jar');
exports.jar = jar_1.default;
var error_1 = require('./error');
exports.PopsicleError = error_1.default;
var transport = require('./index');
exports.transport = transport;
function defaults(defaultsOptions) {
    var defaults = extend({ transport: transport }, defaultsOptions);
    return function popsicle(options) {
        var opts;
        if (typeof options === 'string') {
            opts = extend(defaults, { url: options });
        }
        else {
            opts = extend(defaults, options);
        }
        if (typeof opts.url !== 'string') {
            throw new TypeError('The URL must be a string');
        }
        return new request_1.default(opts);
    };
}
exports.defaults = defaults;
exports.browser = !!process.browser;
exports.request = defaults({});
exports.get = defaults({ method: 'get' });
exports.post = defaults({ method: 'post' });
exports.put = defaults({ method: 'put' });
exports.patch = defaults({ method: 'patch' });
exports.del = defaults({ method: 'delete' });
exports.head = defaults({ method: 'head' });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.request;
//# sourceMappingURL=common.js.map