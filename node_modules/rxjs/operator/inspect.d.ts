import { Observable } from '../Observable';
export declare function inspect<T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T>;
