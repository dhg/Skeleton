"use strict";

var connect = require("connect");
var serverUtils = require("./utils.js");

/**
 * Create a server for the snippet
 * @param {BrowserSync} bs
 * @param scripts
 * @returns {*}
 */
module.exports = function createSnippetServer (bs, scripts) {

    var app = serverUtils.getBaseApp(bs, bs.options, scripts);
    return serverUtils.getServer(app, bs.options);
};
