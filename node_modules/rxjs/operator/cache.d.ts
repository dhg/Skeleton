import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
export declare function cache<T>(bufferSize?: number, windowTime?: number, scheduler?: Scheduler): Observable<T>;
