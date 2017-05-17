import Node from '../Node.js';
import deindent from '../../utils/deindent.js';

export default class ClassDeclaration extends Node {
	initialise ( transforms ) {
		this.name = this.id.name;
		this.findScope( true ).addDeclaration( this.id, 'class' );

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.classes ) {
			if ( !this.superClass ) deindent( this.body, code );

			const superName = this.superClass && ( this.superClass.name || 'superclass' );

			const i0 = this.getIndentation();
			const i1 = i0 + code.getIndentString();

			// if this is an export default statement, we have to move the export to
			// after the declaration, because `export default var Foo = ...` is illegal
			const syntheticDefaultExport = this.parent.type === 'ExportDefaultDeclaration' ?
				`\n\n${i0}export default ${this.id.name};` :
				'';

			if ( syntheticDefaultExport ) code.remove( this.parent.start, this.start );

			code.overwrite( this.start, this.id.start, 'var ' );

			if ( this.superClass ) {
				if ( this.superClass.end === this.body.start ) {
					code.remove( this.id.end, this.superClass.start );
					code.insertLeft( this.id.end, ` = (function (${superName}) {\n${i1}` );
				} else {
					code.overwrite( this.id.end, this.superClass.start, ' = ' );
					code.overwrite( this.superClass.end, this.body.start, `(function (${superName}) {\n${i1}` );
				}
			} else {
				if ( this.id.end === this.body.start ) {
					code.insertLeft( this.id.end, ' = ' );
				} else {
					code.overwrite( this.id.end, this.body.start, ' = ' );
				}
			}

			this.body.transpile( code, transforms, !!this.superClass, superName );

			if ( this.superClass ) {
				code.insertLeft( this.end, `\n\n${i1}return ${this.name};\n${i0}}(` );
				code.move( this.superClass.start, this.superClass.end, this.end );
				code.insertRight( this.end, `));${syntheticDefaultExport}` );
			} else if ( syntheticDefaultExport ) {
				code.insertRight( this.end, syntheticDefaultExport );
			}
		}

		else {
			this.body.transpile( code, transforms, false, null );
		}
	}
}
