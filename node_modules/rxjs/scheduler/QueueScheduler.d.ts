import { Scheduler } from '../Scheduler';
import { QueueAction } from './QueueAction';
import { Subscription } from '../Subscription';
import { Action } from './Action';
export declare class QueueScheduler implements Scheduler {
    active: boolean;
    actions: QueueAction<any>[];
    scheduledId: number;
    now(): number;
    flush(): void;
    schedule<T>(work: (x?: any) => Subscription | void, delay?: number, state?: any): Subscription;
    scheduleNow<T>(work: (x?: any) => Subscription | void, state?: any): Action;
    scheduleLater<T>(work: (x?: any) => Subscription | void, delay: number, state?: any): Action;
}
