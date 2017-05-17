import { provide } from 'angular2/core';
import { Http, Jsonp } from './src/http/http';
import { XHRBackend } from './src/http/backends/xhr_backend';
import { JSONPBackend, JSONPBackend_ } from './src/http/backends/jsonp_backend';
import { BrowserXhr } from './src/http/backends/browser_xhr';
import { BrowserJsonp } from './src/http/backends/browser_jsonp';
import { BaseRequestOptions, RequestOptions } from './src/http/base_request_options';
import { BaseResponseOptions, ResponseOptions } from './src/http/base_response_options';
export { Request } from './src/http/static_request';
export { Response } from './src/http/static_response';
export { Connection, ConnectionBackend } from './src/http/interfaces';
export { BrowserXhr } from './src/http/backends/browser_xhr';
export { BaseRequestOptions, RequestOptions } from './src/http/base_request_options';
export { BaseResponseOptions, ResponseOptions } from './src/http/base_response_options';
export { XHRBackend, XHRConnection } from './src/http/backends/xhr_backend';
export { JSONPBackend, JSONPConnection } from './src/http/backends/jsonp_backend';
export { Http, Jsonp } from './src/http/http';
export { Headers } from './src/http/headers';
export { ResponseType, ReadyState, RequestMethod } from './src/http/enums';
export { URLSearchParams } from './src/http/url_search_params';
/**
 * Provides a basic set of injectables to use the {@link Http} service in any application.
 *
 * The `HTTP_PROVIDERS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/snj7Nv?p=preview))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {NgFor} from 'angular2/common';
 * import {HTTP_PROVIDERS, Http} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [HTTP_PROVIDERS],
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ngFor="#person of people">
 *           {{person.name}}
 *         </li>
 *       </ul>
 *     </div>
 *   `,
 *   directives: [NgFor]
 * })
 * export class App {
 *   people: Object[];
 *   constructor(http:Http) {
 *     http.get('people.json').subscribe(res => {
 *       this.people = res.json();
 *     });
 *   }
 *   active:boolean = false;
 *   toggleActiveState() {
 *     this.active = !this.active;
 *   }
 * }
 *
 * bootstrap(App)
 *   .catch(err => console.error(err));
 * ```
 *
 * The primary public API included in `HTTP_PROVIDERS` is the {@link Http} class.
 * However, other providers required by `Http` are included,
 * which may be beneficial to override in certain cases.
 *
 * The providers included in `HTTP_PROVIDERS` include:
 *  * {@link Http}
 *  * {@link XHRBackend}
 *  * `BrowserXHR` - Private factory to create `XMLHttpRequest` instances
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new provider for {@link RequestOptions} should
 * be added in the same injector as `HTTP_PROVIDERS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/aCMEXi?p=preview))
 *
 * ```
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {HTTP_PROVIDERS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [HTTP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link XHRBackend}
 * provider should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7LWALD?p=preview))
 *
 * ```
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {HTTP_PROVIDERS, Http, Response, XHRBackend} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 *
 * var injector = Injector.resolveAndCreate([
 *   HTTP_PROVIDERS,
 *   MockBackend,
 *   provide(XHRBackend, {useExisting: MockBackend})
 * ]);
 * var http = injector.get(Http);
 * var backend = injector.get(MockBackend);
 *
 * // Listen for any new requests
 * backend.connections.observer({
 *   next: connection => {
 *     var response = new Response({body: people});
 *     setTimeout(() => {
 *       // Send a response to the request
 *       connection.mockRespond(response);
 *     });
 *   }
 * });
 *
 * http.get('people.json').observer({
 *   next: res => {
 *     // Response came from mock backend
 *     console.log('first person', res.json()[0].name);
 *   }
 * });
 * ```
 */
export const HTTP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    provide(Http, {
        useFactory: (xhrBackend, requestOptions) => new Http(xhrBackend, requestOptions),
        deps: [XHRBackend, RequestOptions]
    }),
    BrowserXhr,
    provide(RequestOptions, { useClass: BaseRequestOptions }),
    provide(ResponseOptions, { useClass: BaseResponseOptions }),
    XHRBackend
];
/**
 * See {@link HTTP_PROVIDERS} instead.
 *
 * @deprecated
 */
