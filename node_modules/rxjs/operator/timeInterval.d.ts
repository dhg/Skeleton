import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
export declare function timeInterval<T>(scheduler?: Scheduler): Observable<TimeInterval<T>>;
export declare class TimeInterval<T> {
    value: T;
    interval: number;
    constructor(value: T, interval: number);
}
