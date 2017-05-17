import { Observable, ObservableInput } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
/**
 * Combines the values from this observable with values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine the source with
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */
export declare function combineLatest<T, R>(...observables: Array<ObservableInput<any> | Array<ObservableInput<any>> | ((...values: Array<any>) => R)>): Observable<R>;
export interface CombineLatestSignature<T> {
    <R>(project: (v1: T) => R): Observable<R>;
    <T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): Observable<R>;
    <T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
    <T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
    <T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
    <T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R>;
    <T2>(v2: ObservableInput<T2>): Observable<[T, T2]>;
    <T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
    <T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
    <T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
    <T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
    <R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
    <R>(array: ObservableInput<any>[]): Observable<R>;
    <R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R): Observable<R>;
}
/**
 * Combines the values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */
export declare function combineLatestStatic<T>(v1: ObservableInput<T>): Observable<[T]>;
export declare function combineLatestStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
export declare function combineLatestStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
export declare function combineLatestStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
export declare function combineLatestStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
export declare function combineLatestStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
export declare function combineLatestStatic<T, R>(v1: ObservableInput<T>, project: (v1: T) => R): Observable<R>;
export declare function combineLatestStatic<T, T2, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): Observable<R>;
export declare function combineLatestStatic<T, T2, T3, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
export declare function combineLatestStatic<T, T2, T3, T4, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
export declare function combineLatestStatic<T, T2, T3, T4, T5, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
export declare function combineLatestStatic<T, T2, T3, T4, T5, T6, R>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R>;
export declare function combineLatestStatic<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export declare function combineLatestStatic<R>(array: ObservableInput<any>[]): Observable<R>;
export declare function combineLatestStatic<R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R): Observable<R>;
export declare class CombineLatestOperator<T, R> implements Operator<T, R> {
    private project;
    constructor(project?: (...values: Array<any>) => R);
    call(subscriber: Subscriber<R>): Subscriber<T>;
}
export declare class CombineLatestSubscriber<T, R> extends OuterSubscriber<T, R> {
    private project;
    private active;
    private values;
    private observables;
    private toRespond;
    constructor(destination: Subscriber<R>, project?: (...values: Array<any>) => R);
    protected _next(observable: any): void;
    protected _complete(): void;
    notifyComplete(unused: Subscriber<R>): void;
    notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, R>): void;
    private _tryProject(values);
}
