var Promise = require('any-promise');
var index_1 = require('./plugins/index');
exports.use = index_1.defaults;
function open(request) {
    return new Promise(function (resolve, reject) {
        var url = request.url, method = request.method;
        var responseType = request.options.responseType;
        if (window.location.protocol === 'https:' && /^http\:/.test(url)) {
            return reject(request.error("The request to \"" + url + "\" was blocked", 'EBLOCKED'));
        }
        var xhr = request.raw = new XMLHttpRequest();
        xhr.onload = function () {
            return resolve({
                status: xhr.status === 1223 ? 204 : xhr.status,
                statusText: xhr.statusText,
                rawHeaders: parseToRawHeaders(xhr.getAllResponseHeaders()),
                body: responseType ? xhr.response : xhr.responseText,
                url: xhr.responseURL
            });
        };
        xhr.onabort = function () {
            return reject(request.error('Request aborted', 'EABORT'));
        };
        xhr.onerror = function () {
            return reject(request.error("Unable to connect to \"" + request.url + "\"", 'EUNAVAILABLE'));
        };
        xhr.onprogress = function (e) {
            if (e.lengthComputable) {
                request.downloadLength = e.total;
            }
            request.downloadedBytes = e.loaded;
        };
        if (method === 'GET' || method === 'HEAD' || !xhr.upload) {
            request.uploadLength = 0;
            request.uploadedBytes = 0;
        }
        else {
            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable) {
                    request.uploadLength = e.total;
                }
                request.uploadedBytes = e.loaded;
            };
        }
        try {
            xhr.open(method, url);
        }
        catch (e) {
            return reject(request.error("Refused to connect to \"" + url + "\"", 'ECSP', e));
        }
        if (request.options.withCredentials) {
            xhr.withCredentials = true;
        }
        if (responseType) {
            try {
                xhr.responseType = responseType;
            }
            finally {
                if (xhr.responseType !== responseType) {
                    throw request.error("Unsupported response type: " + responseType, 'ERESPONSETYPE');
                }
            }
        }
        for (var i = 0; i < request.rawHeaders.length; i += 2) {
            xhr.setRequestHeader(request.rawHeaders[i], request.rawHeaders[i + 1]);
        }
        xhr.send(request.body);
    });
}
exports.open = open;
function abort(request) {
    request.raw.abort();
}
exports.abort = abort;
function parseToRawHeaders(headers) {
    var rawHeaders = [];
    var lines = headers.replace(/\r?\n$/, '').split(/\r?\n/);
    for (var _i = 0; _i < lines.length; _i++) {
        var header = lines[_i];
        var indexOf = header.indexOf(':');
        var name_1 = header.substr(0, indexOf).trim();
        var value = header.substr(indexOf + 1).trim();
        rawHeaders.push(name_1, value);
    }
    return rawHeaders;
}
//# sourceMappingURL=browser.js.map