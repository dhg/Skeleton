import Node from '../Node.js';

export default class ArrowFunctionExpression extends Node {
	initialise ( transforms ) {
		this.body.createScope();
		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.arrow ) {
			// remove arrow
			let charIndex = this.body.start;
			while ( code.original[ charIndex ] !== '=' ) {
				charIndex -= 1;
			}
			code.remove( charIndex, this.body.start );

			// wrap naked parameter
			if ( this.params.length === 1 && this.start === this.params[0].start ) {
				code.insertRight( this.params[0].start, '(' );
				code.insertLeft( this.params[0].end, ')' );
			}

			// add function
			code.insertRight( this.start, 'function ' );
		}

		super.transpile( code, transforms );
	}
}
