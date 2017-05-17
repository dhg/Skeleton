import { Scheduler } from '../Scheduler';
import { ConnectableObservable } from '../observable/ConnectableObservable';
export declare function publishReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: Scheduler): ConnectableObservable<T>;
