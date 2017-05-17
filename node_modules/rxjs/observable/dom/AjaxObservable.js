"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _this = this;
var root_1 = require('../../util/root');
var tryCatch_1 = require('../../util/tryCatch');
var errorObject_1 = require('../../util/errorObject');
var Observable_1 = require('../../Observable');
var Subscriber_1 = require('../../Subscriber');
var createXHRDefault = function () {
    var xhr = new root_1.root.XMLHttpRequest();
    if (_this.crossDomain) {
        if ('withCredentials' in xhr) {
            xhr.withCredentials = true;
            return xhr;
        }
        else if (!!root_1.root.XDomainRequest) {
            return new root_1.root.XDomainRequest();
        }
        else {
            throw new Error('CORS is not supported by your browser');
        }
    }
    else {
        return xhr;
    }
};
function defaultGetResultSelector(response) {
    return response.response;
}
function ajaxGet(url, resultSelector, headers) {
    if (resultSelector === void 0) { resultSelector = defaultGetResultSelector; }
    if (headers === void 0) { headers = null; }
    return new AjaxObservable({ method: 'GET', url: url, resultSelector: resultSelector, headers: headers });
}
exports.ajaxGet = ajaxGet;
;
function ajaxPost(url, body, headers) {
    return new AjaxObservable({ method: 'POST', url: url, body: body, headers: headers });
}
exports.ajaxPost = ajaxPost;
;
function ajaxDelete(url, headers) {
    return new AjaxObservable({ method: 'DELETE', url: url, headers: headers });
}
exports.ajaxDelete = ajaxDelete;
;
function ajaxPut(url, body, headers) {
    return new AjaxObservable({ method: 'PUT', url: url, body: body, headers: headers });
}
exports.ajaxPut = ajaxPut;
;
function ajaxGetJSON(url, resultSelector, headers) {
    var finalResultSelector = resultSelector ? function (res) { return resultSelector(res.response); } : function (res) { return res.response; };
    return new AjaxObservable({ method: 'GET', url: url, responseType: 'json', resultSelector: finalResultSelector, headers: headers });
}
exports.ajaxGetJSON = ajaxGetJSON;
;
/**
 * Creates an observable for an Ajax request with either a request object with url, headers, etc or a string for a URL.
 *
 * @example
 *   source = Rx.Observable.ajax('/products');
 *   source = Rx.Observable.ajax( url: 'products', method: 'GET' });
 *
 * @param {Object} request Can be one of the following:
 *
 *  A string of the URL to make the Ajax call.
 *  An object with the following properties
 *   - url: URL of the request
 *   - body: The body of the request
 *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
 *   - async: Whether the request is async
 *   - headers: Optional headers
 *   - crossDomain: true if a cross domain request, else false
 *   - createXHR: a function to override if you need to use an alternate XMLHttpRequest implementation.
 *   - resultSelector: a function to use to alter the output value type of the Observable. Gets {AjaxResponse} as an argument
 * @returns {Observable} An observable sequence containing the XMLHttpRequest.
*/
var AjaxObservable = (function (_super) {
    __extends(AjaxObservable, _super);
    function AjaxObservable(urlOrRequest) {
        _super.call(this);
        var request = {
            async: true,
            createXHR: createXHRDefault,
            crossDomain: false,
            headers: {},
            method: 'GET',
            responseType: 'json',
            timeout: 0
        };
        if (typeof urlOrRequest === 'string') {
            request.url = urlOrRequest;
        }
        else {
            for (var prop in urlOrRequest) {
                if (urlOrRequest.hasOwnProperty(prop)) {
                    request[prop] = urlOrRequest[prop];
                }
            }
        }
        this.request = request;
    }
    AjaxObservable.prototype._subscribe = function (subscriber) {
        return new AjaxSubscriber(subscriber, this.request);
    };
    AjaxObservable.create = (function () {
        var create = function (urlOrRequest) {
            return new AjaxObservable(urlOrRequest);
        };
        create.get = ajaxGet;
        create.post = ajaxPost;
        create.delete = ajaxDelete;
        create.put = ajaxPut;
        create.getJSON = ajaxGetJSON;
        return create;
    })();
    return AjaxObservable;
}(Observable_1.Observable));
exports.AjaxObservable = AjaxObservable;
var AjaxSubscriber = (function (_super) {
    __extends(AjaxSubscriber, _super);
    function AjaxSubscriber(destination, request) {
        _super.call(this, destination);
        this.request = request;
        this.done = false;
        var headers = request.headers = request.headers || {};
        // force CORS if requested
        if (!request.crossDomain && !headers['X-Requested-With']) {
            headers['X-Requested-With'] = 'XMLHttpRequest';
        }
        // ensure content type is set
        if (!('Content-Type' in headers)) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
        // properly serialize body
        request.body = this.serializeBody(request.body, request.headers['Content-Type']);
        this.resultSelector = request.resultSelector;
        this.send();
    }
    AjaxSubscriber.prototype.next = function (e) {
        this.done = true;
        var _a = this, resultSelector = _a.resultSelector, xhr = _a.xhr, request = _a.request, destination = _a.destination;
        var response = new AjaxResponse(e, xhr, request);
        if (resultSelector) {
            var result = tryCatch_1.tryCatch(resultSelector)(response);
            if (result === errorObject_1.errorObject) {
                this.error(errorObject_1.errorObject.e);
            }
            else {
                destination.next(result);
            }
        }
        else {
            destination.next(response);
        }
    };
    AjaxSubscriber.prototype.send = function () {
        var _a = this, request = _a.request, _b = _a.request, user = _b.user, method = _b.method, url = _b.url, async = _b.async, password = _b.password, headers = _b.headers, body = _b.body;
        var createXHR = request.createXHR;
        var xhr = tryCatch_1.tryCatch(createXHR).call(request);
        if (xhr === errorObject_1.errorObject) {
            this.error(errorObject_1.errorObject.e);
        }
        else {
            this.xhr = xhr;
            // open XHR first
            var result = void 0;
            if (user) {
                result = tryCatch_1.tryCatch(xhr.open).call(xhr, method, url, async, user, password);
            }
            else {
                result = tryCatch_1.tryCatch(xhr.open).call(xhr, method, url, async);
            }
            if (result === errorObject_1.errorObject) {
                this.error(errorObject_1.errorObject.e);
                return;
            }
            // timeout and responseType can be set once the XHR is open
            xhr.timeout = request.timeout;
            xhr.responseType = request.responseType;
            // set headers
            this.setHeaders(xhr, headers);
            // now set up the events
            this.setupEvents(xhr, request);
            // finally send the request
            if (body) {
                xhr.send(body);
            }
            else {
                xhr.send();
            }
        }
    };
    AjaxSubscriber.prototype.serializeBody = function (body, contentType) {
        if (!body || typeof body === 'string') {
            return body;
        }
        var splitIndex = contentType.indexOf(';');
        if (splitIndex !== -1) {
            contentType = contentType.substring(0, splitIndex);
        }
        switch (contentType) {
            case 'application/x-www-form-urlencoded':
                return Object.keys(body).map(function (key) { return (key + "=" + encodeURI(body[key])); }).join('&');
            case 'application/json':
                return JSON.stringify(body);
        }
    };
    AjaxSubscriber.prototype.setHeaders = function (xhr, headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
    };
    AjaxSubscriber.prototype.setupEvents = function (xhr, request) {
        var progressSubscriber = request.progressSubscriber;
        xhr.ontimeout = function xhrTimeout(e) {
            var _a = xhrTimeout, subscriber = _a.subscriber, progressSubscriber = _a.progressSubscriber, request = _a.request;
            if (progressSubscriber) {
                progressSubscriber.error(e);
            }
            subscriber.error(new AjaxTimeoutError(this, request)); //TODO: Make betterer.
        };
        xhr.ontimeout.request = request;
        xhr.ontimeout.subscriber = this;
        xhr.ontimeout.progressSubscriber = progressSubscriber;
        if (xhr.upload && 'withCredentials' in xhr && root_1.root.XDomainRequest) {
            if (progressSubscriber) {
                xhr.onprogress = function xhrProgress(e) {
                    var progressSubscriber = xhrProgress.progressSubscriber;
                    progressSubscriber.next(e);
                };
                xhr.onprogress.progressSubscriber = progressSubscriber;
            }
            xhr.onerror = function xhrError(e) {
                var _a = xhrError, progressSubscriber = _a.progressSubscriber, subscriber = _a.subscriber, request = _a.request;
                if (progressSubscriber) {
                    progressSubscriber.error(e);
                }
                subscriber.error(new AjaxError('ajax error', this, request));
            };
            xhr.onerror.request = request;
            xhr.onerror.subscriber = this;
            xhr.onerror.progressSubscriber = progressSubscriber;
        }
        xhr.onreadystatechange = function xhrReadyStateChange(e) {
            var _a = xhrReadyStateChange, subscriber = _a.subscriber, progressSubscriber = _a.progressSubscriber, request = _a.request;
            if (this.readyState === 4) {
                // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
                var status_1 = this.status === 1223 ? 204 : this.status;
                var response = (this.responseType === 'text' ? (this.response || this.responseText) : this.response);
                // fix status code when it is 0 (0 status is undocumented).
                // Occurs when accessing file resources or on Android 4.1 stock browser
                // while retrieving files from application cache.
                if (status_1 === 0) {
                    status_1 = response ? 200 : 0;
                }
                if (200 <= status_1 && status_1 < 300) {
                    if (progressSubscriber) {
                        progressSubscriber.complete();
                    }
                    subscriber.next(e);
                    subscriber.complete();
                }
                else {
                    if (progressSubscriber) {
                        progressSubscriber.error(e);
                    }
                    subscriber.error(new AjaxError('ajax error ' + status_1, this, request));
                }
            }
        };
        xhr.onreadystatechange.subscriber = this;
        xhr.onreadystatechange.progressSubscriber = progressSubscriber;
        xhr.onreadystatechange.request = request;
    };
    AjaxSubscriber.prototype.unsubscribe = function () {
        var _a = this, done = _a.done, xhr = _a.xhr;
        if (!done && xhr && xhr.readyState !== 4) {
            xhr.abort();
        }
        _super.prototype.unsubscribe.call(this);
    };
    return AjaxSubscriber;
}(Subscriber_1.Subscriber));
exports.AjaxSubscriber = AjaxSubscriber;
/** A normalized AJAX response */
var AjaxResponse = (function () {
    function AjaxResponse(originalEvent, xhr, request) {
        this.originalEvent = originalEvent;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
        this.responseType = xhr.responseType;
        switch (this.responseType) {
            case 'json':
                if ('response' in xhr) {
                    this.response = xhr.response;
                }
                else {
                    this.response = JSON.parse(xhr.responseText || '');
                }
                break;
            case 'xml':
                this.response = xhr.responseXML;
                break;
            case 'text':
            default:
                this.response = ('response' in xhr) ? xhr.response : xhr.responseText;
                break;
        }
    }
    return AjaxResponse;
}());
exports.AjaxResponse = AjaxResponse;
/** A normalized AJAX error */
var AjaxError = (function (_super) {
    __extends(AjaxError, _super);
    function AjaxError(message, xhr, request) {
        _super.call(this, message);
        this.message = message;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
    }
    return AjaxError;
}(Error));
exports.AjaxError = AjaxError;
var AjaxTimeoutError = (function (_super) {
    __extends(AjaxTimeoutError, _super);
    function AjaxTimeoutError(xhr, request) {
        _super.call(this, 'ajax timeout', xhr, request);
    }
    return AjaxTimeoutError;
}(AjaxError));
exports.AjaxTimeoutError = AjaxTimeoutError;
//# sourceMappingURL=AjaxObservable.js.map