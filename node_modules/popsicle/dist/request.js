var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var arrify = require('arrify');
var extend = require('xtend');
var Promise = require('any-promise');
var base_1 = require('./base');
var response_1 = require('./response');
var error_1 = require('./error');
var Request = (function (_super) {
    __extends(Request, _super);
    function Request(options) {
        var _this = this;
        _super.call(this, options);
        this.aborted = false;
        this.timedout = false;
        this.opened = false;
        this.started = false;
        this.uploadLength = null;
        this.downloadLength = null;
        this._uploadedBytes = null;
        this._downloadedBytes = null;
        this._before = [];
        this._after = [];
        this._always = [];
        this._progress = [];
        this.timeout = Number(options.timeout) || 0;
        this.method = (options.method || 'GET').toUpperCase();
        this.body = options.body;
        this.options = extend(options.options);
        this._promise = new Promise(function (resolve, reject) {
            process.nextTick(function () { return start(_this).then(resolve, reject); });
        });
        this.transport = extend(options.transport);
        this.use(options.use || this.transport.use);
        this.before(options.before);
        this.after(options.after);
        this.always(options.always);
        this.progress(options.progress);
    }
    Request.prototype.use = function (fn) {
        var _this = this;
        arrify(fn).forEach(function (fn) { return fn(_this); });
        return this;
    };
    Request.prototype.error = function (message, code, original) {
        return new error_1.default(message, code, original, this);
    };
    Request.prototype.then = function (onFulfilled, onRejected) {
        return this._promise.then(onFulfilled, onRejected);
    };
    Request.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    };
    Request.prototype.exec = function (cb) {
        this.then(function (response) {
            cb(null, response);
        }, cb);
    };
    Request.prototype.toOptions = function () {
        return {
            url: this.url,
            method: this.method,
            options: this.options,
            use: [],
            body: this.body,
            transport: this.transport,
            timeout: this.timeout,
            rawHeaders: this.rawHeaders,
            before: this._before,
            after: this._after,
            progress: this._progress,
            always: this._always
        };
    };
    Request.prototype.toJSON = function () {
        return {
            url: this.url,
            headers: this.headers,
            body: this.body,
            options: this.options,
            timeout: this.timeout,
            method: this.method
        };
    };
    Request.prototype.clone = function () {
        return new Request(this.toOptions());
    };
    Request.prototype.progress = function (fn) {
        return pluginFunction(this, '_progress', fn);
    };
    Request.prototype.before = function (fn) {
        return pluginFunction(this, '_before', fn);
    };
    Request.prototype.after = function (fn) {
        return pluginFunction(this, '_after', fn);
    };
    Request.prototype.always = function (fn) {
        return pluginFunction(this, '_always', fn);
    };
    Request.prototype.abort = function () {
        if (this.completed === 1 || this.aborted) {
            return this;
        }
        this.aborted = true;
        this.errored = this.errored || this.error('Request aborted', 'EABORT');
        if (this.opened) {
            emitProgress(this);
            this._progress = null;
            if (this.transport.abort) {
                this.transport.abort(this);
            }
        }
        return this;
    };
    Object.defineProperty(Request.prototype, "uploaded", {
        get: function () {
            return this.uploadLength ? this.uploadedBytes / this.uploadLength : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "downloaded", {
        get: function () {
            return this.downloadLength ? this.downloadedBytes / this.downloadLength : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "completed", {
        get: function () {
            return (this.uploaded + this.downloaded) / 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "completedBytes", {
        get: function () {
            return this.uploadedBytes + this.downloadedBytes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "totalBytes", {
        get: function () {
            return this.uploadLength + this.downloadLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "uploadedBytes", {
        get: function () {
            return this._uploadedBytes;
        },
        set: function (bytes) {
            if (bytes !== this._uploadedBytes) {
                this._uploadedBytes = bytes;
                emitProgress(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "downloadedBytes", {
        get: function () {
            return this._downloadedBytes;
        },
        set: function (bytes) {
            if (bytes !== this._downloadedBytes) {
                this._downloadedBytes = bytes;
                emitProgress(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    return Request;
})(base_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Request;
function pluginFunction(request, property, fns) {
    if (request.started) {
        throw new TypeError('Plugins can not be used after the request has started');
    }
    for (var _i = 0, _a = arrify(fns); _i < _a.length; _i++) {
        var fn = _a[_i];
        if (typeof fn !== 'function') {
            throw new TypeError("Expected a function, but got " + fn + " instead");
        }
        ;
        request[property].push(fn);
    }
    return request;
}
function start(request) {
    var req = request;
    var timeout = request.timeout, url = request.url;
    var timer;
    request.started = true;
    if (request.errored) {
        return Promise.reject(request.errored);
    }
    if (/^https?\:\/*(?:[~#\\\?;\:]|$)/.test(url)) {
        return Promise.reject(request.error("Refused to connect to invalid URL \"" + url + "\"", 'EINVALID'));
    }
    return chain(req._before, request)
        .then(function () {
        if (request.errored) {
            return;
        }
        if (timeout) {
            timer = setTimeout(function () {
                var error = request.error("Timeout of " + request.timeout + "ms exceeded", 'ETIMEOUT');
                request.errored = error;
                request.timedout = true;
                request.abort();
            }, timeout);
        }
        req.opened = true;
        return req.transport.open(request)
            .then(function (options) {
            var response = new response_1.default(options);
            response.request = request;
            request.response = response;
            return chain(req._after, response);
        });
    })
        .then(function () { return chain(req._always, request); }, function (error) { return chain(req._always, request).then(function () { return Promise.reject(error); }); })
        .then(function () {
        if (request.errored) {
            return Promise.reject(request.errored);
        }
        return request.response;
    }, function (error) {
        request.errored = request.errored || error;
        return Promise.reject(request.errored);
    });
}
function chain(fns, arg) {
    return fns.reduce(function (p, fn) {
        return p.then(function () { return fn(arg); });
    }, Promise.resolve());
}
function emitProgress(request) {
    var fns = request._progress;
    if (!fns || request.errored) {
        return;
    }
    try {
        for (var _i = 0; _i < fns.length; _i++) {
            var fn = fns[_i];
            fn(request);
        }
    }
    catch (err) {
        request.errored = err;
        request.abort();
    }
}
//# sourceMappingURL=request.js.map