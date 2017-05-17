import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class AsyncSubject<T> extends Subject<T> {
    value: T;
    hasNext: boolean;
    protected _subscribe(subscriber: Subscriber<any>): Subscription | Function | void;
    protected _next(value: T): void;
    protected _complete(): void;
}
