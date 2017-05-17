import { PartialObserver } from '../Observer';
import { Subscriber } from '../Subscriber';
export declare function toSubscriber<T>(nextOrObserver?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscriber<T>;
