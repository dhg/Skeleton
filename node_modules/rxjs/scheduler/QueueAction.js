"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FutureAction_1 = require('./FutureAction');
var QueueAction = (function (_super) {
    __extends(QueueAction, _super);
    function QueueAction() {
        _super.apply(this, arguments);
    }
    QueueAction.prototype._schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay > 0) {
            return _super.prototype._schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        var scheduler = this.scheduler;
        scheduler.actions.push(this);
        scheduler.flush();
        return this;
    };
    return QueueAction;
}(FutureAction_1.FutureAction));
exports.QueueAction = QueueAction;
//# sourceMappingURL=QueueAction.js.map