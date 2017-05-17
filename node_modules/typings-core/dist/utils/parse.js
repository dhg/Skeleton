"use strict";
var invariant = require('invariant');
var url_1 = require('url');
var path_1 = require('path');
var config_1 = require('./config');
var path_2 = require('./path');
var rc_1 = require('./rc');
function gitFromPath(src) {
    var index = src.indexOf('#');
    var sha = index === -1 ? 'master' : src.substr(index + 1);
    var segments = index === -1 ? src.split('/') : src.substr(0, index).split('/');
    var org = segments.shift();
    var repo = segments.shift();
    var path = segments.join('/');
    var name;
    if (segments.length === 0) {
        path = config_1.CONFIG_FILE;
    }
    else if (path_2.isDefinition(path)) {
        name = path_1.basename(path_2.pathFromDefinition(path));
    }
    else if (segments[segments.length - 1] !== config_1.CONFIG_FILE) {
        path += "/" + config_1.CONFIG_FILE;
    }
    return { org: org, repo: repo, path: path, sha: sha, name: name };
}
function splitProtocol(raw) {
    var index = raw.indexOf(':');
    if (index === -1) {
        return [undefined, raw];
    }
    return [raw.substr(0, index), path_2.normalizeSlashes(raw.substr(index + 1))];
}
function parseDependency(raw) {
    var _a = splitProtocol(raw), type = _a[0], src = _a[1];
    if (type === 'file') {
        var location = path_1.normalize(src);
        var filename = path_1.basename(location);
        var name = path_2.isDefinition(filename) ? path_2.pathFromDefinition(filename) : undefined;
        invariant(filename === config_1.CONFIG_FILE || path_2.isDefinition(filename), "Only \".d.ts\" and \"" + config_1.CONFIG_FILE + "\" files are supported");
        return {
            raw: raw,
            type: type,
            meta: {
                name: name,
                path: location
            },
            location: location
        };
    }
    if (type === 'github') {
        var meta = gitFromPath(src);
        var org = meta.org, repo = meta.repo, path = meta.path, sha = meta.sha;
        var location = "https://raw.githubusercontent.com/" + org + "/" + repo + "/" + sha + "/" + path;
        return {
            raw: raw,
            meta: meta,
            type: type,
            location: location
        };
    }
    if (type === 'bitbucket') {
        var meta = gitFromPath(src);
        var org = meta.org, repo = meta.repo, path = meta.path, sha = meta.sha;
        var location = "https://bitbucket.org/" + org + "/" + repo + "/raw/" + sha + "/" + path;
        return {
            raw: raw,
            meta: meta,
            type: type,
            location: location
        };
    }
    if (type === 'npm') {
        var parts = src.split('/');
        var isScoped = parts.length > 0 && parts[0].charAt(0) === '@';
        var hasPath = isScoped ? parts.length > 2 : parts.length > 1;
        if (!hasPath) {
            parts.push('package.json');
        }
        return {
            raw: raw,
            type: 'npm',
            meta: {
                name: isScoped ? parts.slice(0, 2).join('/') : parts[0],
                path: path_1.join.apply(void 0, parts.slice(isScoped ? 2 : 1))
            },
            location: path_1.join.apply(void 0, parts)
        };
    }
    if (type === 'bower') {
        var parts = src.split('/');
        if (parts.length === 1) {
            parts.push('bower.json');
        }
        return {
            raw: raw,
            type: 'bower',
            meta: {
                name: parts[0],
                path: path_1.join.apply(void 0, parts.slice(1))
            },
            location: path_1.join.apply(void 0, parts)
        };
    }
    if (type === 'http' || type === 'https') {
        return {
            raw: raw,
            type: type,
            meta: {},
            location: raw
        };
    }
    if (type === 'registry') {
        var parts = /^([^\/]+)\/(.+?)(?:@(.*?)|#(.*?))?$/.exec(src);
        if (parts == null) {
            throw new TypeError("Unable to parse: " + raw);
        }
        var source = parts[1], name = parts[2], version = parts[3], tag = parts[4];
        if (version != null && tag != null) {
            throw new TypeError("Unable to use tag and version together: " + raw);
        }
        var path = "/entries/" + encodeURIComponent(source) + "/" + encodeURIComponent(name);
        if (tag) {
            path += "/tags/" + encodeURIComponent(tag);
        }
        else if (version) {
            path += "/versions/" + encodeURIComponent(version) + "/latest";
        }
        else {
            path += '/versions/latest';
        }
        return {
            raw: raw,
            type: type,
            meta: {
                source: source,
                name: name,
                version: version,
                tag: tag
            },
            location: url_1.resolve(rc_1.default.registryURL, path)
        };
    }
    throw new TypeError("Unknown dependency: " + raw);
}
exports.parseDependency = parseDependency;
function resolveDependency(raw, path) {
    var _a = parseDependency(raw), type = _a.type, meta = _a.meta, location = _a.location;
    if (type === 'github' || type === 'bitbucket') {
        var org = meta.org, repo = meta.repo, sha = meta.sha;
        var resolvedPath = path_2.normalizeSlashes(path_1.join(path_1.dirname(meta.path), path));
        return type + ":" + org + "/" + repo + "/" + resolvedPath + (sha === 'master' ? '' : '#' + sha);
    }
    if (type === 'npm' || type === 'bower') {
        var resolvedPath = path_2.normalizeSlashes(path_1.join(path_1.dirname(meta.path), path));
        return type + ":" + meta.name + "/" + resolvedPath;
    }
    if (type === 'http' || type === 'https') {
        return url_1.resolve(location, path);
    }
    if (type === 'file') {
        return "file:" + path_2.normalizeSlashes(path_1.join(location, path));
    }
    throw new TypeError("Unable to resolve dependency from \"" + raw + "\"");
}
exports.resolveDependency = resolveDependency;
function parseDependencyExpression(raw, options) {
    var _a = /^(?:([^=!:#]+)=)?(?:([\w]+\:.+)|((?:[\w]+\!)?.+))$/.exec(raw), name = _a[1], scheme = _a[2], registry = _a[3];
    var location = scheme || expandRegistry(registry, options);
    return {
        name: name,
        location: location
    };
}
exports.parseDependencyExpression = parseDependencyExpression;
function expandRegistry(raw, options) {
    if (options === void 0) { options = {}; }
    if (typeof raw !== 'string') {
        throw new TypeError("Expected registry name to be a string, not " + typeof raw);
    }
    var indexOf = raw.indexOf('!');
    var source = options.ambient ? rc_1.default.defaultAmbientSource : rc_1.default.defaultSource;
    var name;
    if (indexOf === -1) {
        name = raw;
    }
    else {
        source = raw.substr(0, indexOf);
        name = raw.substr(indexOf + 1);
    }
    return "registry:" + source + "/" + name;
}
exports.expandRegistry = expandRegistry;
//# sourceMappingURL=parse.js.map