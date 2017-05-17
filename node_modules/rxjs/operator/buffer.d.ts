import { Observable } from '../Observable';
/**
 * Buffers the incoming observable values until the passed `closingNotifier`
 * emits a value, at which point it emits the buffer on the returned observable
 * and starts a new buffer internally, awaiting the next time `closingNotifier`
 * emits.
 *
 * <img src="./img/buffer.png" width="100%">
 *
 * @param {Observable<any>} closingNotifier an Observable that signals the
 * buffer to be emitted} from the returned observable.
 * @returns {Observable<T[]>} an Observable of buffers, which are arrays of
 * values.
 */
export declare function buffer<T>(closingNotifier: Observable<any>): Observable<T[]>;
export interface BufferSignature<T> {
    (closingNotifier: Observable<any>): Observable<T[]>;
}
