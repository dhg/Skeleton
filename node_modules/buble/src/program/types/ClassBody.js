import Node from '../Node.js';
import { findIndex } from '../../utils/array.js';
import reserved from '../../utils/reserved.js';

// TODO this code is pretty wild, tidy it up
export default class ClassBody extends Node {
	transpile ( code, transforms, inFunctionExpression, superName ) {
		if ( transforms.classes ) {
			const name = this.parent.name;

			const indentStr = code.getIndentString();
			const i0 = this.getIndentation() + ( inFunctionExpression ? indentStr : '' );
			const i1 = i0 + indentStr;

			const constructorIndex = findIndex( this.body, node => node.kind === 'constructor' );
			const constructor = this.body[ constructorIndex ];

			let introBlock = '';
			let outroBlock = '';

			if ( this.body.length ) {
				code.remove( this.start, this.body[0].start );
				code.remove( this.body[ this.body.length - 1 ].end, this.end );
			} else {
				code.remove( this.start, this.end );
			}

			if ( constructor ) {
				constructor.value.body.isConstructorBody = true;

				const previousMethod = this.body[ constructorIndex - 1 ];
				const nextMethod = this.body[ constructorIndex + 1 ];

				// ensure constructor is first
				if ( constructorIndex > 0 ) {
					code.remove( previousMethod.end, constructor.start );
					code.move( constructor.start, nextMethod ? nextMethod.start : this.end - 1, this.body[0].start );
				}

				if ( !inFunctionExpression ) code.insertLeft( constructor.end, ';' );
			}

			if ( this.parent.superClass ) {
				let inheritanceBlock = `if ( ${superName} ) ${name}.__proto__ = ${superName};\n${i0}${name}.prototype = Object.create( ${superName} && ${superName}.prototype );\n${i0}${name}.prototype.constructor = ${name};`;

				if ( constructor ) {
					introBlock += `\n\n${i0}` + inheritanceBlock;
				} else {
					const fn = `function ${name} () {` + ( superName ?
						`\n${i1}${superName}.apply(this, arguments);\n${i0}}` :
						`}` ) + ( inFunctionExpression ? '' : ';' ) + ( this.body.length ? `\n\n${i0}` : '' );

					inheritanceBlock = fn + inheritanceBlock;
					introBlock += inheritanceBlock + `\n\n${i0}`;
				}
			} else if ( !constructor ) {
				let fn = `function ${name} () {}`;
				if ( this.parent.type === 'ClassDeclaration' ) fn += ';';
				if ( this.body.length ) fn += `\n\n${i0}`;

				introBlock += fn;
			}

			const scope = this.findScope( false );

			let prototypeGettersAndSetters = [];
			let staticGettersAndSetters = [];
			let prototypeAccessors;
			let staticAccessors;

			this.body.forEach( ( method, i ) => {
				if ( method.kind === 'constructor' ) {
					code.overwrite( method.key.start, method.key.end, `function ${name}` );
					return;
				}

				if ( method.static ) code.remove( method.start, method.start + 7 );

				const isAccessor = method.kind !== 'method';
				let lhs;

				let methodName = method.key.name;
				if ( scope.contains( methodName ) || reserved[ methodName ] ) methodName = scope.createIdentifier( methodName );

				if ( isAccessor ) {
					if ( method.computed ) {
						throw new Error( 'Computed accessor properties are not currently supported' );
					}

					code.remove( method.start, method.key.start );

					if ( method.static ) {
						if ( !~staticGettersAndSetters.indexOf( method.key.name ) ) staticGettersAndSetters.push( method.key.name );
						if ( !staticAccessors ) staticAccessors = scope.createIdentifier( 'staticAccessors' );

						lhs = `${staticAccessors}`;
					} else {
						if ( !~prototypeGettersAndSetters.indexOf( method.key.name ) ) prototypeGettersAndSetters.push( method.key.name );
						if ( !prototypeAccessors ) prototypeAccessors = scope.createIdentifier( 'prototypeAccessors' );

						lhs = `${prototypeAccessors}`;
					}
				} else {
					lhs = method.static ?
						`${name}` :
						`${name}.prototype`;
				}

				if ( !method.computed ) lhs += '.';

				const insertNewlines = ( constructorIndex > 0 && i === constructorIndex + 1 ) ||
				                       ( i === 0 && constructorIndex === this.body.length - 1 );

				if ( insertNewlines ) lhs = `\n\n${i0}${lhs}`;

				let c = method.key.end;
				if ( method.computed ) {
					while ( code.original[c] !== ']' ) c += 1;
					c += 1;
				}

				code.insertRight( method.start, lhs );

				const rhs = ( isAccessor ? `.${method.kind}` : '' ) + ` = function` + ( method.value.generator ? '* ' : ' ' ) + ( method.computed || isAccessor ? '' : `${methodName} ` );
				code.remove( c, method.value.start );
				code.insertRight( method.value.start, rhs );
				code.insertLeft( method.end, ';' );

				if ( method.value.generator ) code.remove( method.start, method.key.start );
			});

			if ( prototypeGettersAndSetters.length || staticGettersAndSetters.length ) {
				let intro = [];
				let outro = [];

				if ( prototypeGettersAndSetters.length ) {
					intro.push( `var ${prototypeAccessors} = { ${prototypeGettersAndSetters.map( name => `${name}: {}` ).join( ',' )} };` );
					outro.push( `Object.defineProperties( ${name}.prototype, ${prototypeAccessors} );` );
				}

				if ( staticGettersAndSetters.length ) {
					intro.push( `var ${staticAccessors} = { ${staticGettersAndSetters.map( name => `${name}: {}` ).join( ',' )} };` );
					outro.push( `Object.defineProperties( ${name}, ${staticAccessors} );` );
				}

				if ( constructor ) introBlock += `\n\n${i0}`;
				introBlock += intro.join( `\n${i0}` );
				if ( !constructor ) introBlock += `\n\n${i0}`;

				outroBlock += `\n\n${i0}` + outro.join( `\n${i0}` );
			}

			if ( constructor ) {
				code.insertLeft( constructor.end, introBlock );
			} else {
				code.insertRight( this.start, introBlock );
			}

			code.insertLeft( this.end, outroBlock );
		}

		super.transpile( code, transforms );
	}
}
