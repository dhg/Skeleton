import { Action } from './Action';
import { FutureAction } from './FutureAction';
export declare class AsapAction<T> extends FutureAction<T> {
    protected _schedule(state?: any, delay?: number): Action;
    protected _unsubscribe(): void;
}
