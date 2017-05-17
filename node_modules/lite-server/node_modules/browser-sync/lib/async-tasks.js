var async           = require("./async");

module.exports = [
    {
        step: "Finding an empty port",
        fn: async.getEmptyPort
    },
    {
        step: "Getting an extra port for Proxy",
        fn: async.getExtraPortForProxy
    },
    {
        step: "Checking online status",
        fn: async.getOnlineStatus
    },
    {
        step: "Resolve user plugins from options",
        fn: async.resolveInlineUserPlugins
    },
    {
        step: "Set Urls and other options that rely on port/online status",
        fn: async.setOptions
    },
    {
        step: "Setting Internal Events",
        fn: async.setInternalEvents
    },
    {
        step: "Setting file watchers",
        fn: async.setFileWatchers
    },
    {
        step: "Merging middlewares from core + plugins",
        fn: async.mergeMiddlewares
    },
    {
        step: "Starting the Server",
        fn: async.startServer
    },
    {
        step: "Starting the HTTPS Tunnel",
        fn: async.startTunnel
    },
    {
        step: "Starting the web-socket server",
        fn: async.startSockets
    },
    {
        step: "Starting the UI",
        fn: async.startUi
    },
    {
        step: "Merge UI settings",
        fn: async.mergeUiSettings
    },
    {
        step: "Init user plugins",
        fn: async.initUserPlugins
    }
];
