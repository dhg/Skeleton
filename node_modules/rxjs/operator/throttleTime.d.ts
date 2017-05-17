import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare function throttleTime<T>(delay: number, scheduler?: Scheduler): Observable<T>;
