"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var makeError = require('make-error');
function makeErrorCause(value, _super) {
    if (_super === void 0) { _super = makeErrorCause.BaseError; }
    return makeError(value, _super);
}
var makeErrorCause;
(function (makeErrorCause) {
    var BaseError = (function (_super) {
        __extends(BaseError, _super);
        function BaseError(message, cause) {
            _super.call(this, message);
            this.cause = cause;
        }
        BaseError.prototype.toString = function () {
            return _super.prototype.toString.call(this) + (this.cause ? "\nCaused by: " + this.cause.toString() : '');
        };
        return BaseError;
    }(makeError.BaseError));
    makeErrorCause.BaseError = BaseError;
})(makeErrorCause || (makeErrorCause = {}));
module.exports = makeErrorCause;
//# sourceMappingURL=index.js.map