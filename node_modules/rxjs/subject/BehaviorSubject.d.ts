import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class BehaviorSubject<T> extends Subject<T> {
    private _value;
    constructor(_value: T);
    getValue(): T;
    value: T;
    protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void;
    protected _next(value: T): void;
    protected _error(err: any): void;
}
