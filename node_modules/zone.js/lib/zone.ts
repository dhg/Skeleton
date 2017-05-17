/**
 * Zone is a mechanism for intercepting and keeping track of asynchronous work.
 *
 * A Zone is a global object which is configured with rules about how to intercept and keep track
 * of the asynchronous callbacks. Zone has these responsibilities:
 *
 * 1. Intercept asynchronous task scheduling
 * 2. Wrap callbacks for error-handling and zone tracking across async operations.
 * 3. Provide a way to attach data to zones
 * 4. Provide a context specific last frame error handling
 * 5. (Intercept blocking methods)
 *
 * A zone by itself does not do anything, instead it relies on some other code to route existing
 * platform API through it. (The zone library ships with code which monkey patches all of the
 * browsers's asynchronous API and redirects them through the zone for interception.)
 *
 * In its simplest form a zone allows one to intercept the scheduling and calling of asynchronous
 * operations, and execute additional code before as well as after the asynchronous task. The rules
 * of interception are configured using [ZoneConfig]. There can be many different zone instances in
 * a system, but only one zone is active at any given time which can be retrieved using
 * [Zone#current].
 *
 *
 *
 * ## Callback Wrapping
 *
 * An important aspect of the zones is that they should persist across asynchronous operations. To
 * achieve this, when a future work is scheduled through async API, it is necessary to capture, and
 * subsequently restore the current zone. For example if a code is running in zone `b` and it
 * invokes `setTimeout` to scheduleTask work later, the `setTimeout` method needs to 1) capture the
 * current zone and 2) wrap the `wrapCallback` in code which will restore the current zone `b` once
 * the wrapCallback executes. In this way the rules which govern the current code are preserved in
 * all future asynchronous tasks. There could be a different zone `c` which has different rules and
 * is associated with different asynchronous tasks. As these tasks are processed, each asynchronous
 * wrapCallback correctly restores the correct zone, as well as preserves the zone for future
 * asynchronous callbacks.
 *
 * Example: Suppose a browser page consist of application code as well as third-party
 * advertisement code. (These two code bases are independent, developed by different mutually
 * unaware developers.) The application code may be interested in doing global error handling and
 * so it configures the `app` zone to send all of the errors to the server for analysis, and then
 * executes the application in the `app` zone. The advertising code is interested in the same
 * error processing but it needs to send the errors to a different third-party. So it creates the
 * `ads` zone with a different error handler. Now both advertising as well as application code
 * create many asynchronous operations, but the [Zone] will ensure that all of the asynchronous
 * operations created from the application code will execute in `app` zone with its error
 * handler and all of the advertisement code will execute in the `ads` zone with its error handler.
 * This will not only work for the async operations created directly, but also for all subsequent
 * asynchronous operations.
 *
 * If you think of chain of asynchronous operations as a thread of execution (bit of a stretch)
 * then [Zone#current] will act as a thread local variable.
 *
 *
 *
 * ## Asynchronous operation scheduling
 *
 * In addition to wrapping the callbacks to restore the zone, all operations which cause a
 * scheduling of work for later are routed through the current zone which is allowed to intercept
 * them by adding work before or after the wrapCallback as well as using different means of
 * achieving the request. (Useful for unit testing, or tracking of requests). In some instances
 * such as `setTimeout` the wrapping of the wrapCallback and scheduling is done in the same
 * wrapCallback, but there are other examples such as `Promises` where the `then` wrapCallback is
 * wrapped, but the execution of `then` in triggered by `Promise` scheduling `resolve` work.
 *
 * Fundamentally there are three kinds of tasks which can be scheduled:
 *
 * 1. [MicroTask] used for doing work right after the current task. This is non-cancelable which is
 *    guaranteed to run exactly once and immediately.
 * 2. [MacroTask] used for doing work later. Such as `setTimeout`. This is typically cancelable
 *    which is guaranteed to execute at least once after some well understood delay.
 * 3. [EventTask] used for listening on some future event. This may execute zero or more times, with
 *    an unknown delay.
 *
 * Each asynchronous API is modeled and routed through one of these APIs.
 *
 *
 * ### [MicroTask]
 *
 * [MicroTask]s represent work which will be done in current VM turn as soon as possible, before VM
 * yielding.
 *
 *
 * ### [TimerTask]
 *
 * [TimerTask]s represents work which will be done after some delay. (Sometimes the delay is
 * approximate such as on next available animation frame). Typically these methods include:
 * `setTimeout`, `setImmediate`, `setInterval`, `requestAnimationFrame`, and all browser specif
 * variants.
 *
 *
 * ### [EventTask]
 *
 * [EventTask]s represents a request to create a listener on an event. Unlike the other task
 * events may never be executed, but typically execute more then once. There is no queue of
 * events, rather their callbacks are unpredictable both in order and time.
 *
 *
 * ## Global Error Handling
 *
 *
 * ## Composability
 *
 * Zones can be composed together through [Zone.fork()]. A child zone may create its own set of
 * rules. A child zone is expected to either:
 *
 * 1. Delegate the interception to a parent zone, and optionally add before and after wrapCallback
 *    hook.s
 * 2) Or process the request itself without delegation.
 *
 * Composability allows zones to keep their concerns clean. For example a top most zone may chose
 * to handle error handling, while child zones may chose to do user action tracking.
 *
 *
 * ## Root Zone
 *
 * At the start the browser will run in a special root zone, which is configure to behave exactly
 * like the platform, making any existing code which is not-zone aware behave as expected. All
 * zones are children of the root zone.
 *
 */
interface Zone {
  /**
   *
   * @returns {Zone} The parent Zone.
   */
  parent: Zone;
  /**
   * @returns {string} The Zone name (useful for debugging)
   */
  name: string;

  /**
   * Returns a value associated with the `key`.
   *
   * If the current zone does not have a key, the request is delegated to the parent zone. Use
   * [ZoneSpec.properties] to configure the set of properties asseciated with the current zone.
   *
   * @param key The key to retrieve.
   * @returns {any} Tha value for the key, or `undefined` if not found.
   */
  get(key: string): any;
  /**
   * Used to create a child zone.
   *
   * @param zoneSpec A set of rules which the child zone should follow.
   * @returns {Zone} A new child zone.
   */
  fork(zoneSpec: ZoneSpec): Zone;
  /**
   * Wraps a callback function in a new function which will properly restore the current zone upon
   * invocation.
   *
   * The wrapped function will properly forward `this` as well as `arguments` to the `callback`.
   *
   * Before the function is wrapped the zone can intercept the `callback` by declaring
   * [ZoneSpec.onIntercept].
   *
   * @param callback the function which will be wrapped in the zone.
   * @param source A unique debug location of the API being wrapped.
   * @returns {function(): *} A function which will invoke the `callback` through [Zone.runGuarded].
   */
  wrap(callback: Function, source: string): Function;
  /**
   * Invokes a function in a given zone.
   *
   * The invocation of `callback` can be intercepted be declaring [ZoneSpec.onInvoke].
   *
   * @param callback The function to invoke.
   * @param applyThis
   * @param applyArgs
   * @param source A unique debug location of the API being invoked.
   * @returns {any} Value from the `callback` function.
   */
  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
  /**
   * Invokes a function in a given zone and catches any exceptions.
   *
   * Any exceptions thrown will be forwarded to [Zone.HandleError].
   *
   * The invocation of `callback` can be intercepted be declaring [ZoneSpec.onInvoke]. The
   * handling of exceptions can intercepted by declaring [ZoneSpec.handleError].
   *
   * @param callback The function to invoke.
   * @param applyThis
   * @param applyArgs
   * @param source A unique debug location of the API being invoked.
   * @returns {any} Value from the `callback` function.
   */
  runGuarded<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
  /**
   * Execute the Task by restoring the [Zone.currentTask] in the Task's zone.
   *
   * @param callback
   * @param applyThis
   * @param applyArgs
   * @returns {*}
   */
  runTask(task: Task, applyThis?: any, applyArgs?: any): any;
  scheduleMicroTask(source: string, callback: Function, data?: TaskData, customSchedule?: (task: Task) => void): MicroTask;
  scheduleMacroTask(source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void, customCancel: (task: Task) => void): MacroTask;
  scheduleEventTask(source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void, customCancel: (task: Task) => void): EventTask;
  /**
   * Allows the zone to intercept canceling of scheduled Task.
   *
   * The interception is configured using [ZoneSpec.onCancelTask]. The default canceler invokes
   * the [Task.cancelFn].
   *
   * @param task
   * @returns {any}
   */
  cancelTask(task: Task): any;
}

interface ZoneType {
  /**
   * @returns {Zone} Returns the current [Zone]. Returns the current zone. The only way to change
   * the current zone is by invoking a run() method, which will update the current zone for the
   * duration of the run method callback.
   */
  current: Zone;
  /**
   * @returns {Task} The task associated with the current execution.
   */
  currentTask: Task;
}

/**
 * Provides a way to configure the interception of zone events.
 *
 * Only the `name` property is required (all other are optional).
 */
interface ZoneSpec {
  /**
   * The name of the zone. Usefull when debugging Zones.
   */
  name: string;

  /**
   * A set of properties to be associated with Zone. Use [Zone.get] to retrive them.
   */
  properties?: {[key: string]: any};

  /**
   * Allows the interception of zone forking.
   *
   * When the zone is being forked, the request is forwarded to this method for interception.
   *
   * @param parentZoneDelegate Dalegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param zoneSpec The argument passed into the `fork` method.
   */
  onFork?: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
            zoneSpec: ZoneSpec) =>  Zone;

  /**
   * Allows interception of the wrapping of the callback.
   *
   * @param parentZoneDelegate Dalegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param delegate The argument passed into the `warp` method.
   * @param source The argument passed into the `warp` method.
   */
  onIntercept?: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                 delegate: Function, source: string) => Function;

  /**
   * Allows interception of the callback invocation.
   *
   * @param parentZoneDelegate Dalegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param delegate The argument passed into the `run` method.
   * @param applyThis The argument passed into the `run` method.
   * @param applyArgs The argument passed into the `run` method.
   * @param source The argument passed into the `run` method.
   */
  onInvoke?: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
              delegate: Function, applyThis: any, applyArgs: any[], source: string) => any;

  /**
   * Allows interception of the error handling.
   *
   * @param parentZoneDelegate Dalegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param error The argument passed into the `handleError` method.
   */
  onHandleError?: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                   error: any) => boolean;

  /**
   * Allows interception of task scheduling.
   *
   * @param parentZoneDelegate Dalegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param task The argument passed into the `scheduleTask` method.
   */
  onScheduleTask?: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                    task: Task) => Task;

  onInvokeTask?: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                  task: Task, applyThis: any, applyArgs: any) => any;

  /**
   * Allows interception of task cancalation.
   *
   * @param parentZoneDelegate Dalegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param task The argument passed into the `cancelTask` method.
   */
  onCancelTask?: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                  task: Task) => any;

  /**
   * Notifies of changes to the task queue empty status.
   *
   * @param parentZoneDelegate Dalegate which performs the parent [ZoneSpec] operation.
   * @param currentZone The current [Zone] where the current interceptor has beed declared.
   * @param targetZone The [Zone] which originally received the request.
   * @param isEmpty
   */
  onHasTask?: (delegate: ZoneDelegate, current: Zone, target: Zone,
               hasTaskState: HasTaskState) => void;
};

/**
 *  A delegate when intercepting zone operations.
 *
 *  A ZoneDelegate is needed because a child zone can't simply invoke a method on a parent zone. For
 *  example a child zone wrap can't just call parent zone wrap. Doing so would create a callback
 *  which is bound to the parent zone. What we are interested is intercepting the callback before it
 *  is bound to any zone. Furthermore, we also need to pass the targetZone (zone which received the
 *  original request) to the delegate.
 *
 *  The ZoneDelegate methods mirror those of Zone with an addition of extra targetZone argument in
 *  the method signature. (The original Zone which received the request.) Some methods are renamed
 *  to prevent confusion, because they have slightly different semantics and arguments.
 *
 *  - `wrap` => `intercept`: The `wrap` method delegates to `intercept`. The `wrap` method returns
 *     a callback which will run in a given zone, where as intercept allows wrapping the callback
 *     so that additional code can be run before and after, but does not associated the callback
 *     with the zone.
 *  - `run` => `invoke`: The `run` method delegates to `invoke` to perform the actual execution of
 *     the callback. The `run` method switches to new zone; saves and restores the `Zone.current`;
 *     and optionally performs error handling. The invoke is not responsible for error handling,
 *     or zone management.
 *
 *  Not every method is usually overwritten in the child zone, for this reason the ZoneDelegate
 *  stores the closest zone which overwrites this behavior along with the closest ZoneSpec.
 *
 *  NOTE: We have tried to make this API analogous to Event bubbling with target and current
 *  properties.
 *
 *  Note: The ZoneDelegate treats ZoneSpec as class. This allows the ZoneSpec to use its `this` to
 *  store internal state.
 */
interface ZoneDelegate {
  zone: Zone;
  fork(targetZone: Zone, zoneSpec: ZoneSpec): Zone;
  intercept(targetZone: Zone, callback: Function, source: string): Function;
  invoke(targetZone: Zone, callback: Function, applyThis: any, applyArgs: any[], source: string): any;
  handleError(targetZone: Zone, error: any): boolean;
  scheduleTask(targetZone: Zone, task: Task): Task;
  invokeTask(targetZone: Zone, task: Task, applyThis: any, applyArgs: any): any;
  cancelTask(targetZone: Zone, task: Task): any;
  hasTask(targetZone: Zone, isEmpty: HasTaskState): void;
}

type HasTaskState = {
  microTask: boolean,
  macroTask: boolean,
  eventTask: boolean,
  change: TaskType
};

/**
 * Task type: `microTask`, `macroTask`, `eventTask`.
 */
type TaskType = string; /* TS v1.8 => "microTask" | "macroTask" | "eventTask" */;

/**
 */
interface TaskData {
  /**
   * A periodic [MacroTask] is such which get automatically rescheduled after it is executed.
   */
  isPeriodic?: boolean;

  /**
   * Delay in milliseconds when the Task will run.
   */
  delay?: number;
}

/**
 * Represents work which is executed with a clean stack.
 *
 * Tasks are used in Zones to mark work which is performed on clean stack frame. There are three
 * kinds of task. [MicroTask], [MacroTask], and [EventTask].
 *
 * A JS VM can be modeled as a [MicroTask] queue, [MacroTask] queue, and [EventTask] set.
 *
 * - [MicroTask] queue represents a set of tasks which are executing right after the current stack
 *   frame becomes clean and before a VM yield. All [MicroTask]s execute in order of insertion
 *   before VM yield and the next [MacroTask] is executed.
 * - [MacroTask] queue represents a set of tasks which are executed one at a time after each VM
 *   yield. The queue is order by time, and insertions can happen in any location.
 * - [EventTask] is a set of tasks which can at any time be inserted to the head of the [MacroTask]
 *   queue. This happens when the event fires.
 *
 */
interface Task {
  /**
   * Task type: `microTask`, `macroTask`, `eventTask`.
   */
  type: TaskType;

  /**
   * Debug string representing the API which requested the scheduling of the task.
   */
  source: string;

  /**
   * The Function to be used by the VM on entering the [Task]. This function will delegate to
   * [Zone.runTask] and delegate to `callback`.
   */
  invoke: Function;

  /**
   * Function which needs to be executed by the Task after the [Zone.currentTask] has been set to
   * the current task.
   */
  callback: Function;

  /**
   * Task specific options associated with the current task. This is passed to the `scheduleFn`.
   */
  data: TaskData;

  /**
   * Represents the default work which needs to be done to schedule the Task by the VM.
   *
   * A zone may chose to intercept this function and perform its own scheduling.
   */
  scheduleFn: (task: Task) => void;

  /**
   * Represents the default work which needs to be done to un-schedule the Task from the VM. Not all
   * Tasks are cancelable, and therefore this method is optional.
   *
   * A zone may chose to intercept this function and perform its own scheduling.
   */
  cancelFn: (task: Task) => void;

  /**
   * @type {Zone} The zone which will be used to invoke the `callback`. The Zone is captured
   * at the time of Task creation.
   */
  zone: Zone;
}

interface MicroTask extends Task {
  /* TS v1.8 => type: 'microTask'; */
}

interface MacroTask extends Task {
  /* TS v1.8 => type: 'macroTask'; */
}

interface EventTask extends Task {
  /* TS v1.8 => type: 'eventTask'; */
}

/** @internal */
type AmbientZone = Zone;
/** @internal */
type AmbientZoneDelegate = ZoneDelegate;

