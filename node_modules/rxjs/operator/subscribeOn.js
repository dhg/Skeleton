"use strict";
var SubscribeOnObservable_1 = require('../observable/SubscribeOnObservable');
/**
 * Asynchronously subscribes Observers to this Observable on the specified Scheduler.
 *
 * <img src="./img/subscribeOn.png" width="100%">
 *
 * @param {Scheduler} the Scheduler to perform subscription actions on.
 * @returns {Observable<T>} the source Observable modified so that its subscriptions happen on the specified Scheduler
 .
 */
function subscribeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return new SubscribeOnObservable_1.SubscribeOnObservable(this, delay, scheduler);
}
exports.subscribeOn = subscribeOn;
//# sourceMappingURL=subscribeOn.js.map