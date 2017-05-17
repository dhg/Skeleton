import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Scheduler } from '../Scheduler';
import { AsyncSubject } from '../subject/AsyncSubject';
export declare class BoundNodeCallbackObservable<T> extends Observable<T> {
    private callbackFunc;
    private selector;
    private args;
    scheduler: Scheduler;
    subject: AsyncSubject<T>;
    static create<R>(callbackFunc: (callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): () => Observable<R>;
    static create<T, R>(callbackFunc: (v1: T, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T) => Observable<R>;
    static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2) => Observable<R>;
    static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
    static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
    static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
    static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
    static create<T>(callbackFunc: Function, selector?: void, scheduler?: Scheduler): (...args: any[]) => Observable<T>;
    static create<T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: Scheduler): (...args: any[]) => Observable<T>;
    constructor(callbackFunc: Function, selector: Function, args: any[], scheduler: Scheduler);
    protected _subscribe(subscriber: Subscriber<T | T[]>): Subscription;
}
