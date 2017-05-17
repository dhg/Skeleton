"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FutureAction_1 = require('./FutureAction');
var AnimationFrame_1 = require('../util/AnimationFrame');
var AnimationFrameAction = (function (_super) {
    __extends(AnimationFrameAction, _super);
    function AnimationFrameAction() {
        _super.apply(this, arguments);
    }
    AnimationFrameAction.prototype._schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay > 0) {
            return _super.prototype._schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        var scheduler = this.scheduler;
        scheduler.actions.push(this);
        if (!scheduler.scheduledId) {
            scheduler.scheduledId = AnimationFrame_1.AnimationFrame.requestAnimationFrame(function () {
                scheduler.scheduledId = null;
                scheduler.flush();
            });
        }
        return this;
    };
    AnimationFrameAction.prototype._unsubscribe = function () {
        var scheduler = this.scheduler;
        var scheduledId = scheduler.scheduledId, actions = scheduler.actions;
        _super.prototype._unsubscribe.call(this);
        if (actions.length === 0) {
            scheduler.active = false;
            if (scheduledId != null) {
                scheduler.scheduledId = null;
                AnimationFrame_1.AnimationFrame.cancelAnimationFrame(scheduledId);
            }
        }
    };
    return AnimationFrameAction;
}(FutureAction_1.FutureAction));
exports.AnimationFrameAction = AnimationFrameAction;
//# sourceMappingURL=AnimationFrameAction.js.map