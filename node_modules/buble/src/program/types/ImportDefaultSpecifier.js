import Node from '../Node.js';

export default class ImportDefaultSpecifier extends Node {
	initialise ( transforms ) {
		this.findScope( true ).addDeclaration( this.local, 'import' );
		super.initialise( transforms );
	}
}
