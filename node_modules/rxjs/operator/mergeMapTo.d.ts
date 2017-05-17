import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
export declare function mergeMapTo<T, R, R2>(observable: Observable<R>, resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2 | number, concurrent?: number): Observable<R2>;
export declare class MergeMapToOperator<T, R, R2> implements Operator<Observable<T>, R2> {
    private ish;
    private resultSelector;
    private concurrent;
    constructor(ish: Observable<R> | Promise<R>, resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2, concurrent?: number);
    call(observer: Subscriber<R2>): Subscriber<any>;
}
export declare class MergeMapToSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
    private ish;
    private resultSelector;
    private concurrent;
    private hasCompleted;
    private buffer;
    private active;
    protected index: number;
    constructor(destination: Subscriber<R2>, ish: Observable<R> | Promise<R>, resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2, concurrent?: number);
    protected _next(value: any): void;
    private _innerSub(ish, destination, resultSelector, value, index);
    protected _complete(): void;
    notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, R>): void;
    private trySelectResult(outerValue, innerValue, outerIndex, innerIndex);
    notifyError(err: any): void;
    notifyComplete(innerSub: Subscription): void;
}
