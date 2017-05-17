"use strict";

var _            = require("../lodash.custom");
var Immutable    = require("immutable");

var utils        = require("./utils");
var pluginUtils  = require("./plugins");
var connectUtils = require("./connect-utils");

module.exports = {
    /**
     * BrowserSync needs at least 1 free port.
     * It will check the one provided in config
     * and keep incrementing until an available one is found.
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    getEmptyPort: function (bs, done) {
        utils.getPorts(bs.options, function (err, port) {
            if (err) {
                return utils.fail(true, err, bs.cb);
            }
            bs.debug("Found a free port: {magenta:%s", port);
            done(null, {
                options: {
                    port: port
                }
            });
        });
    },
    /**
     * If the running mode is proxy, we'll use a separate port
     * for the Browsersync web-socket server. This is to eliminate any issues
     * with trying to proxy web sockets through to the users server.
     * @param bs
     * @param done
     */
    getExtraPortForProxy: function (bs, done) {
        /**
         * An extra port is not needed in snippet/server mode
         */
        if (bs.options.get("mode") !== "proxy") {
            return done();
        }

        /**
         * Web socket support is disabled by default
         */
        if (!bs.options.getIn(["proxy", "ws"])) {
            return done();
        }

        /**
         * Use 1 higher than server port by default...
         */
        var socketPort = bs.options.get("port") + 1;

        /**
         * Or use the user-defined socket.port option instead
         */
        if (bs.options.hasIn(["socket", "port"])) {
            socketPort = bs.options.getIn(["socket", "port"]);
        }

        utils.getPort(socketPort, null, function (err, port) {
            if (err) {
                return utils.fail(true, err, bs.cb);
            }
            done(null, {
                optionsIn: [
                    {
                        path: ["socket", "port"],
                        value: port
                    }
                ]
            });
        });
    },
    /**
     * Some features require an internet connection.
     * If the user did not provide either `true` or `false`
     * for the online option, we will attempt to resolve www.google.com
     * as a way of determining network connectivity
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    getOnlineStatus: function (bs, done) {
        if (_.isUndefined(bs.options.get("online")) && _.isUndefined(process.env.TESTING)) {
            require("dns").resolve("www.google.com", function (err) {
                var online = false;
                if (err) {
                    bs.debug("Could not resolve www.google.com, setting {magenta:online: false}");
                } else {
                    bs.debug("Resolved www.google.com, setting {magenta:online: true}");
                    online = true;
                }
                done(null, {
                    options: {
                        online: online
                    }
                });
            });
        } else {
            done();
        }
    },
    /**
     * Try to load plugins that were given in options
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    resolveInlineUserPlugins: function (bs, done) {

        var plugins = bs.options
            .get("plugins")
            .map(pluginUtils.resolvePlugin)
            .map(pluginUtils.requirePlugin);

        plugins
            .forEach(function (plugin) {
                if (plugin.get("errors").size) {
                    return logPluginError(plugin);
                }
                var jsPlugin = plugin.toJS();
                jsPlugin.options = jsPlugin.options || {};
                jsPlugin.options.moduleName = jsPlugin.moduleName;
                bs.registerPlugin(jsPlugin.module, jsPlugin.options);
            });

        function logPluginError (plugin) {
            utils.fail(true, plugin.getIn(["errors", 0]), bs.cb);
        }

        done();
    },
    /**
     *
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    setOptions: function (bs, done) {
        done(null, {
            options: {
                urls:        utils.getUrlOptions(bs.options),
                snippet:     connectUtils.scriptTags(bs.options),
                scriptPaths: Immutable.fromJS(connectUtils.clientScript(bs.options, true)),
                files:       bs.pluginManager.hook(
                    "files:watch",
                    bs.options.get("files"),
                    bs.pluginManager.pluginOptions
                )
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    setInternalEvents: function (bs, done) {
        require("./internal-events")(bs);
        done();
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    setFileWatchers: function (bs, done) {
        done(null, {
            instance: {
                watchers: bs.pluginManager.get("file:watcher")(bs)
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    mergeMiddlewares: function (bs, done) {

        done(null, {
            options: {
                middleware: bs.pluginManager.hook(
                    "server:middleware",
                    bs.options.get("middleware")
                )
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    startServer: function (bs, done) {

        var server = bs.pluginManager.get("server")(bs);

        done(null, {
            instance: {
                server: server.server,
                app: server.app
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    startTunnel: function (bs, done) {
        if (bs.options.get("tunnel") && bs.options.get("online")) {
            var localTunnel = require("./tunnel");
            localTunnel(bs, function (err, tunnel) {
                if (err) {
                    return done(err);
                } else {
                    return done(null, {
                        optionsIn: [
                            {
                                path:  ["urls", "tunnel"],
                                value: tunnel.url
                            }
                        ],
                        instance: {
                            tunnel: tunnel
                        }
                    });
                }
            });
        } else {
            done();
        }
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    startSockets: function (bs, done) {

        var clientEvents = bs.pluginManager.hook(
            "client:events",
            bs.options.get("clientEvents").toJS()
        );

        // Start the socket, needs an existing server.
        var io = bs.pluginManager.get("socket")(
            bs.server,
            clientEvents,
            bs
        );

        done(null, {
            instance: {
                io: io
            },
            options: {
                clientEvents: Immutable.fromJS(clientEvents)
            }
        });
    },
    /**
     *
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    startUi: function (bs, done) {

        var PLUGIN_NAME = "UI";
        var userPlugins   = bs.getUserPlugins();
        var ui            = bs.pluginManager.get(PLUGIN_NAME);
        var uiOpts        = bs.options.get("ui");

        if (!uiOpts || uiOpts.get("enabled") === false) {
            return done();
        }

        // if user provided a UI, use it instead
        if (userPlugins.some(function (item) {
            return item.name === PLUGIN_NAME;
        })) {
            uiOpts = bs.options.get("ui").mergeDeep(Immutable.fromJS(bs.pluginManager.pluginOptions[PLUGIN_NAME]));
        }

        return ui(uiOpts.toJS(), bs, function (err, ui) {
            if (err) {
                return done(err);
            }
            done(null, {
                instance: {
                    ui: ui
                }
            });
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    mergeUiSettings: function (bs, done) {

        if (!bs.ui) {
            return done();
        }

        done(null, {
            options: {
                urls: bs.options.get("urls").merge(bs.ui.options.get("urls"))
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    initUserPlugins: function (bs, done) {

        bs.pluginManager.initUserPlugins(bs);

        done(null, {
            options: {
                userPlugins: bs.getUserPlugins()
            }
        });
    }
};
