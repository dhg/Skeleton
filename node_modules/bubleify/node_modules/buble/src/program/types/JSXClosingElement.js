import Node from '../Node.js';

function containsNewLine ( node ) {
	return node.type === 'Literal' && !/\S/.test( node.value ) && /\n/.test( node.value );
}

export default class JSXClosingElement extends Node {
	transpile ( code, transforms ) {
		let spaceBeforeParen = true;

		const lastChild = this.parent.children[ this.parent.children.length - 1 ];

		// omit space before closing paren if
		//   a) this is on a separate line, or
		//   b) there are no children but there are attributes
		if ( ( lastChild && containsNewLine( lastChild ) ) || ( this.parent.openingElement.attributes.length ) ) {
			spaceBeforeParen = false;
		}

		code.overwrite( this.start, this.end, spaceBeforeParen ? ' )' : ')' );
	}
}
