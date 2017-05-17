"use strict";
var test = require('blue-tape');
var makeErrorCause = require('./index');
test('make error cause', function (t) {
    var TestError = makeErrorCause('TestError');
    var SubTestError = makeErrorCause('SubTestError', TestError);
    t.test('render the cause', function (t) {
        var cause = new Error('boom!');
        var error = new TestError('something bad', cause);
        var again = new SubTestError('more bad', error);
        t.equal(error.cause, cause);
        t.equal(error.toString(), 'TestError: something bad\nCaused by: Error: boom!');
        t.ok(error instanceof Error);
        t.ok(error instanceof makeErrorCause.BaseError);
        t.ok(error instanceof TestError);
        t.equal(again.cause, error);
        t.equal(again.toString(), 'SubTestError: more bad\nCaused by: TestError: something bad\nCaused by: Error: boom!');
        t.ok(again instanceof Error);
        t.ok(again instanceof makeErrorCause.BaseError);
        t.ok(again instanceof TestError);
        t.ok(again instanceof SubTestError);
        t.end();
    });
});
//# sourceMappingURL=index.spec.js.map