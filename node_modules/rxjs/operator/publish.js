"use strict";
var Subject_1 = require('../Subject');
var multicast_1 = require('./multicast');
/**
 * Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
 * before it begins emitting items to those Observers that have subscribed to it.
 *
 * <img src="./img/publish.png" width="100%">
 *
 * @returns a ConnectableObservable that upon connection causes the source Observable to emit items to its Observers.
 */
function publish() {
    return multicast_1.multicast.call(this, new Subject_1.Subject());
}
exports.publish = publish;
//# sourceMappingURL=publish.js.map