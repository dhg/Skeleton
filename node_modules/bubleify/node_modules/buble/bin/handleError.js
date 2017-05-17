var chalk = require( 'chalk' );

var handlers = {
	MISSING_INPUT_OPTION: function () {
		console.error( chalk.red( 'You must specify an --input (-i) option' ) );
	},

	MISSING_OUTPUT_DIR: function () {
		console.error( chalk.red( 'You must specify an --output (-o) option when compiling a directory of files' ) );
	},

	MISSING_OUTPUT_FILE: function () {
		console.error( chalk.red( 'You must specify an --output (-o) option when creating a file with a sourcemap' ) );
	},

	ONE_AT_A_TIME: function ( err ) {
		console.error( chalk.red( 'Bublé can only compile one file/directory at a time' ) );
	},

	DUPLICATE_IMPORT_OPTIONS: function ( err ) {
		console.error( chalk.red( 'use --input, or pass input path as argument – not both' ) );
	},

	BAD_TARGET: function ( err ) {
		console.error( chalk.red( 'illegal --target option' ) );
	}
};

module.exports = function handleError ( err ) {
	var handler;

	if ( handler = handlers[ err && err.code ] ) {
		handler( err );
	} else {
		if ( err.snippet ) console.error( chalk.red( '---\n' + err.snippet ) );
		console.error( chalk.red( err.message || err ) );

		if ( err.stack ) {
			console.error( chalk.grey( err.stack ) );
		}
	}

	console.error( 'Type ' + chalk.cyan( 'buble --help' ) + ' for help, or visit https://buble.surge.sh/guide/' );

	process.exit( 1 );
};
