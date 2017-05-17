/*
 * Extension to detect ES6 and auto-load Traceur or Babel for processing
 */
(function() {
  // good enough ES6 module detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var esmRegEx = /(^\s*|[}\);\n]\s*)(import\s*(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s*from\s*['"]|\{)|export\s+\*\s+from\s+["']|export\s*(\{|default|function|class|var|const|let|async\s+function))/;

  var traceurRuntimeRegEx = /\$traceurRuntime\s*\./;
  var babelHelpersRegEx = /babelHelpers\s*\./;

  hook('translate', function(translate) {
    return function(load) {
      var loader = this;
      return translate.call(loader, load)
      .then(function(source) {
        // detect & transpile ES6
        if (load.metadata.format == 'esm' || load.metadata.format == 'es6' || !load.metadata.format && source.match(esmRegEx)) {
          if (load.metadata.format == 'es6')
            warn.call(loader, 'Module ' + load.name + ' has metadata setting its format to "es6", which is deprecated.\nThis should be updated to "esm".');

          load.metadata.format = 'esm';

          if (loader.transpiler === false) {
            // we accept translation to esm for builds though to enable eg rollup optimizations
            if (loader.builder)
              return source;
            throw new TypeError('Unable to dynamically transpile ES module as SystemJS.transpiler set to false.');
          }

          // setting _loader.loadedTranspiler = false tells the next block to
          // do checks for setting transpiler metadata
          loader._loader.loadedTranspiler = loader._loader.loadedTranspiler || false;
          if (loader.pluginLoader)
            loader.pluginLoader._loader.loadedTranspiler = loader._loader.loadedTranspiler || false;

          // do transpilation
          return (loader._loader.transpilerPromise || (
            loader._loader.transpilerPromise = Promise.resolve(
              __global[loader.transpiler == 'typescript' ? 'ts' : loader.transpiler] || (loader.pluginLoader || loader)['import'](loader.transpiler)
          ))).then(function(transpiler) {
            loader._loader.loadedTranspilerRuntime = true;

            // translate hooks means this is a transpiler plugin instead of a raw implementation
            if (transpiler.translate) {
              // if transpiler is the same as the plugin loader, then don't run twice
              if (transpiler == load.metadata.loaderModule)
                return load.source;

              // convert the source map into an object for transpilation chaining
              if (typeof load.metadata.sourceMap == 'string')
                load.metadata.sourceMap = JSON.parse(load.metadata.sourceMap);

              return Promise.resolve(transpiler.translate.call(loader, load))
              .then(function(source) {
                // sanitize sourceMap if an object not a JSON string
                var sourceMap = load.metadata.sourceMap;
                if (sourceMap && typeof sourceMap == 'object') {
                  var originalName = load.name.split('!')[0];
                  
                  // force set the filename of the original file
                  sourceMap.file = originalName + '!transpiled';

                  // force set the sources list if only one source
                  if (!sourceMap.sources || sourceMap.sources.length <= 1)
                    sourceMap.sources = [originalName];
                }

                if (load.metadata.format == 'esm' && !loader.builder && detectRegisterFormat(source))
                  load.metadata.format = 'register';
                return source;
              });
            }

            // legacy builder support
            if (loader.builder)
              load.metadata.originalSource = load.source;
            
            // defined in es6-module-loader/src/transpile.js
            return transpile.call(loader, load)
            .then(function(source) {
              // clear sourceMap as transpiler embeds it
              load.metadata.sourceMap = undefined;
              return source;
            });            
          });
        }

        // skip transpiler and transpiler runtime loading when transpiler is disabled
        if (loader.transpiler === false)
          return source;

        // load the transpiler correctly
        if (loader._loader.loadedTranspiler === false && (loader.transpiler == 'traceur' || loader.transpiler == 'typescript' || loader.transpiler == 'babel')
            && load.name == loader.normalizeSync(loader.transpiler)) {

          // always load transpiler as a global
          if (source.length > 100 && !load.metadata.format) {
            load.metadata.format = 'global';

            if (loader.transpiler === 'traceur')
              load.metadata.exports = 'traceur';
            if (loader.transpiler === 'typescript')
              load.metadata.exports = 'ts';
          }

          loader._loader.loadedTranspiler = true;
        }

        // load the transpiler runtime correctly
        if (loader._loader.loadedTranspilerRuntime === false) {
          if (load.name == loader.normalizeSync('traceur-runtime')
              || load.name == loader.normalizeSync('babel/external-helpers*')) {
            if (source.length > 100)
              load.metadata.format = load.metadata.format || 'global';

            loader._loader.loadedTranspilerRuntime = true;
          }
        }

        // detect transpiler runtime usage to load runtimes
        if ((load.metadata.format == 'register' || load.metadata.bundle) && loader._loader.loadedTranspilerRuntime !== true) {
          if (!__global.$traceurRuntime && load.source.match(traceurRuntimeRegEx)) {
            loader._loader.loadedTranspilerRuntime = loader._loader.loadedTranspilerRuntime || false;
            return loader['import']('traceur-runtime').then(function() {
              return source;
            });
          }
          if (!__global.babelHelpers && load.source.match(babelHelpersRegEx)) {
            loader._loader.loadedTranspilerRuntime = loader._loader.loadedTranspilerRuntime || false;
            return loader['import']('babel/external-helpers').then(function() {
              return source;
            });
          }
        }

        return source;
      });
    };
  });

})();
