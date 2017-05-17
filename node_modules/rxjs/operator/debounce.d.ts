import { Observable } from '../Observable';
/**
 * Returns the source Observable delayed by the computed debounce duration,
 * with the duration lengthened if a new source item arrives before the delay
 * duration ends.
 * In practice, for each item emitted on the source, this operator holds the
 * latest item, waits for a silence as long as the `durationSelector` specifies,
 * and only then emits the latest source item on the result Observable.
 * @param {function} durationSelector function for computing the timeout duration for each item.
 * @returns {Observable} an Observable the same as source Observable, but drops items.
 */
export declare function debounce<T>(durationSelector: (value: T) => Observable<number> | Promise<number>): Observable<T>;
