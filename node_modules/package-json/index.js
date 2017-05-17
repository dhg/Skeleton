'use strict';
var url = require('url');
var got = require('got');
var registryUrl = require('registry-url');
var registryAuthToken = require('registry-auth-token');
var semver = require('semver');

module.exports = function (name, version) {
	var scope = name.split('/')[0];
	var regUrl = registryUrl(scope);
	var pkgUrl = url.resolve(regUrl, encodeURIComponent(name).replace(/^%40/, '@'));
	var authInfo = registryAuthToken(regUrl);
	var headers = {};

	if (authInfo) {
		headers.authorization = authInfo.type + ' ' + authInfo.token;
	}

	return got(pkgUrl, {
		json: true,
		headers: headers
	})
		.then(function (res) {
			var data = res.body;

			if (version === 'latest') {
				data = data.versions[data['dist-tags'].latest];
			} else if (version) {
				if (!data.versions[version]) {
					var versions = Object.keys(data.versions);
					version = semver.maxSatisfying(versions, version);

					if (!version) {
						throw new Error('Version doesn\'t exist');
					}
				}

				data = data.versions[version];

				if (!data) {
					throw new Error('Version doesn\'t exist');
				}
			}

			return data;
		})
		.catch(function (err) {
			if (err.statusCode === 404) {
				throw new Error('Package `' + name + '` doesn\'t exist');
			}

			throw err;
		});
};
