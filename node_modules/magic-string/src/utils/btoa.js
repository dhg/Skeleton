let _btoa;

if ( typeof window !== 'undefined' && typeof window.btoa === 'function' ) {
	_btoa = window.btoa;
} else if ( typeof Buffer === 'function' ) {
	_btoa = str => new Buffer( str ).toString( 'base64' );
} else {
	_btoa = () => {
		throw new Error( 'Unsupported environment: `window.btoa` or `Buffer` should be supported.' );
	};
}

export default _btoa;
