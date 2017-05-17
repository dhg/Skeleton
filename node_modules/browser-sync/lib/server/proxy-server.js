"use strict";

var httpProxy  = require("http-proxy");
var utils      = require("./utils");
var proxyUtils = require("./proxy-utils");
var Immutable  = require("immutable");
var Map        = require("immutable").Map;
var List       = require("immutable").List;

/**
 * Default options that are passed along to http-proxy
 */
var defaultHttpProxyOptions = Map({
    /**
     * This ensures targets are more likely to
     * accept each request
     */
    changeOrigin: true,
    /**
     * This handles redirects
     */
    autoRewrite: true,
    /**
     * This allows our self-signed certs to be used for development
     */
    secure: false,
    ws: true
});

var defaultCookieOptions = Map({
    stripDomain: true
});

var ProxyOption = Immutable.Record({
    route: "",
    target: "",
    rewriteRules: true,
    /**
     * Functions to be called on proxy request
     * with args [proxyReq, req, res, options]
     */
    proxyReq:     List([]),
    /**
     * Functions to be called on proxy response
     * with args [proxyRes, req, res]
     */
    proxyRes:     List([]),
    /**
     * Functions to be called on proxy response
     * with args [proxyReq, req, socket, options, head]
     */
    proxyReqWs:   List([]),
    errHandler:   undefined,
    url:          Map({}),
    proxyOptions: Map(defaultHttpProxyOptions),
    cookies:      Map(defaultCookieOptions),
    ws:           false,
    middleware:   List([]),
    reqHeaders:   undefined
});

/**
 * @param {BrowserSync} bs
 * @param {String} scripts
 * @returns {*}
 */
module.exports = function createProxyServer (bs) {

    var opt         = new ProxyOption().mergeDeep(bs.options.get("proxy"));
    var proxy       = httpProxy.createProxyServer(opt.get("proxyOptions").set("target", opt.get("target")).toJS());
    var target      = opt.get("target");
    var proxyReq    = getProxyReqFunctions(opt.get("proxyReq"), opt, bs);
    var proxyRes    = getProxyResFunctions(opt.get("proxyRes"), opt);
    var proxyResWs  = opt.get("proxyReqWs");
    bs.options      = bs.options.update("middleware", function (mw) {
        return mw.concat({
            id: "Browsersync Proxy",
            route: opt.get("route"),
            handle: function (req, res) {
                proxy.web(req, res, {
                    target: target
                });
            }
        });
    });

    var app  = utils.getBaseApp(bs);

    /**
     * @type {*|{server, app}}
     */
    var browserSyncServer = utils.getServer(app, bs.options);
    browserSyncServer.proxy = proxy;

    if (opt.get("ws")) {
        // debug(`+ ws upgrade for: ${x.get("target")}`);
        browserSyncServer.server.on("upgrade", function (req, socket, head) {
            proxy.ws(req, socket, head);
        });
    }

    /**
     * Add any user provided functions for proxyReq, proxyReqWs and proxyRes
     */
    applyFns("proxyReq",   proxyReq);
    applyFns("proxyRes",   proxyRes);
    applyFns("proxyReqWs", proxyResWs);

    /**
     * Handle Proxy errors
     */
    proxy.on("error", function (err) {
        if (typeof opt.get("errHandler") === "function") {
            opt.get("errHandler").call(null, err);
        }
    });

    /**
     * Apply functions to proxy events
     * @param {string} name - the name of the http-proxy event
     * @param {Array} fns - functions to call on each event
     */
    function applyFns (name, fns) {
        if (!List.isList(fns)) fns = [fns];
        proxy.on(name, function () {
            var args = arguments;
            fns.forEach(function(fn) {
                if (typeof fn === "function") {
                    fn.apply(null, args);
                }
            });
        });
    }

    return browserSyncServer;
};

/**
 * @param resFns
 * @returns {*}
 */
function getProxyResFunctions (resFns, opt) {
    if (opt.getIn(["cookies", "stripDomain"])) {
        return resFns.push(proxyUtils.checkCookies);
    }
    return resFns;
}

/**
 * @param reqFns
 * @returns {*}
 */
function getProxyReqFunctions (reqFns, opt, bs) {

    var reqHeaders = opt.getIn(["reqHeaders"]);

    if (!reqHeaders) {
        return reqFns;
    }

    /**
     * Back-compat for old `reqHeaders` option here a
     * function was given that returned an object
     * where key:value was header-name:header-value
     * This didn't really work as it clobbered all other headers,
     * but it remains for the unlucky few who used it.
     */
    if (typeof reqHeaders === "function") {
        var output = reqHeaders.call(bs, opt.toJS());
        if (Object.keys(output).length) {
            return reqFns.concat(function (proxyReq) {
                Object.keys(output).forEach(function (key) {
                    proxyReq.setHeader(key, output[key]);
                });
            });
        }
    }

    /**
     * Now, if {key:value} given, set the each header
     *
     * eg: reqHeaders: {
     *     'is-dev': 'true'
     * }
     */
    if (Map.isMap(reqHeaders)) {
        return reqFns.concat(function (proxyReq) {
            reqHeaders.forEach(function (value, key) {
                proxyReq.setHeader(key, value);
            });
        });
    }

    return reqFns;
}
