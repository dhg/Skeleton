import Chunk from './Chunk.js';
import SourceMap from './utils/SourceMap.js';
import guessIndent from './utils/guessIndent.js';
import encodeMappings from './utils/encodeMappings.js';
import getRelativePath from './utils/getRelativePath.js';
import isObject from './utils/isObject.js';
import getLocator from './utils/getLocator.js';
import Stats from './utils/Stats.js';

export default function MagicString ( string, options = {} ) {
	const chunk = new Chunk( 0, string.length, string );

	Object.defineProperties( this, {
		original:              { writable: true, value: string },
		outro:                 { writable: true, value: '' },
		intro:                 { writable: true, value: '' },
		firstChunk:            { writable: true, value: chunk },
		lastChunk:             { writable: true, value: chunk },
		lastSearchedChunk:     { writable: true, value: chunk },
		byStart:               { writable: true, value: {} },
		byEnd:                 { writable: true, value: {} },
		filename:              { writable: true, value: options.filename },
		indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
		sourcemapLocations:    { writable: true, value: {} },
		storedNames:           { writable: true, value: {} },
		indentStr:             { writable: true, value: guessIndent( string ) }
	});

	if ( DEBUG ) {
		Object.defineProperty( this, 'stats', { value: new Stats() });
	}

	this.byStart[ 0 ] = chunk;
	this.byEnd[ string.length ] = chunk;
}

