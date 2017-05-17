var http_1 = require('http');
var https_1 = require('https');
var stream_1 = require('stream');
var urlLib = require('url');
var arrify = require('arrify');
var Promise = require('any-promise');
var index_1 = require('./plugins/index');
exports.use = index_1.defaults;
var REDIRECT_TYPE;
(function (REDIRECT_TYPE) {
    REDIRECT_TYPE[REDIRECT_TYPE["FOLLOW_WITH_GET"] = 0] = "FOLLOW_WITH_GET";
    REDIRECT_TYPE[REDIRECT_TYPE["FOLLOW_WITH_CONFIRMATION"] = 1] = "FOLLOW_WITH_CONFIRMATION";
})(REDIRECT_TYPE || (REDIRECT_TYPE = {}));
var REDIRECT_STATUS = {
    '300': REDIRECT_TYPE.FOLLOW_WITH_GET,
    '301': REDIRECT_TYPE.FOLLOW_WITH_GET,
    '302': REDIRECT_TYPE.FOLLOW_WITH_GET,
    '303': REDIRECT_TYPE.FOLLOW_WITH_GET,
    '305': REDIRECT_TYPE.FOLLOW_WITH_GET,
    '307': REDIRECT_TYPE.FOLLOW_WITH_CONFIRMATION,
    '308': REDIRECT_TYPE.FOLLOW_WITH_CONFIRMATION
};
function open(request) {
    var url = request.url, method = request.method, body = request.body, options = request.options;
    var maxRedirects = num(options.maxRedirects, 5);
    var followRedirects = options.followRedirects !== false;
    var requestCount = 0;
    var confirmRedirect = typeof options.followRedirects === 'function' ?
        options.followRedirects : falsey;
    function get(url, method, body) {
        if (requestCount++ > maxRedirects) {
            return Promise.reject(request.error("Exceeded maximum of " + maxRedirects + " redirects", 'EMAXREDIRECTS'));
        }
        return appendCookies(request)
            .then(function () {
            return new Promise(function (resolve, reject) {
                var arg = urlLib.parse(url);
                var isHttp = arg.protocol !== 'https:';
                var engine = isHttp ? http_1.request : https_1.request;
                arg.method = method;
                arg.headers = request.toHeaders();
                arg.agent = options.agent;
                arg.rejectUnauthorized = options.rejectUnauthorized !== false;
                arg.ca = options.ca;
                arg.cert = options.cert;
                arg.key = options.key;
                var req = engine(arg);
                var requestProxy = new stream_1.PassThrough();
                var responseProxy = new stream_1.PassThrough();
                requestProxy.on('data', function (chunk) {
                    request.uploadedBytes = request.uploadedBytes + chunk.length;
                });
                requestProxy.on('end', function () {
                    request.uploadedBytes = request.uploadLength;
                });
                responseProxy.on('data', function (chunk) {
                    request.downloadedBytes = request.downloadedBytes + chunk.length;
                });
                responseProxy.on('end', function () {
                    request.downloadedBytes = request.downloadLength;
                });
                function response(res) {
                    var status = res.statusCode;
                    var redirect = REDIRECT_STATUS[status];
                    if (followRedirects && redirect != null && res.headers.location) {
                        var newUrl = urlLib.resolve(url, res.headers.location);
                        res.resume();
                        request.remove('Cookie');
                        if (redirect === REDIRECT_TYPE.FOLLOW_WITH_GET) {
                            request.set('Content-Length', '0');
                            return get(newUrl, 'GET');
                        }
                        if (redirect === REDIRECT_TYPE.FOLLOW_WITH_CONFIRMATION) {
                            if (arg.method === 'GET' || arg.method === 'HEAD') {
                                return get(newUrl, method, body);
                            }
                            if (confirmRedirect(req, res)) {
                                return get(newUrl, method, body);
                            }
                        }
                    }
                    request.downloadLength = num(res.headers['content-length'], 0);
                    res.pipe(responseProxy);
                    return Promise.resolve({
                        body: responseProxy,
                        status: status,
                        statusText: res.statusMessage,
                        headers: res.headers,
                        rawHeaders: res.rawHeaders,
                        url: url
                    });
                }
                req.once('response', function (message) {
                    return resolve(setCookies(request, message).then(function () { return response(message); }));
                });
                req.once('abort', function () {
                    return reject(request.error('Request aborted', 'EABORT'));
                });
                req.once('error', function (error) {
                    return reject(request.error("Unable to connect to \"" + url + "\"", 'EUNAVAILABLE', error));
                });
                requestProxy.once('error', reject);
                request.raw = req;
                request.uploadLength = num(req.getHeader('content-length'), 0);
                requestProxy.pipe(req);
                if (body) {
                    if (typeof body.pipe === 'function') {
                        body.pipe(requestProxy);
                    }
                    else {
                        requestProxy.end(body);
                    }
                }
                else {
                    requestProxy.end();
                }
            });
        });
    }
    return get(url, method, body);
}
exports.open = open;
function abort(request) {
    request.raw.abort();
}
exports.abort = abort;
function num(value, fallback) {
    if (value == null) {
        return fallback;
    }
    return isNaN(value) ? fallback : Number(value);
}
function falsey() {
    return false;
}
function appendCookies(request) {
    return new Promise(function (resolve, reject) {
        if (!request.options.jar) {
            return resolve();
        }
        request.options.jar.getCookies(request.url, function (err, cookies) {
            if (err) {
                return reject(err);
            }
            if (cookies.length) {
                request.append('Cookie', cookies.join('; '));
            }
            return resolve();
        });
    });
}
function setCookies(request, message) {
    return new Promise(function (resolve, reject) {
        if (!request.options.jar) {
            return resolve();
        }
        var cookies = arrify(message.headers['set-cookie']);
        if (!cookies.length) {
            return resolve();
        }
        var setCookies = cookies.map(function (cookie) {
            return new Promise(function (resolve, reject) {
                request.options.jar.setCookie(cookie, request.url, function (err) {
                    return err ? reject(err) : resolve();
                });
            });
        });
        return resolve(Promise.all(setCookies));
    });
}
//# sourceMappingURL=index.js.map