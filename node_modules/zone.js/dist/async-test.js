/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	(function () {
	    var AsyncTestZoneSpec = (function () {
	        function AsyncTestZoneSpec(finishCallback, failCallback, namePrefix) {
	            this._pendingMicroTasks = false;
	            this._pendingMacroTasks = false;
	            this._alreadyErrored = false;
	            this.runZone = Zone.current;
	            this._finishCallback = finishCallback;
	            this._failCallback = failCallback;
	            this.name = 'asyncTestZone for ' + namePrefix;
	        }
	        AsyncTestZoneSpec.prototype._finishCallbackIfDone = function () {
	            var _this = this;
	            if (!(this._pendingMicroTasks || this._pendingMacroTasks)) {
	                // We do this because we would like to catch unhandled rejected promises.
	                // To do this quickly when there are native promises, we must run using an unwrapped
	                // promise implementation.
	                var symbol = Zone.__symbol__;
	                var NativePromise = window[symbol('Promise')];
	                if (NativePromise) {
	                    NativePromise.resolve(true)[symbol('then')](function () {
	                        if (!_this._alreadyErrored) {
	                            _this.runZone.run(_this._finishCallback);
	                        }
	                    });
	                }
	                else {
	                    // For implementations which do not have nativePromise, use setTimeout(0). This is slower,
	                    // but it also works because Zones will handle errors when rejected promises have no
	                    // listeners after one macrotask.
	                    this.runZone.run(function () {
	                        setTimeout(function () {
	                            if (!_this._alreadyErrored) {
	                                _this._finishCallback();
	                            }
	                        }, 0);
	                    });
	                }
	            }
	        };
	        // Note - we need to use onInvoke at the moment to call finish when a test is
	        // fully synchronous. TODO(juliemr): remove this when the logic for
	        // onHasTask changes and it calls whenever the task queues are dirty.
	        AsyncTestZoneSpec.prototype.onInvoke = function (parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source) {
	            try {
	                return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
	            }
	            finally {
	                this._finishCallbackIfDone();
	            }
	        };
	        AsyncTestZoneSpec.prototype.onHandleError = function (parentZoneDelegate, currentZone, targetZone, error) {
	            // Let the parent try to handle the error.
	            var result = parentZoneDelegate.handleError(targetZone, error);
	            if (result) {
	                this._failCallback(error.message ? error.message : 'unknown error');
	                this._alreadyErrored = true;
	            }
	            return false;
	        };
	        AsyncTestZoneSpec.prototype.onScheduleTask = function (delegate, currentZone, targetZone, task) {
	            if (task.type == 'macroTask' && task.source == 'setInterval') {
	                this._failCallback('Cannot use setInterval from within an async zone test.');
	                return;
	            }
	            return delegate.scheduleTask(targetZone, task);
	        };
	        AsyncTestZoneSpec.prototype.onHasTask = function (delegate, current, target, hasTaskState) {
	            delegate.hasTask(target, hasTaskState);
	            if (hasTaskState.change == 'microTask') {
	                this._pendingMicroTasks = hasTaskState.microTask;
	                this._finishCallbackIfDone();
	            }
	            else if (hasTaskState.change == 'macroTask') {
	                this._pendingMacroTasks = hasTaskState.macroTask;
	                this._finishCallbackIfDone();
	            }
	        };
	        return AsyncTestZoneSpec;
	    }());
	    // Export the class so that new instances can be created with proper
	    // constructor params.
	    Zone['AsyncTestZoneSpec'] = AsyncTestZoneSpec;
	})();


/***/ }
/******/ ]);