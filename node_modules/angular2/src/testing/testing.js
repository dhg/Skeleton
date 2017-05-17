'use strict';/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
var lang_1 = require('angular2/src/facade/lang');
var test_injector_1 = require('./test_injector');
var test_injector_2 = require('./test_injector');
exports.inject = test_injector_2.inject;
exports.injectAsync = test_injector_2.injectAsync;
var matchers_1 = require('./matchers');
exports.expect = matchers_1.expect;
var _global = (typeof window === 'undefined' ? lang_1.global : window);
/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
exports.afterEach = _global.afterEach;
/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
exports.describe = _global.describe;
/**
 * See {@link fdescribe}.
 */
exports.ddescribe = _global.fdescribe;
/**
 * Like {@link describe}, but instructs the test runner to only run
 * the test cases in this group. This is useful for debugging.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fdescribe'}
 */
exports.fdescribe = _global.fdescribe;
/**
 * Like {@link describe}, but instructs the test runner to exclude
 * this group of test cases from execution. This is useful for
 * debugging, or for excluding broken tests until they can be fixed.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xdescribe'}
 */
exports.xdescribe = _global.xdescribe;
var jsmBeforeEach = _global.beforeEach;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var testInjector = test_injector_1.getTestInjector();
// Reset the test providers before each test.
jsmBeforeEach(function () { testInjector.reset(); });
/**
 * Allows overriding default providers of the test injector,
 * which are defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEachProviders'}
 */
function beforeEachProviders(fn) {
    jsmBeforeEach(function () {
        var providers = fn();
        if (!providers)
            return;
        try {
            testInjector.addProviders(providers);
        }
        catch (e) {
            throw new Error('beforeEachProviders was called after the injector had ' +
                'been used in a beforeEach or it block. This invalidates the ' +
                'test injector');
        }
    });
}
exports.beforeEachProviders = beforeEachProviders;
function _isPromiseLike(input) {
    return input && !!(input.then);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof test_injector_1.FunctionWithParamTokens) {
        jsmFn(name, function (done) {
            var returnedTestValue;
            try {
                returnedTestValue = testInjector.execute(testFn);
            }
            catch (err) {
                done.fail(err);
                return;
            }
            if (testFn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(function () { done(); }, function (err) { done.fail(err); });
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returnedTestValue);
                }
            }
            else {
                if (!(returnedTestValue === undefined)) {
                    done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                        'value was: ' + returnedTestValue);
                }
                done();
            }
        }, timeOut);
    }
    else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        jsmFn(name, testFn, timeOut);
    }
}
/**
 * Wrapper around Jasmine beforeEach function.
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEach'}
 */
function beforeEach(fn) {
    if (fn instanceof test_injector_1.FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        jsmBeforeEach(function (done) {
            var returnedTestValue;
            try {
                returnedTestValue = testInjector.execute(fn);
            }
            catch (err) {
                done.fail(err);
                return;
            }
            if (fn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(function () { done(); }, function (err) { done.fail(err); });
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returnedTestValue);
                }
            }
            else {
                if (!(returnedTestValue === undefined)) {
                    done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                        'value was: ' + returnedTestValue);
                }
                done();
            }
        });
    }
    else {
        // The test case doesn't use inject(). ie `beforeEach((done) => { ... }));`
        if (fn.length === 0) {
            jsmBeforeEach(function () { fn(); });
        }
        else {
            jsmBeforeEach(function (done) { fn(done); });
        }
    }
}
exports.beforeEach = beforeEach;
/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, an asynchronous function
 * that takes a completion callback, or an injected function created via {@link inject}
 * or {@link injectAsync}. The test will automatically wait for any asynchronous calls
 * inside the injected test function to complete.
 *
 * Wrapper around Jasmine it function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
function it(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIt, name, fn, timeOut);
}
exports.it = it;
/**
 * Like {@link it}, but instructs the test runner to exclude this test
 * entirely. Useful for debugging or for excluding broken tests until
 * they can be fixed.
 *
 * Wrapper around Jasmine xit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xit'}
 */
