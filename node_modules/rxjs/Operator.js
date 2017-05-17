"use strict";
var Subscriber_1 = require('./Subscriber');
var Operator = (function () {
    function Operator() {
    }
    Operator.prototype.call = function (subscriber) {
        return new Subscriber_1.Subscriber(subscriber);
    };
    return Operator;
}());
exports.Operator = Operator;
//# sourceMappingURL=Operator.js.map