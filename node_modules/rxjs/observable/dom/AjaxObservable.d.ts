import { Observable } from '../../Observable';
import { Subscriber } from '../../Subscriber';
import { Subscription } from '../../Subscription';
export interface AjaxRequest {
    url?: string;
    body?: any;
    user?: string;
    async?: boolean;
    method: string;
    headers?: Object;
    timeout?: number;
    password?: string;
    hasContent?: boolean;
    crossDomain?: boolean;
    createXHR?: () => XMLHttpRequest;
    progressSubscriber?: Subscriber<any>;
    resultSelector?: <T>(response: AjaxResponse) => T;
    responseType?: string;
}
export interface AjaxCreationMethod {
    (): <T>(urlOrRequest: string | AjaxRequest) => Observable<T>;
    get: <T>(url: string, resultSelector?: (response: AjaxResponse) => T, headers?: Object) => Observable<T>;
    post: <T>(url: string, body?: any, headers?: Object) => Observable<T>;
    put: <T>(url: string, body?: any, headers?: Object) => Observable<T>;
    delete: <T>(url: string, headers?: Object) => Observable<T>;
    getJSON: <T, R>(url: string, resultSelector?: (data: T) => R, headers?: Object) => Observable<R>;
}
export declare function ajaxGet<T>(url: string, resultSelector?: (response: AjaxResponse) => T, headers?: Object): AjaxObservable<T>;
export declare function ajaxPost<T>(url: string, body?: any, headers?: Object): Observable<T>;
export declare function ajaxDelete<T>(url: string, headers?: Object): Observable<T>;
export declare function ajaxPut<T>(url: string, body?: any, headers?: Object): Observable<T>;
export declare function ajaxGetJSON<T, R>(url: string, resultSelector?: (data: T) => R, headers?: Object): Observable<R>;
/**
 * Creates an observable for an Ajax request with either a request object with url, headers, etc or a string for a URL.
 *
 * @example
 *   source = Rx.Observable.ajax('/products');
 *   source = Rx.Observable.ajax( url: 'products', method: 'GET' });
 *
 * @param {Object} request Can be one of the following:
 *
 *  A string of the URL to make the Ajax call.
 *  An object with the following properties
 *   - url: URL of the request
 *   - body: The body of the request
 *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
 *   - async: Whether the request is async
 *   - headers: Optional headers
 *   - crossDomain: true if a cross domain request, else false
 *   - createXHR: a function to override if you need to use an alternate XMLHttpRequest implementation.
 *   - resultSelector: a function to use to alter the output value type of the Observable. Gets {AjaxResponse} as an argument
 * @returns {Observable} An observable sequence containing the XMLHttpRequest.
*/
export declare class AjaxObservable<T> extends Observable<T> {
    static create: AjaxCreationMethod;
    private request;
    constructor(urlOrRequest: string | AjaxRequest);
    protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void;
}
export declare class AjaxSubscriber<T> extends Subscriber<Event> {
    request: AjaxRequest;
    private xhr;
    private resultSelector;
    private done;
    constructor(destination: Subscriber<T>, request: AjaxRequest);
    next(e: Event): void;
    private send();
    private serializeBody(body, contentType);
    private setHeaders(xhr, headers);
    private setupEvents(xhr, request);
    unsubscribe(): void;
}
/** A normalized AJAX response */
export declare class AjaxResponse {
    originalEvent: Event;
    xhr: XMLHttpRequest;
    request: AjaxRequest;
    /** {number} the HTTP status code */
    status: number;
    /** {string|ArrayBuffer|Document|object|any} the response data */
    response: any;
    /** {string} the raw responseText */
    responseText: string;
    /** {string} the responsType (e.g. 'json', 'arraybuffer', or 'xml') */
    responseType: string;
    constructor(originalEvent: Event, xhr: XMLHttpRequest, request: AjaxRequest);
}
/** A normalized AJAX error */
export declare class AjaxError extends Error {
    /** {XMLHttpRequest} the XHR instance associated with the error */
    xhr: XMLHttpRequest;
    /** {AjaxRequest} the AjaxRequest associated with the error */
    request: AjaxRequest;
    /** {number} the HTTP status code */
    status: number;
    constructor(message: string, xhr: XMLHttpRequest, request: AjaxRequest);
}
export declare class AjaxTimeoutError extends AjaxError {
    constructor(xhr: XMLHttpRequest, request: AjaxRequest);
}
