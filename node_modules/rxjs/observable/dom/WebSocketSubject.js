"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subject_1 = require('../../Subject');
var Subscriber_1 = require('../../Subscriber');
var Observable_1 = require('../../Observable');
var Subscription_1 = require('../../Subscription');
var root_1 = require('../../util/root');
var ReplaySubject_1 = require('../../subject/ReplaySubject');
var tryCatch_1 = require('../../util/tryCatch');
var errorObject_1 = require('../../util/errorObject');
var assign_1 = require('../../util/assign');
var WebSocketSubject = (function (_super) {
    __extends(WebSocketSubject, _super);
    function WebSocketSubject(urlConfigOrSource, destination) {
        if (urlConfigOrSource instanceof Observable_1.Observable) {
            _super.call(this, destination, urlConfigOrSource);
        }
        else {
            _super.call(this);
            this.WebSocketCtor = root_1.root.WebSocket;
            if (typeof urlConfigOrSource === 'string') {
                this.url = urlConfigOrSource;
            }
            else {
                // WARNING: config object could override important members here.
                assign_1.assign(this, urlConfigOrSource);
            }
            if (!this.WebSocketCtor) {
                throw new Error('no WebSocket constructor can be found');
            }
            this.destination = new ReplaySubject_1.ReplaySubject();
        }
    }
    WebSocketSubject.prototype.resultSelector = function (e) {
        return JSON.parse(e.data);
    };
    WebSocketSubject.create = function (urlConfigOrSource) {
        return new WebSocketSubject(urlConfigOrSource);
    };
    WebSocketSubject.prototype.lift = function (operator) {
        var sock = new WebSocketSubject(this, this.destination);
        sock.operator = operator;
        return sock;
    };
    // TODO: factor this out to be a proper Operator/Subscriber implementation and eliminate closures
    WebSocketSubject.prototype.multiplex = function (subMsg, unsubMsg, messageFilter) {
        var self = this;
        return new Observable_1.Observable(function (observer) {
            var result = tryCatch_1.tryCatch(subMsg)();
            if (result === errorObject_1.errorObject) {
                observer.error(errorObject_1.errorObject.e);
            }
            else {
                self.next(result);
            }
            var subscription = self.subscribe(function (x) {
                var result = tryCatch_1.tryCatch(messageFilter)(x);
                if (result === errorObject_1.errorObject) {
                    observer.error(errorObject_1.errorObject.e);
                }
                else if (result) {
                    observer.next(x);
                }
            }, function (err) { return observer.error(err); }, function () { return observer.complete(); });
            return function () {
                var result = tryCatch_1.tryCatch(unsubMsg)();
                if (result === errorObject_1.errorObject) {
                    observer.error(errorObject_1.errorObject.e);
                }
                else {
                    self.next(result);
                }
                subscription.unsubscribe();
            };
        });
    };
    WebSocketSubject.prototype._unsubscribe = function () {
        this.socket = null;
        this.source = null;
        this.destination = new ReplaySubject_1.ReplaySubject();
        this.isStopped = false;
        this.hasErrored = false;
        this.hasCompleted = false;
        this.observers = null;
        this.isUnsubscribed = false;
    };
    WebSocketSubject.prototype._subscribe = function (subscriber) {
        var _this = this;
        if (!this.observers) {
            this.observers = [];
        }
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        // HACK: For some reason transpilation wasn't honoring this in arrow functions below
        // Doesn't seem right, need to reinvestigate.
        var self = this;
        var WebSocket = this.WebSocketCtor;
        if (self.source || !subscription || subscription.isUnsubscribed) {
            return subscription;
        }
        if (self.url && !self.socket) {
            var socket_1 = self.protocol ? new WebSocket(self.url, self.protocol) : new WebSocket(self.url);
            self.socket = socket_1;
            socket_1.onopen = function (e) {
                var openObserver = self.openObserver;
                if (openObserver) {
                    openObserver.next(e);
                }
                var queue = self.destination;
                self.destination = Subscriber_1.Subscriber.create(function (x) { return socket_1.readyState === 1 && socket_1.send(x); }, function (e) {
                    var closingObserver = self.closingObserver;
                    if (closingObserver) {
                        closingObserver.next(undefined);
                    }
                    if (e && e.code) {
                        socket_1.close(e.code, e.reason);
                    }
                    else {
                        self._finalError(new TypeError('WebSocketSubject.error must be called with an object with an error code, ' +
                            'and an optional reason: { code: number, reason: string }'));
                    }
                }, function () {
                    var closingObserver = self.closingObserver;
                    if (closingObserver) {
                        closingObserver.next(undefined);
                    }
                    socket_1.close();
                });
                if (queue && queue instanceof ReplaySubject_1.ReplaySubject) {
                    subscription.add(queue.subscribe(self.destination));
                }
            };
            socket_1.onerror = function (e) { return self.error(e); };
            socket_1.onclose = function (e) {
                var closeObserver = self.closeObserver;
                if (closeObserver) {
                    closeObserver.next(e);
                }
                if (e.wasClean) {
                    self._finalComplete();
                }
                else {
                    self._finalError(e);
                }
            };
            socket_1.onmessage = function (e) {
                var result = tryCatch_1.tryCatch(self.resultSelector)(e);
                if (result === errorObject_1.errorObject) {
                    self._finalError(errorObject_1.errorObject.e);
                }
                else {
                    self._finalNext(result);
                }
            };
        }
        return new Subscription_1.Subscription(function () {
            subscription.unsubscribe();
            if (!_this.observers || _this.observers.length === 0) {
                var socket = _this.socket;
                if (socket && socket.readyState < 2) {
                    socket.close();
                }
                _this.socket = undefined;
                _this.source = undefined;
                _this.destination = new ReplaySubject_1.ReplaySubject();
            }
        });
    };
    return WebSocketSubject;
}(Subject_1.Subject));
exports.WebSocketSubject = WebSocketSubject;
//# sourceMappingURL=WebSocketSubject.js.map