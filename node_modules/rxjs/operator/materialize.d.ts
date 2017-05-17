import { Observable } from '../Observable';
import { Notification } from '../Notification';
/**
 * Returns an Observable that represents all of the emissions and notifications
 * from the source Observable into emissions marked with their original types
 * within a `Notification` objects.
 *
 * <img src="./img/materialize.png" width="100%">
 *
 * @scheduler materialize does not operate by default on a particular Scheduler.
 * @returns {Observable} an Observable that emits items that are the result of
 * materializing the items and notifications of the source Observable.
 */
export declare function materialize<T>(): Observable<Notification<T>>;
