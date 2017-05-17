import { Observable } from '../Observable';
export declare function partition<T>(predicate: (value: T) => boolean, thisArg?: any): [Observable<T>, Observable<T>];
