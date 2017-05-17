import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class FunctionDeclaration extends Node {
	initialise ( transforms ) {
		if ( this.generator && transforms.generator ) {
			throw new CompileError( this, 'Generators are not supported' );
		}

		this.body.createScope();

		this.findScope( true ).addDeclaration( this.id, 'function' );
		super.initialise( transforms );
	}
}
