import Node from '../Node.js';
import reserved from '../../utils/reserved.js';

export default class Property extends Node {
	transpile ( code, transforms ) {
		if ( transforms.conciseMethodProperty && !this.computed && this.parent.type !== 'ObjectPattern' ) {
			if ( this.shorthand ) {
				code.insertRight( this.start, `${this.key.name}: ` );
			} else if ( this.method ) {
				const name = this.findScope( true ).createIdentifier( this.key.type === 'Identifier' ? this.key.name : this.key.value );
				if ( this.value.generator ) code.remove( this.start, this.key.start );
				code.insertLeft( this.key.end, `: function${this.value.generator ? '*' : ''} ${name}` );
			}
		}

		if ( transforms.reservedProperties && reserved[ this.key.name ] ) {
			code.insertRight( this.key.start, `'` );
			code.insertLeft( this.key.end, `'` );
		}

		super.transpile( code, transforms );
	}
}
