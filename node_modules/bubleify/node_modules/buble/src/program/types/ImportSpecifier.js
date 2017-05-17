import Node from '../Node.js';

export default class ImportSpecifier extends Node {
	initialise ( transforms ) {
		this.findScope( true ).addDeclaration( this.local, 'import' );
		super.initialise( transforms );
	}
}
