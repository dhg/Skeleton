"use strict";
var test = require('blue-tape');
var Promise = require('any-promise');
var promise_finally_1 = require('./promise-finally');
test('promise-finally', function (t) {
    t.test('run on resolve', function (t) {
        t.plan(2);
        function cb() {
            t.equal(arguments.length, 0, 'should not have any arguments');
        }
        return promise_finally_1.default(Promise.resolve('hello'), cb)
            .then(function (value) { return t.equal(value, 'hello'); });
    });
    t.test('run on reject', function (t) {
        t.plan(2);
        function cb() {
            t.equal(arguments.length, 0, 'should not have any arguments');
        }
        return promise_finally_1.default(Promise.reject('hello'), cb)
            .then(null, function (reason) { return t.equal(reason, 'hello'); });
    });
});
//# sourceMappingURL=promise-finally.spec.js.map