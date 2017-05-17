import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
/**
 * Creates a result Observable which emits values from every given input Observable.
 *
 * <img src="./img/merge.png" width="100%">
 *
 * @param {Observable} input Observables
 * @returns {Observable} an Observable that emits items that are the result of every input Observable.
 */
export declare function merge<T, R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R>;
export declare function mergeStatic<T, R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R>;
