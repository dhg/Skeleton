import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class Super extends Node {
	initialise ( transforms ) {
		if ( transforms.classes ) {
			this.method = this.findNearest( 'MethodDefinition' );
			if ( !this.method ) throw new CompileError( this, 'use of super outside class method' );

			const parentClass = this.findNearest( 'ClassBody' ).parent;
			this.superClassName = parentClass.superClass && (parentClass.superClass.name || 'superclass');

			if ( !this.superClassName ) throw new CompileError( this, 'super used in base class' );

			this.isCalled = this.parent.type === 'CallExpression' && this === this.parent.callee;

			if ( this.method.kind !== 'constructor' && this.isCalled ) {
				throw new CompileError( this, 'super() not allowed outside class constructor' );
			}

			this.isMember = this.parent.type === 'MemberExpression';

			if ( !this.isCalled && !this.isMember ) {
				throw new CompileError( this, 'Unexpected use of `super` (expected `super(...)` or `super.*`)' );
			}
		}

		if ( transforms.arrow ) {
			const lexicalBoundary = this.findLexicalBoundary();
			const arrowFunction = this.findNearest( 'ArrowFunctionExpression' );
			const loop = this.findNearest( /(?:For(?:In|Of)?|While)Statement/ );

			if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
				this.thisAlias = lexicalBoundary.getThisAlias();
			}

			if ( loop && loop.body.contains( this ) && loop.depth > lexicalBoundary.depth ) {
				this.thisAlias = lexicalBoundary.getThisAlias();
			}
		}
	}

	transpile ( code, transforms ) {
		if ( transforms.classes ) {
			const expression = ( this.isCalled || this.method.static ) ?
				this.superClassName :
				`${this.superClassName}.prototype`;

			code.overwrite( this.start, this.end, expression, true );

			const callExpression = this.isCalled ? this.parent : this.parent.parent;

			if ( callExpression && callExpression.type === 'CallExpression' ) {
				if ( !this.noCall ) { // special case – `super( ...args )`
					code.insertLeft( callExpression.callee.end, '.call' );
				}

				const thisAlias = this.thisAlias || 'this';

				if ( callExpression.arguments.length ) {
					code.insertLeft( callExpression.arguments[0].start, `${thisAlias}, ` );
				} else {
					code.insertLeft( callExpression.end - 1, `${thisAlias}` );
				}
			}
		}
	}
}
