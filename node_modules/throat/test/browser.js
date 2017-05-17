'use strict';

var run = require('sauce-test');
var testResult = require('test-result');

var LOCAL = !process.env.CI && process.argv[2] !== 'sauce';
var USER = 'throat';
var ACCESS_KEY = '57db1bf4-537a-4bde-ab8b-1e82eed9db4b';

if (process.env.CI && process.version.indexOf('v0.12.') !== 0) {
  // only run the browser tests once
  process.exit(0);
}
run(__dirname + '/index.js', LOCAL ? 'chromedriver' : 'saucelabs', {
  username: USER,
  accessKey: ACCESS_KEY,
  browserify: true,
  disableSSL: true,
  filterPlatforms: function (platform, defaultFilter) {
    // exclude some arbitrary browsers to make tests
    // run faster.  Also excludes beta versions of browsers
    if (!defaultFilter(platform)) return false;
    // these platforms don't support ES5
    var version = +platform.version;
    switch (platform.browserName) {
      case 'internet explorer':
        return version > 8;
      case 'firefox':
        return version > 4;
      case 'iphone':
      case 'ipad':
        return version > 5.1;
      default:
        return true;
    }
  },
  bail: true,
  timeout: '30s'
}).done(function (result) {
  if (result.passed) {
    testResult.pass('browser tests');
  } else {
    testResult.fail('browser tests');
  }
});
