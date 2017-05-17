define('named-in-anon', function() {
  return 'named';
});

define(['named-in-anon'], function(named) {
  return {
    anon: true,
    named: named
  };
});

define([], function() {

});