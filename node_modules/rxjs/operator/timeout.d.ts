import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare function timeout<T>(due: number | Date, errorToSend?: any, scheduler?: Scheduler): Observable<T>;
