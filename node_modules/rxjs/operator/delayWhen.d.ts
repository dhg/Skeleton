import { Observable } from '../Observable';
/**
 * Returns an Observable that delays the emission of items from the source Observable
 * by a subscription delay and a delay selector function for each element.
 * @param {Function} selector function to retrieve a sequence indicating the delay for each given element.
 * @param {Observable} sequence indicating the delay for the subscription to the source.
 * @returns {Observable} an Observable that delays the emissions of the source Observable by the specified timeout or Date.
 */
export declare function delayWhen<T>(delayDurationSelector: (value: T) => Observable<any>, subscriptionDelay?: Observable<any>): Observable<T>;
