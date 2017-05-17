import { findIndex } from './array.js';

const handlers = {
	ArrayPattern: destructureArrayPattern,
	ObjectPattern: destructureObjectPattern,
	AssignmentPattern: destructureAssignmentPattern,
	Identifier: destructureIdentifier
};

export default function destructure ( code, scope, node, ref, statementGenerators ) {
	_destructure( code, scope, node, ref, ref, statementGenerators );
}

function _destructure ( code, scope, node, ref, expr, statementGenerators ) {
	const handler = handlers[ node.type ];
	if ( !handler ) throw new Error( `not implemented: ${node.type}` );

	handler( code, scope, node, ref, expr, statementGenerators );
}

function destructureIdentifier ( code, scope, node, ref, expr, statementGenerators ) {
	statementGenerators.push( ( start, prefix, suffix ) => {
		code.insertRight( node.start, `${prefix}var ` );
		code.insertLeft( node.end, ` = ${expr};${suffix}` );
		code.move( node.start, node.end, start );
	});
}

function handleProperty ( code, scope, c, node, value, statementGenerators ) {
	switch ( node.type ) {
		case 'Identifier':
			code.remove( c, node.start );
			statementGenerators.push( ( start, prefix, suffix ) => {
				code.insertRight( node.start, `${prefix}var ` );
				code.insertLeft( node.end, ` = ${value};${suffix}` );
				code.move( node.start, node.end, start );
			});
			break;

		case 'AssignmentPattern':
			let name;

			const isIdentifier = node.left.type === 'Identifier';

			if ( isIdentifier ) {
				name = node.left.name;
				const declaration = scope.findDeclaration( name );
				if ( declaration ) name = declaration.name;
			} else {
				name = scope.createIdentifier( value );
			}

			statementGenerators.push( ( start, prefix, suffix ) => {
				code.insertRight( node.right.start, `${prefix}var ${name} = ${value}; if ( ${name} === void 0 ) ${name} = ` );
				code.move( node.right.start, node.right.end, start );
				code.insertLeft( node.right.end, `;${suffix}` );
			});

			if ( isIdentifier ) {
				code.remove( c, node.right.start );
			} else {
				code.remove( c, node.left.start );
				code.remove( node.left.end, node.right.start );
				handleProperty( code, scope, c, node.left, name, statementGenerators );
			}

			break;

		case 'ObjectPattern':
			code.remove( c, c = node.start );

			if ( node.properties.length > 1 ) {
				const ref = scope.createIdentifier( value );

				statementGenerators.push( ( start, prefix, suffix ) => {
					// this feels a tiny bit hacky, but we can't do a
					// straightforward insertLeft and keep correct order...
					code.insertRight( node.start, `${prefix}var ${ref} = ` );
					code.overwrite( node.start, c = node.start + 1, value );
					code.insertLeft( c, `;${suffix}` );

					code.move( node.start, c, start );
				});

				node.properties.forEach( prop => {
					handleProperty( code, scope, c, prop.value, `${ref}.${prop.key.name}`, statementGenerators );
					c = prop.end;
				});
			} else {
				const prop = node.properties[0];
				handleProperty( code, scope, c, prop.value, `${value}.${prop.key.name}`, statementGenerators );
				c = prop.end;
			}

			code.remove( c, node.end );
			break;

		case 'ArrayPattern':
			code.remove( c, c = node.start );

			if ( node.elements.filter( Boolean ).length > 1 ) {
				const ref = scope.createIdentifier( value );

				statementGenerators.push( ( start, prefix, suffix ) => {
					code.insertRight( node.start, `${prefix}var ${ref} = ` );
					code.overwrite( node.start, c = node.start + 1, value );
					code.insertLeft( c, `;${suffix}` );

					code.move( node.start, c, start );
				});

				node.elements.forEach( ( element, i ) => {
					if ( !element ) return;

					handleProperty( code, scope, c, element, `${ref}[${i}]`, statementGenerators );
					c = element.end;
				});
			} else {
				const index = findIndex( node.elements, Boolean );
				const element = node.elements[ index ];
				handleProperty( code, scope, c, element, `${value}[${index}]`, statementGenerators );
				c = element.end;
			}

			code.remove( c, node.end );
			break;

		default:
			throw new Error( `Unexpected node type in destructuring (${node.type})` );
	}
}

function destructureArrayPattern ( code, scope, node, ref, expr, statementGenerators ) {
	let c = node.start;

	node.elements.forEach( ( element, i ) => {
		if ( !element ) return;

		handleProperty( code, scope, c, element, `${ref}[${i}]`, statementGenerators );
		c = element.end;
	});

	code.remove( c, node.end );
}

function destructureObjectPattern ( code, scope, node, ref, expr, statementGenerators ) {
	let c = node.start;

	node.properties.forEach( prop => {
		handleProperty( code, scope, c, prop.value, `${ref}.${prop.key.name}`, statementGenerators );
		c = prop.end;
	});

	code.remove( c, node.end );
}

function destructureAssignmentPattern ( code, scope, node, ref, expr, statementGenerators ) {
	const isIdentifier = node.left.type === 'Identifier';
	const name = isIdentifier ? node.left.name : ref;

	statementGenerators.push( ( start, prefix, suffix ) => {
		code.insertRight( node.left.end, `${prefix}if ( ${name} === void 0 ) ${name}` );
		code.move( node.left.end, node.right.end, start );
		code.insertLeft( node.right.end, `;${suffix}` );
	});

	if ( !isIdentifier ) {
		_destructure( code, scope, node.left, ref, expr, statementGenerators );
	}
}
