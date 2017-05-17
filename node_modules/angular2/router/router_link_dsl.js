'use strict';var compiler_1 = require('angular2/compiler');
var core_1 = require('angular2/core');
var router_link_transform_1 = require('angular2/src/router/directives/router_link_transform');
var lang_1 = require('angular2/src/facade/lang');
var router_link_transform_2 = require('angular2/src/router/directives/router_link_transform');
exports.RouterLinkTransform = router_link_transform_2.RouterLinkTransform;
/**
 * Enables the router link DSL.
 *
 * Warning. This feature is experimental and can change.
 *
 * To enable the transformer pass the router link DSL provider to `bootstrap`.
 *
 * ## Example:
 * ```
 * import {bootstrap} from 'angular2/platform/browser';
 * import {ROUTER_LINK_DSL_PROVIDER} from 'angular2/router/router_link_dsl';
 *
 * bootstrap(CustomApp, [ROUTER_LINK_DSL_PROVIDER]);
 * ```
 *
 * The DSL allows you to express router links as follows:
 * ```
 * <a [routerLink]="route:User"> <!-- Same as <a [routerLink]="['User']"> -->
 * <a [routerLink]="route:/User"> <!-- Same as <a [routerLink]="['User']"> -->
 * <a [routerLink]="route:./User"> <!-- Same as <a [routerLink]="['./User']"> -->
 * <a [routerLink]="./User(id: value, name: 'Bob')"> <!-- Same as <a [routerLink]="['./User', {id:
 * value, name: 'Bob'}]"> -->
 * <a [routerLink]="/User/Modal"> <!-- Same as <a [routerLink]="['/User', 'Modal']"> -->
 * <a [routerLink]="User[Modal]"> <!-- Same as <a [routerLink]="['User', ['Modal']]"> -->
 * ```
 */
exports.ROUTER_LINK_DSL_PROVIDER = lang_1.CONST_EXPR(new core_1.Provider(compiler_1.TEMPLATE_TRANSFORMS, { useClass: router_link_transform_1.RouterLinkTransform, multi: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfZHNsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvcm91dGVyL3JvdXRlcl9saW5rX2RzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5QkFBa0MsbUJBQW1CLENBQUMsQ0FBQTtBQUN0RCxxQkFBdUIsZUFBZSxDQUFDLENBQUE7QUFDdkMsc0NBQWtDLHNEQUFzRCxDQUFDLENBQUE7QUFDekYscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFFcEQsc0NBQWtDLHNEQUFzRCxDQUFDO0FBQWpGLDBFQUFpRjtBQUV6Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNVLGdDQUF3QixHQUNqQyxpQkFBVSxDQUFDLElBQUksZUFBUSxDQUFDLDhCQUFtQixFQUFFLEVBQUMsUUFBUSxFQUFFLDJDQUFtQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1RFTVBMQVRFX1RSQU5TRk9STVN9IGZyb20gJ2FuZ3VsYXIyL2NvbXBpbGVyJztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJMaW5rVHJhbnNmb3JtfSBmcm9tICdhbmd1bGFyMi9zcmMvcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmtfdHJhbnNmb3JtJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IHtSb3V0ZXJMaW5rVHJhbnNmb3JtfSBmcm9tICdhbmd1bGFyMi9zcmMvcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmtfdHJhbnNmb3JtJztcblxuLyoqXG4gKiBFbmFibGVzIHRoZSByb3V0ZXIgbGluayBEU0wuXG4gKlxuICogV2FybmluZy4gVGhpcyBmZWF0dXJlIGlzIGV4cGVyaW1lbnRhbCBhbmQgY2FuIGNoYW5nZS5cbiAqXG4gKiBUbyBlbmFibGUgdGhlIHRyYW5zZm9ybWVyIHBhc3MgdGhlIHJvdXRlciBsaW5rIERTTCBwcm92aWRlciB0byBgYm9vdHN0cmFwYC5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICogYGBgXG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JPVVRFUl9MSU5LX0RTTF9QUk9WSURFUn0gZnJvbSAnYW5ndWxhcjIvcm91dGVyL3JvdXRlcl9saW5rX2RzbCc7XG4gKlxuICogYm9vdHN0cmFwKEN1c3RvbUFwcCwgW1JPVVRFUl9MSU5LX0RTTF9QUk9WSURFUl0pO1xuICogYGBgXG4gKlxuICogVGhlIERTTCBhbGxvd3MgeW91IHRvIGV4cHJlc3Mgcm91dGVyIGxpbmtzIGFzIGZvbGxvd3M6XG4gKiBgYGBcbiAqIDxhIFtyb3V0ZXJMaW5rXT1cInJvdXRlOlVzZXJcIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnVXNlciddXCI+IC0tPlxuICogPGEgW3JvdXRlckxpbmtdPVwicm91dGU6L1VzZXJcIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnVXNlciddXCI+IC0tPlxuICogPGEgW3JvdXRlckxpbmtdPVwicm91dGU6Li9Vc2VyXCI+IDwhLS0gU2FtZSBhcyA8YSBbcm91dGVyTGlua109XCJbJy4vVXNlciddXCI+IC0tPlxuICogPGEgW3JvdXRlckxpbmtdPVwiLi9Vc2VyKGlkOiB2YWx1ZSwgbmFtZTogJ0JvYicpXCI+IDwhLS0gU2FtZSBhcyA8YSBbcm91dGVyTGlua109XCJbJy4vVXNlcicsIHtpZDpcbiAqIHZhbHVlLCBuYW1lOiAnQm9iJ31dXCI+IC0tPlxuICogPGEgW3JvdXRlckxpbmtdPVwiL1VzZXIvTW9kYWxcIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL1VzZXInLCAnTW9kYWwnXVwiPiAtLT5cbiAqIDxhIFtyb3V0ZXJMaW5rXT1cIlVzZXJbTW9kYWxdXCI+IDwhLS0gU2FtZSBhcyA8YSBbcm91dGVyTGlua109XCJbJ1VzZXInLCBbJ01vZGFsJ11dXCI+IC0tPlxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfTElOS19EU0xfUFJPVklERVIgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFRFTVBMQVRFX1RSQU5TRk9STVMsIHt1c2VDbGFzczogUm91dGVyTGlua1RyYW5zZm9ybSwgbXVsdGk6IHRydWV9KSk7XG4iXX0=