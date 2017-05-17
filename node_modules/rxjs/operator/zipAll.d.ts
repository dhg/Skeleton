import { Observable } from '../Observable';
export declare function zipAll<T, R>(project?: (...values: Array<any>) => R): Observable<R>;
