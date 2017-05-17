function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var concat = require('concat-stream');
var FormData = require('form-data');
var zlib_1 = require('zlib');
var Promise = require('any-promise');
__export(require('./common'));
var common_2 = require('./common');
function unzipResponse(response) {
    if (['gzip', 'deflate'].indexOf(response.get('Content-Encoding')) > -1) {
        var unzip_1 = zlib_1.createUnzip();
        response.body.pipe(unzip_1);
        response.body = unzip_1;
    }
}
function unzipHeaders(request) {
    if (!request.get('Accept-Encoding')) {
        request.set('Accept-Encoding', 'gzip,deflate');
    }
}
function unzip() {
    return function (request) {
        request.before(unzipHeaders);
        request.after(unzipResponse);
    };
}
exports.unzip = unzip;
function concatStream(encoding) {
    return function (request) {
        request.after(function (response) {
            return new Promise(function (resolve, reject) {
                var stream = concat({
                    encoding: encoding
                }, function (data) {
                    response.body = data;
                    return resolve();
                });
                response.body.once('error', reject);
                response.body.pipe(stream);
            });
        });
    };
}
exports.concatStream = concatStream;
function defaultHeaders(request) {
    if (!request.get('User-Agent')) {
        request.set('User-Agent', 'https://github.com/blakeembrey/popsicle');
    }
    if (request.body instanceof FormData) {
        request.set('Content-Type', 'multipart/form-data; boundary=' + request.body.getBoundary());
        return new Promise(function (resolve, reject) {
            request.body.getLength(function (err, length) {
                if (err) {
                    request.set('Transfer-Encoding', 'chunked');
                }
                else {
                    request.set('Content-Length', String(length));
                }
                return resolve();
            });
        });
    }
    var length = 0;
    var body = request.body;
    if (body && !request.get('Content-Length')) {
        if (Array.isArray(body)) {
            for (var i = 0; i < body.length; i++) {
                length += body[i].length;
            }
        }
        else if (typeof body === 'string') {
            length = Buffer.byteLength(body);
        }
        else {
            length = body.length;
        }
        if (length) {
            request.set('Content-Length', String(length));
        }
        else if (typeof body.pipe === 'function') {
            request.set('Transfer-Encoding', 'chunked');
        }
        else {
            return Promise.reject(request.error('Argument error, `options.body`', 'EBODY'));
        }
    }
}
function headers() {
    var defaults = common_2.headers();
    return function (request) {
        defaults(request);
        request.before(defaultHeaders);
    };
}
exports.headers = headers;
exports.defaults = [common_2.stringify(), headers(), unzip(), concatStream('string'), common_2.parse()];
//# sourceMappingURL=index.js.map