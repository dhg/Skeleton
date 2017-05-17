"use strict";
var Promise = require('any-promise');
var path_1 = require('path');
var events_1 = require('events');
var dependencies_1 = require('./lib/dependencies');
var compile_1 = require('./lib/compile');
var fs_1 = require('./utils/fs');
function bundle(options) {
    var cwd = options.cwd, ambient = options.ambient, out = options.out;
    var emitter = options.emitter || new events_1.EventEmitter();
    if (out == null) {
        return Promise.reject(new TypeError('Out directory is required for bundle'));
    }
    return dependencies_1.resolveAllDependencies({ cwd: cwd, dev: false, ambient: false, emitter: emitter })
        .then(function (tree) {
        var name = options.name || tree.name;
        if (name == null) {
            return Promise.reject(new TypeError('Unable to infer typings name from project. Use the `--name` flag to specify it manually'));
        }
        return compile_1.default(tree, { cwd: cwd, name: name, ambient: ambient, emitter: emitter, meta: true });
    })
        .then(function (output) {
        var path = path_1.resolve(cwd, out);
        return fs_1.mkdirp(path)
            .then(function () {
            return Promise.all([
                fs_1.writeFile(path_1.join(path, 'main.d.ts'), output.main),
                fs_1.writeFile(path_1.join(path, 'browser.d.ts'), output.browser)
            ]);
        })
            .then(function () { return output; });
    });
}
exports.bundle = bundle;
//# sourceMappingURL=bundle.js.map