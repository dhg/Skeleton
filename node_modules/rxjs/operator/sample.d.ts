import { Observable } from '../Observable';
/**
 * Returns an Observable that, when the specified sampler Observable emits an item or completes, it then emits the most
 * recently emitted item (if any) emitted by the source Observable since the previous emission from the sampler
 * Observable.
 *
 * <img src="./img/sample.png" width="100%">
 *
 * @param {Observable} sampler - the Observable to use for sampling the source Observable.
 * @returns {Observable<T>} an Observable that emits the results of sampling the items emitted by this Observable
 * whenever the sampler Observable emits an item or completes.
 */
export declare function sample<T>(notifier: Observable<any>): Observable<T>;