function xit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmXIt, name, fn, timeOut);
}
exports.xit = xit;
/**
 * See {@link fit}.
 */
function iit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.iit = iit;
/**
 * Like {@link it}, but instructs the test runner to only run this test.
 * Useful for debugging.
 *
 * Wrapper around Jasmine fit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fit'}
 */
function fit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.fit = fit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOlsiYmVmb3JlRWFjaFByb3ZpZGVycyIsIl9pc1Byb21pc2VMaWtlIiwiX2l0IiwiYmVmb3JlRWFjaCIsIml0IiwieGl0IiwiaWl0IiwiZml0Il0sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSCxxQkFBcUIsMEJBQTBCLENBQUMsQ0FBQTtBQUloRCw4QkFNTyxpQkFBaUIsQ0FBQyxDQUFBO0FBRXpCLDhCQUFrQyxpQkFBaUIsQ0FBQztBQUE1Qyx3Q0FBTTtBQUFFLGtEQUFvQztBQUVwRCx5QkFBaUMsWUFBWSxDQUFDO0FBQXRDLG1DQUFzQztBQUU5QyxJQUFJLE9BQU8sR0FBUSxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsR0FBRyxhQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFFckU7Ozs7Ozs7O0dBUUc7QUFDUSxpQkFBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFFbkQ7Ozs7Ozs7O0dBUUc7QUFDUSxnQkFBUSxHQUFhLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFFakQ7O0dBRUc7QUFDUSxpQkFBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFFbkQ7Ozs7Ozs7OztHQVNHO0FBQ1EsaUJBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7Ozs7O0dBVUc7QUFDUSxpQkFBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFrQm5ELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDdkMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUN2QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ3pCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFFekIsSUFBSSxZQUFZLEdBQWlCLCtCQUFlLEVBQUUsQ0FBQztB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QUFBO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILGFBQW9CLElBQVksRUFBRSxFQUF1QyxFQUNyRCxPQUFzQjtJQUF0QkMsdUJBQXNCQSxHQUF0QkEsY0FBc0JBO0lBQ3hDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUN4Q0EsQ0FBQ0E7QUFIZSxXQUFHLE1BR2xCLENBQUE7QUFFRDs7R0FFRztBQUNILGFBQW9CLElBQVksRUFBRSxFQUF1QyxFQUNyRCxPQUFzQjtJQUF0QkMsdUJBQXNCQSxHQUF0QkEsY0FBc0JBO0lBQ3hDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUN4Q0EsQ0FBQ0E7QUFIZSxXQUFHLE1BR2xCLENBQUE7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxhQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN4Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBSGUsV0FBRyxNQUdsQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBQdWJsaWMgVGVzdCBMaWJyYXJ5IGZvciB1bml0IHRlc3RpbmcgQW5ndWxhcjIgQXBwbGljYXRpb25zLiBVc2VzIHRoZVxuICogSmFzbWluZSBmcmFtZXdvcmsuXG4gKi9cbmltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7YmluZH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7XG4gIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLFxuICBpbmplY3QsXG4gIGluamVjdEFzeW5jLFxuICBUZXN0SW5qZWN0b3IsXG4gIGdldFRlc3RJbmplY3RvclxufSBmcm9tICcuL3Rlc3RfaW5qZWN0b3InO1xuXG5leHBvcnQge2luamVjdCwgaW5qZWN0QXN5bmN9IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5cbmV4cG9ydCB7ZXhwZWN0LCBOZ01hdGNoZXJzfSBmcm9tICcuL21hdGNoZXJzJztcblxudmFyIF9nbG9iYWwgPSA8YW55Pih0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyk7XG5cbi8qKlxuICogUnVuIGEgZnVuY3Rpb24gKHdpdGggYW4gb3B0aW9uYWwgYXN5bmNocm9ub3VzIGNhbGxiYWNrKSBhZnRlciBlYWNoIHRlc3QgY2FzZS5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2FmdGVyRWFjaCd9XG4gKi9cbmV4cG9ydCB2YXIgYWZ0ZXJFYWNoOiBGdW5jdGlvbiA9IF9nbG9iYWwuYWZ0ZXJFYWNoO1xuXG4vKipcbiAqIEdyb3VwIHRlc3QgY2FzZXMgdG9nZXRoZXIgdW5kZXIgYSBjb21tb24gZGVzY3JpcHRpb24gcHJlZml4LlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZGVzY3JpYmVJdCd9XG4gKi9cbmV4cG9ydCB2YXIgZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5kZXNjcmliZTtcblxuLyoqXG4gKiBTZWUge0BsaW5rIGZkZXNjcmliZX0uXG4gKi9cbmV4cG9ydCB2YXIgZGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIExpa2Uge0BsaW5rIGRlc2NyaWJlfSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gb25seSBydW5cbiAqIHRoZSB0ZXN0IGNhc2VzIGluIHRoaXMgZ3JvdXAuIFRoaXMgaXMgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdmZGVzY3JpYmUnfVxuICovXG5leHBvcnQgdmFyIGZkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmZkZXNjcmliZTtcblxuLyoqXG4gKiBMaWtlIHtAbGluayBkZXNjcmliZX0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIGV4Y2x1ZGVcbiAqIHRoaXMgZ3JvdXAgb2YgdGVzdCBjYXNlcyBmcm9tIGV4ZWN1dGlvbi4gVGhpcyBpcyB1c2VmdWwgZm9yXG4gKiBkZWJ1Z2dpbmcsIG9yIGZvciBleGNsdWRpbmcgYnJva2VuIHRlc3RzIHVudGlsIHRoZXkgY2FuIGJlIGZpeGVkLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0neGRlc2NyaWJlJ31cbiAqL1xuZXhwb3J0IHZhciB4ZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC54ZGVzY3JpYmU7XG5cbi8qKlxuICogU2lnbmF0dXJlIGZvciBhIHN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gKG5vIGFyZ3VtZW50cykuXG4gKi9cbmV4cG9ydCB0eXBlIFN5bmNUZXN0Rm4gPSAoKSA9PiB2b2lkO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYW4gYXN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gd2hpY2ggdGFrZXMgYVxuICogYGRvbmVgIGNhbGxiYWNrLlxuICovXG5leHBvcnQgdHlwZSBBc3luY1Rlc3RGbiA9IChkb25lOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYW55IHNpbXBsZSB0ZXN0aW5nIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgdHlwZSBBbnlUZXN0Rm4gPSBTeW5jVGVzdEZuIHwgQXN5bmNUZXN0Rm47XG5cbnZhciBqc21CZWZvcmVFYWNoID0gX2dsb2JhbC5iZWZvcmVFYWNoO1xudmFyIGpzbUl0ID0gX2dsb2JhbC5pdDtcbnZhciBqc21JSXQgPSBfZ2xvYmFsLmZpdDtcbnZhciBqc21YSXQgPSBfZ2xvYmFsLnhpdDtcblxudmFyIHRlc3RJbmplY3RvcjogVGVzdEluamVjdG9yID0gZ2V0VGVzdEluamVjdG9yKCk7XG5cbi8vIFJlc2V0IHRoZSB0ZXN0IHByb3ZpZGVycyBiZWZvcmUgZWFjaCB0ZXN0LlxuanNtQmVmb3JlRWFjaCgoKSA9PiB7IHRlc3RJbmplY3Rvci5yZXNldCgpOyB9KTtcblxuLyoqXG4gKiBBbGxvd3Mgb3ZlcnJpZGluZyBkZWZhdWx0IHByb3ZpZGVycyBvZiB0aGUgdGVzdCBpbmplY3RvcixcbiAqIHdoaWNoIGFyZSBkZWZpbmVkIGluIHRlc3RfaW5qZWN0b3IuanMuXG4gKlxuICogVGhlIGdpdmVuIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGEgbGlzdCBvZiBESSBwcm92aWRlcnMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYmVmb3JlRWFjaFByb3ZpZGVycyd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoUHJvdmlkZXJzKGZuKTogdm9pZCB7XG4gIGpzbUJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHZhciBwcm92aWRlcnMgPSBmbigpO1xuICAgIGlmICghcHJvdmlkZXJzKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIHRlc3RJbmplY3Rvci5hZGRQcm92aWRlcnMocHJvdmlkZXJzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JlZm9yZUVhY2hQcm92aWRlcnMgd2FzIGNhbGxlZCBhZnRlciB0aGUgaW5qZWN0b3IgaGFkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdiZWVuIHVzZWQgaW4gYSBiZWZvcmVFYWNoIG9yIGl0IGJsb2NrLiBUaGlzIGludmFsaWRhdGVzIHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAndGVzdCBpbmplY3RvcicpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9pc1Byb21pc2VMaWtlKGlucHV0KTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnB1dCAmJiAhIShpbnB1dC50aGVuKTtcbn1cblxuZnVuY3Rpb24gX2l0KGpzbUZuOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nLCB0ZXN0Rm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgIHRlc3RUaW1lT3V0OiBudW1iZXIpOiB2b2lkIHtcbiAgdmFyIHRpbWVPdXQgPSB0ZXN0VGltZU91dDtcblxuICBpZiAodGVzdEZuIGluc3RhbmNlb2YgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpIHtcbiAgICBqc21GbihuYW1lLCAoZG9uZSkgPT4ge1xuICAgICAgdmFyIHJldHVybmVkVGVzdFZhbHVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuZWRUZXN0VmFsdWUgPSB0ZXN0SW5qZWN0b3IuZXhlY3V0ZSh0ZXN0Rm4pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGRvbmUuZmFpbChlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0ZXN0Rm4uaXNBc3luYykge1xuICAgICAgICBpZiAoX2lzUHJvbWlzZUxpa2UocmV0dXJuZWRUZXN0VmFsdWUpKSB7XG4gICAgICAgICAgKDxQcm9taXNlPGFueT4+cmV0dXJuZWRUZXN0VmFsdWUpLnRoZW4oKCkgPT4geyBkb25lKCk7IH0sIChlcnIpID0+IHsgZG9uZS5mYWlsKGVycik7IH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvbmUuZmFpbCgnRXJyb3I6IGluamVjdEFzeW5jIHdhcyBleHBlY3RlZCB0byByZXR1cm4gYSBwcm9taXNlLCBidXQgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAnIHJldHVybmVkIHZhbHVlIHdhczogJyArIHJldHVybmVkVGVzdFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCEocmV0dXJuZWRUZXN0VmFsdWUgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICBkb25lLmZhaWwoJ0Vycm9yOiBpbmplY3QgcmV0dXJuZWQgYSB2YWx1ZS4gRGlkIHlvdSBtZWFuIHRvIHVzZSBpbmplY3RBc3luYz8gUmV0dXJuZWQgJyArXG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSB3YXM6ICcgKyByZXR1cm5lZFRlc3RWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0sIHRpbWVPdXQpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgZG9lc24ndCB1c2UgaW5qZWN0KCkuIGllIGBpdCgndGVzdCcsIChkb25lKSA9PiB7IC4uLiB9KSk7YFxuICAgIGpzbUZuKG5hbWUsIHRlc3RGbiwgdGltZU91dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGJlZm9yZUVhY2ggZnVuY3Rpb24uXG4gKlxuICogYmVmb3JlRWFjaCBtYXkgYmUgdXNlZCB3aXRoIHRoZSBgaW5qZWN0YCBmdW5jdGlvbiB0byBmZXRjaCBkZXBlbmRlbmNpZXMuXG4gKiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxscyBpbnNpZGUgdGhlXG4gKiBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYmVmb3JlRWFjaCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbik6IHZvaWQge1xuICBpZiAoZm4gaW5zdGFuY2VvZiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucykge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgdXNlcyBpbmplY3QoKS4gaWUgYGJlZm9yZUVhY2goaW5qZWN0KFtDbGFzc0FdLCAoYSkgPT4geyAuLi5cbiAgICAvLyB9KSk7YFxuICAgIGpzbUJlZm9yZUVhY2goKGRvbmUpID0+IHtcblxuICAgICAgdmFyIHJldHVybmVkVGVzdFZhbHVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuZWRUZXN0VmFsdWUgPSB0ZXN0SW5qZWN0b3IuZXhlY3V0ZShmbik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZG9uZS5mYWlsKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChmbi5pc0FzeW5jKSB7XG4gICAgICAgIGlmIChfaXNQcm9taXNlTGlrZShyZXR1cm5lZFRlc3RWYWx1ZSkpIHtcbiAgICAgICAgICAoPFByb21pc2U8YW55Pj5yZXR1cm5lZFRlc3RWYWx1ZSkudGhlbigoKSA9PiB7IGRvbmUoKTsgfSwgKGVycikgPT4geyBkb25lLmZhaWwoZXJyKTsgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9uZS5mYWlsKCdFcnJvcjogaW5qZWN0QXN5bmMgd2FzIGV4cGVjdGVkIHRvIHJldHVybiBhIHByb21pc2UsIGJ1dCB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAgICcgcmV0dXJuZWQgdmFsdWUgd2FzOiAnICsgcmV0dXJuZWRUZXN0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIShyZXR1cm5lZFRlc3RWYWx1ZSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgIGRvbmUuZmFpbCgnRXJyb3I6IGluamVjdCByZXR1cm5lZCBhIHZhbHVlLiBEaWQgeW91IG1lYW4gdG8gdXNlIGluamVjdEFzeW5jPyBSZXR1cm5lZCAnICtcbiAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlIHdhczogJyArIHJldHVybmVkVGVzdFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBkb25lKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSBkb2Vzbid0IHVzZSBpbmplY3QoKS4gaWUgYGJlZm9yZUVhY2goKGRvbmUpID0+IHsgLi4uIH0pKTtgXG4gICAgaWYgKCg8YW55PmZuKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGpzbUJlZm9yZUVhY2goKCkgPT4geyAoPFN5bmNUZXN0Rm4+Zm4pKCk7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBqc21CZWZvcmVFYWNoKChkb25lKSA9PiB7ICg8QXN5bmNUZXN0Rm4+Zm4pKGRvbmUpOyB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBzaW5nbGUgdGVzdCBjYXNlIHdpdGggdGhlIGdpdmVuIHRlc3QgbmFtZSBhbmQgZXhlY3V0aW9uIGZ1bmN0aW9uLlxuICpcbiAqIFRoZSB0ZXN0IGZ1bmN0aW9uIGNhbiBiZSBlaXRoZXIgYSBzeW5jaHJvbm91cyBmdW5jdGlvbiwgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uXG4gKiB0aGF0IHRha2VzIGEgY29tcGxldGlvbiBjYWxsYmFjaywgb3IgYW4gaW5qZWN0ZWQgZnVuY3Rpb24gY3JlYXRlZCB2aWEge0BsaW5rIGluamVjdH1cbiAqIG9yIHtAbGluayBpbmplY3RBc3luY30uIFRoZSB0ZXN0IHdpbGwgYXV0b21hdGljYWxseSB3YWl0IGZvciBhbnkgYXN5bmNocm9ub3VzIGNhbGxzXG4gKiBpbnNpZGUgdGhlIGluamVjdGVkIHRlc3QgZnVuY3Rpb24gdG8gY29tcGxldGUuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdkZXNjcmliZUl0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIExpa2Uge0BsaW5rIGl0fSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gZXhjbHVkZSB0aGlzIHRlc3RcbiAqIGVudGlyZWx5LiBVc2VmdWwgZm9yIGRlYnVnZ2luZyBvciBmb3IgZXhjbHVkaW5nIGJyb2tlbiB0ZXN0cyB1bnRpbFxuICogdGhleSBjYW4gYmUgZml4ZWQuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSB4aXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0neGl0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHhpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbVhJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIFNlZSB7QGxpbmsgZml0fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUlJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIExpa2Uge0BsaW5rIGl0fSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gb25seSBydW4gdGhpcyB0ZXN0LlxuICogVXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBmaXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZml0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUlJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuIl19