"use strict";

var connect      = require("connect");
var serverUtils  = require("./utils.js");
var resolve      = require("path").resolve;
var utils        = require("../utils.js");
var serveStatic  = require("serve-static");
var serveIndex   = require("serve-index");

/**
 * @param {BrowserSync} bs
 * @param scripts
 * @returns {*}
 */
module.exports = function createServer (bs) {

    var options            = bs.options;
    var server             = options.get("server");
    var basedirs           = utils.arrayify(server.get("baseDir"));
    var serveStaticOptions = server.get("serveStaticOptions").toJS(); // passed to 3rd party

    var _serveStatic = 0;
    var _routes = 0;
    bs.options = bs.options
        /**
         * Add directory Middleware if given in server.directory
         */
        .update("middleware", function (mw) {
            if (!server.get("directory")) {
                return mw;
            }

            return mw.concat({
                route: "",
                handle: serveIndex(resolve(basedirs[0]), {icons:true}),
                id: "Browsersync Server Directory Middleware"
            });
        })
        /**
         * Add middleware for server.baseDir Option
         */
        .update("middleware", function (mw) {
            return mw.concat(basedirs.map(function (root) {
                return {
                    route: "",
                    id: "Browsersync Server ServeStatic Middleware - " + _serveStatic++,
                    handle: serveStatic(resolve(root), serveStaticOptions)
                }
            }));
        })
        /**
         * Add middleware for server.routes
         */
        .update("middleware", function (mw) {

            if (!server.get("routes")) {
                return mw;
            }

            return mw.concat(server.get("routes").map(function (root, urlPath) {
                // strip trailing slash
                if (urlPath[urlPath.length - 1] === "/") {
                    urlPath = urlPath.slice(0, -1);
                }
                return {
                    route: urlPath,
                    id: "Browsersync Server Routes Middleware - " + _routes++,
                    handle: serveStatic(resolve(root))
                }
            }));
        });

    var app = serverUtils.getBaseApp(bs);

    /**
     * Finally, return the server + App
     */
    return serverUtils.getServer(app, bs.options);
};
