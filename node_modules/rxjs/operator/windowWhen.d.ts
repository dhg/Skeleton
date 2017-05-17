import { Observable } from '../Observable';
export declare function windowWhen<T>(closingSelector: () => Observable<any>): Observable<Observable<T>>;
export interface WindowWhenSignature<T> {
    (closingSelector: () => Observable<any>): Observable<Observable<T>>;
}
