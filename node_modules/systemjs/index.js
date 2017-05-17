if (typeof Promise === 'undefined')
  require('when/es6-shim/Promise');

var version = require('./package.json').version;

var isWindows = typeof process.platform != 'undefined' && process.platform.match(/^win/);

// set transpiler paths in Node
var nodeResolver = typeof process != 'undefined' && typeof require != 'undefined' && require.resolve;
function configNodePath(loader, module, nodeModule, wildcard) {
  if (loader.paths[module])
    return;

  var ext = wildcard ? '/package.json' : '';
  try {
    var match = nodeResolver(nodeModule + ext).replace(/\\/g, '/');
  }
  catch(e) {}
  
  if (match)
    loader.paths[module] = 'file://' + (isWindows ? '/' : '') + match.substr(0, match.length - ext.length) + (wildcard ? '/*.js' : '');
}

var SystemJSLoader = require('./dist/system.src').constructor;

// standard class extend SystemJSLoader to SystemJSNodeLoader
function SystemJSNodeLoader() {
  SystemJSLoader.call(this);

  if (nodeResolver) {
    configNodePath(this, 'traceur', 'traceur/bin/traceur.js');
    configNodePath(this, 'traceur-runtime', 'traceur/bin/traceur-runtime.js');
    configNodePath(this, 'babel', 'babel-core/browser.js');
    configNodePath(this, 'babel/external-helpers', 'babel-core/external-helpers.js');
    configNodePath(this, 'babel-runtime/*', 'babel-runtime', true);
  }
}
SystemJSNodeLoader.prototype = Object.create(SystemJSLoader.prototype);
SystemJSNodeLoader.prototype.constructor = SystemJSNodeLoader;

var System = new SystemJSNodeLoader();

System.version = version + ' Node';

if (typeof global != 'undefined')
  global.System = global.SystemJS = System;

module.exports = System;
