'use strict';var async_1 = require('angular2/src/facade/async');
var ng_zone_impl_1 = require('./ng_zone_impl');
var exceptions_1 = require('../../facade/exceptions');
var ng_zone_impl_2 = require('./ng_zone_impl');
exports.NgZoneError = ng_zone_impl_2.NgZoneError;
/**
 * An injectable service for executing work inside or outside of the Angular zone.
 *
 * The most common use of this service is to optimize performance when starting a work consisting of
 * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
 * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
 * can reenter the Angular zone via {@link #run}.
 *
 * <!-- TODO: add/fix links to:
 *   - docs explaining zones and the use of zones in Angular and change-detection
 *   - link to runOutsideAngular/run (throughout this file!)
 *   -->
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 * ```
 * import {Component, View, NgZone} from 'angular2/core';
 * import {NgIf} from 'angular2/common';
 *
 * @Component({
 *   selector: 'ng-zone-demo'.
 *   template: `
 *     <h2>Demo: NgZone</h2>
 *
 *     <p>Progress: {{progress}}%</p>
 *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
 *
 *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
 *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
 *   `,
 *   directives: [NgIf]
 * })
 * export class NgZoneDemo {
 *   progress: number = 0;
 *   label: string;
 *
 *   constructor(private _ngZone: NgZone) {}
 *
 *   // Loop inside the Angular zone
 *   // so the UI DOES refresh after each setTimeout cycle
 *   processWithinAngularZone() {
 *     this.label = 'inside';
 *     this.progress = 0;
 *     this._increaseProgress(() => console.log('Inside Done!'));
 *   }
 *
 *   // Loop outside of the Angular zone
 *   // so the UI DOES NOT refresh after each setTimeout cycle
 *   processOutsideOfAngularZone() {
 *     this.label = 'outside';
 *     this.progress = 0;
 *     this._ngZone.runOutsideAngular(() => {
 *       this._increaseProgress(() => {
 *       // reenter the Angular zone and display done
 *       this._ngZone.run(() => {console.log('Outside Done!') });
 *     }}));
 *   }
 *
 *
 *   _increaseProgress(doneCallback: () => void) {
 *     this.progress += 1;
 *     console.log(`Current progress: ${this.progress}%`);
 *
 *     if (this.progress < 100) {
 *       window.setTimeout(() => this._increaseProgress(doneCallback)), 10)
 *     } else {
 *       doneCallback();
 *     }
 *   }
 * }
 * ```
 */
