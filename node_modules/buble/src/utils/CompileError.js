import locate from './locate.js';
import getSnippet from './getSnippet.js';

export default class CompileError extends Error {
	constructor ( node, message ) {
		super();

		const source = node.program.magicString.original;
		const loc = locate( source, node.start );

		this.name = 'CompileError';
		this.message = message + ` (${loc.line}:${loc.column})`;

		this.stack = new Error().stack.replace( new RegExp( `.+new ${this.name}.+\\n`, 'm' ), '' );

		this.loc = loc;
		this.snippet = getSnippet( source, loc, node.end - node.start );
	}

	toString () {
		return `${this.name}: ${this.message}\n${this.snippet}`;
	}
}