MagicString.prototype = {
	addSourcemapLocation ( char ) {
		this.sourcemapLocations[ char ] = true;
	},

	append ( content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'outro content must be a string' );

		this.outro += content;
		return this;
	},

	clone () {
		let cloned = new MagicString( this.original, { filename: this.filename });

		let originalChunk = this.firstChunk;
		let clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();

		while ( originalChunk ) {
			cloned.byStart[ clonedChunk.start ] = clonedChunk;
			cloned.byEnd[ clonedChunk.end ] = clonedChunk;

			const nextOriginalChunk = originalChunk.next;
			const nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

			if ( nextClonedChunk ) {
				clonedChunk.next = nextClonedChunk;
				nextClonedChunk.previous = clonedChunk;

				clonedChunk = nextClonedChunk;
			}

			originalChunk = nextOriginalChunk;
		}

		cloned.lastChunk = clonedChunk;

		if ( this.indentExclusionRanges ) {
			cloned.indentExclusionRanges = typeof this.indentExclusionRanges[0] === 'number' ?
				[ this.indentExclusionRanges[0], this.indentExclusionRanges[1] ] :
				this.indentExclusionRanges.map( range => [ range.start, range.end ] );
		}

		Object.keys( this.sourcemapLocations ).forEach( loc => {
			cloned.sourcemapLocations[ loc ] = true;
		});

		return cloned;
	},

	generateMap ( options ) {
		options = options || {};

		const names = Object.keys( this.storedNames );

		if ( DEBUG ) this.stats.time( 'generateMap' );
		const map = new SourceMap({
			file: ( options.file ? options.file.split( /[\/\\]/ ).pop() : null ),
			sources: [ options.source ? getRelativePath( options.file || '', options.source ) : null ],
			sourcesContent: options.includeContent ? [ this.original ] : [ null ],
			names,
			mappings: this.getMappings( options.hires, 0, {}, names )
		});
		if ( DEBUG ) this.stats.timeEnd( 'generateMap' );

		return map;
	},

	getIndentString () {
		return this.indentStr === null ? '\t' : this.indentStr;
	},

	getMappings ( hires, sourceIndex, offsets, names ) {
		return encodeMappings( this.original, this.intro, this.firstChunk, hires, this.sourcemapLocations, sourceIndex, offsets, names );
	},

	indent ( indentStr, options ) {
		const pattern = /^[^\r\n]/gm;

		if ( isObject( indentStr ) ) {
			options = indentStr;
			indentStr = undefined;
		}

		indentStr = indentStr !== undefined ? indentStr : ( this.indentStr || '\t' );

		if ( indentStr === '' ) return this; // noop

		options = options || {};

		// Process exclusion ranges
		let isExcluded = {};

		if ( options.exclude ) {
			let exclusions = typeof options.exclude[0] === 'number' ? [ options.exclude ] : options.exclude;
			exclusions.forEach( exclusion => {
				for ( let i = exclusion[0]; i < exclusion[1]; i += 1 ) {
					isExcluded[i] = true;
				}
			});
		}

		let shouldIndentNextCharacter = options.indentStart !== false;
		const replacer = match => {
			if ( shouldIndentNextCharacter ) return `${indentStr}${match}`;
			shouldIndentNextCharacter = true;
			return match;
		};

		this.intro = this.intro.replace( pattern, replacer );

		let charIndex = 0;

		let chunk = this.firstChunk;

		while ( chunk ) {
			const end = chunk.end;

			if ( chunk.edited ) {
				if ( !isExcluded[ charIndex ] ) {
					chunk.content = chunk.content.replace( pattern, replacer );

					if ( chunk.content.length ) {
						shouldIndentNextCharacter = chunk.content[ chunk.content.length - 1 ] === '\n';
					}
				}
			} else {
				charIndex = chunk.start;

				while ( charIndex < end ) {
					if ( !isExcluded[ charIndex ] ) {
						const char = this.original[ charIndex ];

						if ( char === '\n' ) {
							shouldIndentNextCharacter = true;
						} else if ( char !== '\r' && shouldIndentNextCharacter ) {
							shouldIndentNextCharacter = false;

							if ( charIndex === chunk.start ) {
								chunk.prepend( indentStr );
							} else {
								const rhs = chunk.split( charIndex );
								rhs.prepend( indentStr );

								this.byStart[ charIndex ] = rhs;
								this.byEnd[ charIndex ] = chunk;

								chunk = rhs;
							}
						}
					}

					charIndex += 1;
				}
			}

			charIndex = chunk.end;
			chunk = chunk.next;
		}

		this.outro = this.outro.replace( pattern, replacer );

		return this;
	},

	insert () {
		throw new Error( 'magicString.insert(...) is deprecated. Use insertRight(...) or insertLeft(...)' );
	},

	insertLeft ( index, content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'inserted content must be a string' );

		if ( DEBUG ) this.stats.time( 'insertLeft' );

		this._split( index );

		const chunk = this.byEnd[ index ];

		if ( chunk ) {
			chunk.append( content );
		} else {
			this.intro += content;
		}

		if ( DEBUG ) this.stats.timeEnd( 'insertLeft' );
		return this;
	},

	insertRight ( index, content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'inserted content must be a string' );

		if ( DEBUG ) this.stats.time( 'insertRight' );

		this._split( index );

		const chunk = this.byStart[ index ];

		if ( chunk ) {
			chunk.prepend( content );
		} else {
			this.outro += content;
		}

		if ( DEBUG ) this.stats.timeEnd( 'insertRight' );
		return this;
	},

	move ( start, end, index ) {
		if ( index >= start && index <= end ) throw new Error( 'Cannot move a selection inside itself' );

		if ( DEBUG ) this.stats.time( 'move' );

		this._split( start );
		this._split( end );
		this._split( index );

		const first = this.byStart[ start ];
		const last = this.byEnd[ end ];

		const oldLeft = first.previous;
		const oldRight = last.next;

		const newRight = this.byStart[ index ];
		if ( !newRight && last === this.lastChunk ) return this;
		const newLeft = newRight ? newRight.previous : this.lastChunk;

		if ( oldLeft ) oldLeft.next = oldRight;
		if ( oldRight ) oldRight.previous = oldLeft;

		if ( newLeft ) newLeft.next = first;
		if ( newRight ) newRight.previous = last;

		if ( !first.previous ) this.firstChunk = last.next;
		if ( !last.next ) {
			this.lastChunk = first.previous;
			this.lastChunk.next = null;
		}

		first.previous = newLeft;
		last.next = newRight;

		if ( !newLeft ) this.firstChunk = first;
		if ( !newRight ) this.lastChunk = last;

		if ( DEBUG ) this.stats.timeEnd( 'move' );
		return this;
	},

	overwrite ( start, end, content, storeName ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'replacement content must be a string' );

		while ( start < 0 ) start += this.original.length;
		while ( end < 0 ) end += this.original.length;

		if ( end > this.original.length ) throw new Error( 'end is out of bounds' );
		if ( start === end ) throw new Error( 'Cannot overwrite a zero-length range – use insertLeft or insertRight instead' );

		if ( DEBUG ) this.stats.time( 'overwrite' );

		this._split( start );
		this._split( end );

		if ( storeName ) {
			const original = this.original.slice( start, end );
			this.storedNames[ original ] = true;
		}

		const first = this.byStart[ start ];
		const last = this.byEnd[ end ];

		if ( first ) {
			first.edit( content, storeName );

			if ( first !== last ) {
				first.outro = '';

				let chunk = first.next;
				while ( chunk !== last ) {
					chunk.edit( '', false );
					chunk.intro = chunk.outro = '';
					chunk = chunk.next;
				}

				chunk.edit( '', false );
				chunk.intro = '';
			}
		}

		else {
			// must be inserting at the end
			const newChunk = new Chunk( start, end, '' ).edit( content, storeName );

			// TODO last chunk in the array may not be the last chunk, if it's moved...
			last.next = newChunk;
			newChunk.previous = last;
		}

		if ( DEBUG ) this.stats.timeEnd( 'overwrite' );
		return this;
	},

	prepend ( content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'outro content must be a string' );

		this.intro = content + this.intro;
		return this;
	},

	remove ( start, end ) {
		while ( start < 0 ) start += this.original.length;
		while ( end < 0 ) end += this.original.length;

		if ( start === end ) return this;

		if ( start < 0 || end > this.original.length ) throw new Error( 'Character is out of bounds' );
		if ( start > end ) throw new Error( 'end must be greater than start' );

		return this.overwrite( start, end, '', false );
	},

	slice ( start = 0, end = this.original.length ) {
		while ( start < 0 ) start += this.original.length;
		while ( end < 0 ) end += this.original.length;

		let result = '';

		// find start chunk
		let chunk = this.firstChunk;
		while ( chunk && ( chunk.start > start || chunk.end <= start ) ) {

			// found end chunk before start
			if ( chunk.start < end && chunk.end >= end ) {
				return result;
			}

			chunk = chunk.next;
		}

		if ( chunk && chunk.edited && chunk.start !== start ) throw new Error(`Cannot use replaced character ${start} as slice start anchor.`);

		let startChunk = chunk;
		while ( chunk ) {
			if ( chunk.intro && ( startChunk !== chunk || chunk.start === start ) ) {
				result += chunk.intro;
			}

			const containsEnd = chunk.start < end && chunk.end >= end;
			if ( containsEnd && chunk.edited && chunk.end !== end ) throw new Error(`Cannot use replaced character ${end} as slice end anchor.`);

			const sliceStart = startChunk === chunk ? start - chunk.start : 0;
			const sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;

			result += chunk.content.slice( sliceStart, sliceEnd );

			if ( chunk.outro && ( !containsEnd || chunk.end === end ) ) {
				result += chunk.outro;
			}

			if ( containsEnd ) {
				break;
			}

			chunk = chunk.next;
		}

		return result;
	},

	// TODO deprecate this? not really very useful
	snip ( start, end ) {
		const clone = this.clone();
		clone.remove( 0, start );
		clone.remove( end, clone.original.length );

		return clone;
	},

	_split ( index ) {
		if ( this.byStart[ index ] || this.byEnd[ index ] ) return;

		if ( DEBUG ) this.stats.time( '_split' );

		let chunk = this.lastSearchedChunk;
		const searchForward = index > chunk.end;

		while ( true ) {
			if ( chunk.contains( index ) ) return this._splitChunk( chunk, index );

			chunk = searchForward ?
				this.byStart[ chunk.end ] :
				this.byEnd[ chunk.start ];
		}
	},

	_splitChunk ( chunk, index ) {
		if ( chunk.edited && chunk.content.length ) { // zero-length edited chunks are a special case (overlapping replacements)
			const loc = getLocator( this.original )( index );
			throw new Error( `Cannot split a chunk that has already been edited (${loc.line}:${loc.column} – "${chunk.original}")` );
		}

		const newChunk = chunk.split( index );

		this.byEnd[ index ] = chunk;
		this.byStart[ index ] = newChunk;
		this.byEnd[ newChunk.end ] = newChunk;

		if ( chunk === this.lastChunk ) this.lastChunk = newChunk;

		this.lastSearchedChunk = chunk;
		if ( DEBUG ) this.stats.timeEnd( '_split' );
		return true;
	},

	toString () {
		let str = this.intro;

		let chunk = this.firstChunk;
		while ( chunk ) {
			str += chunk.toString();
			chunk = chunk.next;
		}

		return str + this.outro;
	},

	trimLines () {
		return this.trim('[\\r\\n]');
	},

	trim ( charType ) {
		return this.trimStart( charType ).trimEnd( charType );
	},

	trimEnd ( charType ) {
		const rx = new RegExp( ( charType || '\\s' ) + '+$' );

		this.outro = this.outro.replace( rx, '' );
		if ( this.outro.length ) return this;

		let chunk = this.lastChunk;

		do {
			const end = chunk.end;
			const aborted = chunk.trimEnd( rx );

			// if chunk was trimmed, we have a new lastChunk
			if ( chunk.end !== end ) {
				this.lastChunk = chunk.next;

				this.byEnd[ chunk.end ] = chunk;
				this.byStart[ chunk.next.start ] = chunk.next;
			}

			if ( aborted ) return this;
			chunk = chunk.previous;
		} while ( chunk );

		return this;
	},

	trimStart ( charType ) {
		const rx = new RegExp( '^' + ( charType || '\\s' ) + '+' );

		this.intro = this.intro.replace( rx, '' );
		if ( this.intro.length ) return this;

		let chunk = this.firstChunk;

		do {
			const end = chunk.end;
			const aborted = chunk.trimStart( rx );

			if ( chunk.end !== end ) {
				// special case...
				if ( chunk === this.lastChunk ) this.lastChunk = chunk.next;

				this.byEnd[ chunk.end ] = chunk;
				this.byStart[ chunk.next.start ] = chunk.next;
			}

			if ( aborted ) return this;
			chunk = chunk.next;
		} while ( chunk );

		return this;
	}
};
