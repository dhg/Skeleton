import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
/**
 * Returns an Observable that searches for the first item in the source Observable that
 * matches the specified condition, and returns the first occurence in the source.
 * @param {function} predicate function called with each item to test for condition matching.
 * @returns {Observable} an Observable of the first item that matches the condition.
 */
export declare function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>;
export declare class FindValueOperator<T> implements Operator<T, T> {
    private predicate;
    private source;
    private yieldIndex;
    private thisArg;
    constructor(predicate: (value: T, index: number, source: Observable<T>) => boolean, source: Observable<T>, yieldIndex: boolean, thisArg?: any);
    call(observer: Subscriber<T>): Subscriber<T>;
}
export declare class FindValueSubscriber<T> extends Subscriber<T> {
    private predicate;
    private source;
    private yieldIndex;
    private thisArg;
    private index;
    constructor(destination: Subscriber<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean, source: Observable<T>, yieldIndex: boolean, thisArg?: any);
    private notifyComplete(value);
    protected _next(value: T): void;
    protected _complete(): void;
}
