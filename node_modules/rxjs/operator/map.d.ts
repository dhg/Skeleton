import { Observable } from '../Observable';
/**
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the returned observable
 *
 * <img src="./img/map.png" width="100%">
 *
 * @param {Function} project the function to create projection
 * @param {any} [thisArg] an optional argument to define what `this` is in the project function
 * @returns {Observable} a observable of projected values
 */
export declare function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): Observable<R>;
