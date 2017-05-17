import '../zone';
import {eventTargetPatch} from './event-target';
import {propertyPatch} from './define-property';
import {registerElementPatch} from './register-element';
import {propertyDescriptorPatch} from './property-descriptor';
import {patchMethod, patchPrototype, patchClass} from "./utils";

const set = 'set';
const clear = 'clear';
const blockingMethods = ['alert', 'prompt', 'confirm'];
const _global = typeof window == 'undefined' ? global : window;

patchTimer(_global, set, clear, 'Timeout');
patchTimer(_global, set, clear, 'Interval');
patchTimer(_global, set, clear, 'Immediate');
patchTimer(_global, 'request', 'cancelMacroTask', 'AnimationFrame');
patchTimer(_global, 'mozRequest', 'mozCancel', 'AnimationFrame');
patchTimer(_global, 'webkitRequest', 'webkitCancel', 'AnimationFrame')

for (var i = 0; i < blockingMethods.length; i++) {
  var name = blockingMethods[i];
  patchMethod(_global, name, (delegate, symbol, name) => {
    return function (s:any, args: any[]) {
      return Zone.current.run(delegate, _global, args, name)
    }
  });
}

eventTargetPatch(_global);
propertyDescriptorPatch(_global);
patchClass('MutationObserver');
patchClass('WebKitMutationObserver');
patchClass('FileReader');
propertyPatch();
registerElementPatch(_global);

/// GEO_LOCATION
if (_global['navigator'] && _global['navigator'].geolocation) {
  patchPrototype(_global['navigator'].geolocation, [
    'getCurrentPosition',
    'watchPosition'
  ]);
}

interface TimerOptions extends TaskData {
  handleId: number,
  args: any[]
}

function patchTimer(
    window: any,
    setName: string,
    cancelName: string,
    nameSuffix: string)
{
  setName += nameSuffix;
  cancelName += nameSuffix;

  function scheduleTask(task: Task) {
    var data = <TimerOptions>task.data;
    data.args[0] = task.invoke;
    data.handleId = setNative.apply(window, data.args);
    return task;
  }

  function clearTask(task: Task) {
    return clearNative((<TimerOptions>task.data).handleId);
  }

  var setNative = patchMethod(window, setName, (delegate: Function) => function(self: any, args: any[]) {
    if (typeof args[0] === 'function') {
      var zone = Zone.current;
      var options:TimerOptions = {
        handleId: null,
        isPeriodic: nameSuffix == 'Interval',
        delay: (nameSuffix == 'Timeout' || nameSuffix == 'Interval') ? args[1] || 0 : null,
        args: args
      };
      return zone.scheduleMacroTask(setName, args[0], options, scheduleTask, clearTask);
    } else {
      // cause an error by calling it directly.
      return delegate.apply(window, args);
    }
  });

  var clearNative = patchMethod(window, cancelName, (delegate: Function) => function(self: any, args: any[]) {
    var task: Task = args[0];
    if (task && typeof task.type == 'string') {
      if (task.cancelFn) {
        // Do not cancel already canceled functions
        task.zone.cancelTask(task);
      }
    } else {
      // cause an error by calling it directly.
      delegate.apply(window, args);
    }
  });
}

