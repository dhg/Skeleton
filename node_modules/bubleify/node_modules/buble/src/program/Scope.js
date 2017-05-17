import extractNames from './extractNames.js';
import reserved from '../utils/reserved.js';
import CompileError from '../utils/CompileError.js';

const letConst = /^(?:let|const)$/;

export default function Scope ( options ) {
	options = options || {};

	this.parent = options.parent;
	this.isBlockScope = !!options.block;

	let scope = this;
	while ( scope.isBlockScope ) scope = scope.parent;
	this.functionScope = scope;

	this.identifiers = [];
	this.declarations = Object.create( null );
	this.references = Object.create( null );
	this.blockScopedDeclarations = this.isBlockScope ? null : Object.create( null );
	this.aliases = this.isBlockScope ? null : Object.create( null );
}

Scope.prototype = {
	addDeclaration ( node, kind ) {
		for ( const identifier of extractNames( node ) ) {
			const name = identifier.name;
			const existingDeclaration = this.declarations[ name ];
			if ( existingDeclaration && ( letConst.test( kind ) || letConst.test( existingDeclaration.kind ) ) ) {
				// TODO warn about double var declarations?
				throw new CompileError( identifier, `${name} is already declared` );
			}

			const declaration = { name, node: identifier, kind, instances: [] };
			this.declarations[ name ] = declaration;

			if ( this.isBlockScope ) {
				if ( !this.functionScope.blockScopedDeclarations[ name ] ) this.functionScope.blockScopedDeclarations[ name ] = [];
				this.functionScope.blockScopedDeclarations[ name ].push( declaration );
			}
		}
	},

	addReference ( identifier ) {
		if ( this.consolidated ) {
			this.consolidateReference( identifier );
		} else {
			this.identifiers.push( identifier );
		}
	},

	consolidate () {
		for ( let i = 0; i < this.identifiers.length; i += 1 ) { // we might push to the array during consolidation, so don't cache length
			const identifier = this.identifiers[i];
			this.consolidateReference( identifier );
		}

		this.consolidated = true; // TODO understand why this is necessary... seems bad
	},

	consolidateReference ( identifier ) {
		const declaration = this.declarations[ identifier.name ];
		if ( declaration ) {
			declaration.instances.push( identifier );
		} else {
			this.references[ identifier.name ] = true;
			if ( this.parent ) this.parent.addReference( identifier );
		}
	},

	contains ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	},

	createIdentifier ( base ) {
		base = base
			.replace( /\s/g, '' )
			.replace( /\[([^\]]+)\]/g, '_$1' )
			.replace( /[^a-zA-Z0-9_$]/g, '_' )
			.replace( /_{2,}/, '_' );

		let name = base;
		let counter = 1;

		while ( this.declarations[ name ] || this.references[ name ] || this.aliases[ name ] || name in reserved ) {
			name = `${base}$${counter++}`;
		}

		this.aliases[ name ] = true;
		return name;
	},

	findDeclaration ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent && this.parent.findDeclaration( name ) );
	}
};
