import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class ArrayLikeObservable<T> extends Observable<T> {
    private arrayLike;
    private scheduler;
    private mapFn;
    static create<T>(arrayLike: ArrayLike<T>, mapFn: (x: any, y: number) => T, thisArg: any, scheduler?: Scheduler): Observable<T>;
    static dispatch(state: any): void;
    private value;
    constructor(arrayLike: ArrayLike<T>, mapFn: (x: any, y: number) => T, thisArg: any, scheduler?: Scheduler);
    protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void;
}
