var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var browserify = require('browserify');
var exorcist = require('exorcist');

var ROOT_DIR = path.resolve(__dirname, '..');

var CONFIGURATIONS = {
	'es6': {
		standaloneName: 'Promise',
		entries: [
			path.resolve(ROOT_DIR, 'es6-shim', 'Promise.browserify-es6.js')
		],
		outputDir: 'es6-shim',
		outputFilename: 'Promise.js'
	},
	'when': {
		standaloneName: 'when',
		entries: [
			path.resolve(ROOT_DIR, 'build', 'when.browserify.js')
		],
		outputDir: path.join('dist', 'browser'),
		outputFilename: 'when.js'
	},
	'debug': {
		standaloneName: 'when',
		entries: [
			path.resolve(ROOT_DIR, 'build', 'when.browserify-debug.js')
		],
		outputDir: path.join('dist', 'browser'),
		outputFilename: 'when.debug.js'
	}
};

function revParse(callback) {
	exec('git rev-parse HEAD', function(err, stdout, stderr) {
		process.stderr.write(stderr);
		if (err) {
			callback(err);
		} else {
			callback(null, stdout.replace(/(^\s+)|(\s+$)/g, ''));
		}
	});
}

var configName = process.argv[2];
var config = CONFIGURATIONS[configName];

if (!config) {
	console.error('Cannot find configuration "' + configName + '"');
	process.exit(1);
	return;
}

mkdirp(config.outputDir, function(mkdirErr) {
	if (mkdirErr) {
		console.error(mkdirErr);
		process.exit(1);
	} else {
		revParse(function(revParseErr, rev) {
			if (revParseErr) {
				console.error(revParseErr);
				process.exit(1);
			} else {
				var rootUrl = 'https://raw.githubusercontent.com/cujojs/when/' + rev;
				var outputMapFile = path.resolve(ROOT_DIR, config.outputDir, config.outputFilename + '.map');
				var outputFile = path.resolve(ROOT_DIR, config.outputDir, config.outputFilename);
				browserify({
					entries: config.entries
				})
					.bundle({
						standalone: config.standaloneName,
						detectGlobals: false,
						debug: true
					})
					.pipe(exorcist(outputMapFile, null, rootUrl, ROOT_DIR))
					.pipe(fs.createWriteStream(outputFile));
			}
		});
	}
});
