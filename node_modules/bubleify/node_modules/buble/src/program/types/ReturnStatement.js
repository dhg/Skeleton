import Node from '../Node.js';

export default class ReturnStatement extends Node {
	initialise ( transforms ) {
		this.loop = this.findNearest( /(?:For(?:In)?|While)Statement/ );
		this.nearestFunction = this.findNearest( /Function/ );

		if ( this.loop && ( !this.nearestFunction || this.loop.depth > this.nearestFunction.depth ) ) {
			this.loop.canReturn = true;
			this.shouldWrap = true;
		}

		if ( this.argument ) this.argument.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( this.argument ) {
			const shouldWrap = this.shouldWrap && this.loop && this.loop.shouldRewriteAsFunction;

			if ( shouldWrap ) code.insertRight( this.argument.start, `{ v: ` );

			if ( this.argument ) this.argument.transpile( code, transforms );

			if ( shouldWrap ) code.insertLeft( this.argument.end, ` }` );
		}
	}
}
