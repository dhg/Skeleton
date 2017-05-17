/*
 * Script-only addition used for production loader
 *
 */
hookConstructor(function(constructor) {
  return function() {
    constructor.apply(this, arguments);
    __global.define = this.amdDefine;
  };
});

hook('fetch', function(fetch) {
  return function(load) {
    load.metadata.scriptLoad = true;
    return fetch.call(this, load);
  };
});