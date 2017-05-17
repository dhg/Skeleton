import { Observable } from '../Observable';
/**
 * Buffers values from the source by opening the buffer via signals from an
 * Observable provided to `openings`, and closing and sending the buffers when
 * an Observable returned by the `closingSelector` emits.
 *
 * <img src="./img/bufferToggle.png" width="100%">
 *
 * @param {Observable<O>} openings An observable of notifications to start new
 * buffers.
 * @param {Function} closingSelector a function that takes the value emitted by
 * the `openings` observable and returns an Observable, which, when it emits,
 * signals that the associated buffer should be emitted and cleared.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export declare function bufferToggle<T, O>(openings: Observable<O>, closingSelector: (value: O) => Observable<any>): Observable<T[]>;
export interface BufferToggleSignature<T> {
    <O>(openings: Observable<O>, closingSelector: (value: O) => Observable<any>): Observable<T[]>;
}
