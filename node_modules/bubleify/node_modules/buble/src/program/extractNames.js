export default function extractNames ( node ) {
	const names = [];
	extractors[ node.type ]( names, node );
	return names;
}

const extractors = {
	Identifier ( names, node ) {
		names.push( node );
	},

	ObjectPattern ( names, node ) {
		for ( const prop of node.properties ) {
			extractors[ prop.value.type ]( names, prop.value );
		}
	},

	ArrayPattern ( names, node ) {
		for ( const element of node.elements )  {
			if ( element ) extractors[ element.type ]( names, element );
		}
	},

	RestElement ( names, node ) {
		extractors[ node.argument.type ]( names, node.argument );
	},

	AssignmentPattern ( names, node ) {
		extractors[ node.left.type ]( names, node.left );
	}
};
