import { ROUTER_PROVIDERS_COMMON } from './router_providers_common';
import { Provider } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { BrowserPlatformLocation } from './location/browser_platform_location';
import { PlatformLocation } from './location/platform_location';
/**
 * A list of {@link Provider}s. To use the router, you must add this to your application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
export const ROUTER_PROVIDERS = CONST_EXPR([
    ROUTER_PROVIDERS_COMMON,
    CONST_EXPR(new Provider(PlatformLocation, { useClass: BrowserPlatformLocation })),
]);
/**
 * Use {@link ROUTER_PROVIDERS} instead.
 *
 * @deprecated
 */
export const ROUTER_BINDINGS = ROUTER_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Byb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX3Byb3ZpZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sMkJBQTJCO09BQzFELEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUMvQixFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sc0NBQXNDO09BQ3JFLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEI7QUFFN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsYUFBYSxnQkFBZ0IsR0FBVSxVQUFVLENBQUM7SUFDaEQsdUJBQXVCO0lBQ3ZCLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLFFBQVEsRUFBRSx1QkFBdUIsRUFBQyxDQUFDLENBQUM7Q0FDaEYsQ0FBQyxDQUFDO0FBRUg7Ozs7R0FJRztBQUNILGFBQWEsZUFBZSxHQUFHLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtST1VURVJfUFJPVklERVJTX0NPTU1PTn0gZnJvbSAnLi9yb3V0ZXJfcHJvdmlkZXJzX2NvbW1vbic7XG5pbXBvcnQge1Byb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QnJvd3NlclBsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vbG9jYXRpb24vYnJvd3Nlcl9wbGF0Zm9ybV9sb2NhdGlvbic7XG5pbXBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vbG9jYXRpb24vcGxhdGZvcm1fbG9jYXRpb24nO1xuXG4vKipcbiAqIEEgbGlzdCBvZiB7QGxpbmsgUHJvdmlkZXJ9cy4gVG8gdXNlIHRoZSByb3V0ZXIsIHlvdSBtdXN0IGFkZCB0aGlzIHRvIHlvdXIgYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2lSVVA4QjVPVWJ4Q1dRM0FjSURtKSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7XG4gKiAgIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBSb3V0ZUNvbmZpZ1xuICogfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfUFJPVklERVJTOiBhbnlbXSA9IENPTlNUX0VYUFIoW1xuICBST1VURVJfUFJPVklERVJTX0NPTU1PTixcbiAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoUGxhdGZvcm1Mb2NhdGlvbiwge3VzZUNsYXNzOiBCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbn0pKSxcbl0pO1xuXG4vKipcbiAqIFVzZSB7QGxpbmsgUk9VVEVSX1BST1ZJREVSU30gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX0JJTkRJTkdTID0gUk9VVEVSX1BST1ZJREVSUztcbiJdfQ==