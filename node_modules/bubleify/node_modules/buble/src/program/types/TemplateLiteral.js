import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	transpile ( code, transforms ) {
		if ( transforms.templateString && this.parent.type !== 'TaggedTemplateExpression' ) {
			let ordered = this.expressions.concat( this.quasis )
				.sort( ( a, b ) => a.start - b.start || a.end - b.end )
				.filter( ( node, i ) => {
					// include all expressions
					if ( node.type !== 'TemplateElement' ) return true;

					// include all non-empty strings
					if ( node.value.raw ) return true;

					// exclude all empty strings not at the head
					return !i;
				});

			// special case – we may be able to skip the first element,
			// if it's the empty string, but only if the second and
			// third elements aren't both expressions (since they maybe
			// be numeric, and `1 + 2 + '3' === '33'`)
			if ( ordered.length >= 3 ) {
				const [ first, , third ] = ordered;
				if ( first.type === 'TemplateElement' && first.value.raw === '' && third.type === 'TemplateElement' ) {
					ordered.shift();
				}
			}

			const parenthesise = ( this.quasis.length !== 1 || this.expressions.length !== 0 ) &&
			                     this.parent.type !== 'AssignmentExpression' &&
			                     this.parent.type !== 'VariableDeclarator' &&
			                     ( this.parent.type !== 'BinaryExpression' || this.parent.operator !== '+' );

			if ( parenthesise ) code.insertRight( this.start, '(' );

			let lastIndex = this.start;

			ordered.forEach( ( node, i ) => {
				if ( node.type === 'TemplateElement' ) {
					let replacement = '';
					if ( i ) replacement += ' + ';
					replacement += JSON.stringify( node.value.cooked );

					code.overwrite( lastIndex, node.end, replacement );
				} else {
					const parenthesise = node.type !== 'Identifier'; // TODO other cases where it's safe

					let replacement = '';
					if ( i ) replacement += ' + ';
					if ( parenthesise ) replacement += '(';

					code.overwrite( lastIndex, node.start, replacement );

					if ( parenthesise ) code.insertLeft( node.end, ')' );
				}

				lastIndex = node.end;
			});

			let close = '';
			if ( parenthesise ) close += ')';

			code.overwrite( lastIndex, this.end, close );
		}

		super.transpile( code, transforms );
	}
}
