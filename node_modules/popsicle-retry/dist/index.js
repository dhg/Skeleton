"use strict";
var Promise = require('any-promise');
function popsicleRetry(retries) {
    if (retries === void 0) { retries = popsicleRetry.retries(); }
    return function (self) {
        var iter = 0;
        self.always(function (request) {
            var delay = retries(request, ++iter);
            if (delay > 0) {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(request.clone());
                    }, delay);
                })
                    .then(function (response) {
                    request.response = response;
                });
            }
        });
    };
}
var popsicleRetry;
(function (popsicleRetry) {
    function retryAllowed(request) {
        if (request.errored) {
            return request.errored.code === 'EUNAVAILABLE';
        }
        if (request.response) {
            return request.response.statusType() === 5;
        }
        return false;
    }
    popsicleRetry.retryAllowed = retryAllowed;
    function retries(count, isRetryAllowed) {
        if (count === void 0) { count = 5; }
        if (isRetryAllowed === void 0) { isRetryAllowed = retryAllowed; }
        return function (request, iter) {
            if (iter > count || !isRetryAllowed(request)) {
                return -1;
            }
            var noise = Math.random() * 100;
            return (1 << iter) * 1000 + noise;
        };
    }
    popsicleRetry.retries = retries;
})(popsicleRetry || (popsicleRetry = {}));
module.exports = popsicleRetry;
//# sourceMappingURL=index.js.map