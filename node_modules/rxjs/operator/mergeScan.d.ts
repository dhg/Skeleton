import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
export declare function mergeScan<T, R>(project: (acc: R, value: T) => Observable<R>, seed: R, concurrent?: number): Observable<R>;
export declare class MergeScanOperator<T, R> implements Operator<T, R> {
    private project;
    private seed;
    private concurrent;
    constructor(project: (acc: R, value: T) => Observable<R>, seed: R, concurrent: number);
    call(subscriber: Subscriber<R>): Subscriber<T>;
}
export declare class MergeScanSubscriber<T, R> extends OuterSubscriber<T, R> {
    private project;
    private acc;
    private concurrent;
    private hasValue;
    private hasCompleted;
    private buffer;
    private active;
    protected index: number;
    constructor(destination: Subscriber<R>, project: (acc: R, value: T) => Observable<R>, acc: R, concurrent: number);
    protected _next(value: any): void;
    private _innerSub(ish, value, index);
    protected _complete(): void;
    notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, R>): void;
    notifyComplete(innerSub: Subscription): void;
}
