import Node from '../Node.js';

export default class ClassExpression extends Node {
	initialise ( transforms ) {
		this.name = this.id ? this.id.name :
		            this.parent.type === 'VariableDeclarator' ? this.parent.id.name :
		            this.parent.type === 'AssignmentExpression' ? this.parent.left.name :
		            this.findScope( true ).createIdentifier( 'anonymous' );

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.classes ) {
			const superName = this.superClass && ( this.superClass.name || 'superclass' );

			const i0 = this.getIndentation();
			const i1 = i0 + code.getIndentString();

			if ( this.superClass ) {
				code.remove( this.start, this.superClass.start );
				code.remove( this.superClass.end, this.body.start );
				code.insertLeft( this.start, `(function (${superName}) {\n${i1}` );
			} else {
				code.overwrite( this.start, this.body.start, `(function () {\n${i1}` );
			}

			this.body.transpile( code, transforms, true, superName );

			const outro = `\n\n${i1}return ${this.name};\n${i0}}(`;

			if ( this.superClass ) {
				code.insertLeft( this.end, outro );
				code.move( this.superClass.start, this.superClass.end, this.end );
				code.insertRight( this.end, '))' );
			} else {
				code.insertLeft( this.end, `\n\n${i1}return ${this.name};\n${i0}}())` );
			}
		}

		else {
			this.body.transpile( code, transforms, false );
		}
	}
}
