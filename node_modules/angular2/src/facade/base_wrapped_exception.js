'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A base class for the WrappedException that can be used to identify
 * a WrappedException from ExceptionHandler without adding circular
 * dependency.
 */
var BaseWrappedException = (function (_super) {
    __extends(BaseWrappedException, _super);
    function BaseWrappedException(message) {
        _super.call(this, message);
    }
    Object.defineProperty(BaseWrappedException.prototype, "wrapperMessage", {
        get: function () { return ''; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "wrapperStack", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "originalException", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "originalStack", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "context", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "message", {
        get: function () { return ''; },
        enumerable: true,
        configurable: true
    });
    return BaseWrappedException;
})(Error);
exports.BaseWrappedException = BaseWrappedException;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV93cmFwcGVkX2V4Y2VwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9mYWNhZGUvYmFzZV93cmFwcGVkX2V4Y2VwdGlvbi50cyJdLCJuYW1lcyI6WyJCYXNlV3JhcHBlZEV4Y2VwdGlvbiIsIkJhc2VXcmFwcGVkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiQmFzZVdyYXBwZWRFeGNlcHRpb24ud3JhcHBlck1lc3NhZ2UiLCJCYXNlV3JhcHBlZEV4Y2VwdGlvbi53cmFwcGVyU3RhY2siLCJCYXNlV3JhcHBlZEV4Y2VwdGlvbi5vcmlnaW5hbEV4Y2VwdGlvbiIsIkJhc2VXcmFwcGVkRXhjZXB0aW9uLm9yaWdpbmFsU3RhY2siLCJCYXNlV3JhcHBlZEV4Y2VwdGlvbi5jb250ZXh0IiwiQmFzZVdyYXBwZWRFeGNlcHRpb24ubWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7OztHQUlHO0FBQ0g7SUFBMENBLHdDQUFLQTtJQUM3Q0EsOEJBQVlBLE9BQWVBO1FBQUlDLGtCQUFNQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUVoREQsc0JBQUlBLGdEQUFjQTthQUFsQkEsY0FBK0JFLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDM0NBLHNCQUFJQSw4Q0FBWUE7YUFBaEJBLGNBQTBCRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFIO0lBQ3hDQSxzQkFBSUEsbURBQWlCQTthQUFyQkEsY0FBK0JJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUo7SUFDN0NBLHNCQUFJQSwrQ0FBYUE7YUFBakJBLGNBQTJCSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFMO0lBQ3pDQSxzQkFBSUEseUNBQU9BO2FBQVhBLGNBQXFCTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFOO0lBQ25DQSxzQkFBSUEseUNBQU9BO2FBQVhBLGNBQXdCTyxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFQO0lBQ3RDQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUFURCxFQUEwQyxLQUFLLEVBUzlDO0FBVFksNEJBQW9CLHVCQVNoQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIGJhc2UgY2xhc3MgZm9yIHRoZSBXcmFwcGVkRXhjZXB0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gaWRlbnRpZnlcbiAqIGEgV3JhcHBlZEV4Y2VwdGlvbiBmcm9tIEV4Y2VwdGlvbkhhbmRsZXIgd2l0aG91dCBhZGRpbmcgY2lyY3VsYXJcbiAqIGRlcGVuZGVuY3kuXG4gKi9cbmV4cG9ydCBjbGFzcyBCYXNlV3JhcHBlZEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7IHN1cGVyKG1lc3NhZ2UpOyB9XG5cbiAgZ2V0IHdyYXBwZXJNZXNzYWdlKCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxuICBnZXQgd3JhcHBlclN0YWNrKCk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIGdldCBvcmlnaW5hbEV4Y2VwdGlvbigpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICBnZXQgb3JpZ2luYWxTdGFjaygpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICBnZXQgY29udGV4dCgpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICBnZXQgbWVzc2FnZSgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbn1cbiJdfQ==