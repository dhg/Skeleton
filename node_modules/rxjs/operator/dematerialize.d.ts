import { Observable } from '../Observable';
/**
 * Returns an Observable that transforms Notification objects into the items or notifications they represent.
 * @returns {Observable} an Observable that emits items and notifications embedded in Notification objects emitted by the source Observable.
 */
export declare function dematerialize<T>(): Observable<any>;
