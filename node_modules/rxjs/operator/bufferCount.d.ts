import { Observable } from '../Observable';
/**
 * Buffers a number of values from the source observable by `bufferSize` then
 * emits the buffer and clears it, and starts a new buffer each
 * `startBufferEvery` values. If `startBufferEvery` is not provided or is
 * `null`, then new buffers are started immediately at the start of the source
 * and when each buffer closes and is emitted.
 *
 * <img src="./img/bufferCount.png" width="100%">
 *
 * @param {number} bufferSize the maximum size of the buffer emitted.
 * @param {number} [startBufferEvery] optional interval at which to start a new
 * buffer. (e.g. if `startBufferEvery` is `2`, then a new buffer will be started
 * on every other value from the source.) A new buffer is started at the
 * beginning of the source by default.
 * @returns {Observable<T[]>} an Observable of arrays of buffered values.
 */
export declare function bufferCount<T>(bufferSize: number, startBufferEvery?: number): Observable<T[]>;
export interface BufferCountSignature<T> {
    (bufferSize: number, startBufferEvery?: number): Observable<T[]>;
}
