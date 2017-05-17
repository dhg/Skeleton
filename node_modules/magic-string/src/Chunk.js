export default function Chunk ( start, end, content ) {
	this.start = start;
	this.end = end;
	this.original = content;

	this.intro = '';
	this.outro = '';

	this.content = content;
	this.storeName = false;
	this.edited = false;

	// we make these non-enumerable, for sanity while debugging
	Object.defineProperties( this, {
		previous: { writable: true, value: null },
		next: { writable: true, value: null }
	});
}

Chunk.prototype = {
	append ( content ) {
		this.outro += content;
	},

	clone () {
		const chunk = new Chunk( this.start, this.end, this.original );

		chunk.intro = this.intro;
		chunk.outro = this.outro;
		chunk.content = this.content;
		chunk.storeName = this.storeName;
		chunk.edited = this.edited;

		return chunk;
	},

	contains ( index ) {
		return this.start < index && index < this.end;
	},

	eachNext ( fn ) {
		let chunk = this;
		while ( chunk ) {
			fn( chunk );
			chunk = chunk.next;
		}
	},

	eachPrevious ( fn ) {
		let chunk = this;
		while ( chunk ) {
			fn( chunk );
			chunk = chunk.previous;
		}
	},

	edit ( content, storeName ) {
		this.content = content;
		this.storeName = storeName;

		this.edited = true;

		return this;
	},

	prepend ( content ) {
		this.intro = content + this.intro;
	},

	split ( index ) {
		const sliceIndex = index - this.start;

		const originalBefore = this.original.slice( 0, sliceIndex );
		const originalAfter = this.original.slice( sliceIndex );

		this.original = originalBefore;

		const newChunk = new Chunk( index, this.end, originalAfter );
		newChunk.outro = this.outro;
		this.outro = '';

		this.end = index;

		if ( this.edited ) {
			// TODO is this block necessary?...
			newChunk.edit( '', false );
			this.content = '';
		} else {
			this.content = originalBefore;
		}

		newChunk.next = this.next;
		if ( newChunk.next ) newChunk.next.previous = newChunk;
		newChunk.previous = this;
		this.next = newChunk;

		return newChunk;
	},

	toString () {
		return this.intro + this.content + this.outro;
	},

	trimEnd ( rx ) {
		this.outro = this.outro.replace( rx, '' );
		if ( this.outro.length ) return true;

		const trimmed = this.content.replace( rx, '' );

		if ( trimmed.length ) {
			if ( trimmed !== this.content ) {
				this.split( this.start + trimmed.length ).edit( '', false );
			}

			return true;
		} else {
			this.edit( '', false );

			this.intro = this.intro.replace( rx, '' );
			if ( this.intro.length ) return true;
		}
	},

	trimStart ( rx ) {
		this.intro = this.intro.replace( rx, '' );
		if ( this.intro.length ) return true;

		const trimmed = this.content.replace( rx, '' );

		if ( trimmed.length ) {
			if ( trimmed !== this.content ) {
				this.split( this.end - trimmed.length );
				this.edit( '', false );
			}

			return true;
		} else {
			this.edit( '', false );

			this.outro = this.outro.replace( rx, '' );
			if ( this.outro.length ) return true;
		}
	}
};
