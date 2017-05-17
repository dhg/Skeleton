import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
export declare class ForkJoinObservable<T> extends Observable<T> {
    private sources;
    private resultSelector;
    constructor(sources: Array<Observable<any> | Promise<any>>, resultSelector?: (...values: Array<any>) => T);
    static create<T>(...sources: Array<Observable<any> | Promise<any> | Array<Observable<any>> | ((...values: Array<any>) => any)>): Observable<T>;
    protected _subscribe(subscriber: Subscriber<any>): void;
}
