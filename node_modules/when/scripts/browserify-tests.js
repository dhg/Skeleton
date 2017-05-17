var path = require('path');
var fs = require('fs');
var glob = require('glob');
var browserify = require('browserify');

var POSIX_SEP = path.posix ? path.posix.sep : '/';

var ROOT_DIR = path.resolve(__dirname, '..');
var outputFile = path.resolve(ROOT_DIR, 'test', 'browser', 'tests.js');

var entries = glob(path.join(ROOT_DIR, 'test', '**', '*-test.js'), { sync: true });
if (path.sep !== POSIX_SEP) {
	entries = entries.map(function (entry) {
		return entry.split(POSIX_SEP).join(path.sep);
	});
}

browserify({
	entries: entries
})
	.external('buster')
	.bundle()
	.pipe(fs.createWriteStream(outputFile));
