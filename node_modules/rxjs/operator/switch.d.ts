/**
 * Converts an Observable that emits Observables into an Observable that emits the items emitted by the most recently
 * emitted of those Observables.
 *
 * <img src="./img/switch.png" width="100%">
 *
 * Switch subscribes to an Observable that emits Observables. Each time it observes one of these emitted Observables,
 * the Observable returned by switchOnNext begins emitting the items emitted by that Observable. When a new Observable
 * is emitted, switchOnNext stops emitting items from the earlier-emitted Observable and begins emitting items from the
 * new one.
 *
 * @param {Function} a predicate function to evaluate items emitted by the source Observable.
 * @returns {Observable<T>} an Observable that emits the items emitted by the Observable most recently emitted by the
 * source Observable.
 */
export declare function _switch<T>(): T;