export const HTTP_BINDINGS = HTTP_PROVIDERS;
/**
 * Provides a basic set of providers to use the {@link Jsonp} service in any application.
 *
 * The `JSONP_PROVIDERS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/vmeN4F?p=preview))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {NgFor} from 'angular2/common';
 * import {JSONP_PROVIDERS, Jsonp} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [JSONP_PROVIDERS],
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ngFor="#person of people">
 *           {{person.name}}
 *         </li>
 *       </ul>
 *     </div>
 *   `,
 *   directives: [NgFor]
 * })
 * export class App {
 *   people: Array<Object>;
 *   constructor(jsonp:Jsonp) {
 *     jsonp.request('people.json').subscribe(res => {
 *       this.people = res.json();
 *     })
 *   }
 * }
 * ```
 *
 * The primary public API included in `JSONP_PROVIDERS` is the {@link Jsonp} class.
 * However, other providers required by `Jsonp` are included,
 * which may be beneficial to override in certain cases.
 *
 * The providers included in `JSONP_PROVIDERS` include:
 *  * {@link Jsonp}
 *  * {@link JSONPBackend}
 *  * `BrowserJsonp` - Private factory
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new provider for {@link RequestOptions} should
 * be added in the same injector as `JSONP_PROVIDERS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/TFug7x?p=preview))
 *
 * ```
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {JSONP_PROVIDERS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [JSONP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link JSONPBackend}
 * provider should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/HDqZWL?p=preview))
 *
 * ```
 * import {provide, Injector} from 'angular2/core';
 * import {JSONP_PROVIDERS, Jsonp, Response, JSONPBackend} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 * var injector = Injector.resolveAndCreate([
 *   JSONP_PROVIDERS,
 *   MockBackend,
 *   provide(JSONPBackend, {useExisting: MockBackend})
 * ]);
 * var jsonp = injector.get(Jsonp);
 * var backend = injector.get(MockBackend);
 *
 * // Listen for any new requests
 * backend.connections.observer({
 *   next: connection => {
 *     var response = new Response({body: people});
 *     setTimeout(() => {
 *       // Send a response to the request
 *       connection.mockRespond(response);
 *     });
 *   }
 * });

 * jsonp.get('people.json').observer({
 *   next: res => {
 *     // Response came from mock backend
 *     console.log('first person', res.json()[0].name);
 *   }
 * });
 * ```
 */
export const JSONP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    provide(Jsonp, {
        useFactory: (jsonpBackend, requestOptions) => new Jsonp(jsonpBackend, requestOptions),
        deps: [JSONPBackend, RequestOptions]
    }),
    BrowserJsonp,
    provide(RequestOptions, { useClass: BaseRequestOptions }),
    provide(ResponseOptions, { useClass: BaseResponseOptions }),
    provide(JSONPBackend, { useClass: JSONPBackend_ })
];
/**
 * See {@link JSONP_PROVIDERS} instead.
 *
 * @deprecated
 */
