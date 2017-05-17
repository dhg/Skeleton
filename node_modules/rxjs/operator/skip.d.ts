import { Observable } from '../Observable';
/**
 * Returns an Observable that skips `n` items emitted by an Observable.
 *
 * <img src="./img/skip.png" width="100%">
 *
 * @param {Number} the `n` of times, items emitted by source Observable should be skipped.
 * @returns {Observable} an Observable that skips values emitted by the source Observable.
 *
 */
export declare function skip<T>(total: number): Observable<T>;
