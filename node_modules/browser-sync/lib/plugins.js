var Immutable  = require("immutable");
var Map        = Immutable.Map;
var isMap      = Immutable.Map.isMap;
var List       = Immutable.List;
var qs         = require("qs");
var path       = require("path");
var fs         = require("fs");

var Plugin = Immutable.Record({
    moduleName: "",
    name:       "",
    active:     true,
    module:     undefined,
    options:    Map({}),
    via:        "inline",
    dir:        process.cwd(),
    init:       undefined,
    errors:     List([])
});

/**
 * Accept a string/object
 * and resolve it into the plugin format above
 * @param item
 * @returns {*}
 */
function resolvePlugin(item) {

    /**
     * Handle when string was given, such as plugins: ['bs-html-injector']
     */
    if (typeof item === "string") {
        return getFromString(item);
    }

    if (!isMap(item)) {
        return new Plugin().mergeDeep({errors: [new Error("Plugin not supported in this format")]});
    }

    if (item.has("module")) {

        var nameOrObj = item.get("module");
        var options = item.get("options");

        /**
         * The 'module' key can be a string, this allows
         * inline plugin references, but with options
         * eg:
         *
         * bs.init({
         *     plugins: [
         *         {
         *             module: './myjs-file.js'
         *             options: {
         *                 files: "*.html"
         *             }
         *         }
         *     ]
         * });
         */
        if (typeof nameOrObj === "string") {
            return getFromString(nameOrObj)
                .mergeDeep({
                    options: options
                });
        }

        /**
         * If the plugin was given completely inline (because it needs options)
         * eg:
         *
         * bs.init({
         *     plugins: [
         *         {
         *             module: {
         *                 plugin: function() {
         *                     console.log('My plugin code')
         *                 }
         *             },
         *             options: {
         *                 files: "*.html"
         *             }
         *         }
         *     ]
         * })
         */
        if (Immutable.Map.isMap(nameOrObj)) {
            return new Plugin({
                module: nameOrObj,
                options: options
            });
        }
    }

    /**
     * If a module was given directly. For example, ater calling require.
     *
     * eg:
     *    var myplugin = require('./some-js');
     *    bs.init({plugins: [myplugin]});
     */
    if (item.has("plugin")) {
        return new Plugin({
            module: item
        })
    }

    /**
     * If we reach here, the plugin option was used incorrectly
     */
    return new Plugin().mergeDeep({errors: [new Error("Plugin was not configured correctly")]})
}

module.exports.resolvePlugin = resolvePlugin;

/**
 * Load a plugin from disk
 * @param item
 * @returns {*}
 */
function requirePlugin (item) {

    /**
     * if the "module" property already exists and
     * is not a string, then we bail and don't bother looking
     * for the file
     */
    if (item.get("module") && typeof item.get("module") !== "string") {
        return item;
    }

    try {
        /**
         * Try a raw node require() call - this will be how
         * regular "npm installed" plugins wil work
         */
        var maybe = path.resolve(process.cwd(), "node_modules", item.get("name"));
        return item.set("module", require(maybe));
    } catch (e) {
        /**
         * If require threw an MODULE_NOT_FOUND error, try again
         * by resolving from cwd. This is needed since cli
         * users will not add ./ to the front of a path (which
         * node requires to resolve from cwd)
         */
        if (e.code === "MODULE_NOT_FOUND") {
            var maybe = path.resolve(process.cwd(), item.get("name"));
            if (fs.existsSync(maybe)) {
                return item.set("module", require(maybe));
            } else {
                /**
                 * Finally return a plugin that contains the error
                 * this will be picked up later and discarded
                 */
                return item.update("errors", function (errors) {
                    return errors.concat(e);
                });
            }
        }
        throw e;
    }
}
module.exports.requirePlugin = requirePlugin;

function getFromString(string) {

    /**
     * We allow query strings for plugins, so always split on ?
     */
    var split = string.split("?");

    var outGoing = new Plugin({
        moduleName: split[0],
        name: split[0]
    });

    if (split.length > 1) {
        return outGoing.update("options", function (opts) {
            return opts.mergeDeep(qs.parse(split[1]));
        });
    }

    return outGoing;
}