var Zone: ZoneType = (function(global) {
  class Zone implements AmbientZone {
    static __symbol__: (name: string) => string = __symbol__;


    static get current(): AmbientZone { return _currentZone; };
    static get currentTask(): Task { return _currentTask; };

    public get parent(): AmbientZone { return this._parent; };
    public get name(): string { return this._name; };


    private _parent: Zone;
    private _name: string;
    private _properties: {[key: string]: any} = null;
    private _zoneDelegate: ZoneDelegate;

    constructor(parent: Zone, zoneSpec: ZoneSpec)
    {
      this._parent = parent;
      this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
      this._properties = zoneSpec && zoneSpec.properties || {};
      this._zoneDelegate = new ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
    }

    public get(key: string): any {
      var current: Zone = this;
      while (current) {
        if (current._properties.hasOwnProperty(key)) {
          return current._properties[key];
        }
        current = current._parent;
      }
    }

    public fork(zoneSpec: ZoneSpec): AmbientZone {
      if (!zoneSpec) throw new Error('ZoneSpec required!');
      return this._zoneDelegate.fork(this, zoneSpec);
    }

    public wrap(callback: Function, source: string): Function
    {
      if (typeof callback != 'function') {
        throw new Error('Expecting function got: ' + callback);
      }
      var callback = this._zoneDelegate.intercept(this, callback, source);
      var zone: Zone = this;
      return function() {
        return zone.runGuarded(callback, this, <any>arguments, source);
      }
    }

    public run(callback: Function, applyThis: any = null, applyArgs: any[] = null,
               source: string = null)
    {
      var oldZone = _currentZone;
      _currentZone = this;
      try {
        return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
      } finally {
        _currentZone = oldZone;
      }
    }

    public runGuarded(callback: Function, applyThis: any = null, applyArgs: any[] = null,
                      source: string = null)
    {
      var oldZone = _currentZone;
      _currentZone = this;
      try {
        try {
          return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
        } catch (error) {
          if (this._zoneDelegate.handleError(this, error)) {
            throw error;
          }
        }
      } finally {
        _currentZone = oldZone;
      }
    }


    runTask(task: Task, applyThis?: any, applyArgs?: any) {
      if (task.zone != this)
        throw new Error('A task can only be run in the zone which created it! (Creation: ' +
            task.zone.name + '; Execution: ' + this.name + ')');
      var previousTask = _currentTask;
      _currentTask = task;
      var oldZone = _currentZone;
      _currentZone = this;
      try {
        try {
          return this._zoneDelegate.invokeTask(this, task, applyThis, applyArgs);
        } catch (error) {
          if (this._zoneDelegate.handleError(this, error)) {
            throw error;
          }
        }
      } finally {
        if (task.type == 'macroTask' && task.data && !task.data.isPeriodic) {
          task.cancelFn = null;
        }
        _currentZone = oldZone;
        _currentTask = previousTask;
      }
    }


    scheduleMicroTask(source: string, callback: Function, data?: TaskData,
                      customSchedule?: (task: Task) => void): MicroTask {
      return <MicroTask>this._zoneDelegate.scheduleTask(this,
          new ZoneTask('microTask', this, source, callback, data, customSchedule, null));
    }

    scheduleMacroTask(source: string, callback: Function, data: TaskData,
                      customSchedule: (task: Task) => void,
                      customCancel: (task: Task) => void): MacroTask {
      return <MacroTask>this._zoneDelegate.scheduleTask(this,
          new ZoneTask('macroTask', this, source, callback, data, customSchedule, customCancel));
    }

    scheduleEventTask(source: string, callback: Function, data: TaskData,
                      customSchedule: (task: Task) => void,
                      customCancel: (task: Task) => void): EventTask {
      return <EventTask>this._zoneDelegate.scheduleTask(this,
          new ZoneTask('eventTask', this, source, callback, data, customSchedule, customCancel));
    }

    cancelTask(task: Task): any {
      var value = this._zoneDelegate.cancelTask(this, task);
      task.cancelFn = null;
      return value;
    }
  };

  class ZoneDelegate implements AmbientZoneDelegate {
    public zone: Zone;

    private _taskCounts: {microTask: number, macroTask: number, eventTask: number}
        = {microTask: 0, macroTask: 0, eventTask: 0};

    private _parentDelegate: ZoneDelegate;

    private _forkDlgt: ZoneDelegate;
    private _forkZS: ZoneSpec;

    private _interceptDlgt: ZoneDelegate;
    private _interceptZS: ZoneSpec;

    private _invokeDlgt: ZoneDelegate;
    private _invokeZS: ZoneSpec;

    private _handleErrorDlgt: ZoneDelegate;
    private _handleErrorZS: ZoneSpec;

    private _scheduleTaskDlgt: ZoneDelegate;
    private _scheduleTaskZS: ZoneSpec;

    private _invokeTaskDlgt: ZoneDelegate;
    private _invokeTaskZS: ZoneSpec;

    private _cancelTaskDlgt: ZoneDelegate;
    private _cancelTaskZS: ZoneSpec;

    private _hasTaskDlgt: ZoneDelegate;
    private _hasTaskZS: ZoneSpec;

    constructor(zone: Zone, parentDelegate: ZoneDelegate, zoneSpec:ZoneSpec) {
      this.zone = zone;
      this._parentDelegate = parentDelegate;

      this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
      this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);

      this._interceptZS = zoneSpec && (zoneSpec.onIntercept ? zoneSpec : parentDelegate._interceptZS);
      this._interceptDlgt = zoneSpec && (zoneSpec.onIntercept ? parentDelegate : parentDelegate._interceptDlgt);

      this._invokeZS = zoneSpec && (zoneSpec.onInvoke ? zoneSpec : parentDelegate._invokeZS);
      this._invokeDlgt = zoneSpec && (zoneSpec.onInvoke ? parentDelegate : parentDelegate._invokeDlgt);

      this._handleErrorZS = zoneSpec && (zoneSpec.onHandleError ? zoneSpec : parentDelegate._handleErrorZS);
      this._handleErrorDlgt = zoneSpec && (zoneSpec.onHandleError ? parentDelegate : parentDelegate._handleErrorDlgt);

      this._scheduleTaskZS = zoneSpec && (zoneSpec.onScheduleTask ? zoneSpec : parentDelegate._scheduleTaskZS);
      this._scheduleTaskDlgt = zoneSpec && (zoneSpec.onScheduleTask ? parentDelegate : parentDelegate._scheduleTaskDlgt);

      this._invokeTaskZS = zoneSpec && (zoneSpec.onInvokeTask ? zoneSpec : parentDelegate._invokeTaskZS);
      this._invokeTaskDlgt = zoneSpec && (zoneSpec.onInvokeTask ? parentDelegate : parentDelegate._invokeTaskDlgt);

      this._cancelTaskZS = zoneSpec && (zoneSpec.onCancelTask ? zoneSpec : parentDelegate._cancelTaskZS);
      this._cancelTaskDlgt = zoneSpec && (zoneSpec.onCancelTask ? parentDelegate : parentDelegate._cancelTaskDlgt);

      this._hasTaskZS = zoneSpec && (zoneSpec.onHasTask ? zoneSpec : parentDelegate._hasTaskZS);
      this._hasTaskDlgt = zoneSpec && (zoneSpec.onHasTask ? parentDelegate : parentDelegate._hasTaskDlgt);
    }

    fork(targetZone: Zone, zoneSpec: ZoneSpec): AmbientZone {
      return this._forkZS
          ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec)
          : new Zone(targetZone, zoneSpec);
    }

    intercept(targetZone: Zone, callback: Function, source: string): Function {
      return this._interceptZS
          ? this._interceptZS.onIntercept(this._interceptDlgt, this.zone, targetZone, callback, source)
          : callback;
    }

    invoke(targetZone: Zone, callback: Function, applyThis: any, applyArgs: any[],
           source: string): any
    {
      return this._invokeZS
          ? this._invokeZS.onInvoke(this._invokeDlgt, this.zone, targetZone, callback, applyThis, applyArgs, source)
          : callback.apply(applyThis, applyArgs);
    }

    handleError(targetZone: Zone, error: any): boolean {
      return this._handleErrorZS
          ? this._handleErrorZS.onHandleError(this._handleErrorDlgt, this.zone, targetZone, error)
          : true;
    }

    scheduleTask(targetZone: Zone, task: Task): Task {
      try {
        if (this._scheduleTaskZS) {
          return this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt, this.zone, targetZone, task);
        } else if (task.scheduleFn) {
          task.scheduleFn(task)
        } else if (task.type == 'microTask') {
          scheduleMicroTask(<MicroTask>task);
        } else {
          throw new Error('Task is missing scheduleFn.');
        }
        return task;
      } finally {
        if (targetZone == this.zone) {
          this._updateTaskCount(task.type, 1);
        }
      }
    }

    invokeTask(targetZone: Zone, task: Task, applyThis: any, applyArgs: any): any {
      try {
        return this._invokeTaskZS
            ? this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt, this.zone, targetZone, task, applyThis, applyArgs)
            : task.callback.apply(applyThis, applyArgs);
      } finally {
        if (targetZone == this.zone && (task.type != 'eventTask') && !(task.data && task.data.isPeriodic)) {
          this._updateTaskCount(task.type, -1);
        }
      }
    }

    cancelTask(targetZone: Zone, task: Task): any {
      var value;
      if (this._cancelTaskZS) {
        value =  this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt, this.zone, targetZone, task);
      } else  if (!task.cancelFn) {
        throw new Error('Task does not support cancellation, or is already canceled.');
      } else {
        value = task.cancelFn(task)
      }
      if (targetZone == this.zone) {
        // this should not be in the finally block, because exceptions assume not canceled.
        this._updateTaskCount(task.type, -1);
      }
      return value;
    }

    hasTask(targetZone: Zone, isEmpty: HasTaskState) {
      return this._hasTaskZS && this._hasTaskZS.onHasTask(this._hasTaskDlgt, this.zone, targetZone,
          isEmpty);
    }

    private _updateTaskCount(type: TaskType, count: number) {
      var counts = this._taskCounts;
      var prev = counts[type];
      var next = counts[type] = prev + count;
      if (next < 0) {
        throw new Error('More tasks executed then were scheduled.');
      }
      if (prev == 0 || next == 0) {
        var isEmpty: HasTaskState = {
          microTask: counts.microTask > 0,
          macroTask: counts.macroTask > 0,
          eventTask: counts.eventTask > 0,
          change: type
        };
        try {
          this.hasTask(this.zone, isEmpty);
        } finally  {
          if (this._parentDelegate) {
            this._parentDelegate._updateTaskCount(type, count);
          }
        }
      }
    }
  }


  class ZoneTask implements Task {
    public type: TaskType;
    public source: string;
    public invoke: Function;
    public callback: Function;
    public data: TaskData;
    public scheduleFn: (task: Task) => void;
    public cancelFn: (task: Task) => void;
    public zone: Zone;

    constructor(type: TaskType, zone: Zone, source: string, callback: Function, options: TaskData,
                scheduleFn: (task: Task) => void, cancelFn:(task: Task) => void)
    {
      this.type = type;
      this.zone = zone;
      this.source = source;
      this.data = options;
      this.scheduleFn = scheduleFn;
      this.cancelFn = cancelFn;
      this.callback = callback;
      var self = this;
      this.invoke = function () {
        try {
          return zone.runTask(self, this, <any>arguments);
        } finally {
          drainMicroTaskQueue();
        }
      };
    }
  }

  interface UncaughtPromiseError extends Error {
    zone: AmbientZone;
    task: Task;
    promise: ZoneAwarePromise<any>;
    rejection: any;
  }

  function __symbol__(name: string) { return '__zone_symbol__' + name; };
  const symbolSetTimeout = __symbol__('setTimeout');
  const symbolPromise = __symbol__('Promise');
  const symbolThen = __symbol__('then');

  var _currentZone: Zone = new Zone(null, null);
  var _currentTask: Task = null;
  var _microTaskQueue: Task[] = [];
  var _isDrainingMicrotaskQueue: boolean = false;
  var _uncaughtPromiseErrors: UncaughtPromiseError[] = [];
  var _drainScheduled: boolean = false;

  function scheduleQueueDrain() {
    if (!_drainScheduled && !_currentTask && _microTaskQueue.length == 0) {
      // We are not running in Task, so we need to kickstart the microtask queue.
      if (global[symbolPromise]) {
        global[symbolPromise].resolve(0)[symbolThen](drainMicroTaskQueue);
      } else {
        global[symbolSetTimeout](drainMicroTaskQueue, 0);
      }
    }
  }

  function scheduleMicroTask(task: MicroTask) {
    scheduleQueueDrain();
    _microTaskQueue.push(task);
  }

  function consoleError(e:any) {
    var rejection = e && e.rejection;
    if (rejection) {
      console.error(
          'Unhandled Promise rejection:', rejection instanceof Error ? rejection.message : rejection,
          '; Zone:', (<Zone>e.zone).name,
          '; Task:', e.task && (<Task>e.task).source,
          '; Value:', rejection
      );
    }
    console.error(e);
  }

  function drainMicroTaskQueue() {
    if (!_isDrainingMicrotaskQueue) {
      _isDrainingMicrotaskQueue = true;
      while(_microTaskQueue.length) {
        var queue = _microTaskQueue;
        _microTaskQueue = [];
        for (var i = 0; i < queue.length; i++) {
          var task = queue[i];
          try {
            task.zone.runTask(task, null, null);
          } catch (e) {
            consoleError(e);
          }
        }
      }
      while(_uncaughtPromiseErrors.length) {
        var uncaughtPromiseErrors = _uncaughtPromiseErrors;
        _uncaughtPromiseErrors = [];
        for (var i = 0; i < uncaughtPromiseErrors.length; i++) {
          var uncaughtPromiseError: UncaughtPromiseError = uncaughtPromiseErrors[i];
          try {
            uncaughtPromiseError.zone.runGuarded(() => { throw uncaughtPromiseError; });
          } catch (e) {
            consoleError(e);
          }
        }
      }
      _isDrainingMicrotaskQueue = false;
      _drainScheduled = false;
    }
  }


  function isThenable(value: any): boolean {
    return value && value.then;
  }

  function forwardResolution(value: any): any { return value; }

  function forwardRejection(rejection: any): any { return ZoneAwarePromise.reject(rejection); }

  const symbolState: string = __symbol__('state');
  const symbolValue: string = __symbol__('value');
  const source: string = 'Promise.then';
  const UNRESOLVED = null;
  const RESOLVED = true;
  const REJECTED = false;
  const REJECTED_NO_CATCH = 0;

  function makeResolver(promise: ZoneAwarePromise<any>, state: boolean): (value: any) => void {
    return (v) => {
      resolvePromise(promise, state, v);
      // Do not return value or you will break the Promise spec.
    }
  }

  function resolvePromise(promise: ZoneAwarePromise<any>, state: boolean, value: any): ZoneAwarePromise<any> {
    if (promise[symbolState] === UNRESOLVED) {
      if (value instanceof ZoneAwarePromise && value[symbolState] !== UNRESOLVED) {
        clearRejectedNoCatch(<Promise<any>>value);
        resolvePromise(promise, value[symbolState], value[symbolValue]);
      } else if (isThenable(value)) {
        value.then(makeResolver(promise, state), makeResolver(promise, false));
      } else {
        promise[symbolState] = state;
        var queue = promise[symbolValue];
        promise[symbolValue] = value;

        for (var i = 0; i < queue.length;) {
          scheduleResolveOrReject(promise, queue[i++], queue[i++], queue[i++], queue[i++]);
        }
        if (queue.length == 0 && state == REJECTED) {
          promise[symbolState] = REJECTED_NO_CATCH;
          try {
            throw new Error("Uncaught (in promise): " +  value);
          } catch (e) {
            var error: UncaughtPromiseError = e;
            error.rejection = value;
            error.promise = promise;
            error.zone = Zone.current;
            error.task = Zone.currentTask;
            _uncaughtPromiseErrors.push(error);
            scheduleQueueDrain();
          }
        }
      }
    }
    // Resolving an already resolved promise is a noop.
    return promise;
  }

  function clearRejectedNoCatch(promise: ZoneAwarePromise<any>): void {
    if (promise[symbolState] === REJECTED_NO_CATCH) {
      promise[symbolState] = REJECTED;
      for (var i = 0; i < _uncaughtPromiseErrors.length; i++) {
        if (promise === _uncaughtPromiseErrors[i].promise) {
          _uncaughtPromiseErrors.splice(i, 1);
          break;
        }
      }
    }
  }


  function scheduleResolveOrReject<R, U>(promise: ZoneAwarePromise<any>,
                                         zone: AmbientZone,
                                         chainPromise: ZoneAwarePromise<any>,
                                         onFulfilled?: (value: R) => U,
                                         onRejected?: (error: any) => U): void
  {
    clearRejectedNoCatch(promise);
    var delegate = promise[symbolState] ? onFulfilled || forwardResolution: onRejected || forwardRejection;
    zone.scheduleMicroTask(source, () => {
      try {
        resolvePromise(chainPromise, true, zone.run(delegate, null, [promise[symbolValue]]));
      } catch (error) {
        resolvePromise(chainPromise, false, error);
      }
    });
  }

  class ZoneAwarePromise<R> implements Promise<R> {
    static resolve<R>(value:R): Promise<R> {
      return resolvePromise(<ZoneAwarePromise<R>>new this(null), RESOLVED, value);
    }

    static reject<U>(error:U): Promise<U> {
      return resolvePromise(<ZoneAwarePromise<U>>new this(null), REJECTED, error);
    }

    static race<R>(values: Thenable<any>[]): Promise<R> {
      var resolve: (v: any) => void;
      var reject: (v: any) => void;
      var promise: any = new this((res, rej) => {resolve = res; reject = rej});
      function onResolve(value) { promise && (promise = null || resolve(value)) }
      function onReject(error) { promise && (promise = null || reject(error)) }

      for(var value of values) {
        if (!isThenable(value)) {
          value = this.resolve(value);
        }
        value.then(onResolve, onReject);
      }
      return promise;
    }

    static all<R>(values): Promise<R> {
      var resolve: (v: any) => void;
      var reject: (v: any) => void;
      var promise = new this((res, rej) => {resolve = res; reject = rej;});
      var resolvedValues = [];
      var count = 0;
      function onReject(error) { promise && reject(error); promise = null; }

      for(var value of values) {
        if (!isThenable(value)) {
          value = this.resolve(value);
        }
        value.then(((index) => (value) => {
          resolvedValues[index] = value;
          count--;
          if (promise && !count) {
            resolve(resolvedValues);
          }
          promise == null;
        })(count), onReject);
        count++;
      }
      if (!count) resolve(resolvedValues);
      return promise;
    }

    constructor(executor: (resolve : (value?: R | Thenable<R>) => void,
                           reject: (error?: any) => void) => void) {
      var promise: ZoneAwarePromise<R> = this;
      promise[symbolState] = UNRESOLVED;
      promise[symbolValue] = []; // queue;
      try {
        executor && executor(makeResolver(promise, RESOLVED), makeResolver(promise, REJECTED));
      } catch (e) {
        resolvePromise(promise, false, e);
      }
    }

    then<R, U>(onFulfilled?: (value: R) => U | Thenable<U>,
               onRejected?: (error: any) => U | Thenable<U>): Promise<R>
    {
      var chainPromise: Promise<R> = new ZoneAwarePromise(null);
      var zone = Zone.current;
      if (this[symbolState] == UNRESOLVED ) {
        (<any[]>this[symbolValue]).push(zone, chainPromise, onFulfilled, onRejected);
      } else {
        scheduleResolveOrReject(this, zone, chainPromise, onFulfilled, onRejected);
      }
      return chainPromise;
    }

    catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<R> {
      return this.then(null, onRejected);
    }
  }

  var NativePromise = global[__symbol__('Promise')] = global.Promise;
  global.Promise = ZoneAwarePromise;
  if (NativePromise) {
    var NativePromiseProtototype = NativePromise.prototype;
    var NativePromiseThen = NativePromiseProtototype[__symbol__('then')]
        = NativePromiseProtototype.then;
    NativePromiseProtototype.then = function(onResolve, onReject) {
      var nativePromise = this;
      return new ZoneAwarePromise((resolve, reject) => {
        NativePromiseThen.call(nativePromise, resolve, reject);
      }).then(onResolve, onReject);
    }
  }

  return global.Zone = Zone;
})(typeof window == 'undefined' ? global : window);
