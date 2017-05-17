var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_1 = require('./base');
var Response = (function (_super) {
    __extends(Response, _super);
    function Response(options) {
        _super.call(this, options);
        this.body = options.body;
        this.status = options.status;
        this.statusText = options.statusText;
    }
    Response.prototype.statusType = function () {
        return ~~(this.status / 100);
    };
    Response.prototype.error = function (message, type, error) {
        return this.request.error(message, type, error);
    };
    Response.prototype.toJSON = function () {
        return {
            url: this.url,
            headers: this.headers,
            rawHeaders: this.rawHeaders,
            body: this.body,
            status: this.status,
            statusText: this.statusText
        };
    };
    return Response;
})(base_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Response;
//# sourceMappingURL=response.js.map