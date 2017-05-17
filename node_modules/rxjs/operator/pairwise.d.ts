import { Observable } from '../Observable';
/**
 * Returns a new observable that triggers on the second and following inputs.
 * An input that triggers an event will return an pair of [(N - 1)th, Nth].
 * The (N-1)th is stored in the internal state until Nth input occurs.
 *
 * <img src="./img/pairwise.png" width="100%">
 *
 * @returns {Observable<R>} an observable of pairs of values.
 */
export declare function pairwise<T>(): Observable<[T, T]>;
