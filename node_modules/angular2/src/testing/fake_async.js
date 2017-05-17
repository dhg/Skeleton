'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var _scheduler;
var _microtasks = [];
var _pendingPeriodicTimers = [];
var _pendingTimers = [];
var FakeAsyncZoneSpec = (function () {
    function FakeAsyncZoneSpec() {
        this.name = 'fakeAsync';
        this.properties = { 'inFakeAsyncZone': true };
    }
    FakeAsyncZoneSpec.assertInZone = function () {
        if (!Zone.current.get('inFakeAsyncZone')) {
            throw new Error('The code should be running in the fakeAsync zone to call this function');
        }
    };
    FakeAsyncZoneSpec.prototype.onScheduleTask = function (delegate, current, target, task) {
        switch (task.type) {
            case 'microTask':
                _microtasks.push(task.invoke);
                break;
            case 'macroTask':
                switch (task.source) {
                    case 'setTimeout':
                        task.data['handleId'] = _setTimeout(task.invoke, task.data['delay'], task.data['args']);
                        break;
                    case 'setInterval':
                        task.data['handleId'] =
                            _setInterval(task.invoke, task.data['delay'], task.data['args']);
                        break;
                    default:
                        task = delegate.scheduleTask(target, task);
                }
                break;
            case 'eventTask':
                task = delegate.scheduleTask(target, task);
                break;
        }
        return task;
    };
    FakeAsyncZoneSpec.prototype.onCancelTask = function (delegate, current, target, task) {
        switch (task.source) {
            case 'setTimeout':
                return _clearTimeout(task.data['handleId']);
            case 'setInterval':
                return _clearInterval(task.data['handleId']);
            default:
                return delegate.scheduleTask(target, task);
        }
    };
    return FakeAsyncZoneSpec;
})();
/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @param fn
 * @returns {Function} The function wrapped to be executed in the fakeAsync zone
 */
function fakeAsync(fn) {
    if (Zone.current.get('inFakeAsyncZone')) {
        throw new Error('fakeAsync() calls can not be nested');
    }
    var fakeAsyncZone = Zone.current.fork(new FakeAsyncZoneSpec());
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // TODO(tbosch): This class should already be part of the jasmine typings but it is not...
        _scheduler = new jasmine.DelayedFunctionScheduler();
        clearPendingTimers();
        var res = fakeAsyncZone.run(function () {
            var res = fn.apply(void 0, args);
            flushMicrotasks();
            return res;
        });
        if (_pendingPeriodicTimers.length > 0) {
            throw new exceptions_1.BaseException(_pendingPeriodicTimers.length + " periodic timer(s) still in the queue.");
        }
        if (_pendingTimers.length > 0) {
            throw new exceptions_1.BaseException(_pendingTimers.length + " timer(s) still in the queue.");
        }
        _scheduler = null;
        collection_1.ListWrapper.clear(_microtasks);
        return res;
    };
}
exports.fakeAsync = fakeAsync;
/**
 * Clear the queue of pending timers and microtasks.
 *
 * Useful for cleaning up after an asynchronous test passes.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='pending'}
 */
function clearPendingTimers() {
    // TODO we should fix tick to dequeue the failed timer instead of relying on clearPendingTimers
    collection_1.ListWrapper.clear(_microtasks);
    collection_1.ListWrapper.clear(_pendingPeriodicTimers);
    collection_1.ListWrapper.clear(_pendingTimers);
}
exports.clearPendingTimers = clearPendingTimers;
/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @param {number} millis Number of millisecond, defaults to 0
 */
function tick(millis) {
    if (millis === void 0) { millis = 0; }
    FakeAsyncZoneSpec.assertInZone();
    flushMicrotasks();
    _scheduler.tick(millis);
}
exports.tick = tick;
/**
 * Flush any pending microtasks.
 */
