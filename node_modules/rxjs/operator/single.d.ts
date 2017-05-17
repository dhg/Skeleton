import { Observable } from '../Observable';
/**
 * Returns an Observable that emits the single item emitted by the source Observable that matches a specified
 * predicate, if that Observable emits one such item. If the source Observable emits more than one such item or no
 * such items, notify of an IllegalArgumentException or NoSuchElementException respectively.
 *
 * <img src="./img/single.png" width="100%">
 *
 * @param {Function} a predicate function to evaluate items emitted by the source Observable.
 * @returns {Observable<T>} an Observable that emits the single item emitted by the source Observable that matches
 * the predicate.
 .
 */
export declare function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T>;
