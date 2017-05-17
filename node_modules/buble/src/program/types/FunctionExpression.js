import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class FunctionExpression extends Node {
	initialise ( transforms ) {
		if ( this.generator && transforms.generator ) {
			throw new CompileError( this, 'Generators are not supported' );
		}

		this.body.createScope();

		if ( this.id ) {
			// function expression IDs belong to the child scope...
			this.body.scope.addDeclaration( this.id, 'function' );
		}

		super.initialise( transforms );
	}
}
