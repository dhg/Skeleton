import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class ExportNamedDeclaration extends Node {
	initialise ( transforms ) {
		if ( transforms.moduleExport ) throw new CompileError( this, 'export is not supported' );
		super.initialise( transforms );
	}
}
