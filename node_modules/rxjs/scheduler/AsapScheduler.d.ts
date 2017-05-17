import { Action } from './Action';
import { Subscription } from '../Subscription';
import { QueueScheduler } from './QueueScheduler';
export declare class AsapScheduler extends QueueScheduler {
    scheduleNow<T>(work: (x?: any) => Subscription, state?: any): Action;
}
