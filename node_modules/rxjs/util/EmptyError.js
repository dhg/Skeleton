"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EmptyError = (function (_super) {
    __extends(EmptyError, _super);
    function EmptyError() {
        _super.call(this, 'no elements in sequence');
        this.name = 'EmptyError';
    }
    return EmptyError;
}(Error));
exports.EmptyError = EmptyError;
//# sourceMappingURL=EmptyError.js.map