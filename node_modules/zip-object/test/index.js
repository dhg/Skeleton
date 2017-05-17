var zipObject = require('../');
var test = require('tape');

test('creates object from list of arrays', function (t) {
  var obj = zipObject(['key1', 'key2'], ['value1', 'value2']);
  var expected = {
    key1: 'value1',
    key2: 'value2'
  };
  
  t.deepEqual(obj, expected, 'created object');
  t.end();
});

test('creates object from array of arrays', function (t) {
  var obj = zipObject([['key1', 'key2'], ['value1', 'value2']]);
  var expected = {
    key1: 'value1',
    key2: 'value2'
  };
  
  t.deepEqual(obj, expected, 'created object');
  t.end();
});