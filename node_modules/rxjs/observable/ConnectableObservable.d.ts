import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class ConnectableObservable<T> extends Observable<T> {
    protected source: Observable<T>;
    protected subjectFactory: () => Subject<T>;
    protected subject: Subject<T>;
    protected subscription: Subscription;
    constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    protected getSubject(): Subject<T>;
    connect(): Subscription;
    refCount(): Observable<T>;
    /**
     * This method is opened for `ConnectableSubscription`.
     * Not to call from others.
     */
    _closeSubscription(): void;
}
