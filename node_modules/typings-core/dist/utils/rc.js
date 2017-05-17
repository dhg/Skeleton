"use strict";
var rc = require('rc');
var extend = require('xtend');
var config_1 = require('./config');
exports.DEFAULTS = {
    userAgent: config_1.PROJECT_NAME + "/{typingsVersion} node/{nodeVersion} {platform} {arch}",
    registryURL: config_1.REGISTRY_URL,
    defaultSource: 'npm',
    defaultAmbientSource: 'dt'
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = extend(exports.DEFAULTS, rc(config_1.PROJECT_NAME));
//# sourceMappingURL=rc.js.map