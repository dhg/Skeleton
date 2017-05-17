import LoopStatement from './shared/LoopStatement.js';
import extractNames from '../extractNames.js';

export default class ForStatement extends LoopStatement {
	findScope ( functionScope ) {
		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
	}

	transpile ( code, transforms ) {
		const i1 = this.getIndentation() + code.getIndentString();

		if ( this.shouldRewriteAsFunction ) {
			// which variables are declared in the init statement?
			const names = this.init.type === 'VariableDeclaration' ?
				[].concat.apply( [], this.init.declarations.map( declarator => extractNames( declarator.id ) ) ) :
				[];

			const aliases = this.aliases;

			this.args = names.map( name => name in this.aliases ? this.aliases[ name ].outer : name );
			this.params = names.map( name => name in this.aliases ? this.aliases[ name ].inner : name );

			const updates = Object.keys( this.reassigned )
				.map( name => `${aliases[ name ].outer} = ${aliases[ name ].inner};` );

			if ( updates.length ) {
				if ( this.body.synthetic ) {
					code.insertLeft( this.body.body[0].end, `; ${updates.join(` `)}` );
				} else {
					const lastStatement = this.body.body[ this.body.body.length - 1 ];
					code.insertLeft( lastStatement.end, `\n\n${i1}${updates.join(`\n${i1}`)}` );
				}
			}
		}

		super.transpile( code, transforms );
	}
}
