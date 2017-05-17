import { Observable } from '../Observable';
/**
 * Returns an Observable that emits the item at the specified index in the source Observable.
 * If default is given, missing indices will output this value on next; otherwise, outputs error.
 * @param {number} index the index of the value to be retrieved.
 * @param {any} [defaultValue] the default value returned for missing indices.
 * @returns {Observable} an Observable that emits a single item, if it is found. Otherwise, will emit the default value if given.
 */
export declare function elementAt<T>(index: number, defaultValue?: T): Observable<T>;
