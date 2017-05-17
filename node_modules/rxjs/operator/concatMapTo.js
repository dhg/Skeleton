"use strict";
var mergeMapTo_1 = require('./mergeMapTo');
/**
 * Maps values from the source to a specific observable, and merges them together in a serialized fashion.
 *
 * @param {Observable} observable the observable to map each source value to
 * @param {function} [resultSelector] an optional result selector that is applied to values before they're
 * merged into the returned observable. The arguments passed to this function are:
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 * @returns {Observable} an observable of values merged together by joining the passed observable
 * with itself, one after the other, for each value emitted from the source.
 */
function concatMapTo(observable, resultSelector) {
    return this.lift(new mergeMapTo_1.MergeMapToOperator(observable, resultSelector, 1));
}
exports.concatMapTo = concatMapTo;
//# sourceMappingURL=concatMapTo.js.map