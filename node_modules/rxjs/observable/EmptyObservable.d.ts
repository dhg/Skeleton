import { Scheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
export declare class EmptyObservable<T> extends Observable<T> {
    private scheduler;
    static create<T>(scheduler?: Scheduler): Observable<T>;
    static dispatch({subscriber}: {
        subscriber: any;
    }): void;
    constructor(scheduler?: Scheduler);
    protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void;
}