var NgZone = (function () {
    /**
     * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
     *               enabled in development mode as they significantly impact perf.
     */
    function NgZone(_a) {
        var _this = this;
        var _b = _a.enableLongStackTrace, enableLongStackTrace = _b === void 0 ? false : _b;
        this._hasPendingMicrotasks = false;
        this._hasPendingMacrotasks = false;
        /** @internal */
        this._isStable = true;
        /** @internal */
        this._nesting = 0;
        /** @internal */
        this._onUnstable = new async_1.EventEmitter(false);
        /** @internal */
        this._onMicrotaskEmpty = new async_1.EventEmitter(false);
        /** @internal */
        this._onStable = new async_1.EventEmitter(false);
        /** @internal */
        this._onErrorEvents = new async_1.EventEmitter(false);
        this._zoneImpl = new ng_zone_impl_1.NgZoneImpl({
            trace: enableLongStackTrace,
            onEnter: function () {
                // console.log('ZONE.enter', this._nesting, this._isStable);
                _this._nesting++;
                if (_this._isStable) {
                    _this._isStable = false;
                    _this._onUnstable.emit(null);
                }
            },
            onLeave: function () {
                _this._nesting--;
                // console.log('ZONE.leave', this._nesting, this._isStable);
                _this._checkStable();
            },
            setMicrotask: function (hasMicrotasks) {
                _this._hasPendingMicrotasks = hasMicrotasks;
                _this._checkStable();
            },
            setMacrotask: function (hasMacrotasks) { _this._hasPendingMacrotasks = hasMacrotasks; },
            onError: function (error) { return _this._onErrorEvents.emit(error); }
        });
    }
    NgZone.isInAngularZone = function () { return ng_zone_impl_1.NgZoneImpl.isInAngularZone(); };
    NgZone.assertInAngularZone = function () {
        if (!ng_zone_impl_1.NgZoneImpl.isInAngularZone()) {
            throw new exceptions_1.BaseException('Expected to be in Angular Zone, but it is not!');
        }
    };
    NgZone.assertNotInAngularZone = function () {
        if (ng_zone_impl_1.NgZoneImpl.isInAngularZone()) {
            throw new exceptions_1.BaseException('Expected to not be in Angular Zone, but it is!');
        }
    };
    NgZone.prototype._checkStable = function () {
        var _this = this;
        if (this._nesting == 0) {
            if (!this._hasPendingMicrotasks && !this._isStable) {
                try {
                    // console.log('ZONE.microtaskEmpty');
                    this._nesting++;
                    this._onMicrotaskEmpty.emit(null);
                }
                finally {
                    this._nesting--;
                    if (!this._hasPendingMicrotasks) {
                        try {
                            // console.log('ZONE.stable', this._nesting, this._isStable);
                            this.runOutsideAngular(function () { return _this._onStable.emit(null); });
                        }
                        finally {
                            this._isStable = true;
                        }
                    }
                }
            }
        }
    };
    ;
    Object.defineProperty(NgZone.prototype, "onUnstable", {
        /**
         * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
         */
        get: function () { return this._onUnstable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "onMicrotaskEmpty", {
        /**
         * Notifies when there is no more microtasks enqueue in the current VM Turn.
         * This is a hint for Angular to do change detection, which may enqueue more microtasks.
         * For this reason this event can fire multiple times per VM Turn.
         */
        get: function () { return this._onMicrotaskEmpty; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "onStable", {
        /**
         * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
         * implies we are about to relinquish VM turn.
         * This event gets called just once.
         */
        get: function () { return this._onStable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "onError", {
        /**
         * Notify that an error has been delivered.
         */
        get: function () { return this._onErrorEvents; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "hasPendingMicrotasks", {
        /**
         * Whether there are any outstanding microtasks.
         */
        get: function () { return this._hasPendingMicrotasks; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "hasPendingMacrotasks", {
        /**
         * Whether there are any outstanding microtasks.
         */
        get: function () { return this._hasPendingMacrotasks; },
        enumerable: true,
        configurable: true
    });
    /**
     * Executes the `fn` function synchronously within the Angular zone and returns value returned by
     * the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     */
    NgZone.prototype.run = function (fn) { return this._zoneImpl.runInner(fn); };
    /**
     * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
     * the function.
     *
     * Running functions via `runOutsideAngular` allows you to escape Angular's zone and do work that
     * doesn't trigger Angular change-detection or is subject to Angular's error handling.
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * outside of the Angular zone.
     *
     * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
     */
    NgZone.prototype.runOutsideAngular = function (fn) { return this._zoneImpl.runOuter(fn); };
    return NgZone;
})();
exports.NgZone = NgZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZS50cyJdLCJuYW1lcyI6WyJOZ1pvbmUiLCJOZ1pvbmUuY29uc3RydWN0b3IiLCJOZ1pvbmUuaXNJbkFuZ3VsYXJab25lIiwiTmdab25lLmFzc2VydEluQW5ndWxhclpvbmUiLCJOZ1pvbmUuYXNzZXJ0Tm90SW5Bbmd1bGFyWm9uZSIsIk5nWm9uZS5fY2hlY2tTdGFibGUiLCJOZ1pvbmUub25VbnN0YWJsZSIsIk5nWm9uZS5vbk1pY3JvdGFza0VtcHR5IiwiTmdab25lLm9uU3RhYmxlIiwiTmdab25lLm9uRXJyb3IiLCJOZ1pvbmUuaGFzUGVuZGluZ01pY3JvdGFza3MiLCJOZ1pvbmUuaGFzUGVuZGluZ01hY3JvdGFza3MiLCJOZ1pvbmUucnVuIiwiTmdab25lLnJ1bk91dHNpZGVBbmd1bGFyIl0sIm1hcHBpbmdzIjoiQUFBQSxzQkFBMkIsMkJBQTJCLENBQUMsQ0FBQTtBQUN2RCw2QkFBc0MsZ0JBQWdCLENBQUMsQ0FBQTtBQUN2RCwyQkFBNEIseUJBQXlCLENBQUMsQ0FBQTtBQUN0RCw2QkFBMEIsZ0JBQWdCLENBQUM7QUFBbkMsaURBQW1DO0FBRzNDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0VHO0FBQ0g7SUErQkVBOzs7T0FHR0E7SUFDSEEsZ0JBQVlBLEVBQThCQTtRQW5DNUNDLGlCQTZJQ0E7MENBMUdjQSxvQkFBb0JBLG1CQUFHQSxLQUFLQTtRQXBCakNBLDBCQUFxQkEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFDdkNBLDBCQUFxQkEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFL0NBLGdCQUFnQkE7UUFDUkEsY0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekJBLGdCQUFnQkE7UUFDUkEsYUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDckJBLGdCQUFn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QUNBOzs7T0FBQVQ7SUFLaEVBLHNCQUFJQSx3Q0FBb0JBO1FBSHhCQTs7V0FFR0E7YUFDSEEsY0FBc0NVLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBVjtJQUsxRUEsc0JBQUlBLHdDQUFvQkE7UUFIeEJBOztXQUVHQTthQUNIQSxjQUFzQ1csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFYO0lBRTFFQTs7Ozs7Ozs7O09BU0dBO0lBQ0hBLG9CQUFHQSxHQUFIQSxVQUFJQSxFQUFhQSxJQUFTWSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUvRFo7Ozs7Ozs7Ozs7O09BV0dBO0lBQ0hBLGtDQUFpQkEsR0FBakJBLFVBQWtCQSxFQUFhQSxJQUFTYSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMvRWIsYUFBQ0E7QUFBREEsQ0FBQ0EsQUE3SUQsSUE2SUM7QUE3SVksY0FBTSxTQTZJbEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7Tmdab25lSW1wbCwgTmdab25lRXJyb3J9IGZyb20gJy4vbmdfem9uZV9pbXBsJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnLi4vLi4vZmFjYWRlL2V4Y2VwdGlvbnMnO1xuZXhwb3J0IHtOZ1pvbmVFcnJvcn0gZnJvbSAnLi9uZ196b25lX2ltcGwnO1xuXG5cbi8qKlxuICogQW4gaW5qZWN0YWJsZSBzZXJ2aWNlIGZvciBleGVjdXRpbmcgd29yayBpbnNpZGUgb3Igb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICpcbiAqIFRoZSBtb3N0IGNvbW1vbiB1c2Ugb2YgdGhpcyBzZXJ2aWNlIGlzIHRvIG9wdGltaXplIHBlcmZvcm1hbmNlIHdoZW4gc3RhcnRpbmcgYSB3b3JrIGNvbnNpc3Rpbmcgb2ZcbiAqIG9uZSBvciBtb3JlIGFzeW5jaHJvbm91cyB0YXNrcyB0aGF0IGRvbid0IHJlcXVpcmUgVUkgdXBkYXRlcyBvciBlcnJvciBoYW5kbGluZyB0byBiZSBoYW5kbGVkIGJ5XG4gKiBBbmd1bGFyLiBTdWNoIHRhc2tzIGNhbiBiZSBraWNrZWQgb2ZmIHZpYSB7QGxpbmsgI3J1bk91dHNpZGVBbmd1bGFyfSBhbmQgaWYgbmVlZGVkLCB0aGVzZSB0YXNrc1xuICogY2FuIHJlZW50ZXIgdGhlIEFuZ3VsYXIgem9uZSB2aWEge0BsaW5rICNydW59LlxuICpcbiAqIDwhLS0gVE9ETzogYWRkL2ZpeCBsaW5rcyB0bzpcbiAqICAgLSBkb2NzIGV4cGxhaW5pbmcgem9uZXMgYW5kIHRoZSB1c2Ugb2Ygem9uZXMgaW4gQW5ndWxhciBhbmQgY2hhbmdlLWRldGVjdGlvblxuICogICAtIGxpbmsgdG8gcnVuT3V0c2lkZUFuZ3VsYXIvcnVuICh0aHJvdWdob3V0IHRoaXMgZmlsZSEpXG4gKiAgIC0tPlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9sWTltOEhMeTd6MDZ2RG9VYVNOMj9wPXByZXZpZXcpKVxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgVmlldywgTmdab25lfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7TmdJZn0gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICduZy16b25lLWRlbW8nLlxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxoMj5EZW1vOiBOZ1pvbmU8L2gyPlxuICpcbiAqICAgICA8cD5Qcm9ncmVzczoge3twcm9ncmVzc319JTwvcD5cbiAqICAgICA8cCAqbmdJZj1cInByb2dyZXNzID49IDEwMFwiPkRvbmUgcHJvY2Vzc2luZyB7e2xhYmVsfX0gb2YgQW5ndWxhciB6b25lITwvcD5cbiAqXG4gKiAgICAgPGJ1dHRvbiAoY2xpY2spPVwicHJvY2Vzc1dpdGhpbkFuZ3VsYXJab25lKClcIj5Qcm9jZXNzIHdpdGhpbiBBbmd1bGFyIHpvbmU8L2J1dHRvbj5cbiAqICAgICA8YnV0dG9uIChjbGljayk9XCJwcm9jZXNzT3V0c2lkZU9mQW5ndWxhclpvbmUoKVwiPlByb2Nlc3Mgb3V0c2lkZSBvZiBBbmd1bGFyIHpvbmU8L2J1dHRvbj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nSWZdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE5nWm9uZURlbW8ge1xuICogICBwcm9ncmVzczogbnVtYmVyID0gMDtcbiAqICAgbGFiZWw6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7fVxuICpcbiAqICAgLy8gTG9vcCBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZVxuICogICAvLyBzbyB0aGUgVUkgRE9FUyByZWZyZXNoIGFmdGVyIGVhY2ggc2V0VGltZW91dCBjeWNsZVxuICogICBwcm9jZXNzV2l0aGluQW5ndWxhclpvbmUoKSB7XG4gKiAgICAgdGhpcy5sYWJlbCA9ICdpbnNpZGUnO1xuICogICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICogICAgIHRoaXMuX2luY3JlYXNlUHJvZ3Jlc3MoKCkgPT4gY29uc29sZS5sb2coJ0luc2lkZSBEb25lIScpKTtcbiAqICAgfVxuICpcbiAqICAgLy8gTG9vcCBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmVcbiAqICAgLy8gc28gdGhlIFVJIERPRVMgTk9UIHJlZnJlc2ggYWZ0ZXIgZWFjaCBzZXRUaW1lb3V0IGN5Y2xlXG4gKiAgIHByb2Nlc3NPdXRzaWRlT2ZBbmd1bGFyWm9uZSgpIHtcbiAqICAgICB0aGlzLmxhYmVsID0gJ291dHNpZGUnO1xuICogICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICogICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gKiAgICAgICB0aGlzLl9pbmNyZWFzZVByb2dyZXNzKCgpID0+IHtcbiAqICAgICAgIC8vIHJlZW50ZXIgdGhlIEFuZ3VsYXIgem9uZSBhbmQgZGlzcGxheSBkb25lXG4gKiAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtjb25zb2xlLmxvZygnT3V0c2lkZSBEb25lIScpIH0pO1xuICogICAgIH19KSk7XG4gKiAgIH1cbiAqXG4gKlxuICogICBfaW5jcmVhc2VQcm9ncmVzcyhkb25lQ2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAqICAgICB0aGlzLnByb2dyZXNzICs9IDE7XG4gKiAgICAgY29uc29sZS5sb2coYEN1cnJlbnQgcHJvZ3Jlc3M6ICR7dGhpcy5wcm9ncmVzc30lYCk7XG4gKlxuICogICAgIGlmICh0aGlzLnByb2dyZXNzIDwgMTAwKSB7XG4gKiAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB0aGlzLl9pbmNyZWFzZVByb2dyZXNzKGRvbmVDYWxsYmFjaykpLCAxMClcbiAqICAgICB9IGVsc2Uge1xuICogICAgICAgZG9uZUNhbGxiYWNrKCk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE5nWm9uZSB7XG4gIHN0YXRpYyBpc0luQW5ndWxhclpvbmUoKTogYm9vbGVhbiB7IHJldHVybiBOZ1pvbmVJbXBsLmlzSW5Bbmd1bGFyWm9uZSgpOyB9XG4gIHN0YXRpYyBhc3NlcnRJbkFuZ3VsYXJab25lKCk6IHZvaWQge1xuICAgIGlmICghTmdab25lSW1wbC5pc0luQW5ndWxhclpvbmUoKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0V4cGVjdGVkIHRvIGJlIGluIEFuZ3VsYXIgWm9uZSwgYnV0IGl0IGlzIG5vdCEnKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIGFzc2VydE5vdEluQW5ndWxhclpvbmUoKTogdm9pZCB7XG4gICAgaWYgKE5nWm9uZUltcGwuaXNJbkFuZ3VsYXJab25lKCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdFeHBlY3RlZCB0byBub3QgYmUgaW4gQW5ndWxhciBab25lLCBidXQgaXQgaXMhJyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfem9uZUltcGw6IE5nWm9uZUltcGw7XG5cbiAgcHJpdmF0ZSBfaGFzUGVuZGluZ01pY3JvdGFza3M6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfaGFzUGVuZGluZ01hY3JvdGFza3M6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2lzU3RhYmxlID0gdHJ1ZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9uZXN0aW5nID0gMDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9vblVuc3RhYmxlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX29uTWljcm90YXNrRW1wdHk6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfb25TdGFibGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfb25FcnJvckV2ZW50czogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKGZhbHNlKTtcblxuICAvKipcbiAgICogQHBhcmFtIHtib29sfSBlbmFibGVMb25nU3RhY2tUcmFjZSB3aGV0aGVyIHRvIGVuYWJsZSBsb25nIHN0YWNrIHRyYWNlLiBUaGV5IHNob3VsZCBvbmx5IGJlXG4gICAqICAgICAgICAgICAgICAgZW5hYmxlZCBpbiBkZXZlbG9wbWVudCBtb2RlIGFzIHRoZXkgc2lnbmlmaWNhbnRseSBpbXBhY3QgcGVyZi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHtlbmFibGVMb25nU3RhY2tUcmFjZSA9IGZhbHNlfSkge1xuICAgIHRoaXMuX3pvbmVJbXBsID0gbmV3IE5nWm9uZUltcGwoe1xuICAgICAgdHJhY2U6IGVuYWJsZUxvbmdTdGFja1RyYWNlLFxuICAgICAgb25FbnRlcjogKCkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnWk9ORS5lbnRlcicsIHRoaXMuX25lc3RpbmcsIHRoaXMuX2lzU3RhYmxlKTtcbiAgICAgICAgdGhpcy5fbmVzdGluZysrO1xuICAgICAgICBpZiAodGhpcy5faXNTdGFibGUpIHtcbiAgICAgICAgICB0aGlzLl9pc1N0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuX29uVW5zdGFibGUuZW1pdChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uTGVhdmU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fbmVzdGluZy0tO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnWk9ORS5sZWF2ZScsIHRoaXMuX25lc3RpbmcsIHRoaXMuX2lzU3RhYmxlKTtcbiAgICAgICAgdGhpcy5fY2hlY2tTdGFibGUoKTtcbiAgICAgIH0sXG4gICAgICBzZXRNaWNyb3Rhc2s6IChoYXNNaWNyb3Rhc2tzOiBib29sZWFuKSA9PiB7XG4gICAgICAgIHRoaXMuX2hhc1BlbmRpbmdNaWNyb3Rhc2tzID0gaGFzTWljcm90YXNrcztcbiAgICAgICAgdGhpcy5fY2hlY2tTdGFibGUoKTtcbiAgICAgIH0sXG4gICAgICBzZXRNYWNyb3Rhc2s6IChoYXNNYWNyb3Rhc2tzOiBib29sZWFuKSA9PiB7IHRoaXMuX2hhc1BlbmRpbmdNYWNyb3Rhc2tzID0gaGFzTWFjcm90YXNrczsgfSxcbiAgICAgIG9uRXJyb3I6IChlcnJvcjogTmdab25lRXJyb3IpID0+IHRoaXMuX29uRXJyb3JFdmVudHMuZW1pdChlcnJvcilcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrU3RhYmxlKCkge1xuICAgIGlmICh0aGlzLl9uZXN0aW5nID09IDApIHtcbiAgICAgIGlmICghdGhpcy5faGFzUGVuZGluZ01pY3JvdGFza3MgJiYgIXRoaXMuX2lzU3RhYmxlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ1pPTkUubWljcm90YXNrRW1wdHknKTtcbiAgICAgICAgICB0aGlzLl9uZXN0aW5nKys7XG4gICAgICAgICAgdGhpcy5fb25NaWNyb3Rhc2tFbXB0eS5lbWl0KG51bGwpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRoaXMuX25lc3RpbmctLTtcbiAgICAgICAgICBpZiAoIXRoaXMuX2hhc1BlbmRpbmdNaWNyb3Rhc2tzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnWk9ORS5zdGFibGUnLCB0aGlzLl9uZXN0aW5nLCB0aGlzLl9pc1N0YWJsZSk7XG4gICAgICAgICAgICAgIHRoaXMucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gdGhpcy5fb25TdGFibGUuZW1pdChudWxsKSk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICB0aGlzLl9pc1N0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBOb3RpZmllcyB3aGVuIGNvZGUgZW50ZXJzIEFuZ3VsYXIgWm9uZS4gVGhpcyBnZXRzIGZpcmVkIGZpcnN0IG9uIFZNIFR1cm4uXG4gICAqL1xuICBnZXQgb25VbnN0YWJsZSgpOiBFdmVudEVtaXR0ZXI8YW55PiB7IHJldHVybiB0aGlzLl9vblVuc3RhYmxlOyB9XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHdoZW4gdGhlcmUgaXMgbm8gbW9yZSBtaWNyb3Rhc2tzIGVucXVldWUgaW4gdGhlIGN1cnJlbnQgVk0gVHVybi5cbiAgICogVGhpcyBpcyBhIGhpbnQgZm9yIEFuZ3VsYXIgdG8gZG8gY2hhbmdlIGRldGVjdGlvbiwgd2hpY2ggbWF5IGVucXVldWUgbW9yZSBtaWNyb3Rhc2tzLlxuICAgKiBGb3IgdGhpcyByZWFzb24gdGhpcyBldmVudCBjYW4gZmlyZSBtdWx0aXBsZSB0aW1lcyBwZXIgVk0gVHVybi5cbiAgICovXG4gIGdldCBvbk1pY3JvdGFza0VtcHR5KCk6IEV2ZW50RW1pdHRlcjxhbnk+IHsgcmV0dXJuIHRoaXMuX29uTWljcm90YXNrRW1wdHk7IH1cblxuICAvKipcbiAgICogTm90aWZpZXMgd2hlbiB0aGUgbGFzdCBgb25NaWNyb3Rhc2tFbXB0eWAgaGFzIHJ1biBhbmQgdGhlcmUgYXJlIG5vIG1vcmUgbWljcm90YXNrcywgd2hpY2hcbiAgICogaW1wbGllcyB3ZSBhcmUgYWJvdXQgdG8gcmVsaW5xdWlzaCBWTSB0dXJuLlxuICAgKiBUaGlzIGV2ZW50IGdldHMgY2FsbGVkIGp1c3Qgb25jZS5cbiAgICovXG4gIGdldCBvblN0YWJsZSgpOiBFdmVudEVtaXR0ZXI8YW55PiB7IHJldHVybiB0aGlzLl9vblN0YWJsZTsgfVxuXG4gIC8qKlxuICAgKiBOb3RpZnkgdGhhdCBhbiBlcnJvciBoYXMgYmVlbiBkZWxpdmVyZWQuXG4gICAqL1xuICBnZXQgb25FcnJvcigpOiBFdmVudEVtaXR0ZXI8YW55PiB7IHJldHVybiB0aGlzLl9vbkVycm9yRXZlbnRzOyB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlcmUgYXJlIGFueSBvdXRzdGFuZGluZyBtaWNyb3Rhc2tzLlxuICAgKi9cbiAgZ2V0IGhhc1BlbmRpbmdNaWNyb3Rhc2tzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faGFzUGVuZGluZ01pY3JvdGFza3M7IH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGVyZSBhcmUgYW55IG91dHN0YW5kaW5nIG1pY3JvdGFza3MuXG4gICAqL1xuICBnZXQgaGFzUGVuZGluZ01hY3JvdGFza3MoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9oYXNQZW5kaW5nTWFjcm90YXNrczsgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyB0aGUgYGZuYCBmdW5jdGlvbiBzeW5jaHJvbm91c2x5IHdpdGhpbiB0aGUgQW5ndWxhciB6b25lIGFuZCByZXR1cm5zIHZhbHVlIHJldHVybmVkIGJ5XG4gICAqIHRoZSBmdW5jdGlvbi5cbiAgICpcbiAgICogUnVubmluZyBmdW5jdGlvbnMgdmlhIGBydW5gIGFsbG93cyB5b3UgdG8gcmVlbnRlciBBbmd1bGFyIHpvbmUgZnJvbSBhIHRhc2sgdGhhdCB3YXMgZXhlY3V0ZWRcbiAgICogb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lICh0eXBpY2FsbHkgc3RhcnRlZCB2aWEge0BsaW5rICNydW5PdXRzaWRlQW5ndWxhcn0pLlxuICAgKlxuICAgKiBBbnkgZnV0dXJlIHRhc2tzIG9yIG1pY3JvdGFza3Mgc2NoZWR1bGVkIGZyb20gd2l0aGluIHRoaXMgZnVuY3Rpb24gd2lsbCBjb250aW51ZSBleGVjdXRpbmcgZnJvbVxuICAgKiB3aXRoaW4gdGhlIEFuZ3VsYXIgem9uZS5cbiAgICovXG4gIHJ1bihmbjogKCkgPT4gYW55KTogYW55IHsgcmV0dXJuIHRoaXMuX3pvbmVJbXBsLnJ1bklubmVyKGZuKTsgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyB0aGUgYGZuYCBmdW5jdGlvbiBzeW5jaHJvbm91c2x5IGluIEFuZ3VsYXIncyBwYXJlbnQgem9uZSBhbmQgcmV0dXJucyB2YWx1ZSByZXR1cm5lZCBieVxuICAgKiB0aGUgZnVuY3Rpb24uXG4gICAqXG4gICAqIFJ1bm5pbmcgZnVuY3Rpb25zIHZpYSBgcnVuT3V0c2lkZUFuZ3VsYXJgIGFsbG93cyB5b3UgdG8gZXNjYXBlIEFuZ3VsYXIncyB6b25lIGFuZCBkbyB3b3JrIHRoYXRcbiAgICogZG9lc24ndCB0cmlnZ2VyIEFuZ3VsYXIgY2hhbmdlLWRldGVjdGlvbiBvciBpcyBzdWJqZWN0IHRvIEFuZ3VsYXIncyBlcnJvciBoYW5kbGluZy5cbiAgICpcbiAgICogQW55IGZ1dHVyZSB0YXNrcyBvciBtaWNyb3Rhc2tzIHNjaGVkdWxlZCBmcm9tIHdpdGhpbiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udGludWUgZXhlY3V0aW5nIGZyb21cbiAgICogb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxuICAgKlxuICAgKiBVc2Uge0BsaW5rICNydW59IHRvIHJlZW50ZXIgdGhlIEFuZ3VsYXIgem9uZSBhbmQgZG8gd29yayB0aGF0IHVwZGF0ZXMgdGhlIGFwcGxpY2F0aW9uIG1vZGVsLlxuICAgKi9cbiAgcnVuT3V0c2lkZUFuZ3VsYXIoZm46ICgpID0+IGFueSk6IGFueSB7IHJldHVybiB0aGlzLl96b25lSW1wbC5ydW5PdXRlcihmbik7IH1cbn1cbiJdfQ==