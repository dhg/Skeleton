import Node from '../Node.js';

export default class ThisExpression extends Node {
	initialise ( transforms ) {
		if ( transforms.arrow ) {
			const lexicalBoundary = this.findLexicalBoundary();
			const arrowFunction = this.findNearest( 'ArrowFunctionExpression' );
			const loop = this.findNearest( /(?:For(?:In|Of)?|While)Statement/ );

			if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
				this.alias = lexicalBoundary.getThisAlias();
			}

			if ( loop && loop.body.contains( this ) && loop.depth > lexicalBoundary.depth ) {
				this.alias = lexicalBoundary.getThisAlias();
			}
		}
	}

	transpile ( code, transforms ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, true );
		}
	}
}
