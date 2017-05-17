"use strict";

var _             = require("../lodash.custom");
var devIp         = require("dev-ip")();
var Immutable     = require("immutable");
var portScanner   = require("portscanner");
var path          = require("path");
var List          = require("immutable").List;
var UAParser      = require("ua-parser-js");
var parser        = new UAParser();

var utils = {
    /**
     * @param {Object} options
     * @returns {String|boolean} - the IP address
     * @param devIp
     */
    getHostIp: function (options, devIp) {

        if (options) {
            var host = options.get("host");
            if (host && host !== "localhost") {
                return host;
            }
            if (options.get("detect") === false || !devIp.length) {
                return false;
            }
        }

        return devIp.length ? devIp[0] : false;
    },
    /**
     * Set URL Options
     */
    getUrlOptions: function (options) {

        var scheme = options.get("scheme");

        var port   = options.get("port");
        var urls   = {};

        if (options.get("online") === false) {
            urls.local = utils.getUrl(scheme + "://localhost:" + port, options);
            return Immutable.fromJS(urls);
        }

        var external  = utils.xip(utils.getHostIp(options, devIp), options);
        var localhost = "localhost";

        if (options.get("xip")) {
            localhost = "127.0.0.1";
        }

        localhost = utils.xip(localhost, options);

        return Immutable.fromJS(utils.getUrls(external, localhost, scheme, options));
    },
    /**
     * Append a start path if given in options
     * @param {String} url
     * @param {Object} options
     * @returns {String}
     */
    getUrl: function (url, options) {

        var prefix = "/";
        var startPath = options.get("startPath");

        if (startPath) {
            if (startPath.charAt(0) === "/") {
                prefix = "";
            }
            url = url + prefix + startPath;
        }

        return url;
    },
    /**
     * @param {String} external
     * @param {String} local
     * @param {String} scheme
     * @param {Object} options
     * @returns {{local: string, external: string}}
     */
    getUrls: function (external, local, scheme, options) {

        var urls = {
            local: utils.getUrl(utils._makeUrl(scheme, local, options.get("port")), options)
        };

        if (external !== local) {
            urls.external = utils.getUrl(utils._makeUrl(scheme, external, options.get("port")), options);
        }

        return urls;
    },
    /**
     * @param {String} scheme
     * @param {String} host
     * @param {Number} port
     * @returns {String}
     * @private
     */
    _makeUrl: function (scheme, host, port) {
        return scheme + "://" + host + ":" + port;
    },
    /**
     * Get ports
     * @param {Object} options
     * @param {Function} cb
     */
    getPorts: function (options, cb) {

        var port  = options.get("port");
        var ports = options.get("ports"); // backwards compatibility
        var max;

        if (ports) {
            port = ports.get("min");
            max  = ports.get("max") || null;
        }

        utils.getPort(port, max, cb);
    },
    getPort: function (port, max, cb) {
        portScanner.findAPortNotInUse(port, max, {
            host: "localhost",
            timeout: 1000
        }, cb);
    },
    /**
     * @param {String} ua
     * @returns {Object}
     */
    getUaString: function (ua) {
        return parser.setUA(ua).getBrowser();
    },
    /**
     * Open the page in browser
     * @param {String} url
     * @param {Object} options
     * @param {BrowserSync} bs
     */
    openBrowser: function (url, options, bs) {

        var open    = options.get("open");
        var browser = options.get("browser");

        if (_.isString(open)) {
            if (options.getIn(["urls", open])) {
                url = options.getIn(["urls", open]);
            }
        }

        if (open) {
            if (browser !== "default") {
                if (utils.isList(browser)) {
                    browser.forEach(function (browser) {
                        utils.open(url, browser, bs);
                    });
                } else {
                    utils.open(url, browser, bs); // single
                }
            } else {
                utils.open(url, null, bs);
            }
        }
    },
    /**
     * Wrapper for opn module
     * @param url
     * @param name
     * @param bs
     */
    open: function (url, name, bs) {
        var options = (function () {
            if (_.isString(name)) {
                return {app: name};
            }
            if (Immutable.Map.isMap(name)) {
                return name.toJS();
            }
            return {};
        })();
        var opn = require("opn");
        opn(url, options).catch(function() {
            bs.events.emit("browser:error");
        });
    },
    /**
     * @param {Boolean} kill
     * @param {String|Error} [errMessage]
     * @param {Function} [cb]
     */
    fail: function (kill, errMessage, cb) {
        if (kill) {
            if (_.isFunction(cb)) {
                if (errMessage.message) { // Is this an error object?
                    cb(errMessage);
                } else {
                    cb(new Error(errMessage));
                }
            }
            process.exit(1);
        }
    },
    /**
     * Add support for xip.io urls
     * @param {String} host
     * @param {Object} options
     * @returns {String}
     */
    xip: function (host, options) {
        var suffix = options.get("hostnameSuffix");
        if (options.get("xip")) {
            return host + ".xip.io";
        }
        if (suffix) {
            return host + suffix;
        }
        return host;
    },
    /**
     * Determine if an array of file paths will cause a full page reload.
     * @param {Array} needles - filepath such as ["core.css", "index.html"]
     * @param {Array} haystack
     * @returns {Boolean}
     */
    willCauseReload: function (needles, haystack) {
        return needles.some(function (needle) {
            return !_.includes(haystack, path.extname(needle).replace(".", ""));
        });
    },
    isList: Immutable.List.isList,
    isMap: Immutable.List.isMap,
    /**
     * @param {Map} options
     * @returns {Array}
     */
    getConfigErrors: function (options) {

        var messages = require("./config").errors;

        var errors = [];

        if (options.get("server") && options.get("proxy")) {
            errors.push(messages["server+proxy"]);
        }

        return errors;
    },
    /**
     * @param {Map} options
     * @param {Function} [cb]
     */
    verifyConfig: function (options, cb) {
        var errors = utils.getConfigErrors(options);
        if (errors.length) {
            utils.fail(true, errors.join("\n"), cb);
            return false;
        }
        return true;
    },
    /**
     * @param err
     */
    defaultCallback: function (err) {
        if (err && err.message) {
            console.error(err.message);
        }
    },
    eachSeries: function (arr, iterator, callback) {
        callback = callback || function () {};
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                } else {
                    ++completed;
                    if (completed >= arr.length) {
                        callback();
                    } else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    },
    /**
     * @param {Immutable.List|Array|String} incoming
     * @returns {Array}
     */
    arrayify: function (incoming) {
        if (List.isList(incoming)) {
            return incoming.toArray();
        }
        return [].concat(incoming).filter(Boolean);
    }
};

module.exports              = utils;
module.exports.portscanner  = portScanner;
module.exports.UAParser     = UAParser;
module.exports.connect      = require("connect");
module.exports.devIp        = devIp;
module.exports.serveStatic  = require("serve-static");
module.exports.easyExtender = require("easy-extender");
