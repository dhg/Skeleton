"use strict";

var utils     = require("./utils");
var fileUtils = require("./file-utils");
var Rx        = require("rx");
var fromEvent = Rx.Observable.fromEvent;
var fileHandler = require("./file-event-handler");

module.exports = function (bs) {

    var events = {
        /**
         * File reloads
         * @param data
         */
        "file:reload": function (data) {
            bs.io.sockets.emit("file:reload", data);
        },
        /**
         * Browser Reloads
         */
        "browser:reload": function () {
            bs.io.sockets.emit("browser:reload");
        },
        /**
         * Browser Notify
         * @param data
         */
        "browser:notify": function (data) {
            bs.io.sockets.emit("browser:notify", data);
        },
        /**
         * Things that happened after the service is running
         * @param data
         */
        "service:running": function (data) {

            var mode = bs.options.get("mode");
            var open = bs.options.get("open");

            if (mode === "proxy" || mode === "server" || open === "ui" || open === "ui-external") {
                utils.openBrowser(data.url, bs.options, bs);
            }

            // log about any file watching
            if (bs.watchers) {
                bs.events.emit("file:watching", bs.watchers);
            }
        },
        /**
         * Option setting
         * @param data
         */
        "options:set": function (data) {
            if (bs.io) {
                bs.io.sockets.emit("options:set", data);
            }
        },
        /**
         * Plugin configuration setting
         * @param data
         */
        "plugins:configure": function (data) {
            if (data.active) {
                bs.pluginManager.enablePlugin(data.name);
            } else {
                bs.pluginManager.disablePlugin(data.name);
            }
            bs.setOption("userPlugins", bs.getUserPlugins());
        },
        "plugins:opts": function (data) {
            if (bs.pluginManager.pluginOptions[data.name]) {
                bs.pluginManager.pluginOptions[data.name] = data.opts;
                bs.setOption("userPlugins", bs.getUserPlugins());
            }
        }
    };

    Object.keys(events).forEach(function (event) {
        bs.events.on(event, events[event]);
    });

    var reloader = fileHandler.applyReloadOperators(fromEvent(bs.events, "_browser:reload"), bs.options)
        .subscribe(function() {
            bs.events.emit("browser:reload");
        });

    var coreNamespacedWatchers = fromEvent(bs.events, "file:changed")
        .filter(function() { return bs.options.get("codeSync") })
        .filter(function(x) { return  x.namespace === "core" });

    var handler = fileHandler.fileChanges(coreNamespacedWatchers, bs.options)
        .subscribe(function (x) {
            if (x.type === "reload") {
                bs.events.emit("browser:reload");
            }
            if (x.type === "inject") {
                x.files.forEach(function(data) {
                    if (!bs.paused && data.namespace === "core") {
                        bs.events.emit("file:reload", fileUtils.getFileInfo(data, bs.options));
                    }
                });
            }
        });

    bs.registerCleanupTask(function() {
        handler.dispose();
        reloader.dispose();
    });
};
