var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var makeErrorCause = require('make-error-cause');
var PopsicleError = (function (_super) {
    __extends(PopsicleError, _super);
    function PopsicleError(message, code, original, popsicle) {
        _super.call(this, message, original);
        this.name = 'PopsicleError';
        this.code = code;
        this.popsicle = popsicle;
    }
    return PopsicleError;
})(makeErrorCause.BaseError);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PopsicleError;
//# sourceMappingURL=error.js.map