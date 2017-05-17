'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var math_1 = require('angular2/src/facade/math');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var BrowserDetails = (function () {
    function BrowserDetails() {
        this.elapsedTimeIncludesDelay = false;
        this.doesElapsedTimeIncludesDelay();
    }
    /**
     * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
     * time, Chrome and Opera seem to be the only browsers that include this.
     */
    BrowserDetails.prototype.doesElapsedTimeIncludesDelay = function () {
        var _this = this;
        var div = dom_adapter_1.DOM.createElement('div');
        dom_adapter_1.DOM.setAttribute(div, 'style', "position: absolute; top: -9999px; left: -9999px; width: 1px;\n      height: 1px; transition: all 1ms linear 1ms;");
        // Firefox requires that we wait for 2 frames for some reason
        this.raf(function (timestamp) {
            dom_adapter_1.DOM.on(div, 'transitionend', function (event) {
                var elapsed = math_1.Math.round(event.elapsedTime * 1000);
                _this.elapsedTimeIncludesDelay = elapsed == 2;
                dom_adapter_1.DOM.remove(div);
            });
            dom_adapter_1.DOM.setStyle(div, 'width', '2px');
        }, 2);
    };
    BrowserDetails.prototype.raf = function (callback, frames) {
        if (frames === void 0) { frames = 1; }
        var queue = new RafQueue(callback, frames);
        return function () { return queue.cancel(); };
    };
    BrowserDetails = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BrowserDetails);
    return BrowserDetails;
})();
exports.BrowserDetails = BrowserDetails;
var RafQueue = (function () {
    function RafQueue(callback, frames) {
        this.callback = callback;
        this.frames = frames;
        this._raf();
    }
    RafQueue.prototype._raf = function () {
        var _this = this;
        this.currentFrameId =
            dom_adapter_1.DOM.requestAnimationFrame(function (timestamp) { return _this._nextFrame(timestamp); });
    };
    RafQueue.prototype._nextFrame = function (timestamp) {
        this.frames--;
        if (this.frames > 0) {
            this._raf();
        }
        else {
            this.callback(timestamp);
        }
    };
    RafQueue.prototype.cancel = function () {
        dom_adapter_1.DOM.cancelAnimationFrame(this.currentFrameId);
        this.currentFrameId = null;
    };
    return RafQueue;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbIkJyb3dzZXJEZXRhaWxzIiwiQnJvd3NlckRldGFpbHMuY29uc3RydWN0b3IiLCJCcm93c2VyRGV0YWlscy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5IiwiQnJvd3NlckRldGFpbHMucmFmIiwiUmFmUXVldWUiLCJSYWZRdWV1ZS5jb25zdHJ1Y3RvciIsIlJhZlF1ZXVlLl9yYWYiLCJSYWZRdWV1ZS5fbmV4dEZyYW1lIiwiUmFmUXVldWUuY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBbUIsMEJBQTBCLENBQUMsQ0FBQTtBQUM5Qyw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUUxRDtJQUlFQTtRQUZBQyw2QkFBd0JBLEdBQUdBLEtBQUtBLENBQUNBO1FBRWpCQSxJQUFJQSxDQUFDQSw0QkFBNEJBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRXRERDs7O09BR0dBO0lBQ0hBLHFEQUE0QkEsR0FBNUJBO1FBQUFFLGlCQWFDQTtRQVpDQSxJQUFJQSxHQUFHQSxHQUFHQSxpQkFBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLGlCQUFHQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxFQUFFQSxrSEFDZ0JBLENBQUNBLENBQUNBO1FBQ2pEQSw2REFBNkRBO1FBQzdEQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFDQSxTQUFjQTtZQUN0QkEsaUJBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLGVBQWVBLEVBQUVBLFVBQUNBLEtBQVVBO2dCQUN0Q0EsSUFBSUEsT0FBT0EsR0FBR0EsV0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ25EQSxLQUFJQSxDQUFDQSx3QkFBd0JBLEdBQUdBLE9BQU9BLElBQUlBLENBQUNBLENBQUNBO2dCQUM3Q0EsaUJBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2xCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNIQSxpQkFBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDcENBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ1JBLENBQUNBO0lBRURGLDRCQUFHQSxHQUFIQSxVQUFJQSxRQUFrQkEsRUFBRUEsTUFBa0JBO1FBQWxCRyxzQkFBa0JBLEdBQWxCQSxVQUFrQkE7UUFDeENBLElBQUlBLEtBQUtBLEdBQWFBLElBQUlBLFFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3JEQSxNQUFNQSxDQUFDQSxjQUFNQSxPQUFBQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFkQSxDQUFjQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUE1QkhIO1FBQUNBLGVBQVVBLEVBQUVBOzt1QkE2QlpBO0lBQURBLHFCQUFDQTtBQUFEQSxDQUFDQSxBQTdCRCxJQTZCQztBQTVCWSxzQkFBYyxpQkE0QjFCLENBQUE7QUFFRDtJQUVFSSxrQkFBbUJBLFFBQWtCQSxFQUFTQSxNQUFjQTtRQUF6Q0MsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBVUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFDdEVELHVCQUFJQSxHQUFaQTtRQUFBRSxpQkFHQ0E7UUFGQ0EsSUFBSUEsQ0FBQ0EsY0FBY0E7WUFDZkEsaUJBQUdBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsVUFBQ0EsU0FBaUJBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBLEVBQTFCQSxDQUEwQkEsQ0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBQ09GLDZCQUFVQSxHQUFsQkEsVUFBbUJBLFNBQWlCQTtRQUNsQ0csSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDZEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ2RBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzNCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUNESCx5QkFBTUEsR0FBTkE7UUFDRUksaUJBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBO0lBQzdCQSxDQUFDQTtJQUNISixlQUFDQTtBQUFEQSxDQUFDQSxBQW5CRCxJQW1CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNYXRofSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL21hdGgnO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3NlckRldGFpbHMge1xuICBlbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcigpIHsgdGhpcy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5KCk7IH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBgZXZlbnQuZWxhcHNlZFRpbWVgIGluY2x1ZGVzIHRyYW5zaXRpb24gZGVsYXkgaW4gdGhlIGN1cnJlbnQgYnJvd3Nlci4gIEF0IHRoaXNcbiAgICogdGltZSwgQ2hyb21lIGFuZCBPcGVyYSBzZWVtIHRvIGJlIHRoZSBvbmx5IGJyb3dzZXJzIHRoYXQgaW5jbHVkZSB0aGlzLlxuICAgKi9cbiAgZG9lc0VsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSgpOiB2b2lkIHtcbiAgICB2YXIgZGl2ID0gRE9NLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIERPTS5zZXRBdHRyaWJ1dGUoZGl2LCAnc3R5bGUnLCBgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IC05OTk5cHg7IGxlZnQ6IC05OTk5cHg7IHdpZHRoOiAxcHg7XG4gICAgICBoZWlnaHQ6IDFweDsgdHJhbnNpdGlvbjogYWxsIDFtcyBsaW5lYXIgMW1zO2ApO1xuICAgIC8vIEZpcmVmb3ggcmVxdWlyZXMgdGhhdCB3ZSB3YWl0IGZvciAyIGZyYW1lcyBmb3Igc29tZSByZWFzb25cbiAgICB0aGlzLnJhZigodGltZXN0YW1wOiBhbnkpID0+IHtcbiAgICAgIERPTS5vbihkaXYsICd0cmFuc2l0aW9uZW5kJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgdmFyIGVsYXBzZWQgPSBNYXRoLnJvdW5kKGV2ZW50LmVsYXBzZWRUaW1lICogMTAwMCk7XG4gICAgICAgIHRoaXMuZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5ID0gZWxhcHNlZCA9PSAyO1xuICAgICAgICBET00ucmVtb3ZlKGRpdik7XG4gICAgICB9KTtcbiAgICAgIERPTS5zZXRTdHlsZShkaXYsICd3aWR0aCcsICcycHgnKTtcbiAgICB9LCAyKTtcbiAgfVxuXG4gIHJhZihjYWxsYmFjazogRnVuY3Rpb24sIGZyYW1lczogbnVtYmVyID0gMSk6IEZ1bmN0aW9uIHtcbiAgICB2YXIgcXVldWU6IFJhZlF1ZXVlID0gbmV3IFJhZlF1ZXVlKGNhbGxiYWNrLCBmcmFtZXMpO1xuICAgIHJldHVybiAoKSA9PiBxdWV1ZS5jYW5jZWwoKTtcbiAgfVxufVxuXG5jbGFzcyBSYWZRdWV1ZSB7XG4gIGN1cnJlbnRGcmFtZUlkOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjYWxsYmFjazogRnVuY3Rpb24sIHB1YmxpYyBmcmFtZXM6IG51bWJlcikgeyB0aGlzLl9yYWYoKTsgfVxuICBwcml2YXRlIF9yYWYoKSB7XG4gICAgdGhpcy5jdXJyZW50RnJhbWVJZCA9XG4gICAgICAgIERPTS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKHRpbWVzdGFtcDogbnVtYmVyKSA9PiB0aGlzLl9uZXh0RnJhbWUodGltZXN0YW1wKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbmV4dEZyYW1lKHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcmFtZXMtLTtcbiAgICBpZiAodGhpcy5mcmFtZXMgPiAwKSB7XG4gICAgICB0aGlzLl9yYWYoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFjayh0aW1lc3RhbXApO1xuICAgIH1cbiAgfVxuICBjYW5jZWwoKSB7XG4gICAgRE9NLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuY3VycmVudEZyYW1lSWQpO1xuICAgIHRoaXMuY3VycmVudEZyYW1lSWQgPSBudWxsO1xuICB9XG59XG4iXX0=