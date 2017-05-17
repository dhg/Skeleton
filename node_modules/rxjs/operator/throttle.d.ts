import { Observable } from '../Observable';
export declare function throttle<T>(durationSelector: (value: T) => Observable<number> | Promise<number>): Observable<T>;
