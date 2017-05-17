import { Observable } from '../Observable';
/**
 * Returns an Observable that emits the elements of the source or a specified default value if empty.
 * @param {any} defaultValue the default value used if source is empty; defaults to null.
 * @returns {Observable} an Observable of the items emitted by the where empty values are replaced by the specified default value or null.
 */
export declare function defaultIfEmpty<T, R>(defaultValue?: R): Observable<T | R>;
