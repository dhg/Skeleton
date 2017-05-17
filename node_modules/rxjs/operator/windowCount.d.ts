import { Observable } from '../Observable';
export declare function windowCount<T>(windowSize: number, startWindowEvery?: number): Observable<Observable<T>>;
export interface WindowCountSignature<T> {
    (windowSize: number, startWindowEvery?: number): Observable<Observable<T>>;
}
