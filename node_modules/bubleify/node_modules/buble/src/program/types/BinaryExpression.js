import Node from '../Node.js';

export default class BinaryExpression extends Node {
	transpile ( code, transforms ) {
		if ( this.operator === '**' && transforms.exponentiation ) {
			code.insertRight( this.start, `Math.pow( ` );
			code.overwrite( this.left.end, this.right.start, `, ` );
			code.insertLeft( this.end, ` )` );
		}
		super.transpile( code, transforms );
	}
}
