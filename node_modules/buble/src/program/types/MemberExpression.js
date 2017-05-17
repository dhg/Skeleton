import Node from '../Node.js';
import reserved from '../../utils/reserved.js';

export default class MemberExpression extends Node {
	transpile ( code, transforms ) {
		if ( transforms.reservedProperties && reserved[ this.property.name ] ) {
			code.overwrite( this.object.end, this.property.start, `['` );
			code.insertLeft( this.property.end, `']` );
		}

		super.transpile( code, transforms );
	}
}
