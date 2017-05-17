"use strict";
var publishReplay_1 = require('./publishReplay');
function cache(bufferSize, windowTime, scheduler) {
    if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
    if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
    return publishReplay_1.publishReplay.call(this, bufferSize, windowTime, scheduler).refCount();
}
exports.cache = cache;
//# sourceMappingURL=cache.js.map