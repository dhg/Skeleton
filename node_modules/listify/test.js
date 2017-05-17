/*jslint node: true */
"use strict";

var test = require('tape');
var listify = require('./index');

test('throws when not given an array', function (t) {
	t.throws(function () { listify(); }, TypeError, 'requires an array');
	t.end();
});

test('listifies 0 items', function (t) {
	t.equal(listify([]), '', 'empty list gives empty string');
	t.end();
});

test('listifies 1 item', function (t) {
	t.equal(listify([1]), '1', 'one item is just toStringed');
	t.end();
});

test('listifies 2 items', function (t) {
	t.equal(listify([1, 2]), '1 and 2', 'two items gives no separator');
	t.end();
});

test('listifies 2 items, supports no finalWord', function (t) {
	t.equal(listify([1, 2], { finalWord: false }), '1, 2', 'two items, no final word, gives only separator');
	t.end();
});

test('listifies 3 items', function (t) {
	t.equal(listify([1, 2, 3]), '1, 2, and 3', 'listifies three items');
	t.end();
});

test('supports separator', function (t) {
	t.equal(listify([1, 2, 3], { separator: '… ' }), '1… 2… and 3', 'listifies with separator');
	t.end();
});

test('supports finalWord', function (t) {
	t.equal(listify([1, 2, 3], { finalWord: 'or' }), '1, 2, or 3', 'listifies with no finalWord');
	t.end();
});

test('stringifies separator and finalWord', function (t) {
	var sep = { toString: function () { return 'foo'; } };
	var word = { toString: function () { return 'bar'; } };
	t.equal(listify([1, 2, 3], { separator: sep, finalWord: word }), '1foo2foobar3', 'stringifies options');
	t.end();
});

