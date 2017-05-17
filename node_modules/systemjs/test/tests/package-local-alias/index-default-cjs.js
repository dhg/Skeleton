
var local = require('./local-default-cjs');

exports.q = 'q';

exports.fromLocal = local;

var localDirect = require('./local/index-default-cjs.js');

exports.fromLocalDirect = localDirect;
