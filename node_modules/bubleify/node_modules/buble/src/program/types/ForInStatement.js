import LoopStatement from './shared/LoopStatement.js';
import extractNames from '../extractNames.js';

export default class ForInStatement extends LoopStatement {
	findScope ( functionScope ) {
		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
	}

	transpile ( code, transforms ) {
		if ( this.shouldRewriteAsFunction ) {
			// which variables are declared in the init statement?
			const names = this.left.type === 'VariableDeclaration' ?
				[].concat.apply( [], this.left.declarations.map( declarator => extractNames( declarator.id ) ) ) :
				[];

			this.args = names.map( name => name in this.aliases ? this.aliases[ name ].outer : name );
			this.params = names.map( name => name in this.aliases ? this.aliases[ name ].inner : name );
		}

		super.transpile( code, transforms );
	}
}