export const JSON_BINDINGS = JSONP_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2h0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BTU8sRUFBQyxPQUFPLEVBQVcsTUFBTSxlQUFlO09BQ3hDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxNQUFNLGlCQUFpQjtPQUNwQyxFQUFDLFVBQVUsRUFBZ0IsTUFBTSxpQ0FBaUM7T0FDbEUsRUFBQyxZQUFZLEVBQUUsYUFBYSxFQUFrQixNQUFNLG1DQUFtQztPQUN2RixFQUFDLFVBQVUsRUFBQyxNQUFNLGlDQUFpQztPQUNuRCxFQUFDLFlBQVksRUFBQyxNQUFNLG1DQUFtQztPQUN2RCxFQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBQyxNQUFNLGlDQUFpQztPQUUzRSxFQUFDLG1CQUFtQixFQUFFLGVBQWUsRUFBQyxNQUFNLGtDQUFrQztBQUNyRixTQUFRLE9BQU8sUUFBTywyQkFBMkIsQ0FBQztBQUNsRCxTQUFRLFFBQVEsUUFBTyw0QkFBNEIsQ0FBQztBQUVwRCxTQUdFLFVBQVUsRUFDVixpQkFBaUIsUUFDWix1QkFBdUIsQ0FBQztBQUUvQixTQUFRLFVBQVUsUUFBTyxpQ0FBaUMsQ0FBQztBQUMzRCxTQUFRLGtCQUFrQixFQUFFLGNBQWMsUUFBTyxpQ0FBaUMsQ0FBQztBQUNuRixTQUFRLG1CQUFtQixFQUFFLGVBQWUsUUFBTyxrQ0FBa0MsQ0FBQztBQUN0RixTQUFRLFVBQVUsRUFBRSxhQUFhLFFBQU8saUNBQWlDLENBQUM7QUFDMUUsU0FBUSxZQUFZLEVBQUUsZUFBZSxRQUFPLG1DQUFtQyxDQUFDO0FBQ2hGLFNBQVEsSUFBSSxFQUFFLEtBQUssUUFBTyxpQkFBaUIsQ0FBQztBQUU1QyxTQUFRLE9BQU8sUUFBTyxvQkFBb0IsQ0FBQztBQUUzQyxTQUFRLFlBQVksRUFBRSxVQUFVLEVBQUUsYUFBYSxRQUFPLGtCQUFrQixDQUFDO0FBQ3pFLFNBQVEsZUFBZSxRQUFPLDhCQUE4QixDQUFDO0FBRTdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9IRztBQUNILGFBQWEsY0FBYyxHQUFVO0lBQ25DLGtFQUFrRTtJQUNsRSx3REFBd0Q7SUFDeEQsT0FBTyxDQUFDLElBQUksRUFDSjtRQUNFLFVBQVUsRUFBRSxDQUFDLFVBQXNCLEVBQUUsY0FBOEIsS0FDbkQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQztRQUNwRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDO0tBQ25DLENBQUM7SUFDVixVQUFVO0lBQ1YsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFDLFFBQVEsRUFBRSxrQkFBa0IsRUFBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztJQUN6RCxVQUFVO0NBQ1gsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxhQUFhLGFBQWEsR0FBRyxjQUFjLENBQUM7QUFFNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwR0c7QUFDSCxhQUFhLGVBQWUsR0FBVTtJQUNwQyxrRUFBa0U7SUFDbEUsd0RBQXdEO0lBQ3hELE9BQU8sQ0FBQyxLQUFLLEVBQ0w7UUFDRSxVQUFVLEVBQUUsQ0FBQyxZQUEwQixFQUFFLGNBQThCLEtBQ3ZELElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUM7UUFDdkQsSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQztLQUNyQyxDQUFDO0lBQ1YsWUFBWTtJQUNaLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFDLENBQUM7SUFDekQsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQztDQUNqRCxDQUFDO0FBRUY7Ozs7R0FJRztBQUNILGFBQWEsYUFBYSxHQUFHLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgaHR0cCBtb2R1bGUgcHJvdmlkZXMgc2VydmljZXMgdG8gcGVyZm9ybSBodHRwIHJlcXVlc3RzLiBUbyBnZXQgc3RhcnRlZCwgc2VlIHRoZSB7QGxpbmsgSHR0cH1cbiAqIGNsYXNzLlxuICovXG5pbXBvcnQge3Byb3ZpZGUsIFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SHR0cCwgSnNvbnB9IGZyb20gJy4vc3JjL2h0dHAvaHR0cCc7XG5pbXBvcnQge1hIUkJhY2tlbmQsIFhIUkNvbm5lY3Rpb259IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMveGhyX2JhY2tlbmQnO1xuaW1wb3J0IHtKU09OUEJhY2tlbmQsIEpTT05QQmFja2VuZF8sIEpTT05QQ29ubmVjdGlvbn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9qc29ucF9iYWNrZW5kJztcbmltcG9ydCB7QnJvd3Nlclhocn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9icm93c2VyX3hocic7XG5pbXBvcnQge0Jyb3dzZXJKc29ucH0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9icm93c2VyX2pzb25wJztcbmltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnLi9zcmMvaHR0cC9iYXNlX3JlcXVlc3Rfb3B0aW9ucyc7XG5pbXBvcnQge0Nvbm5lY3Rpb25CYWNrZW5kfSBmcm9tICcuL3NyYy9odHRwL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtCYXNlUmVzcG9uc2VPcHRpb25zLCBSZXNwb25zZU9wdGlvbnN9IGZyb20gJy4vc3JjL2h0dHAvYmFzZV9yZXNwb25zZV9vcHRpb25zJztcbmV4cG9ydCB7UmVxdWVzdH0gZnJvbSAnLi9zcmMvaHR0cC9zdGF0aWNfcmVxdWVzdCc7XG5leHBvcnQge1Jlc3BvbnNlfSBmcm9tICcuL3NyYy9odHRwL3N0YXRpY19yZXNwb25zZSc7XG5cbmV4cG9ydCB7XG4gIFJlcXVlc3RPcHRpb25zQXJncyxcbiAgUmVzcG9uc2VPcHRpb25zQXJncyxcbiAgQ29ubmVjdGlvbixcbiAgQ29ubmVjdGlvbkJhY2tlbmRcbn0gZnJvbSAnLi9zcmMvaHR0cC9pbnRlcmZhY2VzJztcblxuZXhwb3J0IHtCcm93c2VyWGhyfSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfeGhyJztcbmV4cG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnLi9zcmMvaHR0cC9iYXNlX3JlcXVlc3Rfb3B0aW9ucyc7XG5leHBvcnQge0Jhc2VSZXNwb25zZU9wdGlvbnMsIFJlc3BvbnNlT3B0aW9uc30gZnJvbSAnLi9zcmMvaHR0cC9iYXNlX3Jlc3BvbnNlX29wdGlvbnMnO1xuZXhwb3J0IHtYSFJCYWNrZW5kLCBYSFJDb25uZWN0aW9ufSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL3hocl9iYWNrZW5kJztcbmV4cG9ydCB7SlNPTlBCYWNrZW5kLCBKU09OUENvbm5lY3Rpb259IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvanNvbnBfYmFja2VuZCc7XG5leHBvcnQge0h0dHAsIEpzb25wfSBmcm9tICcuL3NyYy9odHRwL2h0dHAnO1xuXG5leHBvcnQge0hlYWRlcnN9IGZyb20gJy4vc3JjL2h0dHAvaGVhZGVycyc7XG5cbmV4cG9ydCB7UmVzcG9uc2VUeXBlLCBSZWFkeVN0YXRlLCBSZXF1ZXN0TWV0aG9kfSBmcm9tICcuL3NyYy9odHRwL2VudW1zJztcbmV4cG9ydCB7VVJMU2VhcmNoUGFyYW1zfSBmcm9tICcuL3NyYy9odHRwL3VybF9zZWFyY2hfcGFyYW1zJztcblxuLyoqXG4gKiBQcm92aWRlcyBhIGJhc2ljIHNldCBvZiBpbmplY3RhYmxlcyB0byB1c2UgdGhlIHtAbGluayBIdHRwfSBzZXJ2aWNlIGluIGFueSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGUgYEhUVFBfUFJPVklERVJTYCBzaG91bGQgYmUgaW5jbHVkZWQgZWl0aGVyIGluIGEgY29tcG9uZW50J3MgaW5qZWN0b3IsXG4gKiBvciBpbiB0aGUgcm9vdCBpbmplY3RvciB3aGVuIGJvb3RzdHJhcHBpbmcgYW4gYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3NuajdOdj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtOZ0Zvcn0gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqIGltcG9ydCB7SFRUUF9QUk9WSURFUlMsIEh0dHB9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHByb3ZpZGVyczogW0hUVFBfUFJPVklERVJTXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGgxPlBlb3BsZTwvaDE+XG4gKiAgICAgICA8dWw+XG4gKiAgICAgICAgIDxsaSAqbmdGb3I9XCIjcGVyc29uIG9mIHBlb3BsZVwiPlxuICogICAgICAgICAgIHt7cGVyc29uLm5hbWV9fVxuICogICAgICAgICA8L2xpPlxuICogICAgICAgPC91bD5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nRm9yXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBwZW9wbGU6IE9iamVjdFtdO1xuICogICBjb25zdHJ1Y3RvcihodHRwOkh0dHApIHtcbiAqICAgICBodHRwLmdldCgncGVvcGxlLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IHtcbiAqICAgICAgIHRoaXMucGVvcGxlID0gcmVzLmpzb24oKTtcbiAqICAgICB9KTtcbiAqICAgfVxuICogICBhY3RpdmU6Ym9vbGVhbiA9IGZhbHNlO1xuICogICB0b2dnbGVBY3RpdmVTdGF0ZSgpIHtcbiAqICAgICB0aGlzLmFjdGl2ZSA9ICF0aGlzLmFjdGl2ZTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApXG4gKiAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICpcbiAqIFRoZSBwcmltYXJ5IHB1YmxpYyBBUEkgaW5jbHVkZWQgaW4gYEhUVFBfUFJPVklERVJTYCBpcyB0aGUge0BsaW5rIEh0dHB9IGNsYXNzLlxuICogSG93ZXZlciwgb3RoZXIgcHJvdmlkZXJzIHJlcXVpcmVkIGJ5IGBIdHRwYCBhcmUgaW5jbHVkZWQsXG4gKiB3aGljaCBtYXkgYmUgYmVuZWZpY2lhbCB0byBvdmVycmlkZSBpbiBjZXJ0YWluIGNhc2VzLlxuICpcbiAqIFRoZSBwcm92aWRlcnMgaW5jbHVkZWQgaW4gYEhUVFBfUFJPVklERVJTYCBpbmNsdWRlOlxuICogICoge0BsaW5rIEh0dHB9XG4gKiAgKiB7QGxpbmsgWEhSQmFja2VuZH1cbiAqICAqIGBCcm93c2VyWEhSYCAtIFByaXZhdGUgZmFjdG9yeSB0byBjcmVhdGUgYFhNTEh0dHBSZXF1ZXN0YCBpbnN0YW5jZXNcbiAqICAqIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfSBjbGFzc1xuICogICoge0BsaW5rIFJlc3BvbnNlT3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlc3BvbnNlT3B0aW9uc30gY2xhc3NcbiAqXG4gKiBUaGVyZSBtYXkgYmUgY2FzZXMgd2hlcmUgaXQgbWFrZXMgc2Vuc2UgdG8gZXh0ZW5kIHRoZSBiYXNlIHJlcXVlc3Qgb3B0aW9ucyxcbiAqIHN1Y2ggYXMgdG8gYWRkIGEgc2VhcmNoIHN0cmluZyB0byBiZSBhcHBlbmRlZCB0byBhbGwgVVJMcy5cbiAqIFRvIGFjY29tcGxpc2ggdGhpcywgYSBuZXcgcHJvdmlkZXIgZm9yIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gc2hvdWxkXG4gKiBiZSBhZGRlZCBpbiB0aGUgc2FtZSBpbmplY3RvciBhcyBgSFRUUF9QUk9WSURFUlNgLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9hQ01FWGk/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge0hUVFBfUFJPVklERVJTLCBCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RPcHRpb25zfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiBjbGFzcyBNeU9wdGlvbnMgZXh0ZW5kcyBCYXNlUmVxdWVzdE9wdGlvbnMge1xuICogICBzZWFyY2g6IHN0cmluZyA9ICdjb3JlVGVhbT10cnVlJztcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwLCBbSFRUUF9QUk9WSURFUlMsIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogTXlPcHRpb25zfSldKVxuICogICAuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gKiBgYGBcbiAqXG4gKiBMaWtld2lzZSwgdG8gdXNlIGEgbW9jayBiYWNrZW5kIGZvciB1bml0IHRlc3RzLCB0aGUge0BsaW5rIFhIUkJhY2tlbmR9XG4gKiBwcm92aWRlciBzaG91bGQgYmUgYm91bmQgdG8ge0BsaW5rIE1vY2tCYWNrZW5kfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvN0xXQUxEP3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge3Byb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgSHR0cCwgUmVzcG9uc2UsIFhIUkJhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICogaW1wb3J0IHtNb2NrQmFja2VuZH0gZnJvbSAnYW5ndWxhcjIvaHR0cC90ZXN0aW5nJztcbiAqXG4gKiB2YXIgcGVvcGxlID0gW3tuYW1lOiAnSmVmZid9LCB7bmFtZTogJ1RvYmlhcyd9XTtcbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgSFRUUF9QUk9WSURFUlMsXG4gKiAgIE1vY2tCYWNrZW5kLFxuICogICBwcm92aWRlKFhIUkJhY2tlbmQsIHt1c2VFeGlzdGluZzogTW9ja0JhY2tlbmR9KVxuICogXSk7XG4gKiB2YXIgaHR0cCA9IGluamVjdG9yLmdldChIdHRwKTtcbiAqIHZhciBiYWNrZW5kID0gaW5qZWN0b3IuZ2V0KE1vY2tCYWNrZW5kKTtcbiAqXG4gKiAvLyBMaXN0ZW4gZm9yIGFueSBuZXcgcmVxdWVzdHNcbiAqIGJhY2tlbmQuY29ubmVjdGlvbnMub2JzZXJ2ZXIoe1xuICogICBuZXh0OiBjb25uZWN0aW9uID0+IHtcbiAqICAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2Uoe2JvZHk6IHBlb3BsZX0pO1xuICogICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICogICAgICAgLy8gU2VuZCBhIHJlc3BvbnNlIHRvIHRoZSByZXF1ZXN0XG4gKiAgICAgICBjb25uZWN0aW9uLm1vY2tSZXNwb25kKHJlc3BvbnNlKTtcbiAqICAgICB9KTtcbiAqICAgfVxuICogfSk7XG4gKlxuICogaHR0cC5nZXQoJ3Blb3BsZS5qc29uJykub2JzZXJ2ZXIoe1xuICogICBuZXh0OiByZXMgPT4ge1xuICogICAgIC8vIFJlc3BvbnNlIGNhbWUgZnJvbSBtb2NrIGJhY2tlbmRcbiAqICAgICBjb25zb2xlLmxvZygnZmlyc3QgcGVyc29uJywgcmVzLmpzb24oKVswXS5uYW1lKTtcbiAqICAgfVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfUFJPVklERVJTOiBhbnlbXSA9IFtcbiAgLy8gVE9ETyhwYXNjYWwpOiB1c2UgZmFjdG9yeSB0eXBlIGFubm90YXRpb25zIG9uY2Ugc3VwcG9ydGVkIGluIERJXG4gIC8vIGlzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zMTgzXG4gIHByb3ZpZGUoSHR0cCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1c2VGYWN0b3J5OiAoeGhyQmFja2VuZDogWEhSQmFja2VuZCwgcmVxdWVzdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBIdHRwKHhockJhY2tlbmQsIHJlcXVlc3RPcHRpb25zKSxcbiAgICAgICAgICAgIGRlcHM6IFtYSFJCYWNrZW5kLCBSZXF1ZXN0T3B0aW9uc11cbiAgICAgICAgICB9KSxcbiAgQnJvd3NlclhocixcbiAgcHJvdmlkZShSZXF1ZXN0T3B0aW9ucywge3VzZUNsYXNzOiBCYXNlUmVxdWVzdE9wdGlvbnN9KSxcbiAgcHJvdmlkZShSZXNwb25zZU9wdGlvbnMsIHt1c2VDbGFzczogQmFzZVJlc3BvbnNlT3B0aW9uc30pLFxuICBYSFJCYWNrZW5kXG5dO1xuXG4vKipcbiAqIFNlZSB7QGxpbmsgSFRUUF9QUk9WSURFUlN9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfQklORElOR1MgPSBIVFRQX1BST1ZJREVSUztcblxuLyoqXG4gKiBQcm92aWRlcyBhIGJhc2ljIHNldCBvZiBwcm92aWRlcnMgdG8gdXNlIHRoZSB7QGxpbmsgSnNvbnB9IHNlcnZpY2UgaW4gYW55IGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBgSlNPTlBfUFJPVklERVJTYCBzaG91bGQgYmUgaW5jbHVkZWQgZWl0aGVyIGluIGEgY29tcG9uZW50J3MgaW5qZWN0b3IsXG4gKiBvciBpbiB0aGUgcm9vdCBpbmplY3RvciB3aGVuIGJvb3RzdHJhcHBpbmcgYW4gYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3ZtZU40Rj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtOZ0Zvcn0gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqIGltcG9ydCB7SlNPTlBfUFJPVklERVJTLCBKc29ucH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgcHJvdmlkZXJzOiBbSlNPTlBfUFJPVklERVJTXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGgxPlBlb3BsZTwvaDE+XG4gKiAgICAgICA8dWw+XG4gKiAgICAgICAgIDxsaSAqbmdGb3I9XCIjcGVyc29uIG9mIHBlb3BsZVwiPlxuICogICAgICAgICAgIHt7cGVyc29uLm5hbWV9fVxuICogICAgICAgICA8L2xpPlxuICogICAgICAgPC91bD5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nRm9yXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBwZW9wbGU6IEFycmF5PE9iamVjdD47XG4gKiAgIGNvbnN0cnVjdG9yKGpzb25wOkpzb25wKSB7XG4gKiAgICAganNvbnAucmVxdWVzdCgncGVvcGxlLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IHtcbiAqICAgICAgIHRoaXMucGVvcGxlID0gcmVzLmpzb24oKTtcbiAqICAgICB9KVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJpbWFyeSBwdWJsaWMgQVBJIGluY2x1ZGVkIGluIGBKU09OUF9QUk9WSURFUlNgIGlzIHRoZSB7QGxpbmsgSnNvbnB9IGNsYXNzLlxuICogSG93ZXZlciwgb3RoZXIgcHJvdmlkZXJzIHJlcXVpcmVkIGJ5IGBKc29ucGAgYXJlIGluY2x1ZGVkLFxuICogd2hpY2ggbWF5IGJlIGJlbmVmaWNpYWwgdG8gb3ZlcnJpZGUgaW4gY2VydGFpbiBjYXNlcy5cbiAqXG4gKiBUaGUgcHJvdmlkZXJzIGluY2x1ZGVkIGluIGBKU09OUF9QUk9WSURFUlNgIGluY2x1ZGU6XG4gKiAgKiB7QGxpbmsgSnNvbnB9XG4gKiAgKiB7QGxpbmsgSlNPTlBCYWNrZW5kfVxuICogICogYEJyb3dzZXJKc29ucGAgLSBQcml2YXRlIGZhY3RvcnlcbiAqICAqIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfSBjbGFzc1xuICogICoge0BsaW5rIFJlc3BvbnNlT3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlc3BvbnNlT3B0aW9uc30gY2xhc3NcbiAqXG4gKiBUaGVyZSBtYXkgYmUgY2FzZXMgd2hlcmUgaXQgbWFrZXMgc2Vuc2UgdG8gZXh0ZW5kIHRoZSBiYXNlIHJlcXVlc3Qgb3B0aW9ucyxcbiAqIHN1Y2ggYXMgdG8gYWRkIGEgc2VhcmNoIHN0cmluZyB0byBiZSBhcHBlbmRlZCB0byBhbGwgVVJMcy5cbiAqIFRvIGFjY29tcGxpc2ggdGhpcywgYSBuZXcgcHJvdmlkZXIgZm9yIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gc2hvdWxkXG4gKiBiZSBhZGRlZCBpbiB0aGUgc2FtZSBpbmplY3RvciBhcyBgSlNPTlBfUFJPVklERVJTYC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVEZ1Zzd4P3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge3Byb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtKU09OUF9QUk9WSURFUlMsIEJhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIGNsYXNzIE15T3B0aW9ucyBleHRlbmRzIEJhc2VSZXF1ZXN0T3B0aW9ucyB7XG4gKiAgIHNlYXJjaDogc3RyaW5nID0gJ2NvcmVUZWFtPXRydWUnO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHAsIFtKU09OUF9QUk9WSURFUlMsIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogTXlPcHRpb25zfSldKVxuICogICAuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gKiBgYGBcbiAqXG4gKiBMaWtld2lzZSwgdG8gdXNlIGEgbW9jayBiYWNrZW5kIGZvciB1bml0IHRlc3RzLCB0aGUge0BsaW5rIEpTT05QQmFja2VuZH1cbiAqIHByb3ZpZGVyIHNob3VsZCBiZSBib3VuZCB0byB7QGxpbmsgTW9ja0JhY2tlbmR9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9IRHFaV0w/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZSwgSW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtKU09OUF9QUk9WSURFUlMsIEpzb25wLCBSZXNwb25zZSwgSlNPTlBCYWNrZW5kfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAvdGVzdGluZyc7XG4gKlxuICogdmFyIHBlb3BsZSA9IFt7bmFtZTogJ0plZmYnfSwge25hbWU6ICdUb2JpYXMnfV07XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgSlNPTlBfUFJPVklERVJTLFxuICogICBNb2NrQmFja2VuZCxcbiAqICAgcHJvdmlkZShKU09OUEJhY2tlbmQsIHt1c2VFeGlzdGluZzogTW9ja0JhY2tlbmR9KVxuICogXSk7XG4gKiB2YXIganNvbnAgPSBpbmplY3Rvci5nZXQoSnNvbnApO1xuICogdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICpcbiAqIC8vIExpc3RlbiBmb3IgYW55IG5ldyByZXF1ZXN0c1xuICogYmFja2VuZC5jb25uZWN0aW9ucy5vYnNlcnZlcih7XG4gKiAgIG5leHQ6IGNvbm5lY3Rpb24gPT4ge1xuICogICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh7Ym9keTogcGVvcGxlfSk7XG4gKiAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAvLyBTZW5kIGEgcmVzcG9uc2UgdG8gdGhlIHJlcXVlc3RcbiAqICAgICAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQocmVzcG9uc2UpO1xuICogICAgIH0pO1xuICogICB9XG4gKiB9KTtcblxuICoganNvbnAuZ2V0KCdwZW9wbGUuanNvbicpLm9ic2VydmVyKHtcbiAqICAgbmV4dDogcmVzID0+IHtcbiAqICAgICAvLyBSZXNwb25zZSBjYW1lIGZyb20gbW9jayBiYWNrZW5kXG4gKiAgICAgY29uc29sZS5sb2coJ2ZpcnN0IHBlcnNvbicsIHJlcy5qc29uKClbMF0ubmFtZSk7XG4gKiAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBKU09OUF9QUk9WSURFUlM6IGFueVtdID0gW1xuICAvLyBUT0RPKHBhc2NhbCk6IHVzZSBmYWN0b3J5IHR5cGUgYW5ub3RhdGlvbnMgb25jZSBzdXBwb3J0ZWQgaW4gRElcbiAgLy8gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMxODNcbiAgcHJvdmlkZShKc29ucCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1c2VGYWN0b3J5OiAoanNvbnBCYWNrZW5kOiBKU09OUEJhY2tlbmQsIHJlcXVlc3RPcHRpb25zOiBSZXF1ZXN0T3B0aW9ucykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSnNvbnAoanNvbnBCYWNrZW5kLCByZXF1ZXN0T3B0aW9ucyksXG4gICAgICAgICAgICBkZXBzOiBbSlNPTlBCYWNrZW5kLCBSZXF1ZXN0T3B0aW9uc11cbiAgICAgICAgICB9KSxcbiAgQnJvd3Nlckpzb25wLFxuICBwcm92aWRlKFJlcXVlc3RPcHRpb25zLCB7dXNlQ2xhc3M6IEJhc2VSZXF1ZXN0T3B0aW9uc30pLFxuICBwcm92aWRlKFJlc3BvbnNlT3B0aW9ucywge3VzZUNsYXNzOiBCYXNlUmVzcG9uc2VPcHRpb25zfSksXG4gIHByb3ZpZGUoSlNPTlBCYWNrZW5kLCB7dXNlQ2xhc3M6IEpTT05QQmFja2VuZF99KVxuXTtcblxuLyoqXG4gKiBTZWUge0BsaW5rIEpTT05QX1BST1ZJREVSU30gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgY29uc3QgSlNPTl9CSU5ESU5HUyA9IEpTT05QX1BST1ZJREVSUztcbiJdfQ==