"use strict";
var ts = require('typescript');
var extend = require('xtend');
var has = require('has');
var Promise = require('any-promise');
var path_1 = require('path');
var fs_1 = require('../utils/fs');
var path_2 = require('../utils/path');
var path_3 = require('../utils/path');
var references_1 = require('../utils/references');
var config_1 = require('../utils/config');
var error_1 = require('./error');
function compile(tree, options) {
    var name = options.name;
    var readFiles = {};
    if (tree.ambient && !options.ambient) {
        return Promise.reject(new error_1.default(("Unable to compile \"" + options.name + "\", the typings are meant to be installed as ") +
            "ambient but attempted to be compiled as an external module"));
    }
    return Promise.all([
        compileDependencyTree(tree, extend(options, {
            browser: false,
            readFiles: readFiles,
            imported: {}
        })),
        compileDependencyTree(tree, extend(options, {
            browser: true,
            readFiles: readFiles,
            imported: {}
        }))
    ])
        .then(function (_a) {
        var main = _a[0], browser = _a[1];
        return {
            name: name,
            tree: tree,
            main: main,
            browser: browser
        };
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compile;
function resolveFromOverride(src, to, tree) {
    if (typeof to === 'string') {
        if (path_3.isModuleName(to)) {
            var _a = getModuleNameParts(to, tree), moduleName = _a[0], modulePath = _a[1];
            return modulePath ? path_3.normalizeToDefinition(to) : moduleName;
        }
        return path_3.resolveFrom(src, path_3.normalizeToDefinition(to));
    }
    return to ? src : undefined;
}
function resolveFromWithModuleName(src, to, tree) {
    if (path_3.isModuleName(to)) {
        var _a = getModuleNameParts(to, tree), moduleName = _a[0], modulePath = _a[1];
        return modulePath ? path_3.toDefinition(to) : moduleName;
    }
    return path_3.resolveFrom(src, path_3.toDefinition(to));
}
function getStringifyOptions(tree, options, parent) {
    var overrides = {};
    var isTypings = typeof tree.typings === 'string';
    var main = isTypings ? tree.typings : tree.main;
    var browser = isTypings ? tree.browserTypings : tree.browser;
    if (options.browser && browser) {
        if (typeof browser === 'string') {
            var mainDefinition = path_3.resolveFrom(tree.src, path_3.normalizeToDefinition(main));
            var browserDefinition = path_3.resolveFrom(tree.src, path_3.normalizeToDefinition(browser));
            overrides[mainDefinition] = browserDefinition;
        }
        else {
            for (var _i = 0, _a = Object.keys(browser); _i < _a.length; _i++) {
                var key = _a[_i];
                var from = resolveFromOverride(tree.src, key, tree);
                var to = resolveFromOverride(tree.src, browser[key], tree);
                overrides[from] = to;
            }
        }
    }
    var referenced = {};
    var dependencies = {};
    var entry = main == null ? main : path_3.resolveFrom(tree.src, path_3.normalizeToDefinition(main));
    var prefix = "" + (parent ? parent.prefix : '') + config_1.DEPENDENCY_SEPARATOR + options.name;
    return extend(options, {
        tree: tree,
        entry: entry,
        prefix: prefix,
        isTypings: isTypings,
        overrides: overrides,
        referenced: referenced,
        dependencies: dependencies,
        parent: parent
    });
}
function compileDependencyTree(tree, options) {
    var stringifyOptions = getStringifyOptions(tree, options, undefined);
    var contents = [];
    if (Array.isArray(tree.files)) {
        for (var _i = 0, _a = tree.files; _i < _a.length; _i++) {
            var file = _a[_i];
            contents.push(compileDependencyPath(file, stringifyOptions));
        }
    }
    if (stringifyOptions.entry || contents.length === 0) {
        contents.push(compileDependencyPath(null, stringifyOptions));
    }
    return Promise.all(contents).then(function (out) { return out.join(path_2.EOL); });
}
function compileDependencyPath(path, options) {
    var tree = options.tree, entry = options.entry;
    if (path == null) {
        if (entry == null) {
            return Promise.reject(new error_1.default(("Unable to resolve entry \".d.ts\" file for \"" + options.name + "\", ") +
                'please make sure the module has a main or typings field'));
        }
        return stringifyDependencyPath(path_3.resolveFrom(tree.src, entry), options);
    }
    return stringifyDependencyPath(path_3.resolveFrom(tree.src, path), options);
}
function cachedReadFileFrom(path, options) {
    if (!has(options.readFiles, path)) {
        options.readFiles[path] = fs_1.readFileFrom(path);
    }
    return options.readFiles[path];
}
function cachedStringifyOptions(name, compileOptions, options) {
    var tree = getDependency(name, options);
    if (!has(options.dependencies, name)) {
        if (tree) {
            options.dependencies[name] = getStringifyOptions(tree, compileOptions, options);
        }
        else {
            options.dependencies[name] = null;
        }
    }
    return options.dependencies[name];
}
function getPath(path, options) {
    if (has(options.overrides, path)) {
        return options.overrides[path];
    }
    return path;
}
function getDependency(name, options) {
    var tree = options.tree, overrides = options.overrides;
    if (has(overrides, name)) {
        if (overrides[name]) {
            return tree.dependencies[overrides[name]];
        }
    }
    else if (has(tree.dependencies, name)) {
        return tree.dependencies[name];
    }
}
function stringifyDependencyPath(path, options) {
    var resolved = getPath(path, options);
    var tree = options.tree, ambient = options.ambient, cwd = options.cwd, browser = options.browser, name = options.name, readFiles = options.readFiles, imported = options.imported, meta = options.meta, entry = options.entry, emitter = options.emitter;
    var importedPath = importPath(path, path_3.pathFromDefinition(path), options);
    if (has(options.imported, importedPath)) {
        return Promise.resolve(null);
    }
    options.imported[importedPath] = true;
    emitter.emit('compile', { name: name, path: path, tree: tree, browser: browser });
    function loadByModuleName(path) {
        var _a = getModuleNameParts(path, tree), moduleName = _a[0], modulePath = _a[1];
        var compileOptions = { cwd: cwd, browser: browser, readFiles: readFiles, imported: imported, emitter: emitter, name: moduleName, ambient: false, meta: meta };
        var stringifyOptions = cachedStringifyOptions(moduleName, compileOptions, options);
        if (!stringifyOptions) {
            return Promise.resolve(null);
        }
        return compileDependencyPath(modulePath, stringifyOptions);
    }
    if (path_3.isModuleName(resolved)) {
        return loadByModuleName(resolved);
    }
    return cachedReadFileFrom(resolved, options)
        .then(function (rawContents) {
        var info = ts.preProcessFile(rawContents);
        if (info.isLibFile) {
            return;
        }
        var importedFiles = info.importedFiles.map(function (x) { return resolveFromWithModuleName(resolved, x.fileName, tree); });
        var referencedFiles = info.referencedFiles.map(function (x) { return path_3.resolveFrom(resolved, x.fileName); });
        if (ambient) {
            Object.keys(tree.dependencies).forEach(function (x) { return importedFiles.push(x); });
        }
        var imports = importedFiles.map(function (importedFile) {
            var path = getPath(importedFile, options);
            if (path_3.isModuleName(path)) {
                return loadByModuleName(path);
            }
            return stringifyDependencyPath(path, options);
        });
        return Promise.all(imports)
            .then(function (imports) {
            var stringified = stringifyFile(resolved, rawContents, path, options);
            for (var _i = 0, referencedFiles_1 = referencedFiles; _i < referencedFiles_1.length; _i++) {
                var reference = referencedFiles_1[_i];
                emitter.emit('reference', { name: name, path: path, reference: reference, tree: tree, browser: browser });
            }
            var out = imports.filter(function (x) { return x != null; });
            out.push(stringified);
            var contents = out.join(path_2.EOL);
            emitter.emit('compiled', { name: name, path: path, tree: tree, browser: browser, contents: contents });
            return contents;
        });
    }, function (cause) {
        var authorPhrase = options.parent ? "The author of \"" + options.parent.name + "\" needs to" : 'You should';
        var relativePath = path_3.relativeTo(tree.src, resolved);
        if (path === entry) {
            return Promise.reject(new error_1.default(("Unable to read typings for \"" + options.name + "\". ") +
                (authorPhrase + " check the entry paths in \"" + path_1.basename(tree.src) + "\" are up to date"), cause));
        }
        return Promise.reject(new error_1.default(("Unable to read \"" + relativePath + "\" from \"" + options.name + "\". ") +
            (authorPhrase + " validate all import paths are accurate (case sensitive and relative)"), cause));
    });
}
function getModuleNameParts(name, tree) {
    var parts = name.split(/[\\\/]/g);
    var len = parts.length;
    while (len--) {
        var name_1 = parts.slice(0, len).join('/');
        var path = parts.slice(len).join('/');
        if (tree.dependencies[name_1]) {
            return [name_1, path];
        }
    }
    return [parts.join('/'), null];
}
function importPath(path, name, options) {
    var prefix = options.prefix, tree = options.tree;
    var resolved = getPath(resolveFromWithModuleName(path, name, tree), options);
    if (path_3.isModuleName(resolved)) {
        var _a = getModuleNameParts(resolved, tree), moduleName = _a[0], modulePath = _a[1];
        if (tree.dependencies[moduleName] == null) {
            return name;
        }
        return "" + prefix + config_1.DEPENDENCY_SEPARATOR + (modulePath ? path_3.pathFromDefinition(resolved) : resolved);
    }
    var relativePath = path_3.relativeTo(tree.src, path_3.pathFromDefinition(resolved));
    return path_3.normalizeSlashes(path_1.join(prefix, relativePath));
}
function stringifyFile(path, rawContents, rawPath, options) {
    var contents = rawContents.replace(references_1.REFERENCE_REGEXP, '');
    var sourceFile = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true);
    var tree = options.tree, name = options.name, prefix = options.prefix, parent = options.parent, isTypings = options.isTypings, cwd = options.cwd, ambient = options.ambient, entry = options.entry;
    var source = path_3.isHttp(path) ? path : path_3.normalizeSlashes(path_1.relative(cwd, path));
    var meta = options.meta ? "// Generated by " + config_1.PROJECT_NAME + path_2.EOL + "// Source: " + source + path_2.EOL : '';
    if (ambient) {
        if (sourceFile.externalModuleIndicator) {
            throw new error_1.default(("Attempted to compile \"" + name + "\" as an ambient ") +
                "module, but it looks like an external module.");
        }
        return "" + meta + path_2.normalizeEOL(contents.trim(), path_2.EOL);
    }
    var wasDeclared = false;
    var hasExports = false;
    var hasDefaultExport = false;
    var hasExportEquals = false;
    function replacer(node) {
        if (node.kind === ts.SyntaxKind.ExportAssignment) {
            hasDefaultExport = !node.isExportEquals;
            hasExportEquals = !hasDefaultExport;
        }
        else if (node.kind === ts.SyntaxKind.ExportDeclaration) {
            hasExports = true;
        }
        else {
            hasExports = hasExports || !!(node.flags & ts.NodeFlags.Export);
            hasDefaultExport = hasDefaultExport || !!(node.flags & ts.NodeFlags.Default);
        }
        if (node.kind === ts.SyntaxKind.StringLiteral &&
            (node.parent.kind === ts.SyntaxKind.ExportDeclaration ||
                node.parent.kind === ts.SyntaxKind.ImportDeclaration ||
                node.parent.kind === ts.SyntaxKind.ModuleDeclaration)) {
            return " '" + importPath(path, node.text, options) + "'";
        }
        if (node.kind === ts.SyntaxKind.DeclareKeyword) {
            wasDeclared = true;
            return sourceFile.text.slice(node.getFullStart(), node.getStart());
        }
        if (node.kind === ts.SyntaxKind.ExternalModuleReference) {
            var requirePath = importPath(path, node.expression.text, options);
            return " require('" + requirePath + "')";
        }
    }
    function read(start, end) {
        var text = sourceFile.text.slice(start, end);
        if (start === 0) {
            return text.replace(/^\s+$/, '');
        }
        if (end == null) {
            return text.replace(/\s+$/, '');
        }
        if (wasDeclared) {
            wasDeclared = false;
            return text.replace(/^\s+/, '');
        }
        return text;
    }
    function alias(name) {
        var imports = [];
        if (hasExportEquals) {
            imports.push("import main = require('" + modulePath + "');");
            imports.push("export = main;");
        }
        else {
            if (hasExports) {
                imports.push("export * from '" + modulePath + "';");
            }
            if (hasDefaultExport) {
                imports.push("export { default } from '" + modulePath + "';");
            }
        }
        if (imports.length === 0) {
            return '';
        }
        return declareText(name, imports.join(path_2.EOL));
    }
    var isEntry = rawPath === entry;
    var moduleText = path_2.normalizeEOL(processTree(sourceFile, replacer, read), path_2.EOL);
    var moduleName = parent && parent.ambient ? name : prefix;
    if (isEntry && isTypings) {
        return meta + declareText(parent ? moduleName : name, moduleText);
    }
    var modulePath = importPath(path, path_3.pathFromDefinition(path), options);
    var prettyPath = path_3.normalizeSlashes(path_1.join(name, path_3.relativeTo(tree.src, path_3.pathFromDefinition(path))));
    var declared = declareText(modulePath, moduleText);
    if (!isEntry) {
        return meta + declared + (parent ? '' : alias(prettyPath));
    }
    return meta + declared + (parent ? '' : alias(prettyPath)) + alias(parent ? moduleName : name);
}
function declareText(name, text) {
    return "declare module '" + name + "' {" + (text ? path_2.EOL + text + path_2.EOL : '') + "}" + path_2.EOL;
}
function processTree(sourceFile, replacer, reader) {
    var code = '';
    var position = 0;
    function skip(node) {
        position = node.end;
    }
    function readThrough(node) {
        if (node.pos > position) {
            code += reader(position, node.pos);
            position = node.pos;
        }
    }
    function visit(node) {
        readThrough(node);
        var replacement = replacer(node);
        if (replacement != null) {
            code += replacement;
            skip(node);
        }
        else {
            ts.forEachChild(node, visit);
        }
    }
    visit(sourceFile);
    code += reader(position);
    return code;
}
//# sourceMappingURL=compile.js.map