'use strict';
var spawn = require('child_process').spawn;
var path = require('path');
var Configstore = require('configstore');
var chalk = require('chalk');
var semverDiff = require('semver-diff');
var latestVersion = require('latest-version');
var isNpm = require('is-npm');
var boxen = require('boxen');
var ONE_DAY = 1000 * 60 * 60 * 24;

function UpdateNotifier(options) {
	this.options = options = options || {};
	options.pkg = options.pkg || {};

	// reduce pkg to the essential keys. with fallback to deprecated options
	// TODO: remove deprecated options at some point far into the future
	options.pkg = {
		name: options.pkg.name || options.packageName,
		version: options.pkg.version || options.packageVersion
	};

	if (!options.pkg.name || !options.pkg.version) {
		throw new Error('pkg.name and pkg.version required');
	}

	this.packageName = options.pkg.name;
	this.packageVersion = options.pkg.version;
	this.updateCheckInterval = typeof options.updateCheckInterval === 'number' ? options.updateCheckInterval : ONE_DAY;
	this.hasCallback = typeof options.callback === 'function';
	this.callback = options.callback || function () {};

	if (!this.hasCallback) {
		this.config = new Configstore('update-notifier-' + this.packageName, {
			optOut: false,
			// init with the current time so the first check is only
			// after the set interval, so not to bother users right away
			lastUpdateCheck: Date.now()
		});
	}
}

UpdateNotifier.prototype.check = function () {
	if (this.hasCallback) {
		this.checkNpm().then(this.callback.bind(this, null)).catch(this.callback);
		return;
	}

	if (this.config.get('optOut') || 'NO_UPDATE_NOTIFIER' in process.env || process.argv.indexOf('--no-update-notifier') !== -1) {
		return;
	}

	this.update = this.config.get('update');

	if (this.update) {
		this.config.del('update');
	}

	// Only check for updates on a set interval
	if (Date.now() - this.config.get('lastUpdateCheck') < this.updateCheckInterval) {
		return;
	}

	// Spawn a detached process, passing the options as an environment property
	spawn(process.execPath, [path.join(__dirname, 'check.js'), JSON.stringify(this.options)], {
		detached: true,
		stdio: 'ignore'
	}).unref();
};

UpdateNotifier.prototype.checkNpm = function () {
	return latestVersion(this.packageName).then(function (latestVersion) {
		return {
			latest: latestVersion,
			current: this.packageVersion,
			type: semverDiff(this.packageVersion, latestVersion) || 'latest',
			name: this.packageName
		};
	}.bind(this));
};

UpdateNotifier.prototype.notify = function (opts) {
	if (!process.stdout.isTTY || isNpm || !this.update) {
		return this;
	}

	opts = opts || {};

	var message = '\n' + boxen('Update available ' + chalk.dim(this.update.current) + chalk.reset(' → ') + chalk.green(this.update.latest) + ' \nRun ' + chalk.cyan('npm i -g ' + this.packageName) + ' to update', {
		padding: 1,
		margin: 1,
		borderColor: 'yellow',
		borderStyle: 'round'
	});

	if (opts.defer === undefined) {
		process.on('exit', function () {
			console.error(message);
		});
	} else {
		console.error(message);
	}

	return this;
};

module.exports = function (options) {
	var updateNotifier = new UpdateNotifier(options);
	updateNotifier.check();
	return updateNotifier;
};

module.exports.UpdateNotifier = UpdateNotifier;
