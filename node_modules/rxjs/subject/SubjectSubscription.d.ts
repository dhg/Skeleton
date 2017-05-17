import { Subject } from '../Subject';
import { Observer } from '../Observer';
import { Subscription } from '../Subscription';
export declare class SubjectSubscription extends Subscription {
    subject: Subject<any>;
    observer: Observer<any>;
    isUnsubscribed: boolean;
    constructor(subject: Subject<any>, observer: Observer<any>);
    unsubscribe(): void;
}
