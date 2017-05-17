export default function getRelativePath ( from, to ) {
	let fromParts = from.split( /[\/\\]/ );
	let toParts = to.split( /[\/\\]/ );

	fromParts.pop(); // get dirname

	while ( fromParts[0] === toParts[0] ) {
		fromParts.shift();
		toParts.shift();
	}

	if ( fromParts.length ) {
		let i = fromParts.length;
		while ( i-- ) fromParts[i] = '..';
	}

	return fromParts.concat( toParts ).join( '/' );
}
