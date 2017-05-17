'use strict';
(function() {
  const NEWLINE = '\n';
  const SEP = '  -------------  ';
  const IGNORE_FRAMES = [];
  const creationTrace = '__creationTrace__';

  class LongStackTrace {
    error: Error = getStacktrace();
    timestamp: Date = new Date();

  }

  function getStacktraceWithUncaughtError (): Error {
    return new Error('STACKTRACE TRACKING');
  }

  function getStacktraceWithCaughtError(): Error {
    try {
      throw getStacktraceWithUncaughtError();
    } catch (e) {
      return e;
    }
  }

  // Some implementations of exception handling don't create a stack trace if the exception
  // isn't thrown, however it's faster not to actually throw the exception.
  var error = getStacktraceWithUncaughtError();
  var coughtError = getStacktraceWithCaughtError();
  var getStacktrace = error.stack
      ? getStacktraceWithUncaughtError
      : (coughtError.stack ? getStacktraceWithCaughtError: getStacktraceWithUncaughtError);

  function getFrames(error: Error): string[] {
    return error.stack ? error.stack.split(NEWLINE) : [];
  }

  function addErrorStack(lines:string[], error:Error):void {
    var trace: string[];
    trace = getFrames(error);
    for (var i = 0; i < trace.length; i++) {
      var frame = trace[i];
      // Filter out the Frames which are part of stack capturing.
      if (! (i < IGNORE_FRAMES.length && IGNORE_FRAMES[i] === frame)) {
        lines.push(trace[i]);
      }
    }
  }

  function renderLongStackTrace(frames: LongStackTrace[], stack: string): string {
    var longTrace: string[] = [stack];

    if (frames) {
      var timestamp = new Date().getTime();
      for (var i = 0; i < frames.length; i++) {
        var traceFrames: LongStackTrace = frames[i];
        var lastTime = traceFrames.timestamp;
        longTrace.push(`${SEP} Elapsed: ${timestamp - lastTime.getTime()} ms; At: ${lastTime} ${SEP}`);
        addErrorStack(longTrace, traceFrames.error);

        timestamp = lastTime.getTime();
      }
    }

    return longTrace.join(NEWLINE);
  }

  Zone['longStackTraceZoneSpec'] = <ZoneSpec>{
    name: 'long-stack-trace',
    longStackTraceLimit: 10, // Max number of task to keep the stack trace for.

    onScheduleTask: function(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                          task: Task): any
    {
      var currentTask = Zone.currentTask;
      var trace = currentTask && currentTask.data && currentTask.data[creationTrace] || [];
      trace = [new LongStackTrace()].concat(trace);
      if (trace.length > this.longStackTraceLimit) {
        trace.length = this.longStackTraceLimit;
      }
      if (!task.data) task.data = {};
      task.data[creationTrace] = trace;
      return parentZoneDelegate.scheduleTask(targetZone, task);
    },

    onHandleError: function(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                 error: any): any
    {
      var parentTask = Zone.currentTask;
      if (error instanceof Error && parentTask) {
        var descriptor = Object.getOwnPropertyDescriptor(error, 'stack');
        if (descriptor) {
          var delegateGet = descriptor.get;
          var value = descriptor.value;
          descriptor = {
            get: function() {
              return renderLongStackTrace(parentTask.data && parentTask.data[creationTrace],
                  delegateGet ? delegateGet.apply(this): value);
            }
          };
          Object.defineProperty(error, 'stack', descriptor);
        } else {
          error.stack = renderLongStackTrace(parentTask.data && parentTask.data[creationTrace],
              error.stack);
        }
      }
      return parentZoneDelegate.handleError(targetZone, error);
    }
  };

  function captureStackTraces(stackTraces: string[][], count: number): void {
    if (count > 0) {
      stackTraces.push(getFrames((new LongStackTrace()).error));
      captureStackTraces(stackTraces, count - 1);
    }
  }

  function computeIgnoreFrames() {
    var frames: string[][] = [];
    captureStackTraces(frames, 2);
    var frames1 = frames[0];
    var frames2 = frames[1];
    for (var i = 0; i < frames1.length; i++) {
      var frame1 = frames1[i];
      var frame2 = frames2[i];
      if (frame1 === frame2) {
        IGNORE_FRAMES.push(frame1);
      } else {
        break;
      }
    }
  }
  computeIgnoreFrames();
})();
