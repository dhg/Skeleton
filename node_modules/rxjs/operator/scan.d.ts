import { Observable } from '../Observable';
/**
 * Returns an Observable that applies a specified accumulator function to each item emitted by the source Observable.
 * If a seed value is specified, then that value will be used as the initial value for the accumulator.
 * If no seed value is specified, the first item of the source is used as the seed.
 * @param {function} accumulator The accumulator function called on each item.
 *
 * <img src="./img/scan.png" width="100%">
 *
 * @param {any} [seed] The initial accumulator value.
 * @returns {Obervable} An observable of the accumulated values.
 */
export declare function scan<T, R>(accumulator: (acc: R, x: T) => R, seed?: T | R): Observable<R>;
