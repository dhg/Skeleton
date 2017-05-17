import { Observable } from '../Observable';
/**
 * If the source Observable is empty it returns an Observable that emits true, otherwise it emits false.
 *
 * <img src="./img/isEmpty.png" width="100%">
 *
 * @returns {Observable} an Observable that emits a Boolean.
 */
export declare function isEmpty(): Observable<boolean>;
