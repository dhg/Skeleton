(function() {
  class AsyncTestZoneSpec implements ZoneSpec {
    _finishCallback: Function;
    _failCallback: Function;
    _pendingMicroTasks: boolean = false;
    _pendingMacroTasks: boolean = false;
    _alreadyErrored: boolean = false;
    runZone = Zone.current;

    constructor(finishCallback: Function, failCallback: Function, namePrefix: string) {
      this._finishCallback = finishCallback;
      this._failCallback = failCallback;
      this.name = 'asyncTestZone for ' + namePrefix;
    }

    _finishCallbackIfDone() {
      if (!(this._pendingMicroTasks || this._pendingMacroTasks)) {
        // We do this because we would like to catch unhandled rejected promises.
        // To do this quickly when there are native promises, we must run using an unwrapped
        // promise implementation.
        var symbol = (<any>Zone).__symbol__;
        var NativePromise: typeof Promise = <any>window[symbol('Promise')];
        if (NativePromise) {
          NativePromise.resolve(true)[symbol('then')](() => {
            if (!this._alreadyErrored) {
              this.runZone.run(this._finishCallback);
            }
          });
        } else {
          // For implementations which do not have nativePromise, use setTimeout(0). This is slower,
          // but it also works because Zones will handle errors when rejected promises have no
          // listeners after one macrotask.
          this.runZone.run(() => {
            setTimeout(() => {
              if (!this._alreadyErrored) {
                this._finishCallback();
              }
            }, 0);
          });
        }
      }
    }

    // ZoneSpec implementation below.

    name: string;

    // Note - we need to use onInvoke at the moment to call finish when a test is
    // fully synchronous. TODO(juliemr): remove this when the logic for
    // onHasTask changes and it calls whenever the task queues are dirty.
    onInvoke(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
      delegate: Function, applyThis: any, applyArgs: any[], source: string): any {
      try {
        return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
      } finally {
        this._finishCallbackIfDone();
      }
    }

    onHandleError(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
      error: any): boolean {
      // Let the parent try to handle the error.
      var result = parentZoneDelegate.handleError(targetZone, error);
      if (result) {
        this._failCallback(error.message ? error.message : 'unknown error');
        this._alreadyErrored = true;
      }
      return false;
    }

    onScheduleTask(delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task): Task {
      if (task.type == 'macroTask' && task.source == 'setInterval') {
        this._failCallback('Cannot use setInterval from within an async zone test.');
        return;
      }

      return delegate.scheduleTask(targetZone, task);
    }

    onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
      delegate.hasTask(target, hasTaskState);

      if (hasTaskState.change == 'microTask') {
        this._pendingMicroTasks = hasTaskState.microTask;
        this._finishCallbackIfDone();
      } else if (hasTaskState.change == 'macroTask') {
        this._pendingMacroTasks = hasTaskState.macroTask;
        this._finishCallbackIfDone();
      }
    }
  }

  // Export the class so that new instances can be created with proper
  // constructor params.
  Zone['AsyncTestZoneSpec'] = AsyncTestZoneSpec;
})();
