import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class ImportDeclaration extends Node {
	initialise ( transforms ) {
		if ( transforms.moduleImport ) throw new CompileError( this, 'import is not supported' );
		super.initialise( transforms );
	}
}
