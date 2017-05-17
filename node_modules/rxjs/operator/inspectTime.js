"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var asap_1 = require('../scheduler/asap');
var Subscriber_1 = require('../Subscriber');
function inspectTime(delay, scheduler) {
    if (scheduler === void 0) { scheduler = asap_1.asap; }
    return this.lift(new InspectTimeOperator(delay, scheduler));
}
exports.inspectTime = inspectTime;
var InspectTimeOperator = (function () {
    function InspectTimeOperator(delay, scheduler) {
        this.delay = delay;
        this.scheduler = scheduler;
    }
    InspectTimeOperator.prototype.call = function (subscriber) {
        return new InspectTimeSubscriber(subscriber, this.delay, this.scheduler);
    };
    return InspectTimeOperator;
}());
var InspectTimeSubscriber = (function (_super) {
    __extends(InspectTimeSubscriber, _super);
    function InspectTimeSubscriber(destination, delay, scheduler) {
        _super.call(this, destination);
        this.delay = delay;
        this.scheduler = scheduler;
        this.hasValue = false;
    }
    InspectTimeSubscriber.prototype._next = function (value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, this));
        }
    };
    InspectTimeSubscriber.prototype.clearThrottle = function () {
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
    return InspectTimeSubscriber;
}(Subscriber_1.Subscriber));
function dispatchNext(subscriber) {
    subscriber.clearThrottle();
}
//# sourceMappingURL=inspectTime.js.map