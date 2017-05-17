import { Observable } from '../Observable';
export declare function letProto<T, R>(func: (selector: Observable<T>) => Observable<R>): Observable<R>;
