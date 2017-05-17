import LoopStatement from './shared/LoopStatement.js';
import CompileError from '../../utils/CompileError.js';

export default class ForOfStatement extends LoopStatement {
	initialise ( transforms ) {
		if ( transforms.forOf && !transforms.dangerousForOf ) throw new CompileError( this, 'for...of statements are not supported. Use `transforms: { forOf: false }` to skip transformation and disable this error, or `transforms: { dangerousForOf: true }` if you know what you\'re doing' );
		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( !transforms.dangerousForOf ) {
			super.transpile( code, transforms );
			return;
		}

		// edge case (#80)
		if ( !this.body.body[0] ) {
			if ( this.left.type === 'VariableDeclaration' && this.left.kind === 'var' ) {
				code.remove( this.start, this.left.start );
				code.insertLeft( this.left.end, ';' );
				code.remove( this.left.end, this.end );
			} else {
				code.remove( this.start, this.end );
			}

			return;
		}

		const scope = this.findScope( true );
		const i0 = this.getIndentation();
		const i1 = i0 + code.getIndentString();

		const key = scope.createIdentifier( 'i' );
		const list = scope.createIdentifier( 'list' );

		if ( this.body.synthetic ) {
			code.insertRight( this.left.start, `{\n${i1}` );
			code.insertLeft( this.body.body[0].end, `\n${i0}}` );
		}

		const bodyStart = this.body.body[0].start;

		code.remove( this.left.end, this.right.start );
		code.move( this.left.start, this.left.end, bodyStart );
		code.insertLeft( this.left.end, ` = ${list}[${key}];\n\n${i1}` );

		code.insertRight( this.right.start, `var ${key} = 0, ${list} = ` );
		code.insertLeft( this.right.end, `; ${key} < ${list}.length; ${key} += 1` );

		super.transpile( code, transforms );
	}
}
