import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { Subscriber } from '../Subscriber';
export declare class IteratorObservable<T> extends Observable<T> {
    private iterator;
    static create<T>(iterator: any, project?: ((x?: any, i?: number) => T) | any, thisArg?: any | Scheduler, scheduler?: Scheduler): IteratorObservable<{}>;
    static dispatch(state: any): void;
    private thisArg;
    private project;
    private scheduler;
    constructor(iterator: any, project?: ((x?: any, i?: number) => T) | any, thisArg?: any | Scheduler, scheduler?: Scheduler);
    protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void;
}
