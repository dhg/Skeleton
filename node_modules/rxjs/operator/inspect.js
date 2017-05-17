"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
function inspect(durationSelector) {
    return this.lift(new InspectOperator(durationSelector));
}
exports.inspect = inspect;
var InspectOperator = (function () {
    function InspectOperator(durationSelector) {
        this.durationSelector = durationSelector;
    }
    InspectOperator.prototype.call = function (subscriber) {
        return new InspectSubscriber(subscriber, this.durationSelector);
    };
    return InspectOperator;
}());
var InspectSubscriber = (function (_super) {
    __extends(InspectSubscriber, _super);
    function InspectSubscriber(destination, durationSelector) {
        _super.call(this, destination);
        this.durationSelector = durationSelector;
        this.hasValue = false;
    }
    InspectSubscriber.prototype._next = function (value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            var duration = tryCatch_1.tryCatch(this.durationSelector)(value);
            if (duration === errorObject_1.errorObject) {
                this.destination.error(errorObject_1.errorObject.e);
            }
            else {
                this.add(this.throttled = subscribeToResult_1.subscribeToResult(this, duration));
            }
        }
    };
    InspectSubscriber.prototype.clearThrottle = function () {
        var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
        if (throttled) {
            this.remove(throttled);
            this.throttled = null;
            throttled.unsubscribe();
        }
        if (hasValue) {
            this.value = null;
            this.hasValue = false;
            this.destination.next(value);
        }
    };
    InspectSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex) {
        this.clearThrottle();
    };
    InspectSubscriber.prototype.notifyComplete = function () {
        this.clearThrottle();
    };
    return InspectSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
//# sourceMappingURL=inspect.js.map