import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class AssignmentExpression extends Node {
	initialise ( transforms ) {
		if ( this.left.type === 'Identifier' ) {
			const declaration = this.findScope( false ).findDeclaration( this.left.name );
			if ( declaration && declaration.kind === 'const' ) {
				throw new CompileError( this.left, `${this.left.name} is read-only` );
			}

			// special case – https://gitlab.com/Rich-Harris/buble/issues/11
			const statement = declaration && declaration.node.ancestor( 3 );
			if ( statement && statement.type === 'ForStatement' && statement.body.contains( this ) ) {
				statement.reassigned[ this.left.name ] = true;
			}
		}

		if ( /Pattern/.test( this.left.type ) ) {
			throw new CompileError( this.left, 'Destructuring assignments are not currently supported. Coming soon!' );
		}

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( this.operator === '**=' && transforms.exponentiation ) {
			const scope = this.findScope( false );
			const getAlias = name => {
				const declaration = scope.findDeclaration( name );
				return declaration ? declaration.name : name;
			};

			// first, the easy part – `**=` -> `=`
			let charIndex = this.left.end;
			while ( code.original[ charIndex ] !== '*' ) charIndex += 1;
			code.remove( charIndex, charIndex + 2 );

			// how we do the next part depends on a number of factors – whether
			// this is a top-level statement, and whether we're updating a
			// simple or complex reference
			let base;

			let left = this.left;
			while ( left.type === 'ParenthesizedExpression' ) left = left.expression;

			if ( left.type === 'Identifier' ) {
				base = getAlias( left.name );
			} else if ( left.type === 'MemberExpression' ) {
				let object;
				let needsObjectVar = false;
				let property;
				let needsPropertyVar = false;

				const statement = this.findNearest( /(?:Statement|Declaration)$/ );
				const i0 = statement.getIndentation();

				if ( left.property.type === 'Identifier' ) {
					property = left.computed ? getAlias( left.property.name ) : left.property.name;
				} else {
					property = scope.createIdentifier( 'property' );
					needsPropertyVar = true;
				}

				if ( left.object.type === 'Identifier' ) {
					object = getAlias( left.object.name );
				} else {
					object = scope.createIdentifier( 'object' );
					needsObjectVar = true;
				}

				if ( left.start === statement.start ) {
					if ( needsObjectVar && needsPropertyVar ) {
						code.insertRight( statement.start, `var ${object} = ` );
						code.overwrite( left.object.end, left.property.start, `;\n${i0}var ${property} = ` );
						code.overwrite( left.property.end, left.end, `;\n${i0}${object}[${property}]` );
					}

					else if ( needsObjectVar ) {
						code.insertRight( statement.start, `var ${object} = ` );
						code.insertLeft( left.object.end, `;\n${i0}` );
						code.insertLeft( left.object.end, object );
					}

					else if ( needsPropertyVar ) {
						code.insertRight( left.property.start, `var ${property} = ` );
						code.insertLeft( left.property.end, `;\n${i0}` );
						code.move( left.property.start, left.property.end, this.start );

						code.insertLeft( left.object.end, `[${property}]` );
						code.remove( left.object.end, left.property.start );
						code.remove( left.property.end, left.end );
					}
				}

				else {
					let declarators = [];
					if ( needsObjectVar ) declarators.push( object );
					if ( needsPropertyVar ) declarators.push( property );
					code.insertRight( statement.start, `var ${declarators.join( ', ' )};\n${i0}` );

					if ( needsObjectVar && needsPropertyVar ) {
						code.insertRight( left.start, `( ${object} = ` );
						code.overwrite( left.object.end, left.property.start, `, ${property} = ` );
						code.overwrite( left.property.end, left.end, `, ${object}[${property}]` );
					}

					else if ( needsObjectVar ) {
						code.insertRight( left.start, `( ${object} = ` );
						code.insertLeft( left.object.end, `, ${object}` );
					}

					else if ( needsPropertyVar ) {
						code.insertRight( left.property.start, `( ${property} = ` );
						code.insertLeft( left.property.end, `, ` );
						code.move( left.property.start, left.property.end, left.start );

						code.overwrite( left.object.end, left.property.start, `[${property}]` );
						code.remove( left.property.end, left.end );
					}

					code.insertLeft( this.end, ` )` );
				}

				base = object + ( left.computed || needsPropertyVar ? `[${property}]` : `.${property}` );
			}

			code.insertRight( this.right.start, `Math.pow( ${base}, ` );
			code.insertLeft( this.right.end, ` )` );
		}

		super.transpile( code, transforms );
	}
}
