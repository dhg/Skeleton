"use strict";
var find_1 = require('./find');
/**
 * Returns an Observable that searches for the first item in the source Observable that
 * matches the specified condition, and returns the the index of the item in the source.
 * @param {function} predicate function called with each item to test for condition matching.
 * @returns {Observable} an Observable of the index of the first item that matches the condition.
 */
function findIndex(predicate, thisArg) {
    return this.lift(new find_1.FindValueOperator(predicate, this, true, thisArg));
}
exports.findIndex = findIndex;
//# sourceMappingURL=findIndex.js.map