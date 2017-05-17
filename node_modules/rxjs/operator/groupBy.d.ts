import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one `GroupedObservable` per group.
 *
 * <img src="./img/groupBy.png" width="100%">
 *
 * @param {Function} keySelector - a function that extracts the key for each item
 * @param {Function} elementSelector - a function that extracts the return element for each item
 * @returns {Observable} an Observable that emits GroupedObservables, each of which corresponds
 * to a unique key value and each of which emits those items from the source Observable that share
 * that key value.
 */
export declare function groupBy<T, K, R>(keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>): Observable<GroupedObservable<K, R>>;
export interface RefCountSubscription {
    count: number;
    unsubscribe: () => void;
    isUnsubscribed: boolean;
    attemptedToUnsubscribe: boolean;
}
export declare class GroupedObservable<K, T> extends Observable<T> {
    key: K;
    private groupSubject;
    private refCountSubscription;
    constructor(key: K, groupSubject: Subject<T>, refCountSubscription?: RefCountSubscription);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
}
