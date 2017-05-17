import { Action } from './Action';
import { Scheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
export declare class FutureAction<T> extends Subscription implements Action {
    scheduler: Scheduler;
    work: (x?: any) => Subscription | void;
    id: any;
    state: any;
    delay: number;
    constructor(scheduler: Scheduler, work: (x?: any) => Subscription | void);
    execute(): void;
    schedule(state?: any, delay?: number): Action;
    protected _schedule(state?: any, delay?: number): Action;
    protected _unsubscribe(): void;
}
