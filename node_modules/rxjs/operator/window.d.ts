import { Observable } from '../Observable';
export declare function window<T>(closingNotifier: Observable<any>): Observable<Observable<T>>;
export interface WindowSignature<T> {
    (closingNotifier: Observable<any>): Observable<Observable<T>>;
}
