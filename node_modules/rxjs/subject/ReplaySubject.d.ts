import { Subject } from '../Subject';
import { Scheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class ReplaySubject<T> extends Subject<T> {
    private events;
    private scheduler;
    private bufferSize;
    private _windowTime;
    constructor(bufferSize?: number, windowTime?: number, scheduler?: Scheduler);
    protected _next(value: T): void;
    protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void;
    private _getNow();
    private _trimBufferThenGetEvents(now);
}
