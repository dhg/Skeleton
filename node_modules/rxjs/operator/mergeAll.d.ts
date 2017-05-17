import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
export declare function mergeAll<T>(concurrent?: number): T;
export declare class MergeAllOperator<T> implements Operator<Observable<T>, T> {
    private concurrent;
    constructor(concurrent: number);
    call(observer: Observer<T>): MergeAllSubscriber<T>;
}
export declare class MergeAllSubscriber<T> extends OuterSubscriber<Observable<T>, T> {
    private concurrent;
    private hasCompleted;
    private buffer;
    private active;
    constructor(destination: Observer<T>, concurrent: number);
    protected _next(observable: Observable<T>): void;
    protected _complete(): void;
    notifyComplete(innerSub: Subscription): void;
}
