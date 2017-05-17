import { Observable } from '../Observable';
/**
 * Returns a new Observable by applying a function that you supply to each item emitted by the source Observable that
 * returns an Observable, and then emitting the items emitted by the most recently emitted of these Observables.
 *
 * <img src="./img/switchMap.png" width="100%">
 *
 * @param {Observable} a function that, when applied to an item emitted by the source Observable, returns an Observable.
 * @returns {Observable} an Observable that emits the items emitted by the Observable returned from applying func to
 * the most recently emitted item emitted by the source Observable.
 */
export declare function switchMap<T, R, R2>(project: (value: T, index: number) => Observable<R>, resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2): Observable<R2>;
