import { TEMPLATE_TRANSFORMS } from 'angular2/compiler';
import { Provider } from 'angular2/core';
import { RouterLinkTransform } from 'angular2/src/router/directives/router_link_transform';
import { CONST_EXPR } from 'angular2/src/facade/lang';
export { RouterLinkTransform } from 'angular2/src/router/directives/router_link_transform';
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
export const ROUTER_LINK_DSL_PROVIDER = CONST_EXPR(new Provider(TEMPLATE_TRANSFORMS, { useClass: RouterLinkTransform, multi: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmtfZHNsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvcm91dGVyL3JvdXRlcl9saW5rX2RzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CO09BQzlDLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUMvQixFQUFDLG1CQUFtQixFQUFDLE1BQU0sc0RBQXNEO09BQ2pGLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO0FBRW5ELFNBQVEsbUJBQW1CLFFBQU8sc0RBQXNELENBQUM7QUFFekY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Qkc7QUFDSCxhQUFhLHdCQUF3QixHQUNqQyxVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsbUJBQW1CLEVBQUUsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VEVNUExBVEVfVFJBTlNGT1JNU30gZnJvbSAnYW5ndWxhcjIvY29tcGlsZXInO1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1JvdXRlckxpbmtUcmFuc2Zvcm19IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfbGlua190cmFuc2Zvcm0nO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5leHBvcnQge1JvdXRlckxpbmtUcmFuc2Zvcm19IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfbGlua190cmFuc2Zvcm0nO1xuXG4vKipcbiAqIEVuYWJsZXMgdGhlIHJvdXRlciBsaW5rIERTTC5cbiAqXG4gKiBXYXJuaW5nLiBUaGlzIGZlYXR1cmUgaXMgZXhwZXJpbWVudGFsIGFuZCBjYW4gY2hhbmdlLlxuICpcbiAqIFRvIGVuYWJsZSB0aGUgdHJhbnNmb3JtZXIgcGFzcyB0aGUgcm91dGVyIGxpbmsgRFNMIHByb3ZpZGVyIHRvIGBib290c3RyYXBgLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKiBgYGBcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Uk9VVEVSX0xJTktfRFNMX1BST1ZJREVSfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXIvcm91dGVyX2xpbmtfZHNsJztcbiAqXG4gKiBib290c3RyYXAoQ3VzdG9tQXBwLCBbUk9VVEVSX0xJTktfRFNMX1BST1ZJREVSXSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgRFNMIGFsbG93cyB5b3UgdG8gZXhwcmVzcyByb3V0ZXIgbGlua3MgYXMgZm9sbG93czpcbiAqIGBgYFxuICogPGEgW3JvdXRlckxpbmtdPVwicm91dGU6VXNlclwiPiA8IS0tIFNhbWUgYXMgPGEgW3JvdXRlckxpbmtdPVwiWydVc2VyJ11cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCJyb3V0ZTovVXNlclwiPiA8IS0tIFNhbWUgYXMgPGEgW3JvdXRlckxpbmtdPVwiWydVc2VyJ11cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCJyb3V0ZTouL1VzZXJcIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnLi9Vc2VyJ11cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCIuL1VzZXIoaWQ6IHZhbHVlLCBuYW1lOiAnQm9iJylcIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnLi9Vc2VyJywge2lkOlxuICogdmFsdWUsIG5hbWU6ICdCb2InfV1cIj4gLS0+XG4gKiA8YSBbcm91dGVyTGlua109XCIvVXNlci9Nb2RhbFwiPiA8IS0tIFNhbWUgYXMgPGEgW3JvdXRlckxpbmtdPVwiWycvVXNlcicsICdNb2RhbCddXCI+IC0tPlxuICogPGEgW3JvdXRlckxpbmtdPVwiVXNlcltNb2RhbF1cIj4gPCEtLSBTYW1lIGFzIDxhIFtyb3V0ZXJMaW5rXT1cIlsnVXNlcicsIFsnTW9kYWwnXV1cIj4gLS0+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9MSU5LX0RTTF9QUk9WSURFUiA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoVEVNUExBVEVfVFJBTlNGT1JNUywge3VzZUNsYXNzOiBSb3V0ZXJMaW5rVHJhbnNmb3JtLCBtdWx0aTogdHJ1ZX0pKTtcbiJdfQ==