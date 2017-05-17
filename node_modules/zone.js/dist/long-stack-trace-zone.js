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

	'use strict';
	(function () {
	    var NEWLINE = '\n';
	    var SEP = '  -------------  ';
	    var IGNORE_FRAMES = [];
	    var creationTrace = '__creationTrace__';
	    var LongStackTrace = (function () {
	        function LongStackTrace() {
	            this.error = getStacktrace();
	            this.timestamp = new Date();
	        }
	        return LongStackTrace;
	    }());
	    function getStacktraceWithUncaughtError() {
	        return new Error('STACKTRACE TRACKING');
	    }
	    function getStacktraceWithCaughtError() {
	        try {
	            throw getStacktraceWithUncaughtError();
	        }
	        catch (e) {
	            return e;
	        }
	    }
	    // Some implementations of exception handling don't create a stack trace if the exception
	    // isn't thrown, however it's faster not to actually throw the exception.
	    var error = getStacktraceWithUncaughtError();
	    var coughtError = getStacktraceWithCaughtError();
	    var getStacktrace = error.stack
	        ? getStacktraceWithUncaughtError
	        : (coughtError.stack ? getStacktraceWithCaughtError : getStacktraceWithUncaughtError);
	    function getFrames(error) {
	        return error.stack ? error.stack.split(NEWLINE) : [];
	    }
	    function addErrorStack(lines, error) {
	        var trace;
	        trace = getFrames(error);
	        for (var i = 0; i < trace.length; i++) {
	            var frame = trace[i];
	            // Filter out the Frames which are part of stack capturing.
	            if (!(i < IGNORE_FRAMES.length && IGNORE_FRAMES[i] === frame)) {
	                lines.push(trace[i]);
	            }
	        }
	    }
	    function renderLongStackTrace(frames, stack) {
	        var longTrace = [stack];
	        if (frames) {
	            var timestamp = new Date().getTime();
	            for (var i = 0; i < frames.length; i++) {
	                var traceFrames = frames[i];
	                var lastTime = traceFrames.timestamp;
	                longTrace.push(SEP + " Elapsed: " + (timestamp - lastTime.getTime()) + " ms; At: " + lastTime + " " + SEP);
	                addErrorStack(longTrace, traceFrames.error);
	                timestamp = lastTime.getTime();
	            }
	        }
	        return longTrace.join(NEWLINE);
	    }
	    Zone['longStackTraceZoneSpec'] = {
	        name: 'long-stack-trace',
	        longStackTraceLimit: 10,
	        onScheduleTask: function (parentZoneDelegate, currentZone, targetZone, task) {
	            var currentTask = Zone.currentTask;
	            var trace = currentTask && currentTask.data && currentTask.data[creationTrace] || [];
	            trace = [new LongStackTrace()].concat(trace);
	            if (trace.length > this.longStackTraceLimit) {
	                trace.length = this.longStackTraceLimit;
	            }
	            if (!task.data)
	                task.data = {};
	            task.data[creationTrace] = trace;
	            return parentZoneDelegate.scheduleTask(targetZone, task);
	        },
	        onHandleError: function (parentZoneDelegate, currentZone, targetZone, error) {
	            var parentTask = Zone.currentTask;
	            if (error instanceof Error && parentTask) {
	                var descriptor = Object.getOwnPropertyDescriptor(error, 'stack');
	                if (descriptor) {
	                    var delegateGet = descriptor.get;
	                    var value = descriptor.value;
	                    descriptor = {
	                        get: function () {
	                            return renderLongStackTrace(parentTask.data && parentTask.data[creationTrace], delegateGet ? delegateGet.apply(this) : value);
	                        }
	                    };
	                    Object.defineProperty(error, 'stack', descriptor);
	                }
	                else {
	                    error.stack = renderLongStackTrace(parentTask.data && parentTask.data[creationTrace], error.stack);
	                }
	            }
	            return parentZoneDelegate.handleError(targetZone, error);
	        }
	    };
	    function captureStackTraces(stackTraces, count) {
	        if (count > 0) {
	            stackTraces.push(getFrames((new LongStackTrace()).error));
	            captureStackTraces(stackTraces, count - 1);
	        }
	    }
	    function computeIgnoreFrames() {
	        var frames = [];
	        captureStackTraces(frames, 2);
	        var frames1 = frames[0];
	        var frames2 = frames[1];
	        for (var i = 0; i < frames1.length; i++) {
	            var frame1 = frames1[i];
	            var frame2 = frames2[i];
	            if (frame1 === frame2) {
	                IGNORE_FRAMES.push(frame1);
	            }
	            else {
	                break;
	            }
	        }
	    }
	    computeIgnoreFrames();
	})();


/***/ }
/******/ ]);