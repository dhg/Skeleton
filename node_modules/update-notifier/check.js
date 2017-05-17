'use strict';
var updateNotifier = require('./');
var options = JSON.parse(process.argv[2]);

updateNotifier = new updateNotifier.UpdateNotifier(options);

updateNotifier.checkNpm().then(function (update) {
	// only update the last update check time on success
	updateNotifier.config.set('lastUpdateCheck', Date.now());

	if (update.type && update.type !== 'latest') {
		updateNotifier.config.set('update', update);
	}

	// Call process exit explicitly to terminate the child process
	// Otherwise the child process will run forever (according to nodejs docs)
	process.exit();
}).catch(function () {
	process.exit(1);
});
