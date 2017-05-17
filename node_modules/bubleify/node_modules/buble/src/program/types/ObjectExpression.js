import Node from '../Node.js';
import deindent from '../../utils/deindent.js';

export default class ObjectExpression extends Node {
	transpile ( code, transforms ) {
		super.transpile( code, transforms );

		let spreadPropertyCount = 0;
		let computedPropertyCount = 0;

		for ( let prop of this.properties ) {
			if ( prop.type === 'SpreadProperty' ) spreadPropertyCount += 1;
			if ( prop.computed ) computedPropertyCount += 1;
		}

		if ( spreadPropertyCount ) {
			// enclose run of non-spread properties in curlies
			let i = this.properties.length;
			while ( i-- ) {
				const prop = this.properties[i];

				if ( prop.type === 'Property' ) {
					const lastProp = this.properties[ i - 1 ];
					const nextProp = this.properties[ i + 1 ];

					if ( !lastProp || lastProp.type !== 'Property' ) {
						code.insertRight( prop.start, '{' );
					}

					if ( !nextProp || nextProp.type !== 'Property' ) {
						code.insertLeft( prop.end, '}' );
					}
				}
			}

			// wrap the whole thing in Object.assign
			code.overwrite( this.start, this.properties[0].start, `${this.program.objectAssign}({}, `);
			code.overwrite( this.properties[ this.properties.length - 1 ].end, this.end, ')' );
		}

		if ( computedPropertyCount && transforms.computedProperty ) {
			const i0 = this.getIndentation();

			let isSimpleAssignment;
			let name;

			let start;
			let end;

			if ( this.parent.type === 'VariableDeclarator' && this.parent.parent.declarations.length === 1 ) {
				isSimpleAssignment = true;
				name = this.parent.id.alias || this.parent.id.name; // TODO is this right?
			} else if ( this.parent.type === 'AssignmentExpression' && this.parent.parent.type === 'ExpressionStatement' && this.parent.left.type === 'Identifier' ) {
				isSimpleAssignment = true;
				name = this.parent.left.alias || this.parent.left.name; // TODO is this right?
			}

			// handle block scoping
			const declaration = this.findScope( false ).findDeclaration( name );
			if ( declaration ) name = declaration.name;

			start = this.start + 1;
			end = this.end;

			if ( isSimpleAssignment ) {
				// ???
			} else {
				name = this.findScope( true ).createIdentifier( 'obj' );

				const statement = this.findNearest( /(?:Statement|Declaration)$/ );
				code.insertRight( statement.start, `var ${name};\n${i0}` );

				code.insertRight( this.start, `( ${name} = ` );
			}

			const len = this.properties.length;
			let lastComputedProp;

			for ( let i = 0; i < len; i += 1 ) {
				const prop = this.properties[i];

				if ( prop.computed ) {
					lastComputedProp = prop;
					let moveStart = i > 0 ? this.properties[ i - 1 ].end : start;

					code.overwrite( moveStart, prop.start, isSimpleAssignment ? `;\n${i0}${name}` : `, ${name}` );
					let c = prop.key.end;
					while ( code.original[c] !== ']' ) c += 1;
					c += 1;

					if ( prop.value.start > c ) code.remove( c, prop.value.start );
					code.insertLeft( c, ' = ' );
					code.move( moveStart, prop.end, end );

					if ( i === 0 && len > 1 ) {
						// remove trailing comma
						c = prop.end;
						while ( code.original[c] !== ',' ) c += 1;

						code.remove( prop.end, c + 1 );
					}

					if ( prop.method && transforms.conciseMethodProperty ) {
						code.insertRight( prop.value.start, 'function ' );
					}

					deindent( prop.value, code );
				}
			}

			// special case
			if ( computedPropertyCount === len ) {
				code.remove( this.properties[ len - 1 ].end, this.end - 1 );
			}

			if ( !isSimpleAssignment ) {
				code.insertLeft( lastComputedProp.end, `, ${name} )` );
			}
		}
	}
}
