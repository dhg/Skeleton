import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class PromiseObservable<T> extends Observable<T> {
    private promise;
    scheduler: Scheduler;
    value: T;
    static create<T>(promise: Promise<T>, scheduler?: Scheduler): Observable<T>;
    constructor(promise: Promise<T>, scheduler?: Scheduler);
    protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void;
}
