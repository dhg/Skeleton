const toString = Object.prototype.toString;

export default function isObject ( thing ) {
	return toString.call( thing ) === '[object Object]';
}
