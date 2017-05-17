import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class BreakStatement extends Node {
	initialise ( transforms ) {
		const loop = this.findNearest( /(?:For(?:In)?|While)Statement/ );
		const switchCase = this.findNearest( 'SwitchCase' );

		if ( loop && ( !switchCase || loop.depth > switchCase.depth ) ) {
			loop.canBreak = true;
			this.loop = loop;
		}
	}

	transpile ( code, transforms ) {
		if ( this.loop && this.loop.shouldRewriteAsFunction ) {
			if ( this.label ) throw new CompileError( this, 'Labels are not currently supported in a loop with locally-scoped variables' );
			code.overwrite( this.start, this.start + 5, `return 'break'` );
		}
	}
}