function flushMicrotasks() {
    FakeAsyncZoneSpec.assertInZone();
    while (_microtasks.length > 0) {
        var microtask = collection_1.ListWrapper.removeAt(_microtasks, 0);
        microtask();
    }
}
exports.flushMicrotasks = flushMicrotasks;
function _setTimeout(fn, delay, args) {
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, delay, args);
    _pendingTimers.push(id);
    _scheduler.scheduleFunction(_dequeueTimer(id), delay);
    return id;
}
function _clearTimeout(id) {
    _dequeueTimer(id);
    return _scheduler.removeFunctionWithId(id);
}
function _setInterval(fn, interval) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, interval, args, true);
    _pendingPeriodicTimers.push(id);
    return id;
}
function _clearInterval(id) {
    collection_1.ListWrapper.remove(_pendingPeriodicTimers, id);
    return _scheduler.removeFunctionWithId(id);
}
function _fnAndFlush(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        fn.apply(lang_1.global, args);
        flushMicrotasks();
    };
}
function _dequeueTimer(id) {
    return function () { collection_1.ListWrapper.remove(_pendingTimers, id); };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9hc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL2Zha2VfYXN5bmMudHMiXSwibmFtZXMiOlsiRmFrZUFzeW5jWm9uZVNwZWMiLCJGYWtlQXN5bmNab25lU3BlYy5jb25zdHJ1Y3RvciIsIkZha2VBc3luY1pvbmVTcGVjLmFzc2VydEluWm9uZSIsIkZha2VBc3luY1pvbmVTcGVjLm9uU2NoZWR1bGVUYXNrIiwiRmFrZUFzeW5jWm9uZVNwZWMub25DYW5jZWxUYXNrIiwiZmFrZUFzeW5jIiwiY2xlYXJQZW5kaW5nVGltZXJzIiwidGljayIsImZsdXNoTWljcm90YXNrcyIsIl9zZXRUaW1lb3V0IiwiX2NsZWFyVGltZW91dCIsIl9zZXRJbnRlcnZhbCIsIl9jbGVhckludGVydmFsIiwiX2ZuQW5kRmx1c2giLCJfZGVxdWV1ZVRpbWVyIl0sIm1hcHBpbmdzIjoiQUFBQSxxQkFBcUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNoRCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUUzRCxJQUFJLFVBQVUsQ0FBQztBQUNmLElBQUksV0FBVyxHQUFlLEVBQUUsQ0FBQztBQUNqQyxJQUFJLHNCQUFzQixHQUFhLEVBQUUsQ0FBQztBQUMxQyxJQUFJLGNBQWMsR0FBYSxFQUFFLENBQUM7QUFFbEM7SUFBQUE7UUFPRUMsU0FBSUEsR0FBV0EsV0FBV0EsQ0FBQ0E7UUFFM0JBLGVBQVVBLEdBQXlCQSxFQUFDQSxpQkFBaUJBLEVBQUVBLElBQUlBLEVBQUNBLENBQUNBO0lBcUMvREEsQ0FBQ0E7SUE3Q1FELDhCQUFZQSxHQUFuQkE7UUFDRUUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6Q0EsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0Esd0VBQXdF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QUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUFBO0FBQy9EQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxudmFyIF9zY2hlZHVsZXI7XG52YXIgX21pY3JvdGFza3M6IEZ1bmN0aW9uW10gPSBbXTtcbnZhciBfcGVuZGluZ1BlcmlvZGljVGltZXJzOiBudW1iZXJbXSA9IFtdO1xudmFyIF9wZW5kaW5nVGltZXJzOiBudW1iZXJbXSA9IFtdO1xuXG5jbGFzcyBGYWtlQXN5bmNab25lU3BlYyBpbXBsZW1lbnRzIFpvbmVTcGVjIHtcbiAgc3RhdGljIGFzc2VydEluWm9uZSgpOiB2b2lkIHtcbiAgICBpZiAoIVpvbmUuY3VycmVudC5nZXQoJ2luRmFrZUFzeW5jWm9uZScpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjb2RlIHNob3VsZCBiZSBydW5uaW5nIGluIHRoZSBmYWtlQXN5bmMgem9uZSB0byBjYWxsIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9XG4gIH1cblxuICBuYW1lOiBzdHJpbmcgPSAnZmFrZUFzeW5jJztcblxuICBwcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHsnaW5GYWtlQXN5bmNab25lJzogdHJ1ZX07XG5cbiAgb25TY2hlZHVsZVRhc2soZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCB0YXNrOiBUYXNrKTogVGFzayB7XG4gICAgc3dpdGNoICh0YXNrLnR5cGUpIHtcbiAgICAgIGNhc2UgJ21pY3JvVGFzayc6XG4gICAgICAgIF9taWNyb3Rhc2tzLnB1c2godGFzay5pbnZva2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21hY3JvVGFzayc6XG4gICAgICAgIHN3aXRjaCAodGFzay5zb3VyY2UpIHtcbiAgICAgICAgICBjYXNlICdzZXRUaW1lb3V0JzpcbiAgICAgICAgICAgIHRhc2suZGF0YVsnaGFuZGxlSWQnXSA9IF9zZXRUaW1lb3V0KHRhc2suaW52b2tlLCB0YXNrLmRhdGFbJ2RlbGF5J10sIHRhc2suZGF0YVsnYXJncyddKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3NldEludGVydmFsJzpcbiAgICAgICAgICAgIHRhc2suZGF0YVsnaGFuZGxlSWQnXSA9XG4gICAgICAgICAgICAgICAgX3NldEludGVydmFsKHRhc2suaW52b2tlLCB0YXNrLmRhdGFbJ2RlbGF5J10sIHRhc2suZGF0YVsnYXJncyddKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0YXNrID0gZGVsZWdhdGUuc2NoZWR1bGVUYXNrKHRhcmdldCwgdGFzayk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdldmVudFRhc2snOlxuICAgICAgICB0YXNrID0gZGVsZWdhdGUuc2NoZWR1bGVUYXNrKHRhcmdldCwgdGFzayk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gdGFzaztcbiAgfVxuXG4gIG9uQ2FuY2VsVGFzayhkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIHRhc2s6IFRhc2spOiBhbnkge1xuICAgIHN3aXRjaCAodGFzay5zb3VyY2UpIHtcbiAgICAgIGNhc2UgJ3NldFRpbWVvdXQnOlxuICAgICAgICByZXR1cm4gX2NsZWFyVGltZW91dCh0YXNrLmRhdGFbJ2hhbmRsZUlkJ10pO1xuICAgICAgY2FzZSAnc2V0SW50ZXJ2YWwnOlxuICAgICAgICByZXR1cm4gX2NsZWFySW50ZXJ2YWwodGFzay5kYXRhWydoYW5kbGVJZCddKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBkZWxlZ2F0ZS5zY2hlZHVsZVRhc2sodGFyZ2V0LCB0YXNrKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwcyBhIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBmYWtlQXN5bmMgem9uZTpcbiAqIC0gbWljcm90YXNrcyBhcmUgbWFudWFsbHkgZXhlY3V0ZWQgYnkgY2FsbGluZyBgZmx1c2hNaWNyb3Rhc2tzKClgLFxuICogLSB0aW1lcnMgYXJlIHN5bmNocm9ub3VzLCBgdGljaygpYCBzaW11bGF0ZXMgdGhlIGFzeW5jaHJvbm91cyBwYXNzYWdlIG9mIHRpbWUuXG4gKlxuICogSWYgdGhlcmUgYXJlIGFueSBwZW5kaW5nIHRpbWVycyBhdCB0aGUgZW5kIG9mIHRoZSBmdW5jdGlvbiwgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLlxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy9mYWtlX2FzeW5jLnRzIHJlZ2lvbj0nYmFzaWMnfVxuICpcbiAqIEBwYXJhbSBmblxuICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgZnVuY3Rpb24gd3JhcHBlZCB0byBiZSBleGVjdXRlZCBpbiB0aGUgZmFrZUFzeW5jIHpvbmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZha2VBc3luYyhmbjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gIGlmIChab25lLmN1cnJlbnQuZ2V0KCdpbkZha2VBc3luY1pvbmUnKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignZmFrZUFzeW5jKCkgY2FsbHMgY2FuIG5vdCBiZSBuZXN0ZWQnKTtcbiAgfVxuXG4gIHZhciBmYWtlQXN5bmNab25lID0gWm9uZS5jdXJyZW50LmZvcmsobmV3IEZha2VBc3luY1pvbmVTcGVjKCkpO1xuXG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgLy8gVE9ETyh0Ym9zY2gpOiBUaGlzIGNsYXNzIHNob3VsZCBhbHJlYWR5IGJlIHBhcnQgb2YgdGhlIGphc21pbmUgdHlwaW5ncyBidXQgaXQgaXMgbm90Li4uXG4gICAgX3NjaGVkdWxlciA9IG5ldyAoPGFueT5qYXNtaW5lKS5EZWxheWVkRnVuY3Rpb25TY2hlZHVsZXIoKTtcbiAgICBjbGVhclBlbmRpbmdUaW1lcnMoKTtcblxuICAgIGxldCByZXMgPSBmYWtlQXN5bmNab25lLnJ1bigoKSA9PiB7XG4gICAgICBsZXQgcmVzID0gZm4oLi4uYXJncyk7XG4gICAgICBmbHVzaE1pY3JvdGFza3MoKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG5cbiAgICBpZiAoX3BlbmRpbmdQZXJpb2RpY1RpbWVycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgJHtfcGVuZGluZ1BlcmlvZGljVGltZXJzLmxlbmd0aH0gcGVyaW9kaWMgdGltZXIocykgc3RpbGwgaW4gdGhlIHF1ZXVlLmApO1xuICAgIH1cblxuICAgIGlmIChfcGVuZGluZ1RpbWVycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJHtfcGVuZGluZ1RpbWVycy5sZW5ndGh9IHRpbWVyKHMpIHN0aWxsIGluIHRoZSBxdWV1ZS5gKTtcbiAgICB9XG5cbiAgICBfc2NoZWR1bGVyID0gbnVsbDtcbiAgICBMaXN0V3JhcHBlci5jbGVhcihfbWljcm90YXNrcyk7XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHF1ZXVlIG9mIHBlbmRpbmcgdGltZXJzIGFuZCBtaWNyb3Rhc2tzLlxuICpcbiAqIFVzZWZ1bCBmb3IgY2xlYW5pbmcgdXAgYWZ0ZXIgYW4gYXN5bmNocm9ub3VzIHRlc3QgcGFzc2VzLlxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy9mYWtlX2FzeW5jLnRzIHJlZ2lvbj0ncGVuZGluZyd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclBlbmRpbmdUaW1lcnMoKTogdm9pZCB7XG4gIC8vIFRPRE8gd2Ugc2hvdWxkIGZpeCB0aWNrIHRvIGRlcXVldWUgdGhlIGZhaWxlZCB0aW1lciBpbnN0ZWFkIG9mIHJlbHlpbmcgb24gY2xlYXJQZW5kaW5nVGltZXJzXG4gIExpc3RXcmFwcGVyLmNsZWFyKF9taWNyb3Rhc2tzKTtcbiAgTGlzdFdyYXBwZXIuY2xlYXIoX3BlbmRpbmdQZXJpb2RpY1RpbWVycyk7XG4gIExpc3RXcmFwcGVyLmNsZWFyKF9wZW5kaW5nVGltZXJzKTtcbn1cblxuXG4vKipcbiAqIFNpbXVsYXRlcyB0aGUgYXN5bmNocm9ub3VzIHBhc3NhZ2Ugb2YgdGltZSBmb3IgdGhlIHRpbWVycyBpbiB0aGUgZmFrZUFzeW5jIHpvbmUuXG4gKlxuICogVGhlIG1pY3JvdGFza3MgcXVldWUgaXMgZHJhaW5lZCBhdCB0aGUgdmVyeSBzdGFydCBvZiB0aGlzIGZ1bmN0aW9uIGFuZCBhZnRlciBhbnkgdGltZXIgY2FsbGJhY2tcbiAqIGhhcyBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy9mYWtlX2FzeW5jLnRzIHJlZ2lvbj0nYmFzaWMnfVxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaWxsaXMgTnVtYmVyIG9mIG1pbGxpc2Vjb25kLCBkZWZhdWx0cyB0byAwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aWNrKG1pbGxpczogbnVtYmVyID0gMCk6IHZvaWQge1xuICBGYWtlQXN5bmNab25lU3BlYy5hc3NlcnRJblpvbmUoKTtcbiAgZmx1c2hNaWNyb3Rhc2tzKCk7XG4gIF9zY2hlZHVsZXIudGljayhtaWxsaXMpO1xufVxuXG4vKipcbiAqIEZsdXNoIGFueSBwZW5kaW5nIG1pY3JvdGFza3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbHVzaE1pY3JvdGFza3MoKTogdm9pZCB7XG4gIEZha2VBc3luY1pvbmVTcGVjLmFzc2VydEluWm9uZSgpO1xuICB3aGlsZSAoX21pY3JvdGFza3MubGVuZ3RoID4gMCkge1xuICAgIHZhciBtaWNyb3Rhc2sgPSBMaXN0V3JhcHBlci5yZW1vdmVBdChfbWljcm90YXNrcywgMCk7XG4gICAgbWljcm90YXNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3NldFRpbWVvdXQoZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCBhcmdzOiBhbnlbXSk6IG51bWJlciB7XG4gIHZhciBjYiA9IF9mbkFuZEZsdXNoKGZuKTtcbiAgdmFyIGlkID0gX3NjaGVkdWxlci5zY2hlZHVsZUZ1bmN0aW9uKGNiLCBkZWxheSwgYXJncyk7XG4gIF9wZW5kaW5nVGltZXJzLnB1c2goaWQpO1xuICBfc2NoZWR1bGVyLnNjaGVkdWxlRnVuY3Rpb24oX2RlcXVldWVUaW1lcihpZCksIGRlbGF5KTtcbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBfY2xlYXJUaW1lb3V0KGlkOiBudW1iZXIpIHtcbiAgX2RlcXVldWVUaW1lcihpZCk7XG4gIHJldHVybiBfc2NoZWR1bGVyLnJlbW92ZUZ1bmN0aW9uV2l0aElkKGlkKTtcbn1cblxuZnVuY3Rpb24gX3NldEludGVydmFsKGZuOiBGdW5jdGlvbiwgaW50ZXJ2YWw6IG51bWJlciwgLi4uYXJncykge1xuICB2YXIgY2IgPSBfZm5BbmRGbHVzaChmbik7XG4gIHZhciBpZCA9IF9zY2hlZHVsZXIuc2NoZWR1bGVGdW5jdGlvbihjYiwgaW50ZXJ2YWwsIGFyZ3MsIHRydWUpO1xuICBfcGVuZGluZ1BlcmlvZGljVGltZXJzLnB1c2goaWQpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIF9jbGVhckludGVydmFsKGlkOiBudW1iZXIpIHtcbiAgTGlzdFdyYXBwZXIucmVtb3ZlKF9wZW5kaW5nUGVyaW9kaWNUaW1lcnMsIGlkKTtcbiAgcmV0dXJuIF9zY2hlZHVsZXIucmVtb3ZlRnVuY3Rpb25XaXRoSWQoaWQpO1xufVxuXG5mdW5jdGlvbiBfZm5BbmRGbHVzaChmbjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGZuLmFwcGx5KGdsb2JhbCwgYXJncyk7XG4gICAgZmx1c2hNaWNyb3Rhc2tzKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2RlcXVldWVUaW1lcihpZDogbnVtYmVyKTogRnVuY3Rpb24ge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7IExpc3RXcmFwcGVyLnJlbW92ZShfcGVuZGluZ1RpbWVycywgaWQpOyB9XG59XG4iXX0=