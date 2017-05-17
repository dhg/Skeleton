"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var ArgumentOutOfRangeError_1 = require('../util/ArgumentOutOfRangeError');
var EmptyObservable_1 = require('../observable/EmptyObservable');
function takeLast(total) {
    if (total === 0) {
        return new EmptyObservable_1.EmptyObservable();
    }
    else {
        return this.lift(new TakeLastOperator(total));
    }
}
exports.takeLast = takeLast;
var TakeLastOperator = (function () {
    function TakeLastOperator(total) {
        this.total = total;
        if (this.total < 0) {
            throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;
        }
    }
    TakeLastOperator.prototype.call = function (subscriber) {
        return new TakeLastSubscriber(subscriber, this.total);
    };
    return TakeLastOperator;
}());
var TakeLastSubscriber = (function (_super) {
    __extends(TakeLastSubscriber, _super);
    function TakeLastSubscriber(destination, total) {
        _super.call(this, destination);
        this.total = total;
        this.count = 0;
        this.index = 0;
        this.ring = new Array(total);
    }
    TakeLastSubscriber.prototype._next = function (value) {
        var index = this.index;
        var ring = this.ring;
        var total = this.total;
        var count = this.count;
        if (total > 1) {
            if (count < total) {
                this.count = count + 1;
                this.index = index + 1;
            }
            else if (index === 0) {
                this.index = ++index;
            }
            else if (index < total) {
                this.index = index + 1;
            }
            else {
                this.index = index = 0;
            }
        }
        else if (count < total) {
            this.count = total;
        }
        ring[index] = value;
    };
    TakeLastSubscriber.prototype._complete = function () {
        var iter = -1;
        var _a = this, ring = _a.ring, count = _a.count, total = _a.total, destination = _a.destination;
        var index = (total === 1 || count < total) ? 0 : this.index - 1;
        while (++iter < count) {
            if (iter + index === total) {
                index = total - iter;
            }
            destination.next(ring[iter + index]);
        }
        destination.complete();
    };
    return TakeLastSubscriber;
}(Subscriber_1.Subscriber));
//# sourceMappingURL=takeLast.js.map