'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var _nextRequestId = 0;
exports.JSONP_HOME = '__ng_jsonp__';
var _jsonpConnections = null;
function _getJsonpConnections() {
    if (_jsonpConnections === null) {
        _jsonpConnections = lang_1.global[exports.JSONP_HOME] = {};
    }
    return _jsonpConnections;
}
// Make sure not to evaluate this in a non-browser environment!
var BrowserJsonp = (function () {
    function BrowserJsonp() {
    }
    // Construct a <script> element with the specified URL
    BrowserJsonp.prototype.build = function (url) {
        var node = document.createElement('script');
        node.src = url;
        return node;
    };
    BrowserJsonp.prototype.nextRequestID = function () { return "__req" + _nextRequestId++; };
    BrowserJsonp.prototype.requestCallback = function (id) { return exports.JSONP_HOME + "." + id + ".finished"; };
    BrowserJsonp.prototype.exposeConnection = function (id, connection) {
        var connections = _getJsonpConnections();
        connections[id] = connection;
    };
    BrowserJsonp.prototype.removeConnection = function (id) {
        var connections = _getJsonpConnections();
        connections[id] = null;
    };
    // Attach the <script> element to the DOM
    BrowserJsonp.prototype.send = function (node) { document.body.appendChild((node)); };
    // Remove <script> element from the DOM
    BrowserJsonp.prototype.cleanup = function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild((node));
        }
    };
    BrowserJsonp = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BrowserJsonp);
    return BrowserJsonp;
})();
exports.BrowserJsonp = BrowserJsonp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9qc29ucC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAudHMiXSwibmFtZXMiOlsiX2dldEpzb25wQ29ubmVjdGlvbnMiLCJCcm93c2VySnNvbnAiLCJCcm93c2VySnNvbnAuY29uc3RydWN0b3IiLCJCcm93c2VySnNvbnAuYnVpbGQiLCJCcm93c2VySnNvbnAubmV4dFJlcXVlc3RJRCIsIkJyb3dzZXJKc29ucC5yZXF1ZXN0Q2FsbGJhY2siLCJCcm93c2VySnNvbnAuZXhwb3NlQ29ubmVjdGlvbiIsIkJyb3dzZXJKc29ucC5yZW1vdmVDb25uZWN0aW9uIiwiQnJvd3Nlckpzb25wLnNlbmQiLCJCcm93c2VySnNvbnAuY2xlYW51cCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBQ3pDLHFCQUFxQiwwQkFBMEIsQ0FBQyxDQUFBO0FBRWhELElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztBQUNWLGtCQUFVLEdBQUcsY0FBYyxDQUFDO0FBQ3pDLElBQUksaUJBQWlCLEdBQXlCLElBQUksQ0FBQztBQUVuRDtJQUNFQSxFQUFFQSxDQUFDQSxDQUFDQSxpQkFBaUJBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQy9CQSxpQkFBaUJBLEdBQTBCQSxhQUFPQSxDQUFDQSxrQkFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDdEVBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLGlCQUFpQkEsQ0FBQ0E7QUFDM0JBLENBQUNBO0FBRUQsK0RBQStEO0FBQy9EO0lBQUFDO0lBZ0NBQyxDQUFDQTtJQTlCQ0Qsc0RBQXNEQTtJQUN0REEsNEJBQUtBLEdBQUxBLFVBQU1BLEdBQVdBO1FBQ2ZFLElBQUlBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQzVDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNmQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVERixvQ0FBYUEsR0FBYkEsY0FBMEJHLE1BQU1BLENBQUNBLFVBQVFBLGNBQWNBLEVBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRTlESCxzQ0FBZUEsR0FBZkEsVUFBZ0JBLEVBQVVBLElBQVlJLE1BQU1BLENBQUlBLGtCQUFVQSxTQUFJQSxFQUFFQSxjQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU5RUosdUNBQWdCQSxHQUFoQkEsVUFBaUJBLEVBQVVBLEVBQUVBLFVBQWVBO1FBQzFDSyxJQUFJQSxXQUFXQSxHQUFHQSxvQkFBb0JBLEVBQUVBLENBQUNBO1FBQ3pDQSxXQUFXQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtJQUMvQkEsQ0FBQ0E7SUFFREwsdUNBQWdCQSxHQUFoQkEsVUFBaUJBLEVBQVVBO1FBQ3pCTSxJQUFJQSxXQUFXQSxHQUFHQSxvQkFBb0JBLEVBQUVBLENBQUNBO1FBQ3pDQSxXQUFXQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFFRE4seUNBQXlDQTtJQUN6Q0EsMkJBQUlBLEdBQUpBLFVBQUtBLElBQVNBLElBQUlPLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTVEUCx1Q0FBdUNBO0lBQ3ZDQSw4QkFBT0EsR0FBUEEsVUFBUUEsSUFBU0E7UUFDZlEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFdBQVdBLENBQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQzVDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQS9CSFI7UUFBQ0EsaUJBQVVBLEVBQUVBOztxQkFnQ1pBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQWhDRCxJQWdDQztBQS9CWSxvQkFBWSxlQStCeEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxubGV0IF9uZXh0UmVxdWVzdElkID0gMDtcbmV4cG9ydCBjb25zdCBKU09OUF9IT01FID0gJ19fbmdfanNvbnBfXyc7XG52YXIgX2pzb25wQ29ubmVjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gbnVsbDtcblxuZnVuY3Rpb24gX2dldEpzb25wQ29ubmVjdGlvbnMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBpZiAoX2pzb25wQ29ubmVjdGlvbnMgPT09IG51bGwpIHtcbiAgICBfanNvbnBDb25uZWN0aW9ucyA9ICg8e1trZXk6IHN0cmluZ106IGFueX0+Z2xvYmFsKVtKU09OUF9IT01FXSA9IHt9O1xuICB9XG4gIHJldHVybiBfanNvbnBDb25uZWN0aW9ucztcbn1cblxuLy8gTWFrZSBzdXJlIG5vdCB0byBldmFsdWF0ZSB0aGlzIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQhXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3Nlckpzb25wIHtcbiAgLy8gQ29uc3RydWN0IGEgPHNjcmlwdD4gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgVVJMXG4gIGJ1aWxkKHVybDogc3RyaW5nKTogYW55IHtcbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIG5vZGUuc3JjID0gdXJsO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgbmV4dFJlcXVlc3RJRCgpOiBzdHJpbmcgeyByZXR1cm4gYF9fcmVxJHtfbmV4dFJlcXVlc3RJZCsrfWA7IH1cblxuICByZXF1ZXN0Q2FsbGJhY2soaWQ6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBgJHtKU09OUF9IT01FfS4ke2lkfS5maW5pc2hlZGA7IH1cblxuICBleHBvc2VDb25uZWN0aW9uKGlkOiBzdHJpbmcsIGNvbm5lY3Rpb246IGFueSkge1xuICAgIGxldCBjb25uZWN0aW9ucyA9IF9nZXRKc29ucENvbm5lY3Rpb25zKCk7XG4gICAgY29ubmVjdGlvbnNbaWRdID0gY29ubmVjdGlvbjtcbiAgfVxuXG4gIHJlbW92ZUNvbm5lY3Rpb24oaWQ6IHN0cmluZykge1xuICAgIHZhciBjb25uZWN0aW9ucyA9IF9nZXRKc29ucENvbm5lY3Rpb25zKCk7XG4gICAgY29ubmVjdGlvbnNbaWRdID0gbnVsbDtcbiAgfVxuXG4gIC8vIEF0dGFjaCB0aGUgPHNjcmlwdD4gZWxlbWVudCB0byB0aGUgRE9NXG4gIHNlbmQobm9kZTogYW55KSB7IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoPE5vZGU+KG5vZGUpKTsgfVxuXG4gIC8vIFJlbW92ZSA8c2NyaXB0PiBlbGVtZW50IGZyb20gdGhlIERPTVxuICBjbGVhbnVwKG5vZGU6IGFueSkge1xuICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCg8Tm9kZT4obm9kZSkpO1xuICAgIH1cbiAgfVxufVxuIl19