import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
/**
 * Returns an Observable that applies a specified accumulator function to the first item emitted by a source Observable,
 * then feeds the result of that function along with the second item emitted by the source Observable into the same
 * function, and so on until all items have been emitted by the source Observable, and emits the final result from
 * the final call to your function as its sole item.
 * This technique, which is called "reduce" here, is sometimes called "aggregate," "fold," "accumulate," "compress," or
 * "inject" in other programming contexts.
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * @param {initialValue} the initial (seed) accumulator value
 * @param {accumulator} an accumulator function to be invoked on each item emitted by the source Observable, the
 * result of which will be used in the next accumulator call.
 * @returns {Observable} an Observable that emits a single item that is the result of accumulating the output from the
 * items emitted by the source Observable.
 */
export declare function reduce<T, R>(project: (acc: R, value: T) => R, seed?: R): Observable<R>;
export declare class ReduceOperator<T, R> implements Operator<T, R> {
    private project;
    private seed;
    constructor(project: (acc: R, value: T) => R, seed?: R);
    call(subscriber: Subscriber<R>): Subscriber<T>;
}
export declare class ReduceSubscriber<T, R> extends Subscriber<T> {
    acc: T | R;
    hasSeed: boolean;
    hasValue: boolean;
    project: (acc: R, value: T) => R;
    constructor(destination: Subscriber<R>, project: (acc: R, value: T) => R, seed?: R);
    protected _next(value: T): void;
    private _tryReduce(value);
    protected _complete(): void;
}
