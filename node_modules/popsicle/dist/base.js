var url_1 = require('url');
var querystring_1 = require('querystring');
var extend = require('xtend');
function lowerHeader(key) {
    var lower = key.toLowerCase();
    if (lower === 'referrer') {
        return 'referer';
    }
    return lower;
}
function type(str) {
    return str == null ? null : str.split(/ *; */)[0];
}
function concat(a, b) {
    if (a == null) {
        return b;
    }
    return Array.isArray(a) ? a.concat(b) : [a, b];
}
var Base = (function () {
    function Base(_a) {
        var url = _a.url, headers = _a.headers, rawHeaders = _a.rawHeaders, query = _a.query;
        this.Url = {};
        this.rawHeaders = [];
        if (url != null) {
            this.url = url;
        }
        if (query != null) {
            this.query = extend(this.query, typeof query === 'string' ? querystring_1.parse(query) : query);
        }
        if (rawHeaders) {
            if (rawHeaders.length % 2 === 1) {
                throw new TypeError("Expected raw headers length to be even, was " + rawHeaders.length);
            }
            this.rawHeaders = rawHeaders.slice(0);
        }
        else {
            this.headers = headers;
        }
    }
    Object.defineProperty(Base.prototype, "url", {
        get: function () {
            return url_1.format(this.Url);
        },
        set: function (url) {
            this.Url = url_1.parse(url, true, true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "query", {
        get: function () {
            return this.Url.query;
        },
        set: function (query) {
            this.Url.query = typeof query === 'string' ? querystring_1.parse(query) : query;
            this.Url.search = null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "headers", {
        get: function () {
            var headers = {};
            for (var i = 0; i < this.rawHeaders.length; i += 2) {
                var key = lowerHeader(this.rawHeaders[i]);
                var value = concat(headers[key], this.rawHeaders[i + 1]);
                headers[key] = value;
            }
            return headers;
        },
        set: function (headers) {
            this.rawHeaders = [];
            if (headers) {
                for (var _i = 0, _a = Object.keys(headers); _i < _a.length; _i++) {
                    var key = _a[_i];
                    this.append(key, headers[key]);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Base.prototype.toHeaders = function () {
        var headers = {};
        for (var i = 0; i < this.rawHeaders.length; i += 2) {
            var key = this.rawHeaders[i];
            var value = concat(headers[key], this.rawHeaders[i + 1]);
            headers[key] = value;
        }
        return headers;
    };
    Base.prototype.set = function (name, value) {
        this.remove(name);
        this.append(name, value);
        return this;
    };
    Base.prototype.append = function (name, value) {
        if (Array.isArray(value)) {
            for (var _i = 0; _i < value.length; _i++) {
                var v = value[_i];
                this.rawHeaders.push(name, v);
            }
        }
        else {
            this.rawHeaders.push(name, value);
        }
        return this;
    };
    Base.prototype.name = function (name) {
        var lowered = lowerHeader(name);
        var headerName;
        for (var i = 0; i < this.rawHeaders.length; i += 2) {
            if (lowerHeader(this.rawHeaders[i]) === lowered) {
                headerName = this.rawHeaders[i];
            }
        }
        return headerName;
    };
    Base.prototype.get = function (name) {
        var lowered = lowerHeader(name);
        var value;
        for (var i = 0; i < this.rawHeaders.length; i += 2) {
            if (lowerHeader(this.rawHeaders[i]) === lowered) {
                value = value == null ? this.rawHeaders[i + 1] : value + ", " + this.rawHeaders[i + 1];
            }
        }
        return value;
    };
    Base.prototype.remove = function (name) {
        var lowered = lowerHeader(name);
        var len = this.rawHeaders.length;
        while ((len -= 2) >= 0) {
            if (lowerHeader(this.rawHeaders[len]) === lowered) {
                this.rawHeaders.splice(len, 2);
            }
        }
        return this;
    };
    Base.prototype.type = function (value) {
        if (arguments.length === 0) {
            return type(this.get('Content-Type'));
        }
        return this.set('Content-Type', value);
    };
    return Base;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Base;
//# sourceMappingURL=base.js.map