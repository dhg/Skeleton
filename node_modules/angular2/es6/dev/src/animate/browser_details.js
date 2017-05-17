var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { Math } from 'angular2/src/facade/math';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
export let BrowserDetails = class {
    constructor() {
        this.elapsedTimeIncludesDelay = false;
        this.doesElapsedTimeIncludesDelay();
    }
    /**
     * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
     * time, Chrome and Opera seem to be the only browsers that include this.
     */
    doesElapsedTimeIncludesDelay() {
        var div = DOM.createElement('div');
        DOM.setAttribute(div, 'style', `position: absolute; top: -9999px; left: -9999px; width: 1px;
      height: 1px; transition: all 1ms linear 1ms;`);
        // Firefox requires that we wait for 2 frames for some reason
        this.raf((timestamp) => {
            DOM.on(div, 'transitionend', (event) => {
                var elapsed = Math.round(event.elapsedTime * 1000);
                this.elapsedTimeIncludesDelay = elapsed == 2;
                DOM.remove(div);
            });
            DOM.setStyle(div, 'width', '2px');
        }, 2);
    }
    raf(callback, frames = 1) {
        var queue = new RafQueue(callback, frames);
        return () => queue.cancel();
    }
};
BrowserDetails = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], BrowserDetails);
class RafQueue {
    constructor(callback, frames) {
        this.callback = callback;
        this.frames = frames;
        this._raf();
    }
    _raf() {
        this.currentFrameId =
            DOM.requestAnimationFrame((timestamp) => this._nextFrame(timestamp));
    }
    _nextFrame(timestamp) {
        this.frames--;
        if (this.frames > 0) {
            this._raf();
        }
        else {
            this.callback(timestamp);
        }
    }
    cancel() {
        DOM.cancelAnimationFrame(this.currentFrameId);
        this.currentFrameId = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbIkJyb3dzZXJEZXRhaWxzIiwiQnJvd3NlckRldGFpbHMuY29uc3RydWN0b3IiLCJCcm93c2VyRGV0YWlscy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5IiwiQnJvd3NlckRldGFpbHMucmFmIiwiUmFmUXVldWUiLCJSYWZRdWV1ZS5jb25zdHJ1Y3RvciIsIlJhZlF1ZXVlLl9yYWYiLCJSYWZRdWV1ZS5fbmV4dEZyYW1lIiwiUmFmUXVldWUuY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLElBQUksRUFBQyxNQUFNLDBCQUEwQjtPQUN0QyxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztBQUV6RDtJQUlFQTtRQUZBQyw2QkFBd0JBLEdBQUdBLEtBQUtBLENBQUNBO1FBRWpCQSxJQUFJQSxDQUFDQSw0QkFBNEJBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRXRERDs7O09BR0dBO0lBQ0hBLDRCQUE0QkE7UUFDMUJFLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ25DQSxHQUFHQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxFQUFFQTttREFDZ0JBLENBQUNBLENBQUNBO1FBQ2pEQSw2REFBNkRBO1FBQzdEQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxTQUFjQTtZQUN0QkEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsZUFBZUEsRUFBRUEsQ0FBQ0EsS0FBVUE7Z0JBQ3RDQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDbkRBLElBQUlBLENBQUNBLHdCQUF3QkEsR0FBR0EsT0FBT0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzdDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNsQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDSEEsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDcENBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ1JBLENBQUNBO0lBRURGLEdBQUdBLENBQUNBLFFBQWtCQSxFQUFFQSxNQUFNQSxHQUFXQSxDQUFDQTtRQUN4Q0csSUFBSUEsS0FBS0EsR0FBYUEsSUFBSUEsUUFBUUEsQ0FBQ0EsUUFBUUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLE1BQU1BLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0lBQzlCQSxDQUFDQTtBQUNISCxDQUFDQTtBQTdCRDtJQUFDLFVBQVUsRUFBRTs7bUJBNkJaO0FBRUQ7SUFFRUksWUFBbUJBLFFBQWtCQSxFQUFTQSxNQUFjQTtRQUF6Q0MsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBVUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFDdEVELElBQUlBO1FBQ1ZFLElBQUlBLENBQUNBLGNBQWNBO1lBQ2ZBLEdBQUdBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsU0FBaUJBLEtBQUtBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUNPRixVQUFVQSxDQUFDQSxTQUFpQkE7UUFDbENHLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ2RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFDREgsTUFBTUE7UUFDSkksR0FBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUM5Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDN0JBLENBQUNBO0FBQ0hKLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TWF0aH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9tYXRoJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEZXRhaWxzIHtcbiAgZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMuZG9lc0VsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSgpOyB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYGV2ZW50LmVsYXBzZWRUaW1lYCBpbmNsdWRlcyB0cmFuc2l0aW9uIGRlbGF5IGluIHRoZSBjdXJyZW50IGJyb3dzZXIuICBBdCB0aGlzXG4gICAqIHRpbWUsIENocm9tZSBhbmQgT3BlcmEgc2VlbSB0byBiZSB0aGUgb25seSBicm93c2VycyB0aGF0IGluY2x1ZGUgdGhpcy5cbiAgICovXG4gIGRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTogdm9pZCB7XG4gICAgdmFyIGRpdiA9IERPTS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBET00uc2V0QXR0cmlidXRlKGRpdiwgJ3N0eWxlJywgYHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAtOTk5OXB4OyBsZWZ0OiAtOTk5OXB4OyB3aWR0aDogMXB4O1xuICAgICAgaGVpZ2h0OiAxcHg7IHRyYW5zaXRpb246IGFsbCAxbXMgbGluZWFyIDFtcztgKTtcbiAgICAvLyBGaXJlZm94IHJlcXVpcmVzIHRoYXQgd2Ugd2FpdCBmb3IgMiBmcmFtZXMgZm9yIHNvbWUgcmVhc29uXG4gICAgdGhpcy5yYWYoKHRpbWVzdGFtcDogYW55KSA9PiB7XG4gICAgICBET00ub24oZGl2LCAndHJhbnNpdGlvbmVuZCcsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIHZhciBlbGFwc2VkID0gTWF0aC5yb3VuZChldmVudC5lbGFwc2VkVGltZSAqIDEwMDApO1xuICAgICAgICB0aGlzLmVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGVsYXBzZWQgPT0gMjtcbiAgICAgICAgRE9NLnJlbW92ZShkaXYpO1xuICAgICAgfSk7XG4gICAgICBET00uc2V0U3R5bGUoZGl2LCAnd2lkdGgnLCAnMnB4Jyk7XG4gICAgfSwgMik7XG4gIH1cblxuICByYWYoY2FsbGJhY2s6IEZ1bmN0aW9uLCBmcmFtZXM6IG51bWJlciA9IDEpOiBGdW5jdGlvbiB7XG4gICAgdmFyIHF1ZXVlOiBSYWZRdWV1ZSA9IG5ldyBSYWZRdWV1ZShjYWxsYmFjaywgZnJhbWVzKTtcbiAgICByZXR1cm4gKCkgPT4gcXVldWUuY2FuY2VsKCk7XG4gIH1cbn1cblxuY2xhc3MgUmFmUXVldWUge1xuICBjdXJyZW50RnJhbWVJZDogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2FsbGJhY2s6IEZ1bmN0aW9uLCBwdWJsaWMgZnJhbWVzOiBudW1iZXIpIHsgdGhpcy5fcmFmKCk7IH1cbiAgcHJpdmF0ZSBfcmFmKCkge1xuICAgIHRoaXMuY3VycmVudEZyYW1lSWQgPVxuICAgICAgICBET00ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXA6IG51bWJlcikgPT4gdGhpcy5fbmV4dEZyYW1lKHRpbWVzdGFtcCkpO1xuICB9XG4gIHByaXZhdGUgX25leHRGcmFtZSh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgIHRoaXMuZnJhbWVzLS07XG4gICAgaWYgKHRoaXMuZnJhbWVzID4gMCkge1xuICAgICAgdGhpcy5fcmFmKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2sodGltZXN0YW1wKTtcbiAgICB9XG4gIH1cbiAgY2FuY2VsKCkge1xuICAgIERPTS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmN1cnJlbnRGcmFtZUlkKTtcbiAgICB0aGlzLmN1cnJlbnRGcmFtZUlkID0gbnVsbDtcbiAgfVxufVxuIl19