"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var make_error_cause_1 = require('make-error-cause');
var TypingsError = (function (_super) {
    __extends(TypingsError, _super);
    function TypingsError() {
        _super.apply(this, arguments);
        this.name = 'TypingsError';
    }
    return TypingsError;
}(make_error_cause_1.BaseError));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TypingsError;
//# sourceMappingURL=error.js.map