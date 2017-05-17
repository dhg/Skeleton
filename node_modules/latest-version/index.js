'use strict';
var packageJson = require('package-json');

module.exports = function (name) {
	return packageJson(name.toLowerCase(), 'latest').then(function (data) {
		return data.version;
	});
};
