/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
;(function(){
// modjewel.js
(function(){
var PROGRAM = "modjewel"
var VERSION = "2.0.0"
var global  = this
if (global.modjewel) {
log("modjewel global variable already defined")
return
}
global.modjewel = null
var ModuleStore
var ModulePreloadStore
var MainModule
var WarnOnRecursiveRequire = false
function get_require(currentModule) {
var result = function require(moduleId) {
if (moduleId.match(/^\.{1,2}\//)) {
moduleId = normalize(currentModule, moduleId)
}
if (hop(ModuleStore, moduleId)) {
var module = ModuleStore[moduleId]
if (module.__isLoading) {
if (WarnOnRecursiveRequire) {
var fromModule = currentModule ? currentModule.id : "<root>"
console.log("module '" + moduleId + "' recursively require()d from '" + fromModule + "', problem?")
}
}
currentModule.moduleIdsRequired.push(moduleId)
return module.exports
}
if (!hop(ModulePreloadStore, moduleId)) {
var fromModule = currentModule ? currentModule.id : "<root>"
error("module '" + moduleId + "' not found from '" + fromModule + "', must be define()'d first")
}
var factory = ModulePreloadStore[moduleId][0]
var prereqs = ModulePreloadStore[moduleId][1]
var module = create_module(moduleId)
var newRequire = get_require(module)
ModuleStore[moduleId] = module
module.__isLoading = true
try {
currentModule.moduleIdsRequired.push(moduleId)
var prereqModules = []
for (var i=0; i<prereqs.length; i++) {
var prereqId = prereqs[i]
var prereqModule
if      (prereqId == "require") prereqModule = newRequire
else if (prereqId == "exports") prereqModule = module.exports
else if (prereqId == "module")  prereqModule = module
else                            prereqModule = newRequire(prereqId)
prereqModules.push(prereqModule)
}
if (typeof factory == "function") {
var result = factory.apply(null, prereqModules)
if (result) {
module.exports = result
}
}
else {
module.exports = factory
}
}
finally {
module.__isLoading = false
}
return module.exports
}
result.define         = require_define
result.implementation = PROGRAM
result.version        = VERSION
return result
}
function hop(object, name) {
return Object.prototype.hasOwnProperty.call(object, name)
}
function create_module(id) {
return {
id:                id,
uri:               id,
exports:           {},
prereqIds:         [],
moduleIdsRequired: []
}
}
function require_reset() {
ModuleStore        = {}
ModulePreloadStore = {}
MainModule         = create_module(null)
var require = get_require(MainModule)
var define  = require_define
define("modjewel", modjewel_module)
global.modjewel            = require("modjewel")
global.modjewel.require    = require
global.modjewel.define     = define
global.modjewel.define.amd = {implementation: PROGRAM, version: VERSION}
}
function require_define(moduleId, prereqs, factory) {
var rem = ["require", "exports", "module"]
if (typeof moduleId != "string") {
console.log("modjewel.define(): first parameter must be a string; was: " + moduleId)
return
}
if (arguments.length == 2) {
factory = prereqs
prereqs = null
}
if (!prereqs || prereqs.length == 0) {
prereqs = rem
}
if (typeof factory != "function") {
if (factory) {
ModulePreloadStore[moduleId] = [factory, prereqs]
return
}
console.log("modjewel.define(): factory was falsy: " + factory)
return
}
if (moduleId.match(/^\./)) {
console.log("modjewel.define(): moduleId must not start with '.': '" + moduleName + "'")
return
}
if (hop(ModulePreloadStore, moduleId)) {
console.log("modjewel.define(): module '" + moduleId + "' has already been defined")
return
}
ModulePreloadStore[moduleId] = [factory, prereqs]
}
function getModulePath(module) {
if (!module || !module.id) return ""
var parts = module.id.split("/")
return parts.slice(0, parts.length-1).join("/")
}
function normalize(module, file) {
var modulePath = getModulePath(module)
var dirParts   = ("" == modulePath) ? [] : modulePath.split("/")
var fileParts  = file.split("/")
for (var i=0; i<fileParts.length; i++) {
var filePart = fileParts[i]
if (filePart == ".") {
}
else if (filePart == "..") {
if (dirParts.length > 0) {
dirParts.pop()
}
else {
}
}
else {
dirParts.push(filePart)
}
}
return dirParts.join("/")
}
function error(message) {
throw new Error(PROGRAM + ": " + message)
}
function modjewel_getLoadedModuleIds() {
var result = []
for (moduleId in ModuleStore) {
result.push(moduleId)
}
return result
}
function modjewel_getPreloadedModuleIds() {
var result = []
for (moduleId in ModulePreloadStore) {
result.push(moduleId)
}
return result
}
function modjewel_getModule(moduleId) {
if (null == moduleId) return MainModule
return ModuleStore[moduleId]
}
function modjewel_getModuleIdsRequired(moduleId) {
var module = modjewel_getModule(moduleId)
if (null == module) return null
return module.moduleIdsRequired.slice()
}
function modjewel_warnOnRecursiveRequire(value) {
if (arguments.length == 0) return WarnOnRecursiveRequire
WarnOnRecursiveRequire = !!value
}
function modjewel_module(require, exports, module) {
exports.VERSION                = VERSION
exports.require                = null 
exports.define                 = null 
exports.getLoadedModuleIds     = modjewel_getLoadedModuleIds
exports.getPreloadedModuleIds  = modjewel_getPreloadedModuleIds
exports.getModule              = modjewel_getModule
exports.getModuleIdsRequired   = modjewel_getModuleIdsRequired
exports.warnOnRecursiveRequire = modjewel_warnOnRecursiveRequire
}
function log(message) {
console.log("modjewel: " + message)
}
require_reset()
})();

;
modjewel.require('modjewel').warnOnRecursiveRequire(true);

// weinre/common/Binding.amd.js
;modjewel.define("weinre/common/Binding", function(require, exports, module) { 
var Binding, Ex;
Ex = require('./Ex');
module.exports = Binding = (function() {
function Binding(receiver, method) {
if (!receiver) {
throw new Ex(arguments, "receiver argument for Binding constructor was null");
}
if (typeof method === "string") {
method = receiver[method];
}
if (typeof method === !"function") {
throw new Ex(arguments, "method argument didn't specify a function");
}
return function() {
return method.apply(receiver, [].slice.call(arguments));
};
}
return Binding;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/Callback.amd.js
;modjewel.define("weinre/common/Callback", function(require, exports, module) { 
var Callback, CallbackIndex, CallbackTable, ConnectorChannel, Ex;
Ex = require('./Ex');
CallbackTable = {};
CallbackIndex = 1;
ConnectorChannel = "???";
module.exports = Callback = (function() {
function Callback() {
throw new Ex(arguments, "this class is not intended to be instantiated");
}
Callback.setConnectorChannel = function(connectorChannel) {
return ConnectorChannel = "" + connectorChannel;
};
Callback.register = function(callback) {
var data, func, index, receiver;
if (typeof callback === "function") {
callback = [null, callback];
}
if (typeof callback.slice !== "function") {
throw new Ex(arguments, "callback must be an array or function");
}
receiver = callback[0];
func = callback[1];
data = callback.slice(2);
if (typeof func === "string") {
func = receiver[func];
}
if (typeof func !== "function") {
throw new Ex(arguments, "callback function was null or not found");
}
index = ConnectorChannel + "::" + CallbackIndex;
CallbackIndex++;
if (CallbackIndex >= 65536 * 65536) {
CallbackIndex = 1;
}
CallbackTable[index] = [receiver, func, data];
return index;
};
Callback.deregister = function(index) {
return delete CallbackTable[index];
};
Callback.invoke = function(index, args) {
var callback, e, func, funcName, receiver;
callback = CallbackTable[index];
if (!callback) {
throw new Ex(arguments, "callback " + index + " not registered or already invoked");
}
receiver = callback[0];
func = callback[1];
args = callback[2].concat(args);
try {
return func.apply(receiver, args);
} catch (_error) {
e = _error;
funcName = func.name || func.signature;
if (!funcName) {
funcName = "<unnamed>";
}
return require("./Weinre").logError(arguments.callee.signature + (" exception invoking callback: " + funcName + "(" + (args.join(',')) + "): ") + e);
} finally {
Callback.deregister(index);
}
};
return Callback;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/Debug.amd.js
;modjewel.define("weinre/common/Debug", function(require, exports, module) { 
var Debug;
module.exports = new (Debug = (function() {
function Debug() {
this._printCalledArgs = {};
}
Debug.prototype.log = function(message) {
var console;
console = window.console.__original || window.console;
return console.log("" + (this.timeStamp()) + ": " + message);
};
Debug.prototype.logCall = function(context, intf, method, args, message) {
var printArgs, signature;
if (message) {
message = ": " + message;
} else {
message = "";
}
signature = this.signature(intf, method);
printArgs = this._printCalledArgs[signature];
if (printArgs) {
args = JSON.stringify(args, null, 4);
} else {
args = "";
}
return this.log("" + context + " " + signature + "(" + args + ")" + message);
};
Debug.prototype.logCallArgs = function(intf, method) {
return this._printCalledArgs[this.signature(intf, method)] = true;
};
Debug.prototype.signature = function(intf, method) {
return "" + intf + "." + method;
};
Debug.prototype.timeStamp = function() {
var date, mins, secs;
date = new Date();
mins = "" + (date.getMinutes());
secs = "" + (date.getSeconds());
if (mins.length === 1) {
mins = "0" + mins;
}
if (secs.length === 1) {
secs = "0" + secs;
}
return "" + mins + ":" + secs;
};
return Debug;
})());
});

;
// weinre/common/EventListeners.amd.js
;modjewel.define("weinre/common/EventListeners", function(require, exports, module) { 
var EventListeners, Ex, Weinre;
Ex = require('./Ex');
Weinre = require('./Weinre');
module.exports = EventListeners = (function() {
function EventListeners() {
this.listeners = [];
}
EventListeners.prototype.add = function(listener, useCapture) {
return this.listeners.push([listener, useCapture]);
};
EventListeners.prototype.remove = function(listener, useCapture) {
var listeners, _i, _len, _listener;
listeners = this.listeners.slice();
for (_i = 0, _len = listeners.length; _i < _len; _i++) {
_listener = listeners[_i];
if (_listener[0] !== listener) {
continue;
}
if (_listener[1] !== useCapture) {
continue;
}
this._listeners.splice(i, 1);
return;
}
};
EventListeners.prototype.fire = function(event) {
var e, listener, listeners, _i, _len, _results;
listeners = this.listeners.slice();
_results = [];
for (_i = 0, _len = listeners.length; _i < _len; _i++) {
listener = listeners[_i];
listener = listener[0];
if (typeof listener === "function") {
try {
listener.call(null, event);
} catch (_error) {
e = _error;
Weinre.logError("" + arguments.callee.name + " invocation exception: " + e);
}
continue;
}
if (typeof (listener != null ? listener.handleEvent : void 0) !== "function") {
throw new Ex(arguments, "listener does not implement the handleEvent() method");
}
try {
_results.push(listener.handleEvent.call(listener, event));
} catch (_error) {
e = _error;
_results.push(Weinre.logError("" + arguments.callee.name + " invocation exception: " + e));
}
}
return _results;
};
return EventListeners;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/Ex.amd.js
;modjewel.define("weinre/common/Ex", function(require, exports, module) { 
var Ex, StackTrace, prefix;
StackTrace = require('./StackTrace');
module.exports = Ex = (function() {
Ex.catching = function(func) {
var e;
try {
return func.call(this);
} catch (_error) {
e = _error;
console.log("runtime error: " + e);
return StackTrace.dump(arguments);
}
};
function Ex(args, message) {
if (!args || !args.callee) {
throw Ex(arguments, "first parameter must be an Arguments object");
}
StackTrace.dump(args);
if (message instanceof Error) {
message = "threw error: " + message;
}
message = prefix(args, message);
message;
}
return Ex;
})();
prefix = function(args, string) {
if (args.callee.signature) {
return args.callee.signature + ": " + string;
}
if (args.callee.displayName) {
return args.callee.displayName + ": " + string;
}
if (args.callee.name) {
return args.callee.name + ": " + string;
}
return "<anonymous>" + ": " + string;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/HookLib.amd.js
;modjewel.define("weinre/common/HookLib", function(require, exports, module) { 
var HookLib, HookSite, HookSites, IgnoreHooks, callAfterHooks, callBeforeHooks, callExceptHooks, getHookSite, getHookedFunction;
HookLib = exports;
HookSites = [];
IgnoreHooks = 0;
module.exports = HookLib = (function() {
function HookLib() {}
HookLib.addHookSite = function(object, property) {
return getHookSite(object, property, true);
};
HookLib.getHookSite = function(object, property) {
return getHookSite(object, property, false);
};
HookLib.ignoreHooks = function(func) {
var result;
try {
IgnoreHooks++;
result = func.call();
} finally {
IgnoreHooks--;
}
return result;
};
return HookLib;
})();
getHookSite = function(object, property, addIfNotFound) {
var hookSite, i, _i, _len;
i = 0;
for (_i = 0, _len = HookSites.length; _i < _len; _i++) {
hookSite = HookSites[_i];
if (hookSite.object !== object) {
continue;
}
if (hookSite.property !== property) {
continue;
}
return hookSite;
}
if (!addIfNotFound) {
return null;
}
hookSite = new HookSite(object, property);
HookSites.push(hookSite);
return hookSite;
};
HookSite = (function() {
function HookSite(object, property) {
var hookedFunction;
this.object = object;
this.property = property;
this.target = object[property];
this.hookss = [];
if (typeof this.target === 'undefined') {
return;
} else {
hookedFunction = getHookedFunction(this.target, this);
if (!(navigator.userAgent.match(/MSIE/i) && (object === localStorage || object === sessionStorage))) {
object[property] = hookedFunction;
}
}
}
HookSite.prototype.addHooks = function(hooks) {
return this.hookss.push(hooks);
};
HookSite.prototype.removeHooks = function(hooks) {
var i, _i, _ref;
for (i = _i = 0, _ref = this.hookss.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
if (this.hookss[i] === hooks) {
this.hookss.splice(i, 1);
return;
}
}
};
return HookSite;
})();
getHookedFunction = function(func, hookSite) {
var hookedFunction;
hookedFunction = function() {
var e, result;
callBeforeHooks(hookSite, this, arguments);
try {
result = func.apply(this, arguments);
} catch (_error) {
e = _error;
callExceptHooks(hookSite, this, arguments, e);
throw e;
} finally {
callAfterHooks(hookSite, this, arguments, result);
}
return result;
};
hookedFunction.displayName = func.displayName || func.name;
return hookedFunction;
};
callBeforeHooks = function(hookSite, receiver, args) {
var hooks, _i, _len, _ref, _results;
if (IgnoreHooks > 0) {
return;
}
_ref = hookSite.hookss;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
hooks = _ref[_i];
if (hooks.before) {
_results.push(hooks.before.call(hooks, receiver, args));
} else {
_results.push(void 0);
}
}
return _results;
};
callAfterHooks = function(hookSite, receiver, args, result) {
var hooks, _i, _len, _ref, _results;
if (IgnoreHooks > 0) {
return;
}
_ref = hookSite.hookss;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
hooks = _ref[_i];
if (hooks.after) {
_results.push(hooks.after.call(hooks, receiver, args, result));
} else {
_results.push(void 0);
}
}
return _results;
};
callExceptHooks = function(hookSite, receiver, args, e) {
var hooks, _i, _len, _ref, _results;
if (IgnoreHooks > 0) {
return;
}
_ref = hookSite.hookss;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
hooks = _ref[_i];
if (hooks.except) {
_results.push(hooks.except.call(hooks, receiver, args, e));
} else {
_results.push(void 0);
}
}
return _results;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/IDGenerator.amd.js
;modjewel.define("weinre/common/IDGenerator", function(require, exports, module) { 
var IDGenerator, idName, nextId, nextIdValue;
nextIdValue = 1;
idName = "__weinre__id";
module.exports = IDGenerator = (function() {
function IDGenerator() {}
IDGenerator.checkId = function(object) {
return object[idName];
};
IDGenerator.getId = function(object, map) {
var id;
id = IDGenerator.checkId(object);
if (!id) {
id = nextId();
object[idName] = id;
}
if (map) {
map[id] = object;
}
return id;
};
IDGenerator.next = function() {
return nextId();
};
return IDGenerator;
})();
nextId = function() {
var result;
result = nextIdValue;
nextIdValue += 1;
return result;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/IDLTools.amd.js
;modjewel.define("weinre/common/IDLTools", function(require, exports, module) { 
var Callback, Ex, IDLTools, IDLs, getProxyMethod;
Ex = require('./Ex');
Callback = require('./Callback');
IDLs = {};
module.exports = IDLTools = (function() {
function IDLTools() {
throw new Ex(arguments, "this class is not intended to be instantiated");
}
IDLTools.addIDLs = function(idls) {
var idl, intf, _i, _len, _results;
_results = [];
for (_i = 0, _len = idls.length; _i < _len; _i++) {
idl = idls[_i];
_results.push((function() {
var _j, _len1, _ref, _results1;
_ref = idl.interfaces;
_results1 = [];
for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
intf = _ref[_j];
IDLs[intf.name] = intf;
_results1.push(intf.module = idl.name);
}
return _results1;
})());
}
return _results;
};
IDLTools.getIDL = function(name) {
return IDLs[name];
};
IDLTools.getIDLsMatching = function(regex) {
var intf, intfName, results;
results = [];
for (intfName in IDLs) {
intf = IDLs[intfName];
if (intfName.match(regex)) {
results.push(intf);
}
}
return results;
};
IDLTools.validateAgainstIDL = function(klass, interfaceName) {
var classMethod, error, errors, intf, intfMethod, messagePrefix, printName, propertyName, _i, _j, _len, _len1, _ref, _results;
intf = IDLTools.getIDL(interfaceName);
messagePrefix = "IDL validation for " + interfaceName + ": ";
if (null === intf) {
throw new Ex(arguments, messagePrefix + ("idl not found: '" + interfaceName + "'"));
}
errors = [];
_ref = intf.methods;
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
intfMethod = _ref[_i];
classMethod = klass.prototype[intfMethod.name];
printName = klass.name + "::" + intfMethod.name;
if (null === classMethod) {
errors.push(messagePrefix + ("method not implemented: '" + printName + "'"));
continue;
}
if (classMethod.length !== intfMethod.parameters.length) {
if (classMethod.length !== intfMethod.parameters.length + 1) {
errors.push(messagePrefix + ("wrong number of parameters: '" + printName + "'"));
continue;
}
}
}
for (propertyName in klass.prototype) {
if (klass.prototype.hasOwnProperty(propertyName)) {
continue;
}
if (propertyName.match(/^_.*/)) {
continue;
}
printName = klass.name + "::" + propertyName;
if (!intf.methods[propertyName]) {
errors.push(messagePrefix + ("method should not be implemented: '" + printName + "'"));
continue;
}
}
if (!errors.length) {
return;
}
_results = [];
for (_j = 0, _len1 = errors.length; _j < _len1; _j++) {
error = errors[_j];
_results.push(require("./Weinre").logError(error));
}
return _results;
};
IDLTools.buildProxyForIDL = function(proxyObject, interfaceName) {
var intf, intfMethod, messagePrefix, _i, _len, _ref, _results;
intf = IDLTools.getIDL(interfaceName);
messagePrefix = "building proxy for IDL " + interfaceName + ": ";
if (null === intf) {
throw new Ex(arguments, messagePrefix + ("idl not found: '" + interfaceName + "'"));
}
_ref = intf.methods;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
intfMethod = _ref[_i];
_results.push(proxyObject[intfMethod.name] = getProxyMethod(intf, intfMethod));
}
return _results;
};
return IDLTools;
})();
getProxyMethod = function(intf, method) {
var proxyMethod, result;
result = proxyMethod = function() {
var args, callbackId;
callbackId = null;
args = [].slice.call(arguments);
if (args.length > 0) {
if (typeof args[args.length - 1] === "function") {
callbackId = Callback.register(args[args.length - 1]);
args = args.slice(0, args.length - 1);
}
}
while (args.length < method.parameters.length) {
args.push(null);
}
args.push(callbackId);
return this.__invoke(intf.name, method.name, args);
};
result.displayName = intf.name + "__" + method.name;
return result;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/MessageDispatcher.amd.js
;modjewel.define("weinre/common/MessageDispatcher", function(require, exports, module) { 
var Binding, Callback, Ex, IDLTools, InspectorBackend, MessageDispatcher, Verbose, WebSocketXhr, Weinre,
__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
Weinre = require('./Weinre');
WebSocketXhr = require('./WebSocketXhr');
IDLTools = require('./IDLTools');
Binding = require('./Binding');
Ex = require('./Ex');
Callback = require('./Callback');
Verbose = false;
InspectorBackend = null;
module.exports = MessageDispatcher = (function() {
function MessageDispatcher(url, id) {
if (!id) {
id = "anonymous";
}
this._url = url;
this._id = id;
this.error = null;
this._opening = false;
this._opened = false;
this._closed = false;
this._interfaces = {};
this._open();
}
MessageDispatcher.setInspectorBackend = function(inspectorBackend) {
return InspectorBackend = inspectorBackend;
};
MessageDispatcher.verbose = function(value) {
if (arguments.length >= 1) {
Verbose = !!value;
}
return Verbose;
};
MessageDispatcher.prototype._open = function() {
if (this._opened || this._opening) {
return;
}
if (this._closed) {
throw new Ex(arguments, "socket has already been closed");
}
this._opening = true;
this._socket = new WebSocketXhr(this._url, this._id);
this._socket.addEventListener("open", Binding(this, "_handleOpen"));
this._socket.addEventListener("error", Binding(this, "_handleError"));
this._socket.addEventListener("message", Binding(this, "_handleMessage"));
return this._socket.addEventListener("close", Binding(this, "_handleClose"));
};
MessageDispatcher.prototype.close = function() {
if (this._closed) {
return;
}
this._opened = false;
this._closed = true;
return this._socket.close();
};
MessageDispatcher.prototype.send = function(data) {
return this._socket.send(data);
};
MessageDispatcher.prototype.getWebSocket = function() {
return this._socket;
};
MessageDispatcher.prototype.registerInterface = function(intfName, intf, validate) {
if (validate) {
IDLTools.validateAgainstIDL(intf.constructor, intfName);
}
if (this._interfaces[intfName]) {
throw new Ex(arguments, "interface " + intfName + " has already been registered");
}
return this._interfaces[intfName] = intf;
};
MessageDispatcher.prototype.createProxy = function(intfName) {
var proxy, self, __invoke;
proxy = {};
IDLTools.buildProxyForIDL(proxy, intfName);
self = this;
proxy.__invoke = __invoke = function(intfName, methodName, args) {
return self._sendMethodInvocation(intfName, methodName, args);
};
return proxy;
};
MessageDispatcher.prototype._sendMethodInvocation = function(intfName, methodName, args) {
var data;
if (typeof intfName !== "string") {
throw new Ex(arguments, "expecting intf parameter to be a string");
}
if (typeof methodName !== "string") {
throw new Ex(arguments, "expecting method parameter to be a string");
}
data = {
"interface": intfName,
method: methodName,
args: args
};
data = JSON.stringify(data);
this._socket.send(data);
if (Verbose) {
return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: send " + intfName + "." + methodName + "(" + (JSON.stringify(args)) + ")"));
}
};
MessageDispatcher.prototype.getState = function() {
if (this._opening) {
return "opening";
}
if (this._opened) {
return "opened";
}
if (this._closed) {
return "closed";
}
return "unknown";
};
MessageDispatcher.prototype.isOpen = function() {
return this._opened === true;
};
MessageDispatcher.prototype._handleOpen = function(event) {
this._opening = false;
this._opened = true;
this.channel = event.channel;
Callback.setConnectorChannel(this.channel);
if (Verbose) {
return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: opened"));
}
};
MessageDispatcher.prototype._handleError = function(message) {
this.error = message;
this.close();
if (Verbose) {
return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: error: ") + message);
}
};
MessageDispatcher.prototype._handleMessage = function(message) {
var args, data, e, intf, intfName, method, methodName, methodSignature, skipErrorForMethods;
skipErrorForMethods = ['domContentEventFired', 'loadEventFired', 'childNodeRemoved'];
try {
data = JSON.parse(message.data);
} catch (_error) {
e = _error;
throw new Ex(arguments, "invalid JSON data received: " + e + ": '" + message.data + "'");
}
intfName = data["interface"];
methodName = data.method;
args = data.args;
methodSignature = "" + intfName + "." + methodName + "()";
intf = this._interfaces.hasOwnProperty(intfName) && this._interfaces[intfName];
if (!intf && InspectorBackend && intfName.match(/.*Notify/)) {
intf = InspectorBackend.getRegisteredDomainDispatcher(intfName.substr(0, intfName.length - 6));
}
if (!intf) {
Weinre.notImplemented("weinre: request for non-registered interface: " + methodSignature);
return;
}
methodSignature = intf.constructor.name + ("." + methodName + "()");
method = intf[methodName];
if (typeof method !== "function") {
Weinre.notImplemented(methodSignature);
return;
}
try {
method.apply(intf, args);
} catch (_error) {
e = _error;
if (__indexOf.call(skipErrorForMethods, methodName) < 0) {
Weinre.logError(("weinre: invocation exception on " + methodSignature + ": ") + e);
}
}
if (Verbose) {
return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: recv " + intfName + "." + methodName + "(" + (JSON.stringify(args)) + ")"));
}
};
MessageDispatcher.prototype._handleClose = function() {
this._reallyClosed = true;
if (Verbose) {
return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: closed"));
}
};
return MessageDispatcher;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/MethodNamer.amd.js
;modjewel.define("weinre/common/MethodNamer", function(require, exports, module) { 
var MethodNamer,
__hasProp = {}.hasOwnProperty;
module.exports = MethodNamer = (function() {
function MethodNamer() {}
MethodNamer.setNamesForClass = function(aClass) {
var key, val, _ref, _results;
for (key in aClass) {
if (!__hasProp.call(aClass, key)) continue;
val = aClass[key];
if (typeof val === "function") {
val.signature = "" + aClass.name + "::" + key;
val.displayName = key;
val.name = key;
}
}
_ref = aClass.prototype;
_results = [];
for (key in _ref) {
if (!__hasProp.call(_ref, key)) continue;
val = _ref[key];
if (typeof val === "function") {
val.signature = "" + aClass.name + "." + key;
val.displayName = key;
_results.push(val.name = key);
} else {
_results.push(void 0);
}
}
return _results;
};
return MethodNamer;
})();
MethodNamer.setNamesForClass(module.exports);
});

;
// weinre/common/StackTrace.amd.js
;modjewel.define("weinre/common/StackTrace", function(require, exports, module) { 
var StackTrace, getTrace;
module.exports = StackTrace = (function() {
function StackTrace(args) {
if (!args || !args.callee) {
throw Error("first parameter to " + arguments.callee.signature + " must be an Arguments object");
}
this.trace = getTrace(args);
}
StackTrace.dump = function(args) {
var stackTrace;
args = args || arguments;
stackTrace = new StackTrace(args);
return stackTrace.dump();
};
StackTrace.prototype.dump = function() {
var frame, _i, _len, _ref, _results;
console.log("StackTrace:");
_ref = this.trace;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
frame = _ref[_i];
_results.push(console.log("    " + frame));
}
return _results;
};
return StackTrace;
})();
getTrace = function(args) {
var err, func, result, visitedFuncs;
result = [];
visitedFuncs = [];
func = args.callee;
while (func) {
if (func.signature) {
result.push(func.signature);
} else if (func.displayName) {
result.push(func.displayName);
} else if (func.name) {
result.push(func.name);
} else {
result.push("<anonymous>");
}
if (-1 !== visitedFuncs.indexOf(func)) {
result.push("... recursion");
return result;
}
visitedFuncs.push(func);
try {
func = func.caller;
} catch (_error) {
err = _error;
func = null;
}
}
return result;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/WebSocketXhr.amd.js
;modjewel.define("weinre/common/WebSocketXhr", function(require, exports, module) { 
var EventListeners, Ex, HookLib, WebSocketXhr, Weinre, _xhrEventHandler;
Ex = require('./Ex');
Weinre = require('./Weinre');
HookLib = require('./HookLib');
EventListeners = require('./EventListeners');
module.exports = WebSocketXhr = (function() {
WebSocketXhr.CONNECTING = 0;
WebSocketXhr.OPEN = 1;
WebSocketXhr.CLOSING = 2;
WebSocketXhr.CLOSED = 3;
function WebSocketXhr(url, id) {
this.initialize(url, id);
}
WebSocketXhr.prototype.initialize = function(url, id) {
if (!id) {
id = "anonymous";
}
this.readyState = WebSocketXhr.CONNECTING;
this._url = url;
this._id = id;
this._urlChannel = null;
this._queuedSends = [];
this._sendInProgress = true;
this._listeners = {
open: new EventListeners(),
message: new EventListeners(),
error: new EventListeners(),
close: new EventListeners()
};
return this._getChannel();
};
WebSocketXhr.prototype._getChannel = function() {
var body;
body = JSON.stringify({
id: this._id
});
return this._xhr(this._url, "POST", body, this._handleXhrResponseGetChannel);
};
WebSocketXhr.prototype._handleXhrResponseGetChannel = function(xhr) {
var e, object;
if (xhr.status !== 200) {
return this._handleXhrResponseError(xhr);
}
try {
object = JSON.parse(xhr.responseText);
} catch (_error) {
e = _error;
this._fireEventListeners("error", {
message: "non-JSON response from channel open request"
});
this.close();
return;
}
if (!object.channel) {
this._fireEventListeners("error", {
message: "channel open request did not include a channel"
});
this.close();
return;
}
this._urlChannel = this._url + "/" + object.channel;
this.readyState = WebSocketXhr.OPEN;
this._fireEventListeners("open", {
message: "open",
channel: object.channel
});
this._sendInProgress = false;
this._sendQueued();
return this._readLoop();
};
WebSocketXhr.prototype._readLoop = function() {
if (this.readyState === WebSocketXhr.CLOSED) {
return;
}
if (this.readyState === WebSocketXhr.CLOSING) {
return;
}
return this._xhr(this._urlChannel, "GET", "", this._handleXhrResponseGet);
};
WebSocketXhr.prototype._handleXhrResponseGet = function(xhr) {
var data, datum, e, self, _i, _len, _results;
self = this;
if (xhr.status !== 200) {
return this._handleXhrResponseError(xhr);
}
try {
datum = JSON.parse(xhr.responseText);
} catch (_error) {
e = _error;
this.readyState = WebSocketXhr.CLOSED;
this._fireEventListeners("error", {
message: "non-JSON response from read request"
});
return;
}
HookLib.ignoreHooks(function() {
return setTimeout((function() {
return self._readLoop();
}), 0);
});
_results = [];
for (_i = 0, _len = datum.length; _i < _len; _i++) {
data = datum[_i];
_results.push(self._fireEventListeners("message", {
data: data
}));
}
return _results;
};
WebSocketXhr.prototype.send = function(data) {
if (typeof data !== "string") {
throw new Ex(arguments, this.constructor.name + ".send");
}
this._queuedSends.push(data);
if (this._sendInProgress) {
return;
}
return this._sendQueued();
};
WebSocketXhr.prototype._sendQueued = function() {
var datum;
if (this._queuedSends.length === 0) {
return;
}
if (this.readyState === WebSocketXhr.CLOSED) {
return;
}
if (this.readyState === WebSocketXhr.CLOSING) {
return;
}
datum = JSON.stringify(this._queuedSends);
this._queuedSends = [];
this._sendInProgress = true;
return this._xhr(this._urlChannel, "POST", datum, this._handleXhrResponseSend);
};
WebSocketXhr.prototype._handleXhrResponseSend = function(xhr) {
var httpSocket;
httpSocket = this;
if (xhr.status !== 200) {
return this._handleXhrResponseError(xhr);
}
this._sendInProgress = false;
return HookLib.ignoreHooks(function() {
return setTimeout((function() {
return httpSocket._sendQueued();
}), 0);
});
};
WebSocketXhr.prototype.close = function() {
this._sendInProgress = true;
this.readyState = WebSocketXhr.CLOSING;
this._fireEventListeners("close", {
message: "closing",
wasClean: true
});
return this.readyState = WebSocketXhr.CLOSED;
};
WebSocketXhr.prototype.addEventListener = function(type, listener, useCapture) {
return this._getListeners(type).add(listener, useCapture);
};
WebSocketXhr.prototype.removeEventListener = function(type, listener, useCapture) {
return this._getListeners(type).remove(listener, useCapture);
};
WebSocketXhr.prototype._fireEventListeners = function(type, event) {
if (this.readyState === WebSocketXhr.CLOSED) {
return;
}
event.target = this;
return this._getListeners(type).fire(event);
};
WebSocketXhr.prototype._getListeners = function(type) {
var listeners;
listeners = this._listeners[type];
if (null === listeners) {
throw new Ex(arguments, "invalid event listener type: '" + type + "'");
}
return listeners;
};
WebSocketXhr.prototype._handleXhrResponseError = function(xhr) {
if (xhr.status === 404) {
this.close();
return;
}
this._fireEventListeners("error", {
target: this,
status: xhr.status,
message: "error from XHR invocation: " + xhr.statusText
});
return Weinre.logError(("error from XHR invocation: " + xhr.status + ": ") + xhr.statusText);
};
WebSocketXhr.prototype._xhr = function(url, method, data, handler) {
var xhr;
if (null === handler) {
throw new Ex(arguments, "handler must not be null");
}
xhr = (XMLHttpRequest.noConflict ? new XMLHttpRequest.noConflict() : new XMLHttpRequest());
xhr.httpSocket = this;
xhr.httpSocketHandler = handler;
xhr.onreadystatechange = function() {
return _xhrEventHandler(xhr);
};
HookLib.ignoreHooks(function() {
return xhr.open(method, url, true);
});
xhr.setRequestHeader("Content-Type", "text/plain");
return HookLib.ignoreHooks(function() {
return xhr.send(data);
});
};
return WebSocketXhr;
})();
_xhrEventHandler = function(xhr) {
if (xhr.readyState !== 4) {
return;
}
return xhr.httpSocketHandler.call(xhr.httpSocket, xhr);
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/common/Weinre.amd.js
;modjewel.define("weinre/common/Weinre", function(require, exports, module) { 
var ConsoleLogger, Ex, IDLTools, StackTrace, Weinre, consoleLogger, getLogger, logger, _notImplemented, _showNotImplemented;
Ex = require('./Ex');
IDLTools = require('./IDLTools');
StackTrace = require('./StackTrace');
_notImplemented = {};
_showNotImplemented = false;
logger = null;
module.exports = Weinre = (function() {
function Weinre() {
throw new Ex(arguments, "this class is not intended to be instantiated");
}
Weinre.addIDLs = function(idls) {
return IDLTools.addIDLs(idls);
};
Weinre.deprecated = function() {
return StackTrace.dump(arguments);
};
Weinre.notImplemented = function(thing) {
if (_notImplemented[thing]) {
return;
}
_notImplemented[thing] = true;
if (!_showNotImplemented) {
return;
}
return Weinre.logWarning(thing + " not implemented");
};
Weinre.showNotImplemented = function() {
var key, _results;
_showNotImplemented = true;
_results = [];
for (key in _notImplemented) {
_results.push(Weinre.logWarning(key + " not implemented"));
}
return _results;
};
Weinre.logError = function(message) {
return getLogger().logError(message);
};
Weinre.logWarning = function(message) {
return getLogger().logWarning(message);
};
Weinre.logInfo = function(message) {
return getLogger().logInfo(message);
};
Weinre.logDebug = function(message) {
return getLogger().logDebug(message);
};
return Weinre;
})();
ConsoleLogger = (function() {
function ConsoleLogger() {}
ConsoleLogger.prototype.logError = function(message) {
return console.log("error: " + message);
};
ConsoleLogger.prototype.logWarning = function(message) {
return console.log("warning: " + message);
};
ConsoleLogger.prototype.logInfo = function(message) {
return console.log("info: " + message);
};
ConsoleLogger.prototype.logDebug = function(message) {
return console.log("debug: " + message);
};
return ConsoleLogger;
})();
consoleLogger = new ConsoleLogger();
getLogger = function() {
if (logger) {
return logger;
}
if (Weinre.client) {
logger = Weinre.WeinreClientCommands;
return logger;
}
if (Weinre.target) {
logger = Weinre.WeinreTargetCommands;
return logger;
}
return consoleLogger;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/BrowserHacks.amd.js
;modjewel.define("weinre/target/BrowserHacks", function(require, exports, module) { 
var BrowserHacks;
BrowserHacks = function() {
if (typeof document.addEventListener === "undefined") {
alert("Oops. It seems the page runs in compatibility mode. Please fix it and try again.");
return;
}
if (typeof window.Element === "undefined") {
window.Element = function() {};
}
if (typeof window.Node === "undefined") {
window.Node = function() {};
}
if (!Object.getPrototypeOf) {
Object.getPrototypeOf = function(object) {
if (!object.__proto__) {
throw new Error("This vm does not support __proto__ and getPrototypeOf. Script requires any of them to operate correctly.");
}
return object.__proto__;
};
}
};
BrowserHacks();
});

;
// weinre/target/CheckForProblems.amd.js
;modjewel.define("weinre/target/CheckForProblems", function(require, exports, module) { 
var CheckForProblems, checkForOldPrototypeVersion;
module.exports = CheckForProblems = (function() {
function CheckForProblems() {}
CheckForProblems.check = function() {
return checkForOldPrototypeVersion();
};
return CheckForProblems;
})();
checkForOldPrototypeVersion = function() {
var badVersion;
badVersion = false;
if (typeof Prototype === "undefined") {
return;
}
if (!Prototype.Version) {
return;
}
if (Prototype.Version.match(/^1\.5.*/)) {
badVersion = true;
}
if (Prototype.Version.match(/^1\.6.*/)) {
badVersion = true;
}
if (badVersion) {
return alert("Sorry, weinre is not support in versions of Prototype earlier than 1.7");
}
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/Console.amd.js
;modjewel.define("weinre/target/Console", function(require, exports, module) { 
var Console, MessageLevel, MessageSource, MessageType, OriginalConsole, RemoteConsole, Timeline, UsingRemote, Weinre;
Weinre = require('../common/Weinre');
Timeline = require('../target/Timeline');
UsingRemote = false;
RemoteConsole = null;
OriginalConsole = null;
MessageSource = {
HTML: 0,
WML: 1,
XML: 2,
JS: 3,
CSS: 4,
Other: 5
};
MessageType = {
Log: 0,
Object: 1,
Trace: 2,
StartGroup: 3,
StartGroupCollapsed: 4,
EndGroup: 5,
Assert: 6,
UncaughtException: 7,
Result: 8
};
MessageLevel = {
Tip: 0,
Log: 1,
Warning: 2,
Error: 3,
Debug: 4
};
module.exports = Console = (function() {
function Console() {}
Object.defineProperty(Console, 'original', {
get: function() {
return OriginalConsole;
}
});
Console.useRemote = function(value) {
var oldValue;
if (arguments.length === 0) {
return UsingRemote;
}
oldValue = UsingRemote;
UsingRemote = !!value;
if (UsingRemote) {
window.console = RemoteConsole;
} else {
window.console = OriginalConsole;
}
return oldValue;
};
Console.prototype._generic = function(level, messageParts) {
var message, messagePart, parameters, payload, _i, _len;
message = messageParts[0].toString();
parameters = [];
for (_i = 0, _len = messageParts.length; _i < _len; _i++) {
messagePart = messageParts[_i];
parameters.push(Weinre.injectedScript.wrapObjectForConsole(messagePart, true));
}
payload = {
source: MessageSource.JS,
type: MessageType.Log,
level: level,
message: message,
parameters: parameters
};
return Weinre.wi.ConsoleNotify.addConsoleMessage(payload);
};
Console.prototype.log = function() {
return this._generic(MessageLevel.Log, [].slice.call(arguments));
};
Console.prototype.debug = function() {
return this._generic(MessageLevel.Debug, [].slice.call(arguments));
};
Console.prototype.error = function() {
return this._generic(MessageLevel.Error, [].slice.call(arguments));
};
Console.prototype.info = function() {
return this._generic(MessageLevel.Log, [].slice.call(arguments));
};
Console.prototype.warn = function() {
return this._generic(MessageLevel.Warning, [].slice.call(arguments));
};
Console.prototype.dir = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.dirxml = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.trace = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.assert = function(condition) {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.count = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.markTimeline = function(message) {
return Timeline.addRecord_Mark(message);
};
Console.prototype.lastWMLErrorMessage = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.profile = function(title) {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.profileEnd = function(title) {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.time = function(title) {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.timeEnd = function(title) {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.group = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.groupCollapsed = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
Console.prototype.groupEnd = function() {
return Weinre.notImplemented(arguments.callee.signature);
};
return Console;
})();
RemoteConsole = new Console();
OriginalConsole = window.console || {};
RemoteConsole.__original = OriginalConsole;
OriginalConsole.__original = OriginalConsole;
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/CSSStore.amd.js
;modjewel.define("weinre/target/CSSStore", function(require, exports, module) { 
var CSSStore, IDGenerator, Weinre, _elementMatchesSelector, _fallbackMatchesSelector, _getMappableId, _getMappableObject, _mozMatchesSelector, _msMatchesSelector, _webkitMatchesSelector;
IDGenerator = require('../common/IDGenerator');
Weinre = require('../common/Weinre');
_elementMatchesSelector = null;
module.exports = CSSStore = (function() {
function CSSStore() {
this.styleSheetMap = {};
this.styleRuleMap = {};
this.styleDeclMap = {};
this.testElement = document.createElement("div");
}
CSSStore.prototype.getInlineStyle = function(node) {
var cssProperty, styleObject, _i, _len, _ref;
styleObject = this._buildMirrorForStyle(node.style, true);
_ref = styleObject.cssProperties;
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
cssProperty = _ref[_i];
cssProperty.status = "style";
}
return styleObject;
};
CSSStore.prototype.getComputedStyle = function(node) {
var styleObject;
if (!node) {
return {};
}
if (node.nodeType !== Node.ELEMENT_NODE) {
return {};
}
styleObject = this._buildMirrorForStyle(window.getComputedStyle(node), false);
return styleObject;
};
CSSStore.prototype.getMatchedCSSRules = function(node) {
var cssRule, err, object, result, styleSheet, _i, _j, _len, _len1, _ref, _ref1;
result = [];
try {
_ref = document.styleSheets;
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
styleSheet = _ref[_i];
if (!styleSheet.cssRules) {
continue;
}
_ref1 = styleSheet.cssRules;
for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
cssRule = _ref1[_j];
if (!_elementMatchesSelector(node, cssRule.selectorText)) {
continue;
}
object = {};
object.ruleId = this._getStyleRuleId(cssRule);
object.selectorText = cssRule.selectorText;
object.style = this._buildMirrorForStyle(cssRule.style, true);
result.push(object);
}
}
} catch (_error) {
err = _error;
return result;
}
return result;
};
CSSStore.prototype.getStyleAttributes = function(node) {
var result;
result = {};
return result;
};
CSSStore.prototype.getPseudoElements = function(node) {
var result;
result = [];
return result;
};
CSSStore.prototype.setPropertyText = function(styleId, propertyIndex, text, overwrite) {
var compare, i, key, mirror, properties, propertyIndices, propertyMirror, styleDecl;
styleDecl = Weinre.cssStore._getStyleDecl(styleId);
if (!styleDecl) {
Weinre.logWarning("requested style not available: " + styleId);
return null;
}
mirror = styleDecl.__weinre__mirror;
if (!mirror) {
Weinre.logWarning("requested mirror not available: " + styleId);
return null;
}
properties = mirror.cssProperties;
propertyMirror = this._parseProperty(text);
if (null === propertyMirror) {
this._removePropertyFromMirror(mirror, propertyIndex);
properties = mirror.cssProperties;
} else {
this._removePropertyFromMirror(mirror, propertyIndex);
properties = mirror.cssProperties;
propertyIndices = {};
i = 0;
while (i < properties.length) {
propertyIndices[properties[i].name] = i;
i++;
}
i = 0;
while (i < propertyMirror.cssProperties.length) {
if (propertyIndices[propertyMirror.cssProperties[i].name] != null) {
properties[propertyIndices[propertyMirror.cssProperties[i].name]] = propertyMirror.cssProperties[i];
} else {
properties.push(propertyMirror.cssProperties[i]);
}
i++;
}
for (key in propertyMirror.shorthandValues) {
mirror.shorthandValues[key] = propertyMirror.shorthandValues[key];
}
}
properties.sort(compare = function(p1, p2) {
if (p1.name < p2.name) {
return -1;
} else if (p1.name > p2.name) {
return 1;
} else {
return 0;
}
});
this._setStyleFromMirror(styleDecl);
return mirror;
};
CSSStore.prototype._removePropertyFromMirror = function(mirror, index) {
var i, newProperties, properties, property;
properties = mirror.cssProperties;
if (index >= properties.length) {
return;
}
property = properties[index];
properties[index] = null;
if (mirror.shorthandValues[property.name]) {
delete mirror.shorthandValues[property.name];
i = 0;
while (i < properties.length) {
if (properties[i]) {
if (properties[i].shorthandName === property.name) {
properties[i] = null;
}
}
i++;
}
}
newProperties = [];
i = 0;
while (i < properties.length) {
if (properties[i]) {
newProperties.push(properties[i]);
}
i++;
}
return mirror.cssProperties = newProperties;
};
CSSStore.prototype.toggleProperty = function(styleId, propertyIndex, disable) {
var cssProperty, mirror, styleDecl;
styleDecl = Weinre.cssStore._getStyleDecl(styleId);
if (!styleDecl) {
Weinre.logWarning("requested style not available: " + styleId);
return null;
}
mirror = styleDecl.__weinre__mirror;
if (!mirror) {
Weinre.logWarning("requested mirror not available: " + styleId);
return null;
}
cssProperty = mirror.cssProperties[propertyIndex];
if (!cssProperty) {
Weinre.logWarning(("requested property not available: " + styleId + ": ") + propertyIndex);
return null;
}
if (disable) {
cssProperty.status = "disabled";
} else {
cssProperty.status = "active";
}
this._setStyleFromMirror(styleDecl);
return mirror;
};
CSSStore.prototype._setStyleFromMirror = function(styleDecl) {
var cssProperties, cssText, property, _i, _len;
cssText = [];
cssProperties = styleDecl.__weinre__mirror.cssProperties;
cssText = "";
for (_i = 0, _len = cssProperties.length; _i < _len; _i++) {
property = cssProperties[_i];
if (!property.parsedOk) {
continue;
}
if (property.status === "disabled") {
continue;
}
if (property.shorthandName) {
continue;
}
cssText += property.name + ": " + property.value;
if (property.priority === "important") {
cssText += " !important; ";
} else {
cssText += "; ";
}
}
return styleDecl.cssText = cssText;
};
CSSStore.prototype._buildMirrorForStyle = function(styleDecl, bind) {
var i, name, properties, property, result, shorthandName;
result = {
properties: {},
cssProperties: []
};
if (!styleDecl) {
return result;
}
if (bind) {
result.styleId = this._getStyleDeclId(styleDecl);
styleDecl.__weinre__mirror = result;
}
result.properties.width = styleDecl.getPropertyValue("width") || "";
result.properties.height = styleDecl.getPropertyValue("height") || "";
result.cssText = styleDecl.cssText;
result.shorthandValues = {};
properties = [];
if (styleDecl) {
i = 0;
while (i < styleDecl.length) {
property = {};
name = styleDecl.item(i);
property.name = name;
property.priority = styleDecl.getPropertyPriority(name);
property.implicit = typeof styleDecl.isPropertyImplicit !== "undefined" ? styleDecl.isPropertyImplicit(name) : true;
property.shorthandName = typeof styleDecl.getPropertyShorthand !== "undefined" ? styleDecl.getPropertyShorthand(name) || "" : "";
property.status = (property.shorthandName ? "style" : "active");
property.parsedOk = true;
property.value = styleDecl.getPropertyValue(name);
properties.push(property);
if (property.shorthandName) {
shorthandName = property.shorthandName;
if (!result.shorthandValues[shorthandName]) {
result.shorthandValues[shorthandName] = styleDecl.getPropertyValue(shorthandName);
property = {};
property.name = shorthandName;
property.priority = styleDecl.getPropertyPriority(shorthandName);
property.implicit = styleDecl.isPropertyImplicit(shorthandName);
property.shorthandName = "";
property.status = "active";
property.parsedOk = true;
property.value = styleDecl.getPropertyValue(name);
properties.push(property);
}
}
i++;
}
}
properties.sort(function(p1, p2) {
if (p1.name < p2.name) {
return -1;
} else if (p1.name > p2.name) {
return 1;
} else {
return 0;
}
});
result.cssProperties = properties;
return result;
};
CSSStore.prototype._parseProperty = function(string) {
var match, property, propertyPattern, result, testStyleDecl;
testStyleDecl = this.testElement.style;
try {
testStyleDecl.cssText = string;
if (testStyleDecl.cssText !== "") {
return this._buildMirrorForStyle(testStyleDecl, false);
}
} catch (_error) {}
propertyPattern = /\s*(.+)\s*:\s*(.+)\s*(!important)?\s*;/;
match = propertyPattern.exec(string);
if (!match) {
return null;
}
match[3] = (match[3] === "!important" ? "important" : "");
property = {};
property.name = match[1];
property.priority = match[3];
property.implicit = true;
property.shorthandName = "";
property.status = "inactive";
property.parsedOk = false;
property.value = match[2];
result = {};
result.width = 0;
result.height = 0;
result.shorthandValues = 0;
result.cssProperties = [property];
return result;
};
CSSStore.prototype._getStyleSheet = function(id) {
return _getMappableObject(id, this.styleSheetMap);
};
CSSStore.prototype._getStyleSheetId = function(styleSheet) {
return _getMappableId(styleSheet, this.styleSheetMap);
};
CSSStore.prototype._getStyleRule = function(id) {
return _getMappableObject(id, this.styleRuleMap);
};
CSSStore.prototype._getStyleRuleId = function(styleRule) {
return _getMappableId(styleRule, this.styleRuleMap);
};
CSSStore.prototype._getStyleDecl = function(id) {
return _getMappableObject(id, this.styleDeclMap);
};
CSSStore.prototype._getStyleDeclId = function(styleDecl) {
return _getMappableId(styleDecl, this.styleDeclMap);
};
return CSSStore;
})();
_getMappableObject = function(id, map) {
return map[id];
};
_getMappableId = function(object, map) {
return IDGenerator.getId(object, map);
};
_mozMatchesSelector = function(element, selector) {
if (!element.mozMatchesSelector) {
return false;
}
return element.mozMatchesSelector(selector);
};
_webkitMatchesSelector = function(element, selector) {
if (!element.webkitMatchesSelector) {
return false;
}
return element.webkitMatchesSelector(selector);
};
_msMatchesSelector = function(element, selector) {
if (!element.msMatchesSelector) {
return false;
}
return element.msMatchesSelector(selector);
};
_fallbackMatchesSelector = function(element, selector) {
return false;
};
if (Element.prototype.webkitMatchesSelector) {
_elementMatchesSelector = _webkitMatchesSelector;
} else if (Element.prototype.mozMatchesSelector) {
_elementMatchesSelector = _mozMatchesSelector;
} else if (Element.prototype.msMatchesSelector) {
_elementMatchesSelector = _msMatchesSelector;
} else {
_elementMatchesSelector = _fallbackMatchesSelector;
}
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/ElementHighlighter.amd.js
;modjewel.define("weinre/target/ElementHighlighter", function(require, exports, module) { 
var ElementHighlighter, canvasAvailable, currentHighlighterElement, fromPx, getMetricsForElement, highlighterClass, supportsCanvas;
canvasAvailable = null;
highlighterClass = null;
currentHighlighterElement = null;
module.exports = ElementHighlighter = (function() {
ElementHighlighter.create = function() {
if (highlighterClass == null) {
highlighterClass = require('./ElementHighlighterDivs2');
}
return new highlighterClass();
};
function ElementHighlighter() {
this.hElement = this.createHighlighterElement();
this.hElement.__weinreHighlighter = true;
this.hElement.style.display = "none";
this.hElement.style.zIndex = 10 * 1000 * 1000;
if (currentHighlighterElement) {
document.body.removeChild(currentHighlighterElement);
}
currentHighlighterElement = this.hElement;
document.body.appendChild(this.hElement);
}
ElementHighlighter.prototype.on = function(element) {
if (null === element) {
return;
}
if (element.nodeType !== Node.ELEMENT_NODE) {
return;
}
this.redraw(getMetricsForElement(element));
return this.hElement.style.display = "block";
};
ElementHighlighter.prototype.off = function() {
return this.hElement.style.display = "none";
};
return ElementHighlighter;
})();
getMetricsForElement = function(element) {
var cStyle, el, left, metrics, top;
metrics = {};
left = 0;
top = 0;
el = element;
while (true) {
left += el.offsetLeft;
top += el.offsetTop;
if (!(el = el.offsetParent)) {
break;
}
}
metrics.x = left;
metrics.y = top;
cStyle = document.defaultView.getComputedStyle(element);
metrics.width = element.offsetWidth;
metrics.height = element.offsetHeight;
metrics.marginLeft = fromPx(cStyle["margin-left"] || cStyle["marginLeft"]);
metrics.marginRight = fromPx(cStyle["margin-right"] || cStyle["marginRight"]);
metrics.marginTop = fromPx(cStyle["margin-top"] || cStyle["marginTop"]);
metrics.marginBottom = fromPx(cStyle["margin-bottom"] || cStyle["marginBottom"]);
metrics.borderLeft = fromPx(cStyle["border-left-width"] || cStyle["borderLeftWidth"]);
metrics.borderRight = fromPx(cStyle["border-right-width"] || cStyle["borderRightWidth"]);
metrics.borderTop = fromPx(cStyle["border-top-width"] || cStyle["borderTopWidth"]);
metrics.borderBottom = fromPx(cStyle["border-bottom-width"] || cStyle["borderBottomWidth"]);
metrics.paddingLeft = fromPx(cStyle["padding-left"] || cStyle["paddingLeft"]);
metrics.paddingRight = fromPx(cStyle["padding-right"] || cStyle["paddingRight"]);
metrics.paddingTop = fromPx(cStyle["padding-top"] || cStyle["paddingTop"]);
metrics.paddingBottom = fromPx(cStyle["padding-bottom"] || cStyle["paddingBottom"]);
metrics.x -= metrics.marginLeft;
metrics.y -= metrics.marginTop;
return metrics;
};
fromPx = function(string) {
return parseInt(string.replace(/px$/, ""));
};
supportsCanvas = function() {
var element;
element = document.createElement('canvas');
if (!element.getContext) {
return false;
}
if (element.getContext('2d')) {
return true;
}
return false;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/ElementHighlighterDivs2.amd.js
;modjewel.define("weinre/target/ElementHighlighterDivs2", function(require, exports, module) { 
var ColorBorder, ColorContent, ColorMargin, ColorPadding, ElementHighlighter, ElementHighlighterDivs2, px,
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
ElementHighlighter = require('./ElementHighlighter');
ColorMargin = 'rgba(246, 178, 107, 0.66)';
ColorBorder = 'rgba(255, 229, 153, 0.66)';
ColorPadding = 'rgba(147, 196, 125, 0.55)';
ColorContent = 'rgba(111, 168, 220, 0.66)';
ColorBorder = 'rgba(255, 255, 153, 0.40)';
ColorPadding = 'rgba(  0, 255,   0, 0.20)';
ColorContent = 'rgba(  0,   0, 255, 0.30)';
module.exports = ElementHighlighterDivs2 = (function(_super) {
__extends(ElementHighlighterDivs2, _super);
function ElementHighlighterDivs2() {
return ElementHighlighterDivs2.__super__.constructor.apply(this, arguments);
}
ElementHighlighterDivs2.prototype.createHighlighterElement = function() {
this.hElement1 = document.createElement("weinreHighlighter");
this.hElement1.style.position = 'absolute';
this.hElement1.style.overflow = 'hidden';
this.hElement2 = document.createElement("weinreHighlighter");
this.hElement2.style.position = 'absolute';
this.hElement2.style.display = 'block';
this.hElement2.style.overflow = 'hidden';
this.hElement1.appendChild(this.hElement2);
this.hElement1.style.borderTopStyle = 'solid';
this.hElement1.style.borderLeftStyle = 'solid';
this.hElement1.style.borderBottomStyle = 'solid';
this.hElement1.style.borderRightStyle = 'solid';
this.hElement1.style.borderTopColor = ColorMargin;
this.hElement1.style.borderLeftColor = ColorMargin;
this.hElement1.style.borderBottomColor = ColorMargin;
this.hElement1.style.borderRightColor = ColorMargin;
this.hElement1.style.backgroundColor = ColorBorder;
this.hElement2.style.borderTopStyle = 'solid';
this.hElement2.style.borderLeftStyle = 'solid';
this.hElement2.style.borderBottomStyle = 'solid';
this.hElement2.style.borderRightStyle = 'solid';
this.hElement2.style.borderTopColor = ColorPadding;
this.hElement2.style.borderLeftColor = ColorPadding;
this.hElement2.style.borderBottomColor = ColorPadding;
this.hElement2.style.borderRightColor = ColorPadding;
this.hElement2.style.backgroundColor = ColorContent;
this.hElement1.style.outline = 'black solid thin';
return this.hElement1;
};
ElementHighlighterDivs2.prototype.redraw = function(metrics) {
this.hElement1.style.top = px(metrics.y);
this.hElement1.style.left = px(metrics.x);
this.hElement1.style.height = px(metrics.height);
this.hElement1.style.width = px(metrics.width);
this.hElement1.style.borderTopWidth = px(metrics.marginTop);
this.hElement1.style.borderLeftWidth = px(metrics.marginLeft);
this.hElement1.style.borderBottomWidth = px(metrics.marginBottom);
this.hElement1.style.borderRightWidth = px(metrics.marginRight);
this.hElement2.style.top = px(metrics.borderTop);
this.hElement2.style.left = px(metrics.borderLeft);
this.hElement2.style.bottom = px(metrics.borderBottom);
this.hElement2.style.right = px(metrics.borderRight);
this.hElement2.style.borderTopWidth = px(metrics.paddingTop);
this.hElement2.style.borderLeftWidth = px(metrics.paddingLeft);
this.hElement2.style.borderBottomWidth = px(metrics.paddingBottom);
return this.hElement2.style.borderRightWidth = px(metrics.paddingRight);
};
return ElementHighlighterDivs2;
})(ElementHighlighter);
px = function(value) {
return "" + value + "px";
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/HookSites.amd.js
;modjewel.define("weinre/target/HookSites", function(require, exports, module) { 
var HookLib, HookSites;
HookLib = require('../common/HookLib');
module.exports = HookSites = (function() {
function HookSites() {}
return HookSites;
})();
HookSites.window_clearInterval = HookLib.addHookSite(window, "clearInterval");
HookSites.window_clearTimeout = HookLib.addHookSite(window, "clearTimeout");
HookSites.window_setInterval = HookLib.addHookSite(window, "setInterval");
HookSites.window_setTimeout = HookLib.addHookSite(window, "setTimeout");
HookSites.window_addEventListener = HookLib.addHookSite(window, "addEventListener");
HookSites.Node_addEventListener = HookLib.addHookSite(Node.prototype, "addEventListener");
HookSites.XMLHttpRequest_open = HookLib.addHookSite(XMLHttpRequest.prototype, "open");
HookSites.XMLHttpRequest_send = HookLib.addHookSite(XMLHttpRequest.prototype, "send");
HookSites.XMLHttpRequest_addEventListener = HookLib.addHookSite(XMLHttpRequest.prototype, "addEventListener");
if (window.openDatabase) {
HookSites.window_openDatabase = HookLib.addHookSite(window, "openDatabase");
}
if (window.localStorage) {
HookSites.LocalStorage_setItem = HookLib.addHookSite(window.localStorage, "setItem");
HookSites.LocalStorage_removeItem = HookLib.addHookSite(window.localStorage, "removeItem");
HookSites.LocalStorage_clear = HookLib.addHookSite(window.localStorage, "clear");
}
if (window.sessionStorage) {
HookSites.SessionStorage_setItem = HookLib.addHookSite(window.sessionStorage, "setItem");
HookSites.SessionStorage_removeItem = HookLib.addHookSite(window.sessionStorage, "removeItem");
HookSites.SessionStorage_clear = HookLib.addHookSite(window.sessionStorage, "clear");
}
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/InjectedScript.js
var injectedScriptConstructor = 
(function (InjectedScriptHost, inspectedWindow, injectedScriptId) {
function bind(thisObject, memberFunction)
{
var func = memberFunction;
var args = Array.prototype.slice.call(arguments, 2);
function bound()
{
return func.apply(thisObject, args.concat(Array.prototype.slice.call(arguments, 0)));
}
bound.toString = function() {
return "bound: " + func;
};
return bound;
}
var InjectedScript = function()
{
this._lastBoundObjectId = 1;
this._idToWrappedObject = {};
this._objectGroups = {};
}
InjectedScript.prototype = {
wrapObjectForConsole: function(object, canAccessInspectedWindow)
{
if (canAccessInspectedWindow)
return this._wrapObject(object, "console");
var result = {};
result.type = typeof object;
result.description = this._toString(object);
return result;
},
_wrapObject: function(object, objectGroupName, abbreviate)
{
try {
var objectId;
if (typeof object === "object" || typeof object === "function" || this._isHTMLAllCollection(object)) {
var id = this._lastBoundObjectId++;
this._idToWrappedObject[id] = object;
var group = this._objectGroups[objectGroupName];
if (!group) {
group = [];
this._objectGroups[objectGroupName] = group;
}
group.push(id);
objectId = { injectedScriptId: injectedScriptId,
id: id,
groupName: objectGroupName };
}
return InjectedScript.RemoteObject.fromObject(object, objectId, abbreviate);
} catch (e) {
return InjectedScript.RemoteObject.fromObject("[ Exception: " + e.toString() + " ]");
}
},
_parseObjectId: function(objectId)
{
return eval("(" + objectId + ")");
},
releaseWrapperObjectGroup: function(objectGroupName)
{
var group = this._objectGroups[objectGroupName];
if (!group)
return;
for (var i = 0; i < group.length; i++)
delete this._idToWrappedObject[group[i]];
delete this._objectGroups[objectGroupName];
},
dispatch: function(methodName, args)
{
var argsArray = eval("(" + args + ")");
var result = this[methodName].apply(this, argsArray);
if (typeof result === "undefined") {
inspectedWindow.console.error("Web Inspector error: InjectedScript.%s returns undefined", methodName);
result = null;
}
return result;
},
getProperties: function(objectId, ignoreHasOwnProperty, abbreviate)
{
var parsedObjectId = this._parseObjectId(objectId);
var object = this._objectForId(parsedObjectId);
if (!this._isDefined(object))
return false;
var properties = [];
var propertyNames;
if (window.navigator.userAgent.indexOf("MSIE") != -1 ) {
propertyNames = this._getPropertyNames(object);
} else
propertyNames = ignoreHasOwnProperty ? this._getPropertyNames(object) : Object.getOwnPropertyNames(object);
if (!ignoreHasOwnProperty && object.__proto__)
propertyNames.push("__proto__");
for (var i = 0; i < propertyNames.length; ++i) {
var propertyName = propertyNames[i];
var property = {};
property.name = propertyName + "";
var isGetter = object["__lookupGetter__"] && object.__lookupGetter__(propertyName);
if (!isGetter) {
try {
property.value = this._wrapObject(object[propertyName], parsedObjectId.groupName, abbreviate);
} catch(e) {
property.value = new InjectedScript.RemoteObject.fromException(e);
}
} else {
property.value = new InjectedScript.RemoteObject.fromObject("\u2014"); 
property.isGetter = true;
}
properties.push(property);
}
return properties;
},
setPropertyValue: function(objectId, propertyName, expression)
{
var parsedObjectId = this._parseObjectId(objectId);
var object = this._objectForId(parsedObjectId);
if (!this._isDefined(object))
return false;
var expressionLength = expression.length;
if (!expressionLength) {
delete object[propertyName];
return !(propertyName in object);
}
try {
var result = inspectedWindow.eval("(" + expression + ")");
object[propertyName] = result;
return true;
} catch(e) {
try {
var result = inspectedWindow.eval("\"" + expression.replace(/"/g, "\\\"") + "\"");
object[propertyName] = result;
return true;
} catch(e) {
return false;
}
}
},
_populatePropertyNames: function(object, resultSet)
{
for (var o = object; o; o = Object.getPrototypeOf(o)) {
try {
var names = Object.getOwnPropertyNames(o);
for (var i = 0; i < names.length; ++i)
resultSet[names[i]] = true;
} catch (e) {
}
}
},
_getPropertyNames: function(object, resultSet)
{
var propertyNameSet = {};
this._populatePropertyNames(object, propertyNameSet);
return Object.keys(propertyNameSet);
},
getCompletions: function(expression, includeCommandLineAPI)
{
var props = {};
try {
if (!expression)
expression = "this";
var expressionResult = this._evaluateOn(inspectedWindow.eval, inspectedWindow, expression, false, false);
if (typeof expressionResult === "object")
this._populatePropertyNames(expressionResult, props);
if (includeCommandLineAPI) {
for (var prop in CommandLineAPI.members_)
props[CommandLineAPI.members_[prop]] = true;
}
} catch(e) {
}
return props;
},
getCompletionsOnCallFrame: function(callFrameId, expression, includeCommandLineAPI)
{
var props = {};
try {
var callFrame = this._callFrameForId(callFrameId);
if (!callFrame)
return props;
if (expression) {
var expressionResult = this._evaluateOn(callFrame.evaluate, callFrame, expression, true, false);
if (typeof expressionResult === "object")
this._populatePropertyNames(expressionResult, props);
} else {
var scopeChain = callFrame.scopeChain;
for (var i = 0; i < scopeChain.length; ++i)
this._populatePropertyNames(scopeChain[i], props);
}
if (includeCommandLineAPI) {
for (var prop in CommandLineAPI.members_)
props[CommandLineAPI.members_[prop]] = true;
}
} catch(e) {
}
return props;
},
evaluate: function(expression, objectGroup, injectCommandLineAPI)
{
return this._evaluateAndWrap(inspectedWindow.eval, inspectedWindow, expression, objectGroup, false, injectCommandLineAPI);
},
_evaluateAndWrap: function(evalFunction, object, expression, objectGroup, isEvalOnCallFrame, injectCommandLineAPI)
{
try {
return this._wrapObject(this._evaluateOn(evalFunction, object, expression, isEvalOnCallFrame, injectCommandLineAPI), objectGroup);
} catch (e) {
return InjectedScript.RemoteObject.fromException(e);
}
},
_evaluateOn: function(evalFunction, object, expression, isEvalOnCallFrame, injectCommandLineAPI)
{
try {
if (injectCommandLineAPI && inspectedWindow.console) {
inspectedWindow.console._commandLineAPI = new CommandLineAPI(this._commandLineAPIImpl, isEvalOnCallFrame ? object : null);
expression = "with ((window && window.console && window.console._commandLineAPI) || {}) {\n" + expression + "\n}";
}
var value = evalFunction.call(object, expression);
if (this._type(value) === "error")
throw value.toString();
return value;
} finally {
if (injectCommandLineAPI && inspectedWindow.console)
delete inspectedWindow.console._commandLineAPI;
}
},
getNodeId: function(node)
{
return InjectedScriptHost.pushNodePathToFrontend(node, false, false);
},
callFrames: function()
{
var callFrame = InjectedScriptHost.currentCallFrame();
if (!callFrame)
return false;
injectedScript.releaseWrapperObjectGroup("backtrace");
var result = [];
var depth = 0;
do {
result.push(new InjectedScript.CallFrameProxy(depth++, callFrame));
callFrame = callFrame.caller;
} while (callFrame);
return result;
},
evaluateOnCallFrame: function(callFrameId, expression, objectGroup, injectCommandLineAPI)
{
var callFrame = this._callFrameForId(callFrameId);
if (!callFrame)
return false;
return this._evaluateAndWrap(callFrame.evaluate, callFrame, expression, objectGroup, true, injectCommandLineAPI);
},
_callFrameForId: function(callFrameId)
{
var parsedCallFrameId = eval("(" + callFrameId + ")");
var ordinal = parsedCallFrameId.ordinal;
var callFrame = InjectedScriptHost.currentCallFrame();
while (--ordinal >= 0 && callFrame)
callFrame = callFrame.caller;
return callFrame;
},
_nodeForId: function(nodeId)
{
if (!nodeId)
return null;
return InjectedScriptHost.nodeForId(nodeId);
},
_objectForId: function(objectId)
{
return this._idToWrappedObject[objectId.id];
},
resolveNode: function(nodeId)
{
var node = this._nodeForId(nodeId);
if (!node)
return false;
return this._wrapObject(node, "prototype");
},
getNodeProperties: function(nodeId, properties)
{
var node = this._nodeForId(nodeId);
if (!node)
return false;
properties = eval("(" + properties + ")");
var result = {};
for (var i = 0; i < properties.length; ++i)
result[properties[i]] = node[properties[i]];
return result;
},
getNodePrototypes: function(nodeId)
{
this.releaseWrapperObjectGroup("prototypes");
var node = this._nodeForId(nodeId);
if (!node)
return false;
var result = [];
var prototype = node;
do {
result.push(this._wrapObject(prototype, "prototypes"));
prototype = Object.getPrototypeOf(prototype);
} while (prototype)
return result;
},
pushNodeToFrontend: function(objectId)
{
var parsedObjectId = this._parseObjectId(objectId);
var object = this._objectForId(parsedObjectId);
if (!object || this._type(object) !== "node")
return false;
return InjectedScriptHost.pushNodePathToFrontend(object, false, false);
},
evaluateOnSelf: function(funcBody, args)
{
var func = eval("(" + funcBody + ")");
return func.apply(this, eval("(" + args + ")") || []);
},
_isDefined: function(object)
{
return object || this._isHTMLAllCollection(object);
},
_isHTMLAllCollection: function(object)
{
return (typeof object === "undefined") && inspectedWindow.HTMLAllCollection && object instanceof inspectedWindow.HTMLAllCollection;
},
_type: function(obj)
{
if (obj === null)
return "null";
var type = typeof obj;
if (type !== "object" && type !== "function") {
if (this._isHTMLAllCollection(obj))
return "array";
return type;
}
if (!inspectedWindow.document)
return type;
if (obj instanceof inspectedWindow.Node) {
try {
return (obj.nodeType === undefined ? type : "node");
} catch (ex) {} 
return obj.toString();
}
if (obj instanceof inspectedWindow.String)
return "string";
if (obj instanceof inspectedWindow.Array)
return "array";
if (obj instanceof inspectedWindow.Boolean)
return "boolean";
if (obj instanceof inspectedWindow.Number)
return "number";
if (obj instanceof inspectedWindow.Date)
return "date";
if (obj instanceof inspectedWindow.RegExp)
return "regexp";
if (isFinite(obj.length) && typeof obj.splice === "function")
return "array";
if (isFinite(obj.length) && typeof obj.callee === "function") 
return "array";
if (obj instanceof inspectedWindow.NodeList)
return "array";
if (obj instanceof inspectedWindow.HTMLCollection)
return "array";
if (obj instanceof inspectedWindow.Error)
return "error";
return type;
},
_describe: function(obj, abbreviated)
{
var type = this._type(obj);
switch (type) {
case "object":
case "node":
var result = InjectedScriptHost.internalConstructorName(obj);
if (result === "Object") {
var constructorName = obj.constructor && obj.constructor.name;
if (constructorName)
return constructorName;
}
return result;
case "array":
var className = InjectedScriptHost.internalConstructorName(obj);
if (typeof obj.length === "number")
className += "[" + obj.length + "]";
return className;
case "string":
if (!abbreviated)
return obj;
if (obj.length > 100)
return "\"" + obj.substring(0, 100) + "\u2026\"";
return "\"" + obj + "\"";
case "function":
var objectText = this._toString(obj);
if (abbreviated)
objectText = /.*/.exec(objectText)[0].replace(/ +$/g, "");
return objectText;
default:
return this._toString(obj);
}
},
_toString: function(obj)
{
return "" + obj;
}
}
var injectedScript = new InjectedScript();
InjectedScript.RemoteObject = function(objectId, type, description, hasChildren)
{
this.objectId = objectId;
this.type = type;
this.description = description;
this.hasChildren = hasChildren;
}
InjectedScript.RemoteObject.fromException = function(e)
{
return new InjectedScript.RemoteObject(null, "error", e.toString());
}
InjectedScript.RemoteObject.fromObject = function(object, objectId, abbreviate)
{
var type = injectedScript._type(object);
var rawType = typeof object;
var hasChildren = (rawType === "object" && object !== null && (Object.getOwnPropertyNames(object).length || !!Object.getPrototypeOf(object))) || rawType === "function";
var description = "";
try {
var description = injectedScript._describe(object, abbreviate);
return new InjectedScript.RemoteObject(objectId, type, description, hasChildren);
} catch (e) {
return InjectedScript.RemoteObject.fromException(e);
}
}
InjectedScript.CallFrameProxy = function(ordinal, callFrame)
{
this.id = { ordinal: ordinal, injectedScriptId: injectedScriptId };
this.type = callFrame.type;
this.functionName = (this.type === "function" ? callFrame.functionName : "");
this.sourceID = callFrame.sourceID;
this.line = callFrame.line;
this.column = callFrame.column;
this.scopeChain = this._wrapScopeChain(callFrame);
}
InjectedScript.CallFrameProxy.prototype = {
_wrapScopeChain: function(callFrame)
{
var GLOBAL_SCOPE = 0;
var LOCAL_SCOPE = 1;
var WITH_SCOPE = 2;
var CLOSURE_SCOPE = 3;
var CATCH_SCOPE = 4;
var scopeChain = callFrame.scopeChain;
var scopeChainProxy = [];
var foundLocalScope = false;
for (var i = 0; i < scopeChain.length; i++) {
var scopeType = callFrame.scopeType(i);
var scopeObject = scopeChain[i];
var scopeObjectProxy = injectedScript._wrapObject(scopeObject, "backtrace", true);
switch(scopeType) {
case LOCAL_SCOPE: {
foundLocalScope = true;
scopeObjectProxy.isLocal = true;
scopeObjectProxy.thisObject = injectedScript._wrapObject(callFrame.thisObject, "backtrace", true);
break;
}
case CLOSURE_SCOPE: {
scopeObjectProxy.isClosure = true;
break;
}
case WITH_SCOPE:
case CATCH_SCOPE: {
if (foundLocalScope && scopeObject instanceof inspectedWindow.Element)
scopeObjectProxy.isElement = true;
else if (foundLocalScope && scopeObject instanceof inspectedWindow.Document)
scopeObjectProxy.isDocument = true;
else
scopeObjectProxy.isWithBlock = true;
break;
}
}
scopeChainProxy.push(scopeObjectProxy);
}
return scopeChainProxy;
}
}
function CommandLineAPI(commandLineAPIImpl, callFrame)
{
function inScopeVariables(member)
{
if (!callFrame)
return false;
var scopeChain = callFrame.scopeChain;
for (var i = 0; i < scopeChain.length; ++i) {
if (member in scopeChain[i])
return true;
}
return false;
}
for (var i = 0; i < CommandLineAPI.members_.length; ++i) {
var member = CommandLineAPI.members_[i];
if (member in inspectedWindow || inScopeVariables(member))
continue;
this[member] = bind(commandLineAPIImpl, commandLineAPIImpl[member]);
}
for (var i = 0; i < 5; ++i) {
var member = "$" + i;
if (member in inspectedWindow || inScopeVariables(member))
continue;
Object.defineProperty(this, "$" + i, {
get: bind(commandLineAPIImpl, commandLineAPIImpl._inspectedNode, i)
});
}
}
CommandLineAPI.members_ = [
"$", "$$", "$x", "dir", "dirxml", "keys", "values", "profile", "profileEnd",
"monitorEvents", "unmonitorEvents", "inspect", "copy", "clear"
];
function CommandLineAPIImpl()
{
}
CommandLineAPIImpl.prototype = {
$: function()
{
return document.getElementById.apply(document, arguments)
},
$$: function()
{
return document.querySelectorAll.apply(document, arguments)
},
$x: function(xpath, context)
{
var nodes = [];
try {
var doc = (context && context.ownerDocument) || inspectedWindow.document;
var results = doc.evaluate(xpath, context || doc, null, XPathResult.ANY_TYPE, null);
var node;
while (node = results.iterateNext())
nodes.push(node);
} catch (e) {
}
return nodes;
},
dir: function()
{
return console.dir.apply(console, arguments)
},
dirxml: function()
{
return console.dirxml.apply(console, arguments)
},
keys: function(object)
{
return Object.keys(object);
},
values: function(object)
{
var result = [];
for (var key in object)
result.push(object[key]);
return result;
},
profile: function()
{
return console.profile.apply(console, arguments)
},
profileEnd: function()
{
return console.profileEnd.apply(console, arguments)
},
monitorEvents: function(object, types)
{
if (!object || !object.addEventListener || !object.removeEventListener)
return;
types = this._normalizeEventTypes(types);
for (var i = 0; i < types.length; ++i) {
object.removeEventListener(types[i], this._logEvent, false);
object.addEventListener(types[i], this._logEvent, false);
}
},
unmonitorEvents: function(object, types)
{
if (!object || !object.addEventListener || !object.removeEventListener)
return;
types = this._normalizeEventTypes(types);
for (var i = 0; i < types.length; ++i)
object.removeEventListener(types[i], this._logEvent, false);
},
inspect: function(object)
{
if (arguments.length === 0)
return;
inspectedWindow.console.log(object);
if (injectedScript._type(object) === "node")
InjectedScriptHost.pushNodePathToFrontend(object, false, true);
else {
switch (injectedScript._describe(object)) {
case "Database":
InjectedScriptHost.selectDatabase(object);
break;
case "Storage":
InjectedScriptHost.selectDOMStorage(object);
break;
}
}
},
copy: function(object)
{
if (injectedScript._type(object) === "node")
object = object.outerHTML;
InjectedScriptHost.copyText(object);
},
clear: function()
{
InjectedScriptHost.clearConsoleMessages();
},
_inspectedNode: function(num)
{
var nodeId = InjectedScriptHost.inspectedNode(num);
return injectedScript._nodeForId(nodeId);
},
_normalizeEventTypes: function(types)
{
if (typeof types === "undefined")
types = [ "mouse", "key", "load", "unload", "abort", "error", "select", "change", "submit", "reset", "focus", "blur", "resize", "scroll" ];
else if (typeof types === "string")
types = [ types ];
var result = [];
for (var i = 0; i < types.length; i++) {
if (types[i] === "mouse")
result.splice(0, 0, "mousedown", "mouseup", "click", "dblclick", "mousemove", "mouseover", "mouseout");
else if (types[i] === "key")
result.splice(0, 0, "keydown", "keyup", "keypress");
else
result.push(types[i]);
}
return result;
},
_logEvent: function(event)
{
console.log(event.type, event);
}
}
injectedScript._commandLineAPIImpl = new CommandLineAPIImpl();
return injectedScript;
})
;
// weinre/target/InjectedScriptHostImpl.amd.js
;modjewel.define("weinre/target/InjectedScriptHostImpl", function(require, exports, module) { 
var InjectedScriptHostImpl, Weinre;
Weinre = require('../common/Weinre');
module.exports = InjectedScriptHostImpl = (function() {
function InjectedScriptHostImpl() {}
InjectedScriptHostImpl.prototype.clearConsoleMessages = function(callback) {
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
InjectedScriptHostImpl.prototype.nodeForId = function(nodeId, callback) {
return Weinre.nodeStore.getNode(nodeId);
};
InjectedScriptHostImpl.prototype.pushNodePathToFrontend = function(node, withChildren, selectInUI, callback) {
var children, nodeId;
nodeId = Weinre.nodeStore.getNodeId(node);
children = Weinre.nodeStore.serializeNode(node, 1);
Weinre.wi.DOMNotify.setChildNodes(nodeId, children);
if (callback) {
Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
if (selectInUI) {
return Weinre.wi.InspectorNotify.updateFocusedNode(nodeId);
}
};
InjectedScriptHostImpl.prototype.inspectedNode = function(num, callback) {
var nodeId;
nodeId = Weinre.nodeStore.getInspectedNode(num);
return nodeId;
};
InjectedScriptHostImpl.prototype.internalConstructorName = function(object) {
var ctor, ctorName, match, pattern;
ctor = object.constructor;
ctorName = ctor.fullClassName || ctor.displayName || ctor.name;
if (ctorName && (ctorName !== "Object")) {
return ctorName;
}
pattern = /\[object (.*)\]/;
match = pattern.exec(object.toString());
if (match) {
return match[1];
}
return "Object";
};
return InjectedScriptHostImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/NetworkRequest.amd.js
;modjewel.define("weinre/target/NetworkRequest", function(require, exports, module) { 
var Ex, HookLib, HookSites, IDGenerator, Loader, NetworkRequest, StackTrace, Weinre, getFormData, getHeaders, getRequest, getResponse, getXhrEventHandler, splitContentType, trim;
StackTrace = require('../common/StackTrace');
IDGenerator = require('../common/IDGenerator');
HookLib = require('../common/HookLib');
Weinre = require('../common/Weinre');
Ex = require('../common/Ex');
HookSites = require('./HookSites');
Loader = {
url: window.location.href,
frameId: 0,
loaderId: 0
};
module.exports = NetworkRequest = (function() {
function NetworkRequest(xhr, id, method, url, stackTrace) {
this.xhr = xhr;
this.id = id;
this.method = method;
this.url = url;
this.stackTrace = stackTrace;
}
NetworkRequest.prototype.handleSend = function(data) {
var redirectResponse, request, time;
Weinre.wi.NetworkNotify.identifierForInitialRequest(this.id, this.url, Loader, this.stackTrace);
time = Date.now() / 1000.0;
request = getRequest(this.url, this.method, this.xhr, data);
redirectResponse = {
isNull: true
};
return Weinre.wi.NetworkNotify.willSendRequest(this.id, time, request, redirectResponse);
};
NetworkRequest.prototype.handleHeadersReceived = function() {
var response, time;
time = Date.now() / 1000.0;
response = getResponse(this.xhr);
return Weinre.wi.NetworkNotify.didReceiveResponse(this.id, time, "XHR", response);
};
NetworkRequest.prototype.handleLoading = function() {};
NetworkRequest.prototype.handleDone = function() {
var description, e, sourceString, status, statusText, success, time;
sourceString = "";
try {
sourceString = this.xhr.responseText;
} catch (_error) {
e = _error;
}
Weinre.wi.NetworkNotify.setInitialContent(this.id, sourceString, "XHR");
time = Date.now() / 1000.0;
status = this.xhr.status;
if (status === 0) {
status = 200;
}
statusText = this.xhr.statusText;
success = status >= 200 && status < 300;
if (success) {
return Weinre.wi.NetworkNotify.didFinishLoading(this.id, time);
} else {
description = "" + status + " - " + statusText;
return Weinre.wi.NetworkNotify.didFailLoading(this.id, time, description);
}
};
NetworkRequest.installNativeHooks = function() {
HookSites.XMLHttpRequest_open.addHooks({
before: function(receiver, args) {
var frame, id, method, rawStackTrace, stackTrace, url, xhr, _i, _len;
xhr = receiver;
method = args[0];
url = args[1];
id = IDGenerator.next();
rawStackTrace = new StackTrace(args).trace.slice(1);
stackTrace = [];
for (_i = 0, _len = rawStackTrace.length; _i < _len; _i++) {
frame = rawStackTrace[_i];
stackTrace.push({
functionName: frame
});
}
xhr.__weinreNetworkRequest__ = new NetworkRequest(xhr, id, method, url, stackTrace);
return HookLib.ignoreHooks(function() {
return xhr.addEventListener("readystatechange", getXhrEventHandler(xhr), false);
});
}
});
return HookSites.XMLHttpRequest_send.addHooks({
before: function(receiver, args) {
var data, nr, xhr;
xhr = receiver;
data = args[0];
nr = xhr.__weinreNetworkRequest__;
if (!nr) {
return;
}
return nr.handleSend(data);
}
});
};
return NetworkRequest;
})();
getRequest = function(url, method, xhr, data) {
return {
url: url,
httpMethod: method,
httpHeaderFields: {},
requestFormData: getFormData(url, data)
};
};
getResponse = function(xhr) {
var contentLength, contentType, encoding, headers, result, _ref;
contentType = xhr.getResponseHeader("Content-Type");
contentType || (contentType = 'application/octet-stream');
_ref = splitContentType(contentType), contentType = _ref[0], encoding = _ref[1];
headers = getHeaders(xhr);
result = {
mimeType: contentType,
textEncodingName: encoding,
httpStatusCode: xhr.status,
httpStatusText: xhr.statusText,
httpHeaderFields: headers,
connectionReused: false,
connectionID: 0,
wasCached: false
};
contentLength = xhr.getResponseHeader("Content-Length");
contentLength = parseInt(contentLength);
if (!isNaN(contentLength)) {
result.expectedContentLength = contentLength;
}
return result;
};
getHeaders = function(xhr) {
var key, line, lines, result, string, val, _i, _len, _ref;
string = xhr.getAllResponseHeaders();
lines = string.split('\r\n');
result = {};
for (_i = 0, _len = lines.length; _i < _len; _i++) {
line = lines[_i];
line = trim(line);
if (line === "") {
break;
}
_ref = line.split(':', 2), key = _ref[0], val = _ref[1];
result[trim(key)] = trim(val);
}
return result;
};
trim = function(string) {
return string.replace(/^\s+|\s+$/g, '');
};
getFormData = function(url, data) {
var match, pattern;
if (data) {
return data;
}
pattern = /.*?\?(.*?)(#.*)?$/;
match = url.match(pattern);
if (match) {
return match[1];
}
return "";
};
splitContentType = function(contentType) {
var match, pattern;
pattern = /\s*(.*?)\s*(;\s*(.*))?\s*$/;
match = contentType.match(pattern);
if (!match) {
return [contentType, ""];
}
return [match[1], match[3]];
};
getXhrEventHandler = function(xhr) {
return function() {
var e, nr;
nr = xhr.__weinreNetworkRequest__;
if (!nr) {
return;
}
try {
switch (xhr.readyState) {
case 2:
return nr.handleHeadersReceived();
case 3:
return nr.handleLoading();
case 4:
return nr.handleDone();
}
} catch (_error) {
e = _error;
}
};
};
});

;
// weinre/target/NodeStore.amd.js
;modjewel.define("weinre/target/NodeStore", function(require, exports, module) { 
var Debug, IDGenerator, NodeStore, Weinre, handleDOMAttrModified, handleDOMCharacterDataModified, handleDOMNodeInserted, handleDOMNodeRemoved, handleDOMSubtreeModified;
Weinre = require('../common/Weinre');
IDGenerator = require('../common/IDGenerator');
Debug = require('../common/Debug');
module.exports = NodeStore = (function() {
function NodeStore() {
this._nodeMap = {};
this._childrenSent = {};
this._inspectedNodes = [];
document.addEventListener("DOMSubtreeModified", handleDOMSubtreeModified, false);
document.addEventListener("DOMNodeInserted", handleDOMNodeInserted, false);
document.addEventListener("DOMNodeRemoved", handleDOMNodeRemoved, false);
document.addEventListener("DOMAttrModified", handleDOMAttrModified, false);
document.addEventListener("DOMCharacterDataModified", handleDOMCharacterDataModified, false);
}
NodeStore.prototype.addInspectedNode = function(nodeId) {
this._inspectedNodes.unshift(nodeId);
if (this._inspectedNodes.length > 5) {
return this._inspectedNodes = this._inspectedNodes.slice(0, 5);
}
};
NodeStore.prototype.getInspectedNode = function(index) {
return this._inspectedNodes[index];
};
NodeStore.prototype.getNode = function(nodeId) {
return this._nodeMap[nodeId];
};
NodeStore.prototype.checkNodeId = function(node) {
return IDGenerator.checkId(node);
};
NodeStore.prototype.getNodeId = function(node) {
var id;
id = this.checkNodeId(node);
if (id) {
return id;
}
return IDGenerator.getId(node, this._nodeMap);
};
NodeStore.prototype.getNodeData = function(nodeId, depth) {
return this.serializeNode(this.getNode(nodeId), depth);
};
NodeStore.prototype.getPreviousSiblingId = function(node) {
var id, sib;
while (true) {
sib = node.previousSibling;
if (!sib) {
return 0;
}
id = this.checkNodeId(sib);
if (id) {
return id;
}
node = sib;
}
};
NodeStore.prototype.nextNodeId = function() {
return "" + IDGenerator.next();
};
NodeStore.prototype.serializeNode = function(node, depth) {
var children, i, id, localName, nodeData, nodeName, nodeValue;
nodeName = "";
nodeValue = null;
localName = null;
id = this.getNodeId(node);
switch (node.nodeType) {
case Node.TEXT_NODE:
case Node.COMMENT_NODE:
case Node.CDATA_SECTION_NODE:
nodeValue = node.nodeValue;
break;
case Node.ATTRIBUTE_NODE:
localName = node.localName;
break;
case Node.DOCUMENT_FRAGMENT_NODE:
break;
default:
nodeName = node.nodeName;
localName = node.localName;
}
nodeData = {
id: id,
nodeType: node.nodeType,
nodeName: nodeName,
localName: localName,
nodeValue: nodeValue
};
if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
nodeData.childNodeCount = this.childNodeCount(node);
children = this.serializeNodeChildren(node, depth);
if (children.length) {
nodeData.children = children;
}
if (node.nodeType === Node.ELEMENT_NODE) {
nodeData.attributes = [];
i = 0;
while (i < node.attributes.length) {
nodeData.attributes.push(node.attributes[i].nodeName);
nodeData.attributes.push(node.attributes[i].nodeValue);
i++;
}
} else {
if (node.nodeType === Node.DOCUMENT_NODE) {
nodeData.documentURL = window.location.href;
}
}
} else if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
nodeData.publicId = node.publicId;
nodeData.systemId = node.systemId;
nodeData.internalSubset = node.internalSubset;
} else if (node.nodeType === Node.ATTRIBUTE_NODE) {
nodeData.name = node.nodeName;
nodeData.value = node.nodeValue;
}
return nodeData;
};
NodeStore.prototype.serializeNodeChildren = function(node, depth) {
var childIds, childNode, i, result;
result = [];
childIds = this.childNodeIds(node);
if (depth === 0) {
if (childIds.length === 1) {
childNode = this.getNode(childIds[0]);
if (childNode.nodeType === Node.TEXT_NODE) {
result.push(this.serializeNode(childNode));
}
}
return result;
}
depth--;
i = 0;
while (i < childIds.length) {
result.push(this.serializeNode(this.getNode(childIds[i]), depth));
i++;
}
return result;
};
NodeStore.prototype.childNodeCount = function(node) {
return this.childNodeIds(node).length;
};
NodeStore.prototype.childNodeIds = function(node) {
var childNode, i, ids, _i, _len, _ref;
ids = [];
i = 0;
_ref = node.childNodes;
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
childNode = _ref[_i];
if (this.isToBeSkipped(childNode)) {
continue;
}
ids.push(this.getNodeId(childNode));
}
return ids;
};
NodeStore.prototype.isToBeSkipped = function(node) {
if (!node) {
return true;
}
if (node.__weinreHighlighter) {
return true;
}
if (node.nodeType !== Node.TEXT_NODE) {
return false;
}
return !!node.nodeValue.match(/^\s*$/);
};
return NodeStore;
})();
handleDOMSubtreeModified = function(event) {
if (!event.attrChange) {
return;
}
return NodeStore.handleDOMAttrModified(event);
};
handleDOMNodeInserted = function(event) {
var child, parentId, previous, targetId;
targetId = Weinre.nodeStore.checkNodeId(event.target);
parentId = Weinre.nodeStore.checkNodeId(event.relatedNode);
if (!parentId) {
return;
}
child = Weinre.nodeStore.serializeNode(event.target, 0);
previous = Weinre.nodeStore.getPreviousSiblingId(event.target);
return Weinre.wi.DOMNotify.childNodeInserted(parentId, previous, child);
};
handleDOMNodeRemoved = function(event) {
var childCount, parentId, targetId;
targetId = Weinre.nodeStore.checkNodeId(event.target);
parentId = Weinre.nodeStore.checkNodeId(event.relatedNode);
if (!parentId) {
return;
}
if (targetId) {
if (parentId) {
return Weinre.wi.DOMNotify.childNodeRemoved(parentId, targetId);
}
} else {
childCount = Weinre.nodeStore.childNodeCount(event.relatedNode);
return Weinre.wi.DOMNotify.childNodeCountUpdated(parentId, childCount);
}
};
handleDOMAttrModified = function(event) {
var attrs, i, targetId;
targetId = Weinre.nodeStore.checkNodeId(event.target);
if (!targetId) {
return;
}
attrs = [];
i = 0;
while (i < event.target.attributes.length) {
attrs.push(event.target.attributes[i].name);
attrs.push(event.target.attributes[i].value);
i++;
}
return Weinre.wi.DOMNotify.attributesUpdated(targetId, attrs);
};
handleDOMCharacterDataModified = function(event) {
var targetId;
targetId = Weinre.nodeStore.checkNodeId(event.target);
if (!targetId) {
return;
}
return Weinre.wi.DOMNotify.characterDataModified(targetId, event.newValue);
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/SqlStepper.amd.js
;modjewel.define("weinre/target/SqlStepper", function(require, exports, module) { 
var Binding, SqlStepper, executeSql, ourErrorCallback, runStep;
Binding = require('../common/Binding');
module.exports = SqlStepper = (function() {
function SqlStepper(steps) {
var context;
if (!(this instanceof SqlStepper)) {
return new SqlStepper(steps);
}
this.__context = {};
context = this.__context;
context.steps = steps;
}
SqlStepper.prototype.run = function(db, errorCallback) {
var context;
context = this.__context;
if (context.hasBeenRun) {
throw new Ex(arguments, "stepper has already been run");
}
context.hasBeenRun = true;
context.db = db;
context.errorCallback = errorCallback;
context.nextStep = 0;
context.ourErrorCallback = new Binding(this, ourErrorCallback);
context.runStep = new Binding(this, runStep);
this.executeSql = new Binding(this, executeSql);
return db.transaction(context.runStep);
};
SqlStepper.example = function(db, id) {
var errorCb, step1, step2, stepper;
step1 = function() {
return this.executeSql("SELECT name FROM sqlite_master WHERE type='table'");
};
step2 = function(resultSet) {
var i, name, result, rows;
rows = resultSet.rows;
result = [];
i = 0;
while (i < rows.length) {
name = rows.item(i).name;
if (name === "__WebKitDatabaseInfoTable__") {
i++;
continue;
}
result.push(name);
i++;
}
return console.log(("[" + this.id + "] table names: ") + result.join(", "));
};
errorCb = function(sqlError) {
return console.log(("[" + this.id + "] sql error:" + sqlError.code + ": ") + sqlError.message);
};
stepper = new SqlStepper([step1, step2]);
stepper.id = id;
return stepper.run(db, errorCb);
};
return SqlStepper;
})();
executeSql = function(statement, data) {
var context;
context = this.__context;
return context.tx.executeSql(statement, data, context.runStep, context.ourErrorCallback);
};
ourErrorCallback = function(tx, sqlError) {
var context;
context = this.__context;
return context.errorCallback.call(this, sqlError);
};
runStep = function(tx, resultSet) {
var context, step;
context = this.__context;
if (context.nextStep >= context.steps.length) {
return;
}
context.tx = tx;
context.currentStep = context.nextStep;
context.nextStep++;
step = context.steps[context.currentStep];
return step.call(this, resultSet);
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/Target.amd.js
;modjewel.define("weinre/target/Target", function(require, exports, module) { 
var Binding, CSSStore, Callback, CheckForProblems, ElementHighlighter, Ex, HookLib, InjectedScriptHostImpl, MessageDispatcher, NetworkRequest, NodeStore, Target, Weinre, WeinreExtraClientCommandsImpl, WeinreTargetEventsImpl, WiCSSImpl, WiConsoleImpl, WiDOMImpl, WiDOMStorageImpl, WiDatabaseImpl, WiInspectorImpl, WiRuntimeImpl, currentTime;
require('./BrowserHacks');
Ex = require('../common/Ex');
Binding = require('../common/Binding');
Callback = require('../common/Callback');
MessageDispatcher = require('../common/MessageDispatcher');
Weinre = require('../common/Weinre');
HookLib = require('../common/HookLib');
CheckForProblems = require('./CheckForProblems');
NodeStore = require('./NodeStore');
CSSStore = require('./CSSStore');
ElementHighlighter = require('./ElementHighlighter');
InjectedScriptHostImpl = require('./InjectedScriptHostImpl');
NetworkRequest = require('./NetworkRequest');
WeinreTargetEventsImpl = require('./WeinreTargetEventsImpl');
WeinreExtraClientCommandsImpl = require('./WeinreExtraClientCommandsImpl');
WiConsoleImpl = require('./WiConsoleImpl');
WiCSSImpl = require('./WiCSSImpl');
WiDatabaseImpl = require('./WiDatabaseImpl');
WiDOMImpl = require('./WiDOMImpl');
WiDOMStorageImpl = require('./WiDOMStorageImpl');
WiInspectorImpl = require('./WiInspectorImpl');
WiRuntimeImpl = require('./WiRuntimeImpl');
module.exports = Target = (function() {
function Target() {}
Target.main = function() {
CheckForProblems.check();
Weinre.target = new Target();
return Weinre.target.initialize();
};
Target.prototype.setWeinreServerURLFromScriptSrc = function(element) {
var match, message, pattern;
if (window.WeinreServerURL) {
return;
}
if (element) {
pattern = /((https?:)?\/\/(.*?)\/)/;
match = pattern.exec(element.src);
if (match) {
window.WeinreServerURL = match[1];
return;
}
}
message = "unable to calculate the weinre server url; explicity set the variable window.WeinreServerURL instead";
alert(message);
throw new Ex(arguments, message);
};
Target.prototype.setWeinreServerIdFromScriptSrc = function(element) {
var attempt, hash;
if (window.WeinreServerId) {
return;
}
element = this.getTargetScriptElement();
hash = "anonymous";
if (element) {
attempt = element.src.split("#")[1];
if (attempt) {
hash = attempt;
} else {
attempt = location.hash.split("#")[1];
if (attempt) {
hash = attempt;
}
}
}
return window.WeinreServerId = hash;
};
Target.prototype.getTargetScriptElement = function() {
var element, elements, i, j, scripts;
elements = document.getElementsByTagName("script");
scripts = ["target-script.js", "target-script-min.js"];
i = 0;
while (i < elements.length) {
element = elements[i];
j = 0;
while (j < scripts.length) {
if (-1 !== element.src.indexOf("/" + scripts[j])) {
return element;
}
j++;
}
i++;
}
};
Target.prototype.initialize = function() {
var element, injectedScriptHost, messageDispatcher;
element = this.getTargetScriptElement();
this.setWeinreServerURLFromScriptSrc(element);
this.setWeinreServerIdFromScriptSrc(element);
if (window.WeinreServerURL[window.WeinreServerURL.length - 1] !== "/") {
window.WeinreServerURL += "/";
}
injectedScriptHost = new InjectedScriptHostImpl();
Weinre.injectedScript = injectedScriptConstructor(injectedScriptHost, window, 0, "?");
window.addEventListener("load", Binding(this, "onLoaded"), false);
document.addEventListener("DOMContentLoaded", Binding(this, "onDOMContent"), false);
this._startTime = currentTime();
if (document.readyState === "loaded") {
HookLib.ignoreHooks((function(_this) {
return function() {
return setTimeout((function() {
return _this.onDOMContent();
}), 10);
};
})(this));
}
if (document.readyState === "complete") {
HookLib.ignoreHooks((function(_this) {
return function() {
setTimeout((function() {
return _this.onDOMContent();
}), 10);
return setTimeout((function() {
return _this.onLoaded();
}), 20);
};
})(this));
}
messageDispatcher = new MessageDispatcher(window.WeinreServerURL + "ws/target", window.WeinreServerId);
Weinre.messageDispatcher = messageDispatcher;
Weinre.wi = {};
Weinre.wi.Console = new WiConsoleImpl();
Weinre.wi.CSS = new WiCSSImpl();
Weinre.wi.Database = new WiDatabaseImpl();
Weinre.wi.DOM = new WiDOMImpl();
Weinre.wi.DOMStorage = new WiDOMStorageImpl();
Weinre.wi.Inspector = new WiInspectorImpl();
Weinre.wi.Runtime = new WiRuntimeImpl();
messageDispatcher.registerInterface("Console", Weinre.wi.Console, false);
messageDispatcher.registerInterface("CSS", Weinre.wi.CSS, false);
messageDispatcher.registerInterface("Database", Weinre.wi.Database, false);
messageDispatcher.registerInterface("DOM", Weinre.wi.DOM, false);
messageDispatcher.registerInterface("DOMStorage", Weinre.wi.DOMStorage, false);
messageDispatcher.registerInterface("Inspector", Weinre.wi.Inspector, false);
messageDispatcher.registerInterface("Runtime", Weinre.wi.Runtime, false);
messageDispatcher.registerInterface("WeinreExtraClientCommands", new WeinreExtraClientCommandsImpl(), true);
messageDispatcher.registerInterface("WeinreTargetEvents", new WeinreTargetEventsImpl(), true);
Weinre.wi.ApplicationCacheNotify = messageDispatcher.createProxy("ApplicationCacheNotify");
Weinre.wi.ConsoleNotify = messageDispatcher.createProxy("ConsoleNotify");
Weinre.wi.DOMNotify = messageDispatcher.createProxy("DOMNotify");
Weinre.wi.DOMStorageNotify = messageDispatcher.createProxy("DOMStorageNotify");
Weinre.wi.DatabaseNotify = messageDispatcher.createProxy("DatabaseNotify");
Weinre.wi.InspectorNotify = messageDispatcher.createProxy("InspectorNotify");
Weinre.wi.TimelineNotify = messageDispatcher.createProxy("TimelineNotify");
Weinre.wi.NetworkNotify = messageDispatcher.createProxy("NetworkNotify");
Weinre.WeinreTargetCommands = messageDispatcher.createProxy("WeinreTargetCommands");
Weinre.WeinreExtraTargetEvents = messageDispatcher.createProxy("WeinreExtraTargetEvents");
messageDispatcher.getWebSocket().addEventListener("open", Binding(this, this.cb_webSocketOpened));
Weinre.nodeStore = new NodeStore();
Weinre.cssStore = new CSSStore();
return NetworkRequest.installNativeHooks();
};
Target.prototype.cb_webSocketOpened = function() {
return Weinre.WeinreTargetCommands.registerTarget(window.location.href, Binding(this, this.cb_registerTarget));
};
Target.prototype.cb_registerTarget = function(targetDescription) {
return Weinre.targetDescription = targetDescription;
};
Target.prototype.onLoaded = function() {
if (!Weinre.wi.InspectorNotify) {
HookLib.ignoreHooks((function(_this) {
return function() {
return setTimeout((function() {
return _this.onLoaded();
}), 10);
};
})(this));
return;
}
return Weinre.wi.InspectorNotify.loadEventFired(currentTime() - this._startTime);
};
Target.prototype.onDOMContent = function() {
if (!Weinre.wi.InspectorNotify) {
HookLib.ignoreHooks((function(_this) {
return function() {
return setTimeout((function() {
return _this.onDOMContent();
}), 10);
};
})(this));
return;
}
return Weinre.wi.InspectorNotify.domContentEventFired(currentTime() - this._startTime);
};
Target.prototype.setDocument = function() {
var nodeData, nodeId;
if (!Weinre.elementHighlighter) {
Weinre.elementHighlighter = ElementHighlighter.create();
}
nodeId = Weinre.nodeStore.getNodeId(document);
nodeData = Weinre.nodeStore.getNodeData(nodeId, 2);
return Weinre.wi.DOMNotify.setDocument(nodeData);
};
Target.prototype.whenBodyReady = function(receiver, args, func) {
if (document.body) {
func.apply(receiver, args);
return;
}
return document.addEventListener("DOMContentLoaded", function() {
return func.apply(receiver, args);
}, false);
};
return Target;
})();
currentTime = function() {
return (new Date().getMilliseconds()) / 1000.0;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/Timeline.amd.js
;modjewel.define("weinre/target/Timeline", function(require, exports, module) { 
var Ex, HookLib, HookSites, IDGenerator, Running, StackTrace, Timeline, TimelineRecordType, TimerIntervals, TimerTimeouts, Weinre, addStackTrace, addTimer, getXhrEventHandler, instrumentedTimerCode, removeTimer;
Ex = require('../common/Ex');
Weinre = require('../common/Weinre');
IDGenerator = require('../common/IDGenerator');
StackTrace = require('../common/StackTrace');
HookLib = require('../common/HookLib');
HookSites = require('./HookSites');
Running = false;
TimerTimeouts = {};
TimerIntervals = {};
TimelineRecordType = {
EventDispatch: 0,
Layout: 1,
RecalculateStyles: 2,
Paint: 3,
ParseHTML: 4,
TimerInstall: 5,
TimerRemove: 6,
TimerFire: 7,
XHRReadyStateChange: 8,
XHRLoad: 9,
EvaluateScript: 10,
Mark: 11,
ResourceSendRequest: 12,
ResourceReceiveResponse: 13,
ResourceFinish: 14,
FunctionCall: 15,
ReceiveResourceData: 16,
GCEvent: 17,
MarkDOMContent: 18,
MarkLoad: 19,
ScheduleResourceRequest: 20
};
module.exports = Timeline = (function() {
function Timeline() {}
Timeline.start = function() {
return Running = true;
};
Timeline.stop = function() {
return Running = false;
};
Timeline.isRunning = function() {
return Running;
};
Timeline.addRecord_Mark = function(message) {
var record;
if (!Timeline.isRunning()) {
return;
}
record = {};
record.type = TimelineRecordType.Mark;
record.category = {
name: "scripting"
};
record.startTime = Date.now();
record.data = {
message: message
};
addStackTrace(record, 3);
return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
};
Timeline.addRecord_EventDispatch = function(event, name, category) {
var record;
if (!Timeline.isRunning()) {
return;
}
if (!category) {
category = "scripting";
}
record = {};
record.type = TimelineRecordType.EventDispatch;
record.category = {
name: category
};
record.startTime = Date.now();
record.data = {
type: event.type
};
return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
};
Timeline.addRecord_TimerInstall = function(id, timeout, singleShot) {
var record;
if (!Timeline.isRunning()) {
return;
}
record = {};
record.type = TimelineRecordType.TimerInstall;
record.category = {
name: "scripting"
};
record.startTime = Date.now();
record.data = {
timerId: id,
timeout: timeout,
singleShot: singleShot
};
addStackTrace(record, 4);
return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
};
Timeline.addRecord_TimerRemove = function(id, timeout, singleShot) {
var record;
if (!Timeline.isRunning()) {
return;
}
record = {};
record.type = TimelineRecordType.TimerRemove;
record.category = {
name: "scripting"
};
record.startTime = Date.now();
record.data = {
timerId: id,
timeout: timeout,
singleShot: singleShot
};
addStackTrace(record, 4);
return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
};
Timeline.addRecord_TimerFire = function(id, timeout, singleShot) {
var record;
if (!Timeline.isRunning()) {
return;
}
record = {};
record.type = TimelineRecordType.TimerFire;
record.category = {
name: "scripting"
};
record.startTime = Date.now();
record.data = {
timerId: id,
timeout: timeout,
singleShot: singleShot
};
return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
};
Timeline.addRecord_XHRReadyStateChange = function(method, url, id, xhr) {
var contentLength, contentType, e, record;
if (!Timeline.isRunning()) {
return;
}
try {
contentLength = xhr.getResponseHeader("Content-Length");
contentLength = parseInt(contentLength);
contentType = xhr.getResponseHeader("Content-Type");
} catch (_error) {
e = _error;
contentLength = 0;
contentType = "unknown";
}
record = {};
record.startTime = Date.now();
record.category = {
name: "loading"
};
if (xhr.readyState === XMLHttpRequest.OPENED) {
record.type = TimelineRecordType.ResourceSendRequest;
record.data = {
identifier: id,
url: url,
requestMethod: method
};
} else if (xhr.readyState === XMLHttpRequest.DONE) {
record.type = TimelineRecordType.ResourceReceiveResponse;
record.data = {
identifier: id,
statusCode: xhr.status,
mimeType: contentType,
url: url
};
if (!isNaN(contentLength)) {
record.data.expectedContentLength = contentLength;
}
} else {
return;
}
return Weinre.wi.TimelineNotify.addRecordToTimeline(record);
};
Timeline.installGlobalListeners = function() {
if (window.applicationCache) {
applicationCache.addEventListener("checking", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.checking", "loading");
}), false);
applicationCache.addEventListener("error", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.error", "loading");
}), false);
applicationCache.addEventListener("noupdate", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.noupdate", "loading");
}), false);
applicationCache.addEventListener("downloading", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.downloading", "loading");
}), false);
applicationCache.addEventListener("progress", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.progress", "loading");
}), false);
applicationCache.addEventListener("updateready", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.updateready", "loading");
}), false);
applicationCache.addEventListener("cached", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.cached", "loading");
}), false);
applicationCache.addEventListener("obsolete", (function(e) {
return Timeline.addRecord_EventDispatch(e, "applicationCache.obsolete", "loading");
}), false);
}
window.addEventListener("error", (function(e) {
return Timeline.addRecord_EventDispatch(e, "window.error");
}), false);
window.addEventListener("hashchange", (function(e) {
return Timeline.addRecord_EventDispatch(e, "window.hashchange");
}), false);
window.addEventListener("message", (function(e) {
return Timeline.addRecord_EventDispatch(e, "window.message");
}), false);
window.addEventListener("offline", (function(e) {
return Timeline.addRecord_EventDispatch(e, "window.offline");
}), false);
window.addEventListener("online", (function(e) {
return Timeline.addRecord_EventDispatch(e, "window.online");
}), false);
return window.addEventListener("scroll", (function(e) {
return Timeline.addRecord_EventDispatch(e, "window.scroll");
}), false);
};
Timeline.installNativeHooks = function() {
HookSites.window_setInterval.addHooks({
before: function(receiver, args) {
var code, interval;
code = args[0];
if (typeof code !== "function") {
return;
}
interval = args[1];
code = instrumentedTimerCode(code, interval, false);
args[0] = code;
this.userData = {};
this.userData.code = code;
return this.userData.interval = interval;
},
after: function(receiver, args, result) {
var code, id;
if (!this.userData) {
return;
}
code = this.userData.code;
if (typeof code !== "function") {
return;
}
id = result;
code.__timerId = id;
return addTimer(id, this.userData.interval, false);
}
});
HookSites.window_clearInterval.addHooks({
before: function(receiver, args) {
var id;
id = args[0];
return removeTimer(id, false);
}
});
HookSites.window_setTimeout.addHooks({
before: function(receiver, args) {
var code, interval;
code = args[0];
if (typeof code !== "function") {
return;
}
interval = args[1];
code = instrumentedTimerCode(code, interval, true);
args[0] = code;
this.userData = {};
this.userData.code = code;
return this.userData.interval = interval;
},
after: function(receiver, args, result) {
var code, id;
if (!this.userData) {
return;
}
code = this.userData.code;
if (typeof code !== "function") {
return;
}
id = result;
code.__timerId = id;
return addTimer(id, this.userData.interval, true);
}
});
HookSites.window_clearTimeout.addHooks({
before: function(receiver, args) {
var id;
id = args[0];
return removeTimer(id, true);
}
});
return HookSites.XMLHttpRequest_open.addHooks({
before: function(receiver, args) {
var xhr;
xhr = receiver;
IDGenerator.getId(xhr);
xhr.__weinre_method = args[0];
xhr.__weinre_url = args[1];
return xhr.addEventListener("readystatechange", getXhrEventHandler(xhr), false);
}
});
};
return Timeline;
})();
getXhrEventHandler = function(xhr) {
return function(event) {
return Timeline.addRecord_XHRReadyStateChange(xhr.__weinre_method, xhr.__weinre_url, IDGenerator.getId(xhr), xhr);
};
};
addTimer = function(id, timeout, singleShot) {
var timerSet;
timerSet = (singleShot ? TimerTimeouts : TimerIntervals);
timerSet[id] = {
id: id,
timeout: timeout,
singleShot: singleShot
};
return Timeline.addRecord_TimerInstall(id, timeout, singleShot);
};
removeTimer = function(id, singleShot) {
var timer, timerSet;
timerSet = (singleShot ? TimerTimeouts : TimerIntervals);
timer = timerSet[id];
if (!timer) {
return;
}
Timeline.addRecord_TimerRemove(id, timer.timeout, singleShot);
return delete timerSet[id];
};
instrumentedTimerCode = function(code, timeout, singleShot) {
var instrumentedCode;
if (typeof code !== "function") {
return code;
}
instrumentedCode = function() {
var id, result;
result = code.apply(this, arguments);
id = arguments.callee.__timerId;
Timeline.addRecord_TimerFire(id, timeout, singleShot);
return result;
};
instrumentedCode.displayName = code.name || code.displayName;
return instrumentedCode;
};
addStackTrace = function(record, skip) {
var i, trace, _results;
if (!skip) {
skip = 1;
}
trace = new StackTrace(arguments).trace;
record.stackTrace = [];
i = skip;
_results = [];
while (i < trace.length) {
record.stackTrace.push({
functionName: trace[i],
scriptName: "",
lineNumber: ""
});
_results.push(i++);
}
return _results;
};
Timeline.installGlobalListeners();
Timeline.installNativeHooks();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WeinreExtraClientCommandsImpl.amd.js
;modjewel.define("weinre/target/WeinreExtraClientCommandsImpl", function(require, exports, module) { 
var Console, Weinre, WeinreExtraClientCommandsImpl, WiDatabaseImpl;
Weinre = require('../common/Weinre');
WiDatabaseImpl = require('./WiDatabaseImpl');
Console = require('./Console');
module.exports = WeinreExtraClientCommandsImpl = (function() {
function WeinreExtraClientCommandsImpl() {}
WeinreExtraClientCommandsImpl.prototype.getDatabases = function(callback) {
var result;
if (!callback) {
return;
}
result = WiDatabaseImpl.getDatabases();
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
};
return WeinreExtraClientCommandsImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WeinreTargetEventsImpl.amd.js
;modjewel.define("weinre/target/WeinreTargetEventsImpl", function(require, exports, module) { 
var Callback, Console, Weinre, WeinreTargetEventsImpl;
Weinre = require('../common/Weinre');
Callback = require('../common/Callback');
Console = require('./Console');
module.exports = WeinreTargetEventsImpl = (function() {
function WeinreTargetEventsImpl() {}
WeinreTargetEventsImpl.prototype.connectionCreated = function(clientChannel, targetChannel) {
var message;
message = ("weinre: target " + targetChannel + " connected to client ") + clientChannel;
Weinre.logInfo(message);
return Weinre.target.whenBodyReady(this, [], function() {
var oldValue;
oldValue = Console.useRemote(true);
Weinre.target.setDocument();
Weinre.wi.TimelineNotify.timelineProfilerWasStopped();
return Weinre.wi.DOMStorage.initialize();
});
};
WeinreTargetEventsImpl.prototype.connectionDestroyed = function(clientChannel, targetChannel) {
var message, oldValue;
message = ("weinre: target " + targetChannel + " disconnected from client ") + clientChannel;
Weinre.logInfo(message);
return oldValue = Console.useRemote(false);
};
WeinreTargetEventsImpl.prototype.sendCallback = function(callbackId, result) {
return Callback.invoke(callbackId, result);
};
return WeinreTargetEventsImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WiConsoleImpl.amd.js
;modjewel.define("weinre/target/WiConsoleImpl", function(require, exports, module) { 
var Weinre, WiConsoleImpl;
Weinre = require('../common/Weinre');
module.exports = WiConsoleImpl = (function() {
function WiConsoleImpl() {
this.messagesEnabled = true;
}
WiConsoleImpl.prototype.setConsoleMessagesEnabled = function(enabled, callback) {
var oldValue;
oldValue = this.messagesEnabled;
this.messagesEnabled = enabled;
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [oldValue]);
}
};
WiConsoleImpl.prototype.clearConsoleMessages = function(callback) {
Weinre.wi.ConsoleNotify.consoleMessagesCleared();
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, []);
}
};
WiConsoleImpl.prototype.setMonitoringXHREnabled = function(enabled, callback) {
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, []);
}
};
return WiConsoleImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WiCSSImpl.amd.js
;modjewel.define("weinre/target/WiCSSImpl", function(require, exports, module) { 
var Weinre, WiCSSImpl;
Weinre = require('../common/Weinre');
module.exports = WiCSSImpl = (function() {
function WiCSSImpl() {
this.dummyComputedStyle = false;
}
WiCSSImpl.prototype.getStylesForNode = function(nodeId, callback) {
var computedStyle, node, parentNode, parentStyle, result;
result = {};
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
if (this.dummyComputedStyle) {
computedStyle = {
styleId: null,
properties: [],
shorthandValues: [],
cssProperties: []
};
} else {
computedStyle = Weinre.cssStore.getComputedStyle(node);
}
result = {
inlineStyle: Weinre.cssStore.getInlineStyle(node),
computedStyle: computedStyle,
matchedCSSRules: Weinre.cssStore.getMatchedCSSRules(node),
styleAttributes: Weinre.cssStore.getStyleAttributes(node),
pseudoElements: Weinre.cssStore.getPseudoElements(node),
inherited: []
};
parentNode = node.parentNode;
while (parentNode) {
parentStyle = {
inlineStyle: Weinre.cssStore.getInlineStyle(parentNode),
matchedCSSRules: Weinre.cssStore.getMatchedCSSRules(parentNode)
};
result.inherited.push(parentStyle);
parentNode = parentNode.parentNode;
}
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiCSSImpl.prototype.getComputedStyleForNode = function(nodeId, callback) {
var node, result;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
result = Weinre.cssStore.getComputedStyle(node);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiCSSImpl.prototype.getInlineStyleForNode = function(nodeId, callback) {
var node, result;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
result = Weinre.cssStore.getInlineStyle(node);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiCSSImpl.prototype.getAllStyles = function(callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiCSSImpl.prototype.getStyleSheet = function(styleSheetId, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiCSSImpl.prototype.getStyleSheetText = function(styleSheetId, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiCSSImpl.prototype.setStyleSheetText = function(styleSheetId, text, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiCSSImpl.prototype.setPropertyText = function(styleId, propertyIndex, text, overwrite, callback) {
var result;
result = Weinre.cssStore.setPropertyText(styleId, propertyIndex, text, overwrite);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiCSSImpl.prototype.toggleProperty = function(styleId, propertyIndex, disable, callback) {
var result;
result = Weinre.cssStore.toggleProperty(styleId, propertyIndex, disable);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiCSSImpl.prototype.setRuleSelector = function(ruleId, selector, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiCSSImpl.prototype.addRule = function(contextNodeId, selector, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiCSSImpl.prototype.querySelectorAll = function(documentId, selector, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
return WiCSSImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WiDatabaseImpl.amd.js
;modjewel.define("weinre/target/WiDatabaseImpl", function(require, exports, module) { 
var HookSites, IDGenerator, SqlStepper, Weinre, WiDatabaseImpl, dbAdd, dbById, dbRecordById, dbRecordByName, executeSQL_error, executeSQL_step_1, executeSQL_step_2, getTableNames_step_1, getTableNames_step_2, id2db, logSqlError, name2db;
Weinre = require('../common/Weinre');
IDGenerator = require('../common/IDGenerator');
HookSites = require('./HookSites');
SqlStepper = require('./SqlStepper');
id2db = {};
name2db = {};
module.exports = WiDatabaseImpl = (function() {
function WiDatabaseImpl() {
if (!window.openDatabase) {
return;
}
HookSites.window_openDatabase.addHooks({
after: function(receiver, args, db) {
var name, version;
if (!db) {
return;
}
name = args[0];
version = args[1];
return dbAdd(db, name, version);
}
});
}
WiDatabaseImpl.getDatabases = function() {
var id, result;
result = [];
for (id in id2db) {
result.push(id2db[id]);
}
return result;
};
WiDatabaseImpl.prototype.getDatabaseTableNames = function(databaseId, callback) {
var db, stepper;
db = dbById(databaseId);
if (!db) {
return;
}
stepper = SqlStepper([getTableNames_step_1, getTableNames_step_2]);
stepper.callback = callback;
return stepper.run(db, logSqlError);
};
WiDatabaseImpl.prototype.executeSQL = function(databaseId, query, callback) {
var db, stepper, txid;
db = dbById(databaseId);
if (!db) {
return;
}
txid = Weinre.targetDescription.channel + "-" + IDGenerator.next();
stepper = SqlStepper([executeSQL_step_1, executeSQL_step_2]);
stepper.txid = txid;
stepper.query = query;
stepper.callback = callback;
stepper.run(db, executeSQL_error);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [true, txid]);
}
};
return WiDatabaseImpl;
})();
logSqlError = function(sqlError) {
return console.log(("SQL Error " + sqlError.code + ": ") + sqlError.message);
};
getTableNames_step_1 = function() {
return this.executeSql("SELECT name FROM sqlite_master WHERE type='table'");
};
getTableNames_step_2 = function(resultSet) {
var i, name, result, rows;
rows = resultSet.rows;
result = [];
i = 0;
while (i < rows.length) {
name = rows.item(i).name;
if (name === "__WebKitDatabaseInfoTable__") {
i++;
continue;
}
result.push(name);
i++;
}
return Weinre.WeinreTargetCommands.sendClientCallback(this.callback, [result]);
};
executeSQL_step_1 = function() {
return this.executeSql(this.query);
};
executeSQL_step_2 = function(resultSet) {
var columnNames, i, j, propName, row, rows, values;
columnNames = [];
values = [];
rows = resultSet.rows;
i = 0;
while (i < rows.length) {
row = rows.item(i);
if (i === 0) {
for (propName in row) {
columnNames.push(propName);
}
}
j = 0;
while (j < columnNames.length) {
values.push(row[columnNames[j]]);
j++;
}
i++;
}
return Weinre.wi.DatabaseNotify.sqlTransactionSucceeded(this.txid, columnNames, values);
};
executeSQL_error = function(sqlError) {
var error;
error = {
code: sqlError.code,
message: sqlError.message
};
return Weinre.wi.DatabaseNotify.sqlTransactionFailed(this.txid, error);
};
dbById = function(id) {
var record;
record = id2db[id];
if (!record) {
return null;
}
return record.db;
};
dbRecordById = function(id) {
return id2db[id];
};
dbRecordByName = function(name) {
return name2db[name];
};
dbAdd = function(db, name, version) {
var payload, record;
record = dbRecordByName(name);
if (record) {
return record;
}
record = {};
record.id = IDGenerator.next();
record.domain = window.location.origin;
record.name = name;
record.version = version;
record.db = db;
id2db[record.id] = record;
name2db[name] = record;
payload = {};
payload.id = record.id;
payload.domain = record.domain;
payload.name = name;
payload.version = version;
return Weinre.WeinreExtraTargetEvents.databaseOpened(payload);
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WiDOMImpl.amd.js
;modjewel.define("weinre/target/WiDOMImpl", function(require, exports, module) { 
var Weinre, WiDOMImpl;
Weinre = require('../common/Weinre');
module.exports = WiDOMImpl = (function() {
function WiDOMImpl() {}
WiDOMImpl.prototype.getChildNodes = function(nodeId, callback) {
var children, node;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
children = Weinre.nodeStore.serializeNodeChildren(node, 1);
Weinre.wi.DOMNotify.setChildNodes(nodeId, children);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiDOMImpl.prototype.setAttribute = function(elementId, name, value, callback) {
var element;
element = Weinre.nodeStore.getNode(elementId);
if (!element) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid elementId: " + elementId);
return;
}
element.setAttribute(name, value);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiDOMImpl.prototype.removeAttribute = function(elementId, name, callback) {
var element;
element = Weinre.nodeStore.getNode(elementId);
if (!element) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid elementId: " + elementId);
return;
}
element.removeAttribute(name);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiDOMImpl.prototype.setTextNodeValue = function(nodeId, value, callback) {
var node;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
node.nodeValue = value;
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiDOMImpl.prototype.getEventListenersForNode = function(nodeId, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiDOMImpl.prototype.copyNode = function(nodeId, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiDOMImpl.prototype.removeNode = function(nodeId, callback) {
var node;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
if (!node.parentNode) {
Weinre.logWarning(arguments.callee.signature + " passed a parentless node: " + node);
return;
}
node.parentNode.removeChild(node);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiDOMImpl.prototype.changeTagName = function(nodeId, newTagName, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiDOMImpl.prototype.getOuterHTML = function(nodeId, callback) {
var node, value;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
value = node.outerHTML;
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [value]);
}
};
WiDOMImpl.prototype.setOuterHTML = function(nodeId, outerHTML, callback) {
var node;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
node.outerHTML = outerHTML;
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiDOMImpl.prototype.addInspectedNode = function(nodeId, callback) {
Weinre.nodeStore.addInspectedNode(nodeId);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiDOMImpl.prototype.performSearch = function(query, runSynchronously, callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiDOMImpl.prototype.searchCanceled = function(callback) {
return Weinre.notImplemented(arguments.callee.signature);
};
WiDOMImpl.prototype.pushNodeByPathToFrontend = function(path, callback) {
var childNodeIds, curr, currId, i, index, nodeId, nodeName, parts, _i, _ref;
parts = path.split(",");
curr = document;
currId = null;
nodeId = Weinre.nodeStore.getNodeId(curr);
this.getChildNodes(nodeId);
for (i = _i = 0, _ref = parts.length; _i < _ref; i = _i += 2) {
index = parseInt(parts[i]);
nodeName = parts[i + 1];
if (isNaN(index)) {
return;
}
childNodeIds = Weinre.nodeStore.childNodeIds(curr);
currId = childNodeIds[index];
if (!currId) {
return;
}
this.getChildNodes(currId);
curr = Weinre.nodeStore.getNode(currId);
if (curr.nodeName !== nodeName) {
return;
}
}
if (callback && currId) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [currId]);
}
};
WiDOMImpl.prototype.resolveNode = function(nodeId, callback) {
var result;
result = Weinre.injectedScript.resolveNode(nodeId);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiDOMImpl.prototype.getNodeProperties = function(nodeId, propertiesArray, callback) {
var result;
propertiesArray = JSON.stringify(propertiesArray);
result = Weinre.injectedScript.getNodeProperties(nodeId, propertiesArray);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiDOMImpl.prototype.getNodePrototypes = function(nodeId, callback) {
var result;
result = Weinre.injectedScript.getNodePrototypes(nodeId);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiDOMImpl.prototype.pushNodeToFrontend = function(objectId, callback) {
var result;
objectId = JSON.stringify(objectId);
result = Weinre.injectedScript.pushNodeToFrontend(objectId);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
return WiDOMImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WiDOMStorageImpl.amd.js
;modjewel.define("weinre/target/WiDOMStorageImpl", function(require, exports, module) { 
var HookSites, Weinre, WiDOMStorageImpl, _getStorageArea, _storageEventHandler;
Weinre = require('../common/Weinre');
HookSites = require('./HookSites');
module.exports = WiDOMStorageImpl = (function() {
function WiDOMStorageImpl() {}
WiDOMStorageImpl.prototype.getDOMStorageEntries = function(storageId, callback) {
var i, key, length, result, storageArea, val;
storageArea = _getStorageArea(storageId);
if (!storageArea) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid storageId: " + storageId);
return;
}
result = [];
length = storageArea.length;
i = 0;
while (i < length) {
key = storageArea.key(i);
val = storageArea.getItem(key);
result.push([key, val]);
i++;
}
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiDOMStorageImpl.prototype.setDOMStorageItem = function(storageId, key, value, callback) {
var e, result, storageArea;
storageArea = _getStorageArea(storageId);
if (!storageArea) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid storageId: " + storageId);
return;
}
result = true;
try {
HookLib.ignoreHooks(function() {
if (storageArea === window.localStorage) {
return localStorage.setItem(key, value);
} else if (storageArea === window.sessionStorage) {
return sessionStorage.setItem(key, value);
}
});
} catch (_error) {
e = _error;
result = false;
}
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiDOMStorageImpl.prototype.removeDOMStorageItem = function(storageId, key, callback) {
var e, result, storageArea;
storageArea = _getStorageArea(storageId);
if (!storageArea) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid storageId: " + storageId);
return;
}
result = true;
try {
HookLib.ignoreHooks(function() {
if (storageArea === window.localStorage) {
return localStorage.removeItem(key);
} else if (storageArea === window.sessionStorage) {
return sessionStorage.removeItem(key);
}
});
} catch (_error) {
e = _error;
result = false;
}
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiDOMStorageImpl.prototype.initialize = function() {
if (window.localStorage) {
Weinre.wi.DOMStorageNotify.addDOMStorage({
id: 1,
host: window.location.host,
isLocalStorage: true
});
HookSites.LocalStorage_setItem.addHooks({
after: function() {
return _storageEventHandler({
storageArea: window.localStorage
});
}
});
HookSites.LocalStorage_removeItem.addHooks({
after: function() {
return _storageEventHandler({
storageArea: window.localStorage
});
}
});
HookSites.LocalStorage_clear.addHooks({
after: function() {
return _storageEventHandler({
storageArea: window.localStorage
});
}
});
}
if (window.sessionStorage) {
Weinre.wi.DOMStorageNotify.addDOMStorage({
id: 2,
host: window.location.host,
isLocalStorage: false
});
HookSites.SessionStorage_setItem.addHooks({
after: function() {
return _storageEventHandler({
storageArea: window.sessionStorage
});
}
});
HookSites.SessionStorage_removeItem.addHooks({
after: function() {
return _storageEventHandler({
storageArea: window.sessionStorage
});
}
});
HookSites.SessionStorage_clear.addHooks({
after: function() {
return _storageEventHandler({
storageArea: window.sessionStorage
});
}
});
}
return document.addEventListener("storage", _storageEventHandler, false);
};
return WiDOMStorageImpl;
})();
_getStorageArea = function(storageId) {
if (storageId === 1) {
return window.localStorage;
} else if (storageId === 2) {
return window.sessionStorage;
}
return null;
};
_storageEventHandler = function(event) {
var storageId;
if (event.storageArea === window.localStorage) {
storageId = 1;
} else if (event.storageArea === window.sessionStorage) {
storageId = 2;
} else {
return;
}
return Weinre.wi.DOMStorageNotify.updateDOMStorage(storageId);
};
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WiInspectorImpl.amd.js
;modjewel.define("weinre/target/WiInspectorImpl", function(require, exports, module) { 
var Timeline, Weinre, WiInspectorImpl;
Weinre = require('../common/Weinre');
Timeline = require('../target/Timeline');
module.exports = WiInspectorImpl = (function() {
function WiInspectorImpl() {}
WiInspectorImpl.prototype.reloadPage = function(callback) {
if (callback) {
Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
return window.location.reload();
};
WiInspectorImpl.prototype.highlightDOMNode = function(nodeId, callback) {
var node;
node = Weinre.nodeStore.getNode(nodeId);
if (!node) {
Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
return;
}
Weinre.elementHighlighter.on(node);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiInspectorImpl.prototype.hideDOMNodeHighlight = function(callback) {
Weinre.elementHighlighter.off();
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiInspectorImpl.prototype.startTimelineProfiler = function(callback) {
Timeline.start();
Weinre.wi.TimelineNotify.timelineProfilerWasStarted();
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
WiInspectorImpl.prototype.stopTimelineProfiler = function(callback) {
Timeline.stop();
Weinre.wi.TimelineNotify.timelineProfilerWasStopped();
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback);
}
};
return WiInspectorImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// weinre/target/WiRuntimeImpl.amd.js
;modjewel.define("weinre/target/WiRuntimeImpl", function(require, exports, module) { 
var Weinre, WiRuntimeImpl;
Weinre = require('../common/Weinre');
module.exports = WiRuntimeImpl = (function() {
function WiRuntimeImpl() {}
WiRuntimeImpl.prototype.evaluate = function(expression, objectGroup, includeCommandLineAPI, callback) {
var result;
result = Weinre.injectedScript.evaluate(expression, objectGroup, includeCommandLineAPI);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiRuntimeImpl.prototype.getCompletions = function(expression, includeCommandLineAPI, callback) {
var result;
result = Weinre.injectedScript.getCompletions(expression, includeCommandLineAPI);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiRuntimeImpl.prototype.getProperties = function(objectId, ignoreHasOwnProperty, abbreviate, callback) {
var result;
objectId = JSON.stringify(objectId);
result = Weinre.injectedScript.getProperties(objectId, ignoreHasOwnProperty, abbreviate);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiRuntimeImpl.prototype.setPropertyValue = function(objectId, propertyName, expression, callback) {
var result;
objectId = JSON.stringify(objectId);
result = Weinre.injectedScript.setPropertyValue(objectId, propertyName, expression);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
WiRuntimeImpl.prototype.releaseWrapperObjectGroup = function(injectedScriptId, objectGroup, callback) {
var result;
result = Weinre.injectedScript.releaseWrapperObjectGroup(objectGroup);
if (callback) {
return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
}
};
return WiRuntimeImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
});

;
// interfaces/all-json-idls-min.js
modjewel.require('weinre/common/Weinre').addIDLs([{"interfaces": [{"name": "InjectedScriptHost", "methods": [{"name": "clearConsoleMessages", "parameters": []}, {"name": "copyText", "parameters": [{"name": "text"}]}, {"parameters": [{"name": "nodeId"}], "name": "nodeForId"}, {"parameters": [{"name": "node"}, {"name": "withChildren"}, {"name": "selectInUI"}], "name": "pushNodePathToFrontend"}, {"name": "inspectedNode", "parameters": [{"name": "num"}]}, {"parameters": [{"name": "object"}], "name": "internalConstructorName"}, {"parameters": [], "name": "currentCallFrame"}, {"parameters": [{"name": "database"}], "name": "selectDatabase"}, {"parameters": [{"name": "storage"}], "name": "selectDOMStorage"}, {"name": "didCreateWorker", "parameters": [{"name": "id"}, {"name": "url"}, {"name": "isFakeWorker"}]}, {"name": "didDestroyWorker", "parameters": [{"name": "id"}]}, {"name": "nextWorkerId", "parameters": []}]}], "name": "core"}, {"interfaces": [{"name": "Inspector", "methods": [{"name": "addScriptToEvaluateOnLoad", "parameters": [{"name": "scriptSource"}]}, {"name": "removeAllScriptsToEvaluateOnLoad", "parameters": []}, {"name": "reloadPage", "parameters": [{"name": "ignoreCache"}]}, {"name": "populateScriptObjects", "parameters": []}, {"name": "openInInspectedWindow", "parameters": [{"name": "url"}]}, {"name": "setSearchingForNode", "parameters": [{"name": "enabled"}]}, {"name": "didEvaluateForTestInFrontend", "parameters": [{"name": "testCallId"}, {"name": "jsonResult"}]}, {"name": "highlightDOMNode", "parameters": [{"name": "nodeId"}]}, {"name": "hideDOMNodeHighlight", "parameters": []}, {"name": "highlightFrame", "parameters": [{"name": "frameId"}]}, {"name": "hideFrameHighlight", "parameters": []}, {"name": "setUserAgentOverride", "parameters": [{"name": "userAgent"}]}, {"name": "getCookies", "parameters": []}, {"name": "deleteCookie", "parameters": [{"name": "cookieName"}, {"name": "domain"}]}, {"name": "startTimelineProfiler", "parameters": []}, {"name": "stopTimelineProfiler", "parameters": []}, {"name": "enableDebugger", "parameters": []}, {"name": "disableDebugger", "parameters": []}, {"name": "enableProfiler", "parameters": []}, {"name": "disableProfiler", "parameters": []}, {"name": "startProfiling", "parameters": []}, {"name": "stopProfiling", "parameters": []}]}, {"name": "Runtime", "methods": [{"name": "evaluate", "parameters": [{"name": "expression"}, {"name": "objectGroup"}, {"name": "includeCommandLineAPI"}]}, {"name": "getCompletions", "parameters": [{"name": "expression"}, {"name": "includeCommandLineAPI"}]}, {"name": "getProperties", "parameters": [{"name": "objectId"}, {"name": "ignoreHasOwnProperty"}, {"name": "abbreviate"}]}, {"name": "setPropertyValue", "parameters": [{"name": "objectId"}, {"name": "propertyName"}, {"name": "expression"}]}, {"name": "releaseWrapperObjectGroup", "parameters": [{"name": "injectedScriptId"}, {"name": "objectGroup"}]}]}, {"name": "InjectedScript", "methods": [{"name": "evaluateOnSelf", "parameters": [{"name": "functionBody"}, {"name": "argumentsArray"}]}]}, {"name": "Console", "methods": [{"name": "setConsoleMessagesEnabled", "parameters": [{"name": "enabled"}]}, {"name": "clearConsoleMessages", "parameters": []}, {"name": "setMonitoringXHREnabled", "parameters": [{"name": "enabled"}]}]}, {"name": "Network", "methods": [{"name": "cachedResources", "parameters": []}, {"name": "resourceContent", "parameters": [{"name": "frameId"}, {"name": "url"}, {"name": "base64Encode"}]}, {"name": "setExtraHeaders", "parameters": [{"name": "headers"}]}]}, {"name": "Database", "methods": [{"name": "getDatabaseTableNames", "parameters": [{"name": "databaseId"}]}, {"name": "executeSQL", "parameters": [{"name": "databaseId"}, {"name": "query"}]}]}, {"name": "DOMStorage", "methods": [{"name": "getDOMStorageEntries", "parameters": [{"name": "storageId"}]}, {"name": "setDOMStorageItem", "parameters": [{"name": "storageId"}, {"name": "key"}, {"name": "value"}]}, {"name": "removeDOMStorageItem", "parameters": [{"name": "storageId"}, {"name": "key"}]}]}, {"name": "ApplicationCache", "methods": [{"name": "getApplicationCaches", "parameters": []}]}, {"name": "DOM", "methods": [{"name": "getChildNodes", "parameters": [{"name": "nodeId"}]}, {"name": "setAttribute", "parameters": [{"name": "elementId"}, {"name": "name"}, {"name": "value"}]}, {"name": "removeAttribute", "parameters": [{"name": "elementId"}, {"name": "name"}]}, {"name": "setTextNodeValue", "parameters": [{"name": "nodeId"}, {"name": "value"}]}, {"name": "getEventListenersForNode", "parameters": [{"name": "nodeId"}]}, {"name": "copyNode", "parameters": [{"name": "nodeId"}]}, {"name": "removeNode", "parameters": [{"name": "nodeId"}]}, {"name": "changeTagName", "parameters": [{"name": "nodeId"}, {"name": "newTagName"}]}, {"name": "getOuterHTML", "parameters": [{"name": "nodeId"}]}, {"name": "setOuterHTML", "parameters": [{"name": "nodeId"}, {"name": "outerHTML"}]}, {"name": "addInspectedNode", "parameters": [{"name": "nodeId"}]}, {"name": "performSearch", "parameters": [{"name": "query"}, {"name": "runSynchronously"}]}, {"name": "searchCanceled", "parameters": []}, {"name": "pushNodeByPathToFrontend", "parameters": [{"name": "path"}]}, {"name": "resolveNode", "parameters": [{"name": "nodeId"}]}, {"name": "getNodeProperties", "parameters": [{"name": "nodeId"}, {"name": "propertiesArray"}]}, {"name": "getNodePrototypes", "parameters": [{"name": "nodeId"}]}, {"name": "pushNodeToFrontend", "parameters": [{"name": "objectId"}]}]}, {"name": "CSS", "methods": [{"name": "getStylesForNode", "parameters": [{"name": "nodeId"}]}, {"name": "getComputedStyleForNode", "parameters": [{"name": "nodeId"}]}, {"name": "getInlineStyleForNode", "parameters": [{"name": "nodeId"}]}, {"name": "getAllStyles", "parameters": []}, {"name": "getStyleSheet", "parameters": [{"name": "styleSheetId"}]}, {"name": "getStyleSheetText", "parameters": [{"name": "styleSheetId"}]}, {"name": "setStyleSheetText", "parameters": [{"name": "styleSheetId"}, {"name": "text"}]}, {"name": "setPropertyText", "parameters": [{"name": "styleId"}, {"name": "propertyIndex"}, {"name": "text"}, {"name": "overwrite"}]}, {"name": "toggleProperty", "parameters": [{"name": "styleId"}, {"name": "propertyIndex"}, {"name": "disable"}]}, {"name": "setRuleSelector", "parameters": [{"name": "ruleId"}, {"name": "selector"}]}, {"name": "addRule", "parameters": [{"name": "contextNodeId"}, {"name": "selector"}]}, {"name": "getSupportedCSSProperties", "parameters": []}, {"name": "querySelectorAll", "parameters": [{"name": "documentId"}, {"name": "selector"}]}]}, {"name": "Timeline", "methods": []}, {"name": "Debugger", "methods": [{"name": "activateBreakpoints", "parameters": []}, {"name": "deactivateBreakpoints", "parameters": []}, {"name": "setJavaScriptBreakpoint", "parameters": [{"name": "url"}, {"name": "lineNumber"}, {"name": "columnNumber"}, {"name": "condition"}, {"name": "enabled"}]}, {"name": "setJavaScriptBreakpointBySourceId", "parameters": [{"name": "sourceId"}, {"name": "lineNumber"}, {"name": "columnNumber"}, {"name": "condition"}, {"name": "enabled"}]}, {"name": "removeJavaScriptBreakpoint", "parameters": [{"name": "breakpointId"}]}, {"name": "continueToLocation", "parameters": [{"name": "sourceId"}, {"name": "lineNumber"}, {"name": "columnNumber"}]}, {"name": "stepOver", "parameters": []}, {"name": "stepInto", "parameters": []}, {"name": "stepOut", "parameters": []}, {"name": "pause", "parameters": []}, {"name": "resume", "parameters": []}, {"name": "editScriptSource", "parameters": [{"name": "sourceID"}, {"name": "newContent"}]}, {"name": "getScriptSource", "parameters": [{"name": "sourceID"}]}, {"name": "setPauseOnExceptionsState", "parameters": [{"name": "pauseOnExceptionsState"}]}, {"name": "evaluateOnCallFrame", "parameters": [{"name": "callFrameId"}, {"name": "expression"}, {"name": "objectGroup"}, {"name": "includeCommandLineAPI"}]}, {"name": "getCompletionsOnCallFrame", "parameters": [{"name": "callFrameId"}, {"name": "expression"}, {"name": "includeCommandLineAPI"}]}]}, {"name": "BrowserDebugger", "methods": [{"name": "setAllBrowserBreakpoints", "parameters": [{"name": "breakpoints"}]}, {"name": "setDOMBreakpoint", "parameters": [{"name": "nodeId"}, {"name": "type"}]}, {"name": "removeDOMBreakpoint", "parameters": [{"name": "nodeId"}, {"name": "type"}]}, {"name": "setEventListenerBreakpoint", "parameters": [{"name": "eventName"}]}, {"name": "removeEventListenerBreakpoint", "parameters": [{"name": "eventName"}]}, {"name": "setXHRBreakpoint", "parameters": [{"name": "url"}]}, {"name": "removeXHRBreakpoint", "parameters": [{"name": "url"}]}]}, {"name": "Profiler", "methods": [{"name": "getProfileHeaders", "parameters": []}, {"name": "getProfile", "parameters": [{"name": "type"}, {"name": "uid"}]}, {"name": "removeProfile", "parameters": [{"name": "type"}, {"name": "uid"}]}, {"name": "clearProfiles", "parameters": []}, {"name": "takeHeapSnapshot", "parameters": [{"name": "detailed"}]}]}, {"name": "InspectorNotify", "methods": [{"parameters": [], "name": "frontendReused"}, {"parameters": [{"name": "nodeIds"}], "name": "addNodesToSearchResult"}, {"parameters": [], "name": "bringToFront"}, {"parameters": [], "name": "disconnectFromBackend"}, {"parameters": [{"name": "url"}], "name": "inspectedURLChanged"}, {"parameters": [{"name": "time"}], "name": "domContentEventFired"}, {"parameters": [{"name": "time"}], "name": "loadEventFired"}, {"parameters": [], "name": "reset"}, {"parameters": [{"name": "panel"}], "name": "showPanel"}, {"parameters": [{"name": "testCallId"}, {"name": "script"}], "name": "evaluateForTestInFrontend"}, {"parameters": [{"name": "nodeId"}], "name": "updateFocusedNode"}]}, {"name": "ConsoleNotify", "methods": [{"parameters": [{"name": "messageObj"}], "name": "addConsoleMessage"}, {"parameters": [{"name": "count"}], "name": "updateConsoleMessageExpiredCount"}, {"parameters": [{"name": "count"}], "name": "updateConsoleMessageRepeatCount"}, {"parameters": [], "name": "consoleMessagesCleared"}]}, {"name": "NetworkNotify", "methods": [{"parameters": [{"name": "frameId"}], "name": "frameDetachedFromParent"}, {"parameters": [{"name": "identifier"}, {"name": "url"}, {"name": "loader"}, {"name": "callStack"}], "name": "identifierForInitialRequest"}, {"parameters": [{"name": "identifier"}, {"name": "time"}, {"name": "request"}, {"name": "redirectResponse"}], "name": "willSendRequest"}, {"parameters": [{"name": "identifier"}], "name": "markResourceAsCached"}, {"parameters": [{"name": "identifier"}, {"name": "time"}, {"name": "resourceType"}, {"name": "response"}], "name": "didReceiveResponse"}, {"parameters": [{"name": "identifier"}, {"name": "time"}, {"name": "lengthReceived"}], "name": "didReceiveContentLength"}, {"parameters": [{"name": "identifier"}, {"name": "finishTime"}], "name": "didFinishLoading"}, {"parameters": [{"name": "identifier"}, {"name": "time"}, {"name": "localizedDescription"}], "name": "didFailLoading"}, {"parameters": [{"name": "time"}, {"name": "resource"}], "name": "didLoadResourceFromMemoryCache"}, {"parameters": [{"name": "identifier"}, {"name": "sourceString"}, {"name": "type"}], "name": "setInitialContent"}, {"parameters": [{"name": "frame"}, {"name": "loader"}], "name": "didCommitLoadForFrame"}, {"parameters": [{"name": "identifier"}, {"name": "requestURL"}], "name": "didCreateWebSocket"}, {"parameters": [{"name": "identifier"}, {"name": "time"}, {"name": "request"}], "name": "willSendWebSocketHandshakeRequest"}, {"parameters": [{"name": "identifier"}, {"name": "time"}, {"name": "response"}], "name": "didReceiveWebSocketHandshakeResponse"}, {"parameters": [{"name": "identifier"}, {"name": "time"}], "name": "didCloseWebSocket"}]}, {"name": "DatabaseNotify", "methods": [{"parameters": [{"name": "database"}], "name": "addDatabase"}, {"parameters": [{"name": "databaseId"}], "name": "selectDatabase"}, {"parameters": [{"name": "transactionId"}, {"name": "columnNames"}, {"name": "values"}], "name": "sqlTransactionSucceeded"}, {"parameters": [{"name": "transactionId"}, {"name": "sqlError"}], "name": "sqlTransactionFailed"}]}, {"name": "DOMStorageNotify", "methods": [{"parameters": [{"name": "storage"}], "name": "addDOMStorage"}, {"parameters": [{"name": "storageId"}], "name": "updateDOMStorage"}, {"parameters": [{"name": "storageId"}], "name": "selectDOMStorage"}]}, {"name": "ApplicationCacheNotify", "methods": [{"parameters": [{"name": "status"}], "name": "updateApplicationCacheStatus"}, {"parameters": [{"name": "isNowOnline"}], "name": "updateNetworkState"}]}, {"name": "DOMNotify", "methods": [{"parameters": [{"name": "root"}], "name": "setDocument"}, {"parameters": [{"name": "id"}, {"name": "attributes"}], "name": "attributesUpdated"}, {"parameters": [{"name": "id"}, {"name": "newValue"}], "name": "characterDataModified"}, {"parameters": [{"name": "parentId"}, {"name": "nodes"}], "name": "setChildNodes"}, {"parameters": [{"name": "root"}], "name": "setDetachedRoot"}, {"parameters": [{"name": "id"}, {"name": "newValue"}], "name": "childNodeCountUpdated"}, {"parameters": [{"name": "parentId"}, {"name": "prevId"}, {"name": "node"}], "name": "childNodeInserted"}, {"parameters": [{"name": "parentId"}, {"name": "id"}], "name": "childNodeRemoved"}]}, {"name": "TimelineNotify", "methods": [{"parameters": [], "name": "timelineProfilerWasStarted"}, {"parameters": [], "name": "timelineProfilerWasStopped"}, {"parameters": [{"name": "record"}], "name": "addRecordToTimeline"}]}, {"name": "DebuggerNotify", "methods": [{"parameters": [], "name": "debuggerWasEnabled"}, {"parameters": [], "name": "debuggerWasDisabled"}, {"parameters": [{"name": "sourceID"}, {"name": "url"}, {"name": "lineOffset"}, {"name": "columnOffset"}, {"name": "length"}, {"name": "scriptWorldType"}], "name": "parsedScriptSource"}, {"parameters": [{"name": "url"}, {"name": "data"}, {"name": "firstLine"}, {"name": "errorLine"}, {"name": "errorMessage"}], "name": "failedToParseScriptSource"}, {"parameters": [{"name": "breakpointId"}, {"name": "sourceId"}, {"name": "lineNumber"}, {"name": "columnNumber"}], "name": "breakpointResolved"}, {"parameters": [{"name": "details"}], "name": "pausedScript"}, {"parameters": [], "name": "resumedScript"}, {"parameters": [{"name": "id"}, {"name": "url"}, {"name": "isShared"}], "name": "didCreateWorker"}, {"parameters": [{"name": "id"}], "name": "didDestroyWorker"}]}, {"name": "ProfilerNotify", "methods": [{"parameters": [], "name": "profilerWasEnabled"}, {"parameters": [], "name": "profilerWasDisabled"}, {"parameters": [{"name": "header"}], "name": "addProfileHeader"}, {"parameters": [{"name": "uid"}, {"name": "chunk"}], "name": "addHeapSnapshotChunk"}, {"parameters": [{"name": "uid"}], "name": "finishHeapSnapshot"}, {"parameters": [{"name": "isProfiling"}], "name": "setRecordingProfile"}, {"parameters": [], "name": "resetProfiles"}, {"parameters": [{"name": "done"}, {"name": "total"}], "name": "reportHeapSnapshotProgress"}]}], "name": "core"}, {"interfaces": [{"name": "InspectorFrontendHost", "methods": [{"name": "loaded", "parameters": []}, {"name": "closeWindow", "parameters": []}, {"name": "disconnectFromBackend", "parameters": []}, {"name": "bringToFront", "parameters": []}, {"name": "inspectedURLChanged", "parameters": [{"name": "newURL"}]}, {"name": "requestAttachWindow", "parameters": []}, {"name": "requestDetachWindow", "parameters": []}, {"name": "setAttachedWindowHeight", "parameters": [{"name": "height"}]}, {"name": "moveWindowBy", "parameters": [{"name": "x"}, {"name": "y"}]}, {"name": "setExtensionAPI", "parameters": [{"name": "script"}]}, {"name": "localizedStringsURL", "parameters": []}, {"name": "hiddenPanels", "parameters": []}, {"name": "copyText", "parameters": [{"name": "text"}]}, {"parameters": [], "name": "platform"}, {"parameters": [], "name": "port"}, {"parameters": [{"name": "event"}, {"name": "items"}], "name": "showContextMenu"}, {"name": "sendMessageToBackend", "parameters": [{"name": "message"}]}]}], "name": "core"}, {"interfaces": [{"name": "WeinreClientCommands", "methods": [{"name": "registerClient", "parameters": []}, {"name": "getTargets", "parameters": []}, {"name": "getClients", "parameters": []}, {"name": "connectTarget", "parameters": [{"name": "clientId"}, {"name": "targetId"}]}, {"name": "disconnectTarget", "parameters": [{"name": "clientId"}]}, {"name": "getExtensions", "parameters": []}, {"name": "logDebug", "parameters": [{"name": "message"}]}, {"name": "logInfo", "parameters": [{"name": "message"}]}, {"name": "logWarning", "parameters": [{"name": "message"}]}, {"name": "logError", "parameters": [{"name": "message"}]}]}], "name": "weinre"}, {"interfaces": [{"name": "WeinreClientEvents", "methods": [{"name": "clientRegistered", "parameters": [{"name": "client"}]}, {"name": "targetRegistered", "parameters": [{"name": "target"}]}, {"name": "clientUnregistered", "parameters": [{"name": "clientId"}]}, {"name": "targetUnregistered", "parameters": [{"name": "targetId"}]}, {"name": "connectionCreated", "parameters": [{"name": "clientId"}, {"name": "targetId"}]}, {"name": "connectionDestroyed", "parameters": [{"name": "clientId"}, {"name": "targetId"}]}, {"name": "sendCallback", "parameters": [{"name": "callbackId"}, {"name": "result"}]}, {"name": "serverProperties", "parameters": [{"name": "properties"}]}]}], "name": "weinre"}, {"interfaces": [{"name": "WeinreExtraClientCommands", "methods": [{"name": "getDatabases", "parameters": []}]}], "name": "weinre"}, {"interfaces": [{"name": "WeinreExtraTargetEvents", "methods": [{"name": "databaseOpened", "parameters": [{"name": "databaseRecord"}]}]}], "name": "weinre"}, {"interfaces": [{"name": "WeinreTargetCommands", "methods": [{"name": "registerTarget", "parameters": [{"name": "url"}]}, {"name": "sendClientCallback", "parameters": [{"name": "callbackId"}, {"name": "args"}]}, {"name": "logDebug", "parameters": [{"name": "message"}]}, {"name": "logInfo", "parameters": [{"name": "message"}]}, {"name": "logWarning", "parameters": [{"name": "message"}]}, {"name": "logError", "parameters": [{"name": "message"}]}]}], "name": "weinre"}, {"interfaces": [{"name": "WeinreTargetEvents", "methods": [{"name": "connectionCreated", "parameters": [{"name": "clientId"}, {"name": "targetId"}]}, {"name": "connectionDestroyed", "parameters": [{"name": "clientId"}, {"name": "targetId"}]}, {"name": "sendCallback", "parameters": [{"name": "callbackId"}, {"name": "result"}]}]}], "name": "weinre"}])
;
// modjewel.require('weinre/common/Weinre').showNotImplemented();
modjewel.require('weinre/target/Target').main()
})();