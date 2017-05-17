"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
/**
 * Returns an Observable that applies a specified accumulator function to the first item emitted by a source Observable,
 * then feeds the result of that function along with the second item emitted by the source Observable into the same
 * function, and so on until all items have been emitted by the source Observable, and emits the final result from
 * the final call to your function as its sole item.
 * This technique, which is called "reduce" here, is sometimes called "aggregate," "fold," "accumulate," "compress," or
 * "inject" in other programming contexts.
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * @param {initialValue} the initial (seed) accumulator value
 * @param {accumulator} an accumulator function to be invoked on each item emitted by the source Observable, the
 * result of which will be used in the next accumulator call.
 * @returns {Observable} an Observable that emits a single item that is the result of accumulating the output from the
 * items emitted by the source Observable.
 */
function reduce(project, seed) {
    return this.lift(new ReduceOperator(project, seed));
}
exports.reduce = reduce;
var ReduceOperator = (function () {
    function ReduceOperator(project, seed) {
        this.project = project;
        this.seed = seed;
    }
    ReduceOperator.prototype.call = function (subscriber) {
        return new ReduceSubscriber(subscriber, this.project, this.seed);
    };
    return ReduceOperator;
}());
exports.ReduceOperator = ReduceOperator;
var ReduceSubscriber = (function (_super) {
    __extends(ReduceSubscriber, _super);
    function ReduceSubscriber(destination, project, seed) {
        _super.call(this, destination);
        this.hasValue = false;
        this.acc = seed;
        this.project = project;
        this.hasSeed = typeof seed !== 'undefined';
    }
    ReduceSubscriber.prototype._next = function (value) {
        if (this.hasValue || (this.hasValue = this.hasSeed)) {
            this._tryReduce(value);
        }
        else {
            this.acc = value;
            this.hasValue = true;
        }
    };
    ReduceSubscriber.prototype._tryReduce = function (value) {
        var result;
        try {
            result = this.project(this.acc, value);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.acc = result;
    };
    ReduceSubscriber.prototype._complete = function () {
        if (this.hasValue || this.hasSeed) {
            this.destination.next(this.acc);
        }
        this.destination.complete();
    };
    return ReduceSubscriber;
}(Subscriber_1.Subscriber));
exports.ReduceSubscriber = ReduceSubscriber;
//# sourceMappingURL=reduce.js.map