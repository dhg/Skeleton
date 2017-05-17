import { Subscriber } from './Subscriber';
export declare class Operator<T, R> {
    call(subscriber: Subscriber<R>): Subscriber<T>;
}
