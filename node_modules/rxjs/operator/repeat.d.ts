import { Observable } from '../Observable';
/**
 * Returns an Observable that repeats the stream of items emitted by the source Observable at most count times,
 * on a particular Scheduler.
 *
 * <img src="./img/repeat.png" width="100%">
 *
 * @param {Scheduler} [scheduler] the Scheduler to emit the items on.
 * @param {number} [count] the number of times the source Observable items are repeated, a count of 0 will yield
 * an empty Observable.
 * @returns {Observable} an Observable that repeats the stream of items emitted by the source Observable at most
 * count times.
 */
export declare function repeat<T>(count?: number): Observable<T>;
