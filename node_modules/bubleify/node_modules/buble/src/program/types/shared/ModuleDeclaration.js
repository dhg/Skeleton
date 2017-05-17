import Node from '../../Node.js';
import CompileError from '../../../utils/CompileError.js';

export default class ModuleDeclaration extends Node {
	initialise ( transforms ) {
		if ( transforms.moduleImport ) throw new CompileError( this, 'Modules are not supported' );
		super.initialise( transforms );
	}
}
