"use strict";
var extend = require('xtend');
var invariant = require('invariant');
var zipObject = require('zip-object');
var Promise = require('any-promise');
var path_1 = require('path');
var url_1 = require('url');
var fs_1 = require('../utils/fs');
var parse_1 = require('../utils/parse');
var find_1 = require('../utils/find');
var path_2 = require('../utils/path');
var config_1 = require('../utils/config');
var error_1 = require('./error');
var DEFAULT_DEPENDENCY = {
    src: undefined,
    raw: undefined,
    main: undefined,
    browser: undefined,
    typings: undefined,
    browserTypings: undefined,
    version: undefined,
    files: undefined,
    ambient: undefined,
    postmessage: undefined,
    dependencies: {},
    devDependencies: {},
    peerDependencies: {},
    ambientDependencies: {},
    ambientDevDependencies: {}
};
function resolveAllDependencies(options) {
    return Promise.all([
        resolveBowerDependencies(options).catch(function () { return extend(DEFAULT_DEPENDENCY); }),
        resolveNpmDependencies(options).catch(function () { return extend(DEFAULT_DEPENDENCY); }),
        resolveTypeDependencies(options).catch(function () { return extend(DEFAULT_DEPENDENCY); })
    ])
        .then(function (trees) { return mergeDependencies.apply(void 0, [DEFAULT_DEPENDENCY].concat(trees)); });
}
exports.resolveAllDependencies = resolveAllDependencies;
function resolveDependency(dependency, options, parent) {
    var type = dependency.type, location = dependency.location, raw = dependency.raw, meta = dependency.meta;
    if (type === 'registry') {
        return resolveDependencyRegistry(dependency, options, parent);
    }
    if (type === 'github' || type === 'bitbucket') {
        if (meta.sha === 'master') {
            options.emitter.emit('badlocation', { type: type, raw: raw, location: location });
        }
    }
    return resolveDependencyInternally(type, location, raw, options, parent);
}
exports.resolveDependency = resolveDependency;
function resolveDependencyInternally(type, location, raw, options, parent) {
    if (type === 'npm') {
        return resolveNpmDependency(location, raw, options, parent);
    }
    if (type === 'bower') {
        return resolveBowerDependency(location, raw, options, parent);
    }
    return resolveFileDependency(location, raw, options, parent);
}
function resolveDependencyRegistry(dependency, options, parent) {
    var location = dependency.location, meta = dependency.meta;
    return fs_1.readJsonFrom(location)
        .then(function (entry) {
        var _a = parse_1.parseDependency(entry.location), type = _a.type, location = _a.location;
        var raw = "registry:" + meta.source + "/" + meta.name + "#" + entry.tag;
        if (entry.deprecated) {
            options.emitter.emit('deprecated', {
                parent: parent,
                raw: dependency.raw,
                date: new Date(entry.deprecated)
            });
        }
        return resolveDependencyInternally(type, location, raw, options, parent);
    }, function (error) {
        if (error.code === 'EINVALIDSTATUS' && error.status === 404) {
            var prompt = parent ? '' : options.ambient ?
                'Have you checked for regular typings without using ambient? ' :
                'Did you want to install ambient typings with the ambient flag? ';
            var message = ("Unable to find \"" + meta.name + "\" for \"" + meta.source + "\" in the registry. ") +
                prompt + "If you can contribute these typings, please help us: " +
                "https://github.com/typings/registry";
            return Promise.reject(new error_1.default(message, error));
        }
        return Promise.reject(error);
    });
}
function resolveNpmDependency(name, raw, options, parent) {
    return find_1.findUp(options.cwd, path_1.join('node_modules', name))
        .then(function (modulePath) {
        if (path_2.isDefinition(modulePath)) {
            return resolveFileDependency(modulePath, raw, options, parent);
        }
        return resolveNpmDependencyFrom(modulePath, raw, options, parent);
    }, function (error) {
        return Promise.reject(resolveError(raw, error, parent));
    });
}
function resolveBowerDependency(name, raw, options, parent) {
    return resolveBowerComponentPath(options.cwd)
        .then(function (componentPath) {
        var modulePath = path_1.resolve(componentPath, name);
        if (path_2.isDefinition(modulePath)) {
            return resolveFileDependency(modulePath, raw, options, parent);
        }
        return resolveBowerDependencyFrom(modulePath, raw, componentPath, options, parent);
    }, function (error) {
        return Promise.reject(resolveError(raw, error, parent));
    });
}
function resolveFileDependency(location, raw, options, parent) {
    var src;
    if (path_2.isHttp(location)) {
        src = location;
    }
    else if (parent && path_2.isHttp(parent.src)) {
        src = url_1.resolve(parent.src, location);
    }
    else {
        src = path_1.resolve(options.cwd, location);
    }
    if (!path_2.isDefinition(src)) {
        return resolveTypeDependencyFrom(src, raw, options, parent);
    }
    options.emitter.emit('resolve', { src: src, raw: raw, parent: parent });
    var tree = extend(DEFAULT_DEPENDENCY, {
        typings: src,
        src: src,
        raw: raw,
        parent: parent
    });
    options.emitter.emit('resolved', { src: src, tree: tree, raw: raw, parent: parent });
    return Promise.resolve(tree);
}
function resolveBowerDependencies(options) {
    return find_1.findUp(options.cwd, 'bower.json')
        .then(function (bowerJsonPath) {
        return resolveBowerComponentPath(path_1.dirname(bowerJsonPath))
            .then(function (componentPath) {
            return resolveBowerDependencyFrom(bowerJsonPath, undefined, componentPath, options);
        });
    }, function (cause) {
        return Promise.reject(new error_1.default("Unable to resolve Bower dependencies", cause));
    });
}
exports.resolveBowerDependencies = resolveBowerDependencies;
function resolveBowerDependencyFrom(src, raw, componentPath, options, parent) {
    checkCircularDependency(parent, src);
    options.emitter.emit('resolve', { src: src, raw: raw, parent: parent });
    return fs_1.readJson(src)
        .then(function (bowerJson) {
        if (bowerJson === void 0) { bowerJson = {}; }
        var tree = extend(DEFAULT_DEPENDENCY, {
            name: bowerJson.name,
            version: bowerJson.version,
            main: bowerJson.main,
            browser: bowerJson.browser,
            typings: bowerJson.typings,
            browserTypings: bowerJson.browserTypings,
            ambient: false,
            src: src,
            raw: raw,
            parent: parent
        });
        var dependencyMap = extend(bowerJson.dependencies);
        var devDependencyMap = extend(options.dev ? bowerJson.devDependencies : {});
        return Promise.all([
            resolveBowerDependencyMap(componentPath, dependencyMap, options, tree),
            resolveBowerDependencyMap(componentPath, devDependencyMap, options, tree),
            maybeResolveTypeDependencyFrom(path_1.join(src, '..', config_1.CONFIG_FILE), raw, options, parent)
        ])
            .then(function (_a) {
            var dependencies = _a[0], devDependencies = _a[1], typedPackage = _a[2];
            tree.dependencies = dependencies;
            tree.devDependencies = devDependencies;
            options.emitter.emit('resolved', { src: src, tree: tree, raw: raw, parent: parent });
            return mergeDependencies(tree, typedPackage);
        });
    }, function (error) {
        return Promise.reject(resolveError(raw, error, parent));
    });
}
function resolveBowerComponentPath(path) {
    return fs_1.readJson(path_1.resolve(path, '.bowerrc'))
        .then(function (bowerrc) {
        if (bowerrc === void 0) { bowerrc = {}; }
        return path_1.resolve(path, bowerrc.directory || 'bower_components');
    }, function () {
        return path_1.resolve(path, 'bower_components');
    });
}
function resolveBowerDependencyMap(componentPath, dependencies, options, parent) {
    var keys = Object.keys(dependencies);
    var cwd = options.cwd, emitter = options.emitter;
    return Promise.all(keys.map(function (name) {
        var modulePath = path_1.resolve(componentPath, name, 'bower.json');
        var resolveOptions = { dev: false, ambient: false, peer: false, cwd: cwd, emitter: emitter };
        return resolveBowerDependencyFrom(modulePath, "bower:" + name, componentPath, resolveOptions, parent);
    }))
        .then(function (results) { return zipObject(keys, results); });
}
function resolveNpmDependencies(options) {
    return find_1.findUp(options.cwd, 'package.json')
        .then(function (packgeJsonPath) {
        return resolveNpmDependencyFrom(packgeJsonPath, undefined, options);
    }, function (cause) {
        return Promise.reject(new error_1.default("Unable to resolve NPM dependencies", cause));
    });
}
exports.resolveNpmDependencies = resolveNpmDependencies;
function resolveNpmDependencyFrom(src, raw, options, parent) {
    checkCircularDependency(parent, src);
    options.emitter.emit('resolve', { src: src, raw: raw, parent: parent });
    return fs_1.readJson(src)
        .then(function (packageJson) {
        if (packageJson === void 0) { packageJson = {}; }
        var tree = extend(DEFAULT_DEPENDENCY, {
            name: packageJson.name,
            version: packageJson.version,
            main: packageJson.main,
            browser: packageJson.browser,
            typings: packageJson.typings,
            browserTypings: packageJson.browserTypings,
            ambient: false,
            src: src,
            raw: raw,
            parent: parent
        });
        var dependencyMap = extend(packageJson.dependencies);
        var devDependencyMap = extend(options.dev ? packageJson.devDependencies : {});
        var peerDependencyMap = extend(options.peer ? packageJson.peerDependencies : {});
        return Promise.all([
            resolveNpmDependencyMap(src, dependencyMap, options, tree),
            resolveNpmDependencyMap(src, devDependencyMap, options, tree),
            resolveNpmDependencyMap(src, peerDependencyMap, options, tree),
            maybeResolveTypeDependencyFrom(path_1.join(src, '..', config_1.CONFIG_FILE), raw, options, parent)
        ])
            .then(function (_a) {
            var dependencies = _a[0], devDependencies = _a[1], peerDependencies = _a[2], typedPackage = _a[3];
            tree.dependencies = dependencies;
            tree.devDependencies = devDependencies;
            tree.peerDependencies = peerDependencies;
            options.emitter.emit('resolved', { src: src, tree: tree, raw: raw, parent: parent });
            return mergeDependencies(tree, typedPackage);
        });
    }, function (error) {
        return Promise.reject(resolveError(raw, error, parent));
    });
}
function resolveNpmDependencyMap(src, dependencies, options, parent) {
    var cwd = path_1.dirname(src);
    var keys = Object.keys(dependencies);
    return Promise.all(keys.map(function (name) {
        var resolveOptions = { dev: false, peer: false, ambient: false, cwd: cwd, emitter: options.emitter };
        return resolveNpmDependency(path_1.join(name, 'package.json'), "npm:" + name, resolveOptions, parent);
    }))
        .then(function (results) { return zipObject(keys, results); });
}
function resolveTypeDependencies(options) {
    return find_1.findConfigFile(options.cwd)
        .then(function (path) {
        return resolveTypeDependencyFrom(path, undefined, options);
    }, function (cause) {
        return Promise.reject(new error_1.default("Unable to resolve Typings dependencies", cause));
    });
}
exports.resolveTypeDependencies = resolveTypeDependencies;
function resolveTypeDependencyFrom(src, raw, options, parent) {
    checkCircularDependency(parent, src);
    options.emitter.emit('resolve', { src: src, raw: raw, parent: parent });
    return fs_1.readConfigFrom(src)
        .then(function (config) {
        var tree = extend(DEFAULT_DEPENDENCY, {
            name: config.name,
            main: config.main,
            version: config.version,
            browser: config.browser,
            files: Array.isArray(config.files) ? config.files : undefined,
            type: config_1.PROJECT_NAME,
            ambient: !!config.ambient,
            postmessagee: typeof config.postmessage === 'string' ? config.postmessage : undefined,
            src: src,
            raw: raw,
            parent: parent
        });
        var ambient = options.ambient, dev = options.dev, peer = options.peer;
        var dependencyMap = extend(config.dependencies);
        var devDependencyMap = extend(dev ? config.devDependencies : {});
        var peerDependencyMap = extend(peer ? config.peerDependencies : {});
        var ambientDependencyMap = extend(ambient ? config.ambientDependencies : {});
        var ambientDevDependencyMap = extend(ambient && dev ? config.ambientDevDependencies : {});
        if (parent == null && config.ambientDependencies) {
            options.emitter.emit('ambientdependencies', {
                name: config.name,
                raw: raw,
                dependencies: config.ambientDependencies
            });
        }
        return Promise.all([
            resolveTypeDependencyMap(src, dependencyMap, options, tree),
            resolveTypeDependencyMap(src, devDependencyMap, options, tree),
            resolveTypeDependencyMap(src, peerDependencyMap, options, tree),
            resolveTypeDependencyMap(src, ambientDependencyMap, options, tree),
            resolveTypeDependencyMap(src, ambientDevDependencyMap, options, tree),
        ])
            .then(function (_a) {
            var dependencies = _a[0], devDependencies = _a[1], peerDependencies = _a[2], ambientDependencies = _a[3], ambientDevDependencies = _a[4];
            tree.dependencies = dependencies;
            tree.devDependencies = devDependencies;
            tree.peerDependencies = peerDependencies;
            tree.ambientDependencies = ambientDependencies;
            tree.ambientDevDependencies = ambientDevDependencies;
            options.emitter.emit('resolved', { src: src, tree: tree, raw: raw, parent: parent });
            return tree;
        });
    }, function (error) {
        return Promise.reject(resolveError(raw, error, parent));
    });
}
function maybeResolveTypeDependencyFrom(src, raw, options, parent) {
    return resolveTypeDependencyFrom(src, raw, options, parent).catch(function () { return extend(DEFAULT_DEPENDENCY); });
}
function resolveTypeDependencyMap(src, dependencies, options, parent) {
    var cwd = path_1.dirname(src);
    var keys = Object.keys(dependencies);
    return Promise.all(keys.map(function (name) {
        var resolveOptions = { dev: false, ambient: false, peer: false, cwd: cwd, emitter: options.emitter };
        return resolveDependency(parse_1.parseDependency(dependencies[name]), resolveOptions, parent);
    }))
        .then(function (results) { return zipObject(keys, results); });
}
function checkCircularDependency(tree, filename) {
    if (tree) {
        var currentSrc = tree.src;
        do {
            invariant(tree.src !== filename, "Circular dependency detected using \"" + currentSrc + "\"");
        } while (tree = tree.parent);
    }
}
function resolveError(raw, cause, parent) {
    var message = "Unable to resolve " + (raw == null ? 'typings' : "\"" + raw + "\"");
    if (parent != null && parent.raw != null) {
        message += " from \"" + parent.raw + "\"";
    }
    return new error_1.default(message, cause);
}
function mergeDependencies(root) {
    var trees = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        trees[_i - 1] = arguments[_i];
    }
    var dependency = extend(root);
    for (var _a = 0, trees_1 = trees; _a < trees_1.length; _a++) {
        var tree = trees_1[_a];
        if (tree == null) {
            continue;
        }
        var name = tree.name, raw = tree.raw, src = tree.src, main = tree.main, browser = tree.browser, typings = tree.typings, browserTypings = tree.browserTypings, parent = tree.parent, files = tree.files, ambient = tree.ambient;
        if (parent != null) {
            dependency.parent = parent;
        }
        if (ambient != null) {
            dependency.ambient = ambient;
        }
        if (typeof name === 'string') {
            dependency.name = name;
        }
        if (typeof raw === 'string') {
            dependency.raw = raw;
        }
        if (main != null || browser != null || typings != null || browserTypings != null || files != null) {
            dependency.src = src;
            dependency.main = main;
            dependency.files = files;
            dependency.browser = browser;
            dependency.typings = typings;
            dependency.browserTypings = browserTypings;
        }
        dependency.dependencies = extend(dependency.dependencies, tree.dependencies);
        dependency.devDependencies = extend(dependency.devDependencies, tree.devDependencies);
        dependency.peerDependencies = extend(dependency.peerDependencies, tree.peerDependencies);
        dependency.ambientDependencies = extend(dependency.ambientDependencies, tree.ambientDependencies);
        dependency.ambientDevDependencies = extend(dependency.ambientDevDependencies, tree.ambientDevDependencies);
    }
    return dependency;
}
//# sourceMappingURL=dependencies.js.map