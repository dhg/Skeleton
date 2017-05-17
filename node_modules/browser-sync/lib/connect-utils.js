"use strict";

var _             = require("../lodash.custom");
var fs            = require("fs");
var config        = require("./config");

function getPath(options, relative, port) {
    if (options.get("mode") === "snippet") {
        return options.get("scheme") + "://HOST:" + port + relative;
    } else {
        return "//HOST:" + port + relative;
    }
}

var connectUtils = {
    /**
     * @param {Immutable.Map} options
     * @returns {String}
     */
    scriptTags: function (options) {

        var scriptPath     = this.clientScript(options);
        var async          = options.getIn(["snippetOptions", "async"]);
        var scriptDomain   = options.getIn(["script", "domain"]);

        /**
         * Generate the [src] attribute based on user options
         */
        var scriptSrc = (function () {

            if (options.get("localOnly")) {
                return [
                    options.get("scheme"),
                    "://localhost:",
                    options.get("port"),
                    scriptPath
                ].join("");
            }

            /**
             * First, was "scriptPath" set? if so the user wanted full control over the
             * script tag output
             *
             */
            if (_.isFunction(options.get("scriptPath"))) {
                return options.get("scriptPath").apply(null, getScriptArgs(options, scriptPath));
            }

            /**
             * Next, if "script.domain" was given, allow that + the path to the JS file
             * eg:
             *  script.domain=localhost:3000
             * -> localhost:3000/browser-sync/browser-sync-client.js
             */
            if (scriptDomain) {
                if (_.isFunction(scriptDomain)) {
                    return scriptDomain.call(null, options) + scriptPath;
                }
                if (scriptDomain.match(/\{port\}/)) {
                    return scriptDomain.replace("{port}", options.get("port")) + scriptPath;
                }
                return scriptDomain + scriptPath;
            }

            /**
             * Now if server or proxy, use dynamic script
             * eg:
             *  browser-sync start --server
             * ->
             *  "HOST:3000/browser-sync/browser-sync-client.js".replace("HOST", location.hostname)
             */
            if (options.get("server") || options.get("proxy")) {
                return scriptPath;
            }

            /**
             * Final use case is snippet mode
             * -> "http://HOST:3000/browser-sync/browser-sync-client.js".replace("HOST", location.hostname)
             * -> "//HOST:3000/browser-sync/browser-sync-client.js".replace("HOST", location.hostname)"
             */
            return getPath(options, scriptPath, options.get("port"));
        })();

        /**
         * Decide which template shall be used to generate the script tags
         */
        var template = (function () {
            if (scriptDomain || options.get("localOnly")) {
                return config.templates.scriptTagSimple;
            }
            return config.templates.scriptTag;
        })();

        /**
         * Finally read the template file from disk and replace
         * the dynamic values.
         */
        return fs.readFileSync(template, "utf8")
            .replace("%script%", scriptSrc)
            .replace("%async%", async ? "async" : "");
    },
    /**
     * @param {Map} options
     * @returns {String}
     */
    socketConnector: function (options) {

        var socket        = options.get("socket");
        var template      = fs.readFileSync(config.templates.connector, "utf-8");
        var url           = connectUtils.getConnectionUrl(options);

        /**
         * ***Backwards compatibility***. While `socket.path` is technically a
         * socketIoClientConfig property, it's been documented previously
         * as a top-level option, so must stay.
         */
        var clientConfig  = socket
            .get("socketIoClientConfig")
            .merge({
                path: socket.get("path")
            });

        template = template
            .replace("%config%", JSON.stringify(clientConfig.toJS()))
            .replace("%url%",  url);

        return template;
    },
    /**
     * @param {Object} socketOpts
     * @param {Map} options
     * @returns {String|Function}
     */
    getNamespace: function (socketOpts, options) {

        var namespace = socketOpts.namespace;

        if (typeof namespace === "function") {
            return namespace(options);
        }

        if (!namespace.match(/^\//)) {
            namespace = "/" + namespace;
        }

        return namespace;
    },
    /**
     * @param {Map} options
     * @returns {string}
     */
    getConnectionUrl: function (options) {

        var socketOpts       = options.get("socket").toJS();
        var namespace        = connectUtils.getNamespace(socketOpts, options);

        var protocol         = "";
        var withHostnamePort = "'{protocol}' + location.hostname + ':{port}{ns}'";
        var withHost         = "'{protocol}' + location.host + '{ns}'";
        var withDomain       = "'{domain}{ns}'";
        var port             = options.get("port");

        // default use-case is server/proxy
        var string           = withHost;

        if (options.get("mode") !== "server") {
            protocol = options.get("scheme") + "://";
            string   = withHostnamePort;
        }

        if (options.get("mode") === "proxy" && options.getIn(["proxy", "ws"])) {
            port = options.getIn(["socket", "port"]);
        }

        /**
         * Ensure socket.domain is always a string (for noop replacements later)
         */
        socketOpts.domain = (function () {
            if (options.get("localOnly")) {
                string = withDomain;
                return [
                    options.get("scheme"),
                    "://localhost:",
                    options.get("port")
                ].join("");
            }
            if (socketOpts.domain) {
                string = withDomain;
                /**
                 * User provided a function
                 */
                if (_.isFunction(socketOpts.domain)) {
                    return socketOpts.domain.call(null, options);
                }
                /**
                 * User provided a string
                 */
                if (_.isString(socketOpts.domain)) {
                    return socketOpts.domain;
                }
            }
            return "";
        })();

        return string
            .replace("{protocol}", protocol)
            .replace("{port}",     port)
            .replace("{domain}",   socketOpts.domain.replace("{port}", port))
            .replace("{ns}",       namespace);
    },
    /**
     * @param {Object} [options]
     * @param {Boolean} [both]
     */
    clientScript: function (options, both) {

        var prefix    = options.getIn(["socket", "clientPath"]);
        var script    = prefix + "/browser-sync-client.js";
        var versioned = prefix + "/browser-sync-client.js?v=" + options.get("version");

        if (both) {
            return {
                path: script,
                versioned: versioned
            };
        }

        return versioned;
    }
};

/**
 * @param options
 * @returns {*[]}
 */
function getScriptArgs (options, scriptPath) {
    var abspath = options.get("scheme") + "://HOST:" + options.get("port") + scriptPath;
    return [
        scriptPath,
        options.get("port"),
        options.set("absolute", abspath)
    ];
}

module.exports = connectUtils;
