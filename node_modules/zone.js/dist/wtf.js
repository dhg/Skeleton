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

	/* WEBPACK VAR INJECTION */(function(global) {(function (global) {
	    ;
	    ;
	    // Detect and setup WTF.
	    var wtfTrace = null;
	    var wtfEvents = null;
	    var wtfEnabled = (function () {
	        var wtf = global['wtf'];
	        if (wtf) {
	            wtfTrace = wtf.trace;
	            if (wtfTrace) {
	                wtfEvents = wtfTrace.events;
	                return true;
	            }
	        }
	        return false;
	    })();
	    var WtfZoneSpec = (function () {
	        function WtfZoneSpec() {
	            this.name = 'WTF';
	        }
	        WtfZoneSpec.prototype.onFork = function (parentZoneDelegate, currentZone, targetZone, zoneSpec) {
	            var retValue = parentZoneDelegate.fork(targetZone, zoneSpec);
	            WtfZoneSpec.forkInstance(zonePathName(targetZone), retValue.name);
	            return retValue;
	        };
	        WtfZoneSpec.prototype.onInvoke = function (parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source) {
	            var scope = WtfZoneSpec.invokeScope[source];
	            if (!scope) {
	                scope = WtfZoneSpec.invokeScope[source]
	                    = wtfEvents.createScope("Zone:invoke:" + source + "(ascii zone)");
	            }
	            return wtfTrace.leaveScope(scope(zonePathName(targetZone)), parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source));
	        };
	        WtfZoneSpec.prototype.onHandleError = function (parentZoneDelegate, currentZone, targetZone, error) {
	            return parentZoneDelegate.handleError(targetZone, error);
	        };
	        WtfZoneSpec.prototype.onScheduleTask = function (parentZoneDelegate, currentZone, targetZone, task) {
	            var key = task.type + ':' + task.source;
	            var instance = WtfZoneSpec.scheduleInstance[key];
	            if (!instance) {
	                instance = WtfZoneSpec.scheduleInstance[key]
	                    = wtfEvents.createInstance("Zone:schedule:" + key + "(ascii zone, any data)");
	            }
	            var retValue = parentZoneDelegate.scheduleTask(targetZone, task);
	            instance(zonePathName(targetZone), shallowObj(task.data, 2));
	            return retValue;
	        };
	        WtfZoneSpec.prototype.onInvokeTask = function (parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs) {
	            var source = task.source;
	            var scope = WtfZoneSpec.invokeTaskScope[source];
	            if (!scope) {
	                scope = WtfZoneSpec.invokeTaskScope[source]
	                    = wtfEvents.createScope("Zone:invokeTask:" + source + "(ascii zone)");
	            }
	            return wtfTrace.leaveScope(scope(zonePathName(targetZone)), parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs));
	        };
	        WtfZoneSpec.prototype.onCancelTask = function (parentZoneDelegate, currentZone, targetZone, task) {
	            var key = task.source;
	            var instance = WtfZoneSpec.cancelInstance[key];
	            if (!instance) {
	                instance = WtfZoneSpec.cancelInstance[key]
	                    = wtfEvents.createInstance("Zone:cancel:" + key + "(ascii zone, any options)");
	            }
	            var retValue = parentZoneDelegate.cancelTask(targetZone, task);
	            instance(zonePathName(targetZone), shallowObj(task.data, 2));
	            return retValue;
	        };
	        ;
	        WtfZoneSpec.forkInstance = wtfEnabled && wtfEvents.createInstance('Zone:fork(ascii zone, ascii newZone)');
	        WtfZoneSpec.scheduleInstance = {};
	        WtfZoneSpec.cancelInstance = {};
	        WtfZoneSpec.invokeScope = {};
	        WtfZoneSpec.invokeTaskScope = {};
	        return WtfZoneSpec;
	    }());
	    function shallowObj(obj, depth) {
	        if (!depth)
	            return null;
	        var out = {};
	        for (var key in obj) {
	            if (obj.hasOwnProperty(key)) {
	                var value = obj[key];
	                switch (typeof value) {
	                    case 'object':
	                        var name = value && value.constructor && value.constructor.name;
	                        value = name == Object.name ? shallowObj(value, depth - 1) : name;
	                        break;
	                    case 'function':
	                        value = value.name || undefined;
	                        break;
	                }
	                out[key] = value;
	            }
	        }
	        return out;
	    }
	    function zonePathName(zone) {
	        var name = zone.name;
	        zone = zone.parent;
	        while (zone != null) {
	            name = zone.name + '::' + name;
	            zone = zone.parent;
	        }
	        return name;
	    }
	    Zone['wtfZoneSpec'] = !wtfEnabled ? null : new WtfZoneSpec();
	})(typeof window == 'undefined' ? global : window);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ]);