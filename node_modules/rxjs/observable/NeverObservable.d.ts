import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
export declare class NeverObservable<T> extends Observable<T> {
    static create<T>(): NeverObservable<T>;
    constructor();
    protected _subscribe(subscriber: Subscriber<T>): void;
}
