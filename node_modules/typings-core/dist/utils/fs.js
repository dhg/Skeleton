"use strict";
var fs = require('graceful-fs');
var Promise = require('any-promise');
var thenify = require('thenify');
var stripBom = require('strip-bom');
var parse = require('parse-json');
var popsicle = require('popsicle');
var popsicleStatus = require('popsicle-status');
var popsicleRetry = require('popsicle-retry');
var detectIndent = require('detect-indent');
var sortKeys = require('sort-keys');
var Mkdirp = require('mkdirp');
var uniq = require('array-uniq');
var lockfile = require('lockfile');
var Rimraf = require('rimraf');
var popsicleProxy = require('popsicle-proxy-agent');
var Throat = require('throat');
var promise_finally_1 = require('promise-finally');
var Touch = require('touch');
var path_1 = require('path');
var url_1 = require('url');
var template = require('string-template');
var config_1 = require('./config');
var path_2 = require('./path');
var references_1 = require('./references');
var rc_1 = require('./rc');
var store_1 = require('./store');
var debug_1 = require('./debug');
var pkg = require('../../package.json');
var registryURL = url_1.parse(rc_1.default.registryURL);
var throat = Throat(Promise);
exports.touch = throat(10, thenify(Touch));
exports.stat = throat(10, thenify(fs.stat));
exports.readFile = throat(10, thenify(fs.readFile));
exports.writeFile = thenify(fs.writeFile);
exports.mkdirp = throat(10, thenify(Mkdirp));
exports.unlink = throat(10, thenify(fs.unlink));
exports.lock = throat(10, thenify(lockfile.lock));
exports.unlock = throat(10, thenify(lockfile.unlock));
exports.rimraf = throat(10, thenify(Rimraf));
function isFile(path) {
    return exports.stat(path).then(function (stat) { return stat.isFile(); }, function () { return false; });
}
exports.isFile = isFile;
function readJson(path, allowEmpty) {
    return exports.readFile(path, 'utf8')
        .then(stripBom)
        .then(function (contents) { return parseJson(contents, path, allowEmpty); });
}
exports.readJson = readJson;
function writeJson(path, json, indent, eol) {
    return exports.writeFile(path, stringifyJson(json, indent, eol));
}
exports.writeJson = writeJson;
function readConfig(path) {
    return readJson(path, true).then(function (data) { return parseConfig(data, path); });
}
exports.readConfig = readConfig;
function readConfigFrom(path) {
    return readJsonFrom(path, true).then(function (data) { return parseConfig(data, path); });
}
exports.readConfigFrom = readConfigFrom;
function parseConfig(config, path) {
    return config;
}
exports.parseConfig = parseConfig;
exports.readHttp = throat(5, function readHttp(url) {
    var proxy = rc_1.default.proxy, httpProxy = rc_1.default.httpProxy, httpsProxy = rc_1.default.httpsProxy, noProxy = rc_1.default.noProxy, rejectUnauthorized = rc_1.default.rejectUnauthorized, ca = rc_1.default.ca, key = rc_1.default.key, cert = rc_1.default.cert, userAgent = rc_1.default.userAgent;
    return popsicle.get({
        url: url,
        headers: {
            'User-Agent': template(userAgent, {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                typingsVersion: pkg.version
            })
        },
        options: {
            ca: ca,
            key: key,
            cert: cert,
            rejectUnauthorized: rejectUnauthorized
        },
        use: [
            popsicle.plugins.headers(),
            popsicle.plugins.unzip(),
            popsicle.plugins.concatStream('string')
        ]
    })
        .use(popsicleProxy({ proxy: proxy, httpProxy: httpProxy, httpsProxy: httpsProxy, noProxy: noProxy }))
        .use(popsicleRetry())
        .use(popsicleStatus(200))
        .use(function (self) {
        var hostname = self.Url.hostname;
        if (self.Url.host === registryURL.host) {
            if (store_1.default.get('clientId')) {
                self.before(function (req) {
                    req.set('Typings-Client-Id', store_1.default.get('clientId'));
                });
            }
            else {
                self.after(function (res) {
                    store_1.default.set('clientId', res.get('Typings-Client-Id'));
                });
            }
        }
        if (rc_1.default.githubToken && (hostname === 'raw.githubusercontent.com' || hostname === 'api.github.com')) {
            self.before(function (req) {
                req.set('Authorization', "token " + rc_1.default.githubToken);
            });
        }
    })
        .then(function (response) {
        debug_1.default('http response', response.toJSON());
        return response.body;
    });
});
function readFileFrom(from) {
    return path_2.isHttp(from) ? exports.readHttp(from) : exports.readFile(from, 'utf8');
}
exports.readFileFrom = readFileFrom;
function readJsonFrom(from, allowEmpty) {
    return readFileFrom(from)
        .then(stripBom)
        .then(function (contents) { return parseJson(contents, from, allowEmpty); });
}
exports.readJsonFrom = readJsonFrom;
function stringifyJson(json, indent, eol) {
    if (eol === void 0) { eol = path_2.EOL; }
    return path_2.normalizeEOL(JSON.stringify(json, null, indent || 2), eol) + eol;
}
exports.stringifyJson = stringifyJson;
function parseJson(contents, path, allowEmpty) {
    if (contents === '' && allowEmpty) {
        return {};
    }
    return parse(contents, null, path);
}
exports.parseJson = parseJson;
function transformFile(path, transform) {
    function handle(contents) {
        return Promise.resolve(transform(contents))
            .then(function (contents) { return exports.writeFile(path, contents); });
    }
    var lockfile = path + ".lock";
    var lockOptions = { wait: 250, retries: 25, stale: 60000 };
    var result = exports.lock(lockfile, lockOptions)
        .then(function () {
        return exports.readFile(path, 'utf8');
    })
        .then(function (contents) { return handle(contents); }, function () { return handle(undefined); });
    return promise_finally_1.default(result, function () { return exports.unlock(lockfile); });
}
exports.transformFile = transformFile;
function transformJson(path, transform, allowEmpty) {
    return transformFile(path, function (contents) {
        var indent = contents ? detectIndent(contents).indent : undefined;
        var json = contents ? parseJson(contents, path, allowEmpty) : undefined;
        var eol = contents ? path_2.detectEOL(contents) : undefined;
        return Promise.resolve(transform(json))
            .then(function (json) { return stringifyJson(json, indent, eol); });
    });
}
exports.transformJson = transformJson;
function transformConfig(cwd, transform) {
    var path = path_1.join(cwd, config_1.CONFIG_FILE);
    return transformJson(path, function (config) {
        if (config === void 0) { config = {}; }
        return Promise.resolve(transform(parseConfig(config, path)))
            .then(function (config) {
            if (config.dependencies) {
                config.dependencies = sortKeys(config.dependencies);
            }
            if (config.peerDependencies) {
                config.peerDependencies = sortKeys(config.peerDependencies);
            }
            if (config.devDependencies) {
                config.devDependencies = sortKeys(config.devDependencies);
            }
            if (config.ambientDependencies) {
                config.ambientDependencies = sortKeys(config.ambientDependencies);
            }
            if (config.ambientDevDependencies) {
                config.ambientDevDependencies = sortKeys(config.ambientDevDependencies);
            }
            return config;
        });
    }, true);
}
exports.transformConfig = transformConfig;
function transformDtsFile(path, transform) {
    var cwd = path_1.dirname(path);
    return transformFile(path, function (contents) {
        var typings = references_1.parseReferences(contents, cwd);
        return Promise.resolve(transform(typings))
            .then(function (typings) { return references_1.stringifyReferences(uniq(typings).sort(), cwd); });
    });
}
exports.transformDtsFile = transformDtsFile;
//# sourceMappingURL=fs.js.map