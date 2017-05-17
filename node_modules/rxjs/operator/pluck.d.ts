import { Observable } from '../Observable';
/**
 * Retrieves the value of a specified nested property from all elements in
 * the Observable sequence. If a property can't be resolved, it will return
 * `undefined` for that value.
 *
 * @param {...args} properties the nested properties to pluck
 * @returns {Observable} Returns a new Observable sequence of property values
 */
export declare function pluck(...properties: string[]): Observable<any>;
