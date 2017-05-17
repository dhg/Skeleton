/* global it, describe, beforeEach, afterEach */
'use strict';
var assert = require('assert');
var mockery = require('mockery');
var sinon = require('sinon');

describe('config-defaults', () => {
  var fallbackMock;
  var loggerMock;

  beforeEach(() => {
    mockery.enable({ useCleanCache: true });

    fallbackMock = sinon.stub();
    mockery.registerMock('connect-history-api-fallback', fallbackMock);

    loggerMock = sinon.stub();
    mockery.registerMock('connect-logger', loggerMock);

    mockery.registerAllowable('../lib/config-defaults');
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should provide defaults', () => {
    fallbackMock.returns('fallback-middleware');
    loggerMock.returns('logger-middleware');
    var configDefaults = require('../lib/config-defaults');

    assert.strictEqual(configDefaults.injectChanges, false,
      'includes NG2 styleUrls workaround');
    assert.ok(configDefaults.files.length,
      'includes files array');
    assert.strictEqual(configDefaults.watchOptions.ignored, 'node_modules',
      'ignores node_modules from watchlist');
    assert.ok(configDefaults.server.baseDir,
      'includes basedir');
    assert.deepEqual(
      configDefaults.server.middleware,
      ['logger-middleware', 'fallback-middleware'],
      'includes middleware'
    );
    assert.ok(loggerMock.called, 'logger middleware initialized');
    assert.ok(fallbackMock.called, 'fallback middleware initialized');
  });

});
