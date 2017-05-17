export default class Stats {
	constructor () {
		Object.defineProperties( this, {
			startTimes: { value: {} }
		});
	}

	time ( label ) {
		this.startTimes[ label ] = process.hrtime();
	}

	timeEnd ( label ) {
		const elapsed = process.hrtime( this.startTimes[ label ] );

		if ( !this[ label ] ) this[ label ] = 0;
		this[ label ] += elapsed[0] * 1e3 + elapsed[1] * 1e-6;
	}
}
