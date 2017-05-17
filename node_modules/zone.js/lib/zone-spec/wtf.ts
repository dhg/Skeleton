(function(global) {
  interface Wtf { trace: WtfTrace; }
  interface WtfScope {};
  interface WtfRange {};
  interface WtfTrace {
    events: WtfEvents;
    leaveScope(scope: WtfScope, returnValue?: any): void;
    beginTimeRange(rangeType: string, action: string): WtfRange;
    endTimeRange(range: WtfRange): void;
  }
  interface WtfEvents {
    createScope(signature: string, flags?: any): WtfScopeFn;
    createInstance(signature: string, flags?: any): WtfEventFn;
  }

  type WtfScopeFn = (...args) => WtfScope;
  type WtfEventFn = (...args) => any;

  // Detect and setup WTF.
  var wtfTrace: WtfTrace = null;
  var wtfEvents: WtfEvents = null;
  var wtfEnabled: boolean = (function (): boolean {
    var wtf: Wtf = global['wtf'];
    if (wtf) {
      wtfTrace = wtf.trace;
      if (wtfTrace) {
        wtfEvents = wtfTrace.events;
        return true;
      }
    }
    return false;
  })();

  class WtfZoneSpec implements ZoneSpec {
    name: string = 'WTF';

    static forkInstance = wtfEnabled && wtfEvents.createInstance('Zone:fork(ascii zone, ascii newZone)');
    static scheduleInstance: {[key: string]: WtfEventFn} = {};
    static cancelInstance: {[key: string]: WtfEventFn} = {};
    static invokeScope: {[key: string]: WtfEventFn} = {};
    static invokeTaskScope: {[key: string]: WtfEventFn} = {};

    onFork(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
           zoneSpec: ZoneSpec): Zone {
      var retValue = parentZoneDelegate.fork(targetZone, zoneSpec);
      WtfZoneSpec.forkInstance(zonePathName(targetZone), retValue.name);
      return retValue;
    }

    onInvoke(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
             delegate: Function, applyThis: any, applyArgs: any[], source: string): any {
      var scope = WtfZoneSpec.invokeScope[source];
      if (!scope) {
        scope = WtfZoneSpec.invokeScope[source]
            = wtfEvents.createScope(`Zone:invoke:${source}(ascii zone)`);
      }
      return wtfTrace.leaveScope(scope(zonePathName(targetZone)),
          parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source));
    }


    onHandleError(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                  error: any): boolean {
      return parentZoneDelegate.handleError(targetZone, error);
    }

    onScheduleTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                   task: Task): any {
      var key = task.type + ':' + task.source;
      var instance = WtfZoneSpec.scheduleInstance[key];
      if (!instance) {
        instance = WtfZoneSpec.scheduleInstance[key]
            = wtfEvents.createInstance(`Zone:schedule:${key}(ascii zone, any data)`);
      }
      var retValue = parentZoneDelegate.scheduleTask(targetZone, task);
      instance(zonePathName(targetZone), shallowObj(task.data, 2));
      return retValue;
    }


    onInvokeTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                 task: Task, applyThis: any, applyArgs: any[]): any
    {
      var source = task.source;
      var scope = WtfZoneSpec.invokeTaskScope[source];
      if (!scope) {
        scope = WtfZoneSpec.invokeTaskScope[source]
            = wtfEvents.createScope(`Zone:invokeTask:${source}(ascii zone)`);
      }
      return wtfTrace.leaveScope(scope(zonePathName(targetZone)),
          parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs));
    }

    onCancelTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                 task: Task): any {
      var key = task.source;
      var instance = WtfZoneSpec.cancelInstance[key];
      if (!instance) {
        instance = WtfZoneSpec.cancelInstance[key]
            = wtfEvents.createInstance(`Zone:cancel:${key}(ascii zone, any options)`);
      }
      var retValue = parentZoneDelegate.cancelTask(targetZone, task);
      instance(zonePathName(targetZone), shallowObj(task.data, 2));
      return retValue;
    };
  }

  function shallowObj(obj: any, depth: number): any {
    if (!depth) return null;
    var out = {};
    for(var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        switch (typeof value) {
          case 'object':
            var name = value && value.constructor && (<any>value.constructor).name;
            value = name == (<any>Object).name ? shallowObj(value, depth - 1) : name;
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

  function zonePathName(zone: Zone) {
    var name: string = zone.name;
    zone = zone.parent;
    while(zone != null) {
      name = zone.name + '::' + name;
      zone = zone.parent;
    }
    return name;
  }

  Zone['wtfZoneSpec'] = !wtfEnabled ? null : new WtfZoneSpec();
})(typeof window == 'undefined' ? global : window);
