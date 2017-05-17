"use strict";

var enableDestroy = require("server-destroy");
var _ = require("../../lodash.custom");

/**
 * Browsersync server
 * Three available modes: Snippet, Server or Proxy
 */
module.exports.plugin = function (bs) {

    var debug   = bs.debug;
    var proxy   = bs.options.get("proxy");
    var type    = bs.options.get("mode");

    var bsServer = createServer(bs);

    if (type === "server" || type === "snippet") {
        debug("Static Server running ({magenta:%s}) ...", bs.options.get("scheme"));
    }

    if (proxy) {
        debug("Proxy running, proxing: {magenta:%s}", proxy.get("target"));
    }

    if (bsServer) {

        /**
         * Allow server to be destroyed gracefully
         */
        enableDestroy(bsServer.server);

        /**
         * Listen on the available port
         */
        bsServer.server.listen(bs.options.get("port"));

        /**
         * Hack to deal with https://github.com/socketio/socket.io/issues/1602#issuecomment-224270022
         */
        bs.registerCleanupTask(function () {
            if (bs.io && bs.io.sockets) {
                setCloseReceived(bs.io.sockets);
            }
            if (bs.ui && bs.ui.socket) {
                setCloseReceived(bs.ui.socket);
            }
        });

        /**
         * Destroy the server on cleanup
         */
        bs.registerCleanupTask(function () {
            bsServer.server.destroy();
        });
    }

    function setCloseReceived(io) {
        Object.keys(io.sockets).forEach(function (key) {
            _.set(io.sockets[key], "conn.transport.socket._closeReceived", true);
        });
    }

    debug("Running mode: %s", type.toUpperCase());

    return {
        server: bsServer.server,
        app:    bsServer.app
    };
};

/**
 * Launch the server for serving the client JS plus static files
 * @param {BrowserSync} bs
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}}
 */
function createServer (bs) {

    var proxy   = bs.options.get("proxy");
    var server  = bs.options.get("server");

    if (!proxy && !server) {
        return require("./snippet-server")(bs);
    }

    if (proxy) {
        return require("./proxy-server")(bs);
    }

    if (server) {
        return require("./static-server")(bs);
    }
}

module.exports.createServer = createServer;
