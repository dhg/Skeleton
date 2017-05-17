import Node from '../Node.js';
import reserved from '../../utils/reserved.js';

export default class SpreadProperty extends Node {
	transpile ( code, transforms ) {
		code.remove( this.start, this.argument.start );
		code.remove( this.argument.end, this.end );

		super.transpile( code, transforms );
	}
}
