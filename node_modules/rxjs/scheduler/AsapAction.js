"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Immediate_1 = require('../util/Immediate');
var FutureAction_1 = require('./FutureAction');
var AsapAction = (function (_super) {
    __extends(AsapAction, _super);
    function AsapAction() {
        _super.apply(this, arguments);
    }
    AsapAction.prototype._schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay > 0) {
            return _super.prototype._schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        var scheduler = this.scheduler;
        scheduler.actions.push(this);
        if (!scheduler.scheduledId) {
            scheduler.scheduledId = Immediate_1.Immediate.setImmediate(function () {
                scheduler.scheduledId = null;
                scheduler.flush();
            });
        }
        return this;
    };
    AsapAction.prototype._unsubscribe = function () {
        var scheduler = this.scheduler;
        var scheduledId = scheduler.scheduledId, actions = scheduler.actions;
        _super.prototype._unsubscribe.call(this);
        if (actions.length === 0) {
            scheduler.active = false;
            if (scheduledId != null) {
                scheduler.scheduledId = null;
                Immediate_1.Immediate.clearImmediate(scheduledId);
            }
        }
    };
    return AsapAction;
}(FutureAction_1.FutureAction));
exports.AsapAction = AsapAction;
//# sourceMappingURL=AsapAction.js.map