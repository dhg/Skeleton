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
	    var SyncTestZoneSpec = (function () {
	        function SyncTestZoneSpec(namePrefix) {
	            this.runZone = Zone.current;
	            this.name = 'syncTestZone for ' + namePrefix;
	        }
	        SyncTestZoneSpec.prototype.onScheduleTask = function (delegate, current, target, task) {
	            switch (task.type) {
	                case 'microTask':
	                case 'macroTask':
	                    throw new Error("Cannot call " + task.source + " from within a sync test.");
	                case 'eventTask':
	                    task = delegate.scheduleTask(target, task);
	                    break;
	            }
	            return task;
	        };
	        return SyncTestZoneSpec;
	    }());
	    // Export the class so that new instances can be created with proper
	    // constructor params.
	    Zone['SyncTestZoneSpec'] = SyncTestZoneSpec;
	})();


/***/ }
/******/ ]);