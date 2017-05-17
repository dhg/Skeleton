import { Subscriber } from './Subscriber';
import { OuterSubscriber } from './OuterSubscriber';
export declare class InnerSubscriber<T, R> extends Subscriber<R> {
    private parent;
    private outerValue;
    private outerIndex;
    private index;
    constructor(parent: OuterSubscriber<T, R>, outerValue: T, outerIndex: number);
    protected _next(value: R): void;
    protected _error(error: any): void;
    protected _complete(): void;
}
