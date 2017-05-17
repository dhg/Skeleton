import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class TaggedTemplateExpression extends Node {
	initialise ( transforms ) {
		if ( transforms.templateString && !transforms.dangerousTaggedTemplateString ) {
			throw new CompileError( this, 'Tagged template strings are not supported. Use `transforms: { templateString: false }` to skip transformation and disable this error, or `transforms: { dangerousTaggedTemplateString: true }` if you know what you\'re doing' );
		}

		super.initialise( transforms );
	}

	transpile ( code, transforms ) {
		if ( transforms.templateString && transforms.dangerousTaggedTemplateString ) {
			const ordered = this.quasi.expressions.concat( this.quasi.quasis ).sort( ( a, b ) => a.start - b.start );

			// insert strings at start
			const templateStrings = this.quasi.quasis.map( quasi => JSON.stringify( quasi.value.cooked ) );
			code.overwrite( this.tag.end, ordered[0].start, `([${templateStrings.join(', ')}]` );

			let lastIndex = ordered[0].start;
			ordered.forEach( node => {
				if ( node.type === 'TemplateElement' ) {
					code.remove( lastIndex, node.end );
				} else {
					code.overwrite( lastIndex, node.start, ', ' );
				}

				lastIndex = node.end;
			});

			code.overwrite( lastIndex, this.end, ')' );
		}

		super.transpile( code, transforms );
	}
}
