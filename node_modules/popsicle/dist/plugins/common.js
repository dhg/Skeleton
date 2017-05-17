var Promise = require('any-promise');
var FormData = require('form-data');
var querystring_1 = require('querystring');
var form_1 = require('../form');
var JSON_MIME_REGEXP = /^application\/(?:[\w!#\$%&\*`\-\.\^~]*\+)?json$/i;
var QUERY_MIME_REGEXP = /^application\/x-www-form-urlencoded$/i;
var FORM_MIME_REGEXP = /^multipart\/form-data$/i;
var isHostObject;
if (process.browser) {
    isHostObject = function (object) {
        var str = Object.prototype.toString.call(object);
        switch (str) {
            case '[object File]':
            case '[object Blob]':
            case '[object FormData]':
            case '[object ArrayBuffer]':
                return true;
            default:
                return false;
        }
    };
}
else {
    isHostObject = function (object) {
        return typeof object.pipe === 'function' || Buffer.isBuffer(object);
    };
}
function defaultHeaders(request) {
    if (!request.get('Accept')) {
        request.set('Accept', '*/*');
    }
    request.remove('Host');
}
function stringifyRequest(request) {
    var body = request.body;
    if (Object(body) !== body) {
        request.body = body == null ? null : String(body);
        return;
    }
    if (isHostObject(body)) {
        return;
    }
    var type = request.type();
    if (!type) {
        type = 'application/json';
        request.type(type);
    }
    try {
        if (JSON_MIME_REGEXP.test(type)) {
            request.body = JSON.stringify(body);
        }
        else if (FORM_MIME_REGEXP.test(type)) {
            request.body = form_1.default(body);
        }
        else if (QUERY_MIME_REGEXP.test(type)) {
            request.body = querystring_1.stringify(body);
        }
    }
    catch (err) {
        return Promise.reject(request.error('Unable to stringify request body: ' + err.message, 'ESTRINGIFY', err));
    }
    if (request.body instanceof FormData) {
        request.remove('Content-Type');
    }
}
function parseResponse(response) {
    var body = response.body;
    if (typeof body !== 'string') {
        return;
    }
    if (body === '') {
        response.body = null;
        return;
    }
    var type = response.type();
    try {
        if (JSON_MIME_REGEXP.test(type)) {
            response.body = body === '' ? null : JSON.parse(body);
        }
        else if (QUERY_MIME_REGEXP.test(type)) {
            response.body = querystring_1.parse(body);
        }
    }
    catch (err) {
        return Promise.reject(response.error('Unable to parse response body: ' + err.message, 'EPARSE', err));
    }
}
function headers() {
    return function (request) {
        request.before(defaultHeaders);
    };
}
exports.headers = headers;
function stringify() {
    return function (request) {
        request.before(stringifyRequest);
    };
}
exports.stringify = stringify;
function parse() {
    return function (request) {
        request.after(parseResponse);
    };
}
exports.parse = parse;
//# sourceMappingURL=common.js.map