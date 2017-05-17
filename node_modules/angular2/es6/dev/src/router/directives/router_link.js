var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive } from 'angular2/core';
import { isString } from 'angular2/src/facade/lang';
import { Router } from '../router';
import { Location } from '../location/location';
/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * @RouteConfig([
 *   { path: '/user', component: UserCmp, as: 'User' }
 * ]);
 * class MyComp {}
 * ```
 *
 * When linking to this `User` route, you can write:
 *
 * ```
 * <a [routerLink]="['./User']">link to user component</a>
 * ```
 *
 * RouterLink expects the value to be an array of route names, followed by the params
 * for that level of routing. For instance `['/Team', {teamId: 1}, 'User', {userId: 2}]`
 * means that we want to generate a link for the `Team` route with params `{teamId: 1}`,
 * and with a child route `User` with params `{userId: 2}`.
 *
 * The first route name should be prepended with `/`, `./`, or `../`.
 * If the route begins with `/`, the router will look up the route from the root of the app.
 * If the route begins with `./`, the router will instead look in the current component's
 * children for the route. And if the route begins with `../`, the router will look at the
 * current component's parent.
 */
export let RouterLink = class {
    constructor(_router, _location) {
        this._router = _router;
        this._location = _location;
        // we need to update the link whenever a route changes to account for aux routes
        this._router.subscribe((_) => this._updateLink());
    }
    // because auxiliary links take existing primary and auxiliary routes into account,
    // we need to update the link whenever params or other routes change.
    _updateLink() {
        this._navigationInstruction = this._router.generate(this._routeParams);
        var navigationHref = this._navigationInstruction.toLinkUrl();
        this.visibleHref = this._location.prepareExternalUrl(navigationHref);
    }
    get isRouteActive() { return this._router.isRouteActive(this._navigationInstruction); }
    set routeParams(changes) {
        this._routeParams = changes;
        this._updateLink();
    }
    onClick() {
        // If no target, or if target is _self, prevent default browser behavior
        if (!isString(this.target) || this.target == '_self') {
            this._router.navigateByInstruction(this._navigationInstruction);
            return false;
        }
        return true;
    }
};
RouterLink = __decorate([
    Directive({
        selector: '[routerLink]',
        inputs: ['routeParams: routerLink', 'target: target'],
        host: {
            '(click)': 'onClick()',
            '[attr.href]': 'visibleHref',
            '[class.router-link-active]': 'isRouteActive'
        }
    }), 
    __metadata('design:paramtypes', [Router, Location])
], RouterLink);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmsudHMiXSwibmFtZXMiOlsiUm91dGVyTGluayIsIlJvdXRlckxpbmsuY29uc3RydWN0b3IiLCJSb3V0ZXJMaW5rLl91cGRhdGVMaW5rIiwiUm91dGVyTGluay5pc1JvdXRlQWN0aXZlIiwiUm91dGVyTGluay5yb3V0ZVBhcmFtcyIsIlJvdXRlckxpbmsub25DbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlO09BQ2hDLEVBQUMsUUFBUSxFQUFDLE1BQU0sMEJBQTBCO09BRTFDLEVBQUMsTUFBTSxFQUFDLE1BQU0sV0FBVztPQUN6QixFQUFDLFFBQVEsRUFBQyxNQUFNLHNCQUFzQjtBQUc3Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNIO0lBbUJFQSxZQUFvQkEsT0FBZUEsRUFBVUEsU0FBbUJBO1FBQTVDQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUFRQTtRQUFVQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtRQUM5REEsZ0ZBQWdGQTtRQUNoRkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDcERBLENBQUNBO0lBRURELG1GQUFtRkE7SUFDbkZBLHFFQUFxRUE7SUFDN0RBLFdBQVdBO1FBQ2pCRSxJQUFJQSxDQUFDQSxzQkFBc0JBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQ3ZFQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQzdEQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxrQkFBa0JBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO0lBQ3ZFQSxDQUFDQTtJQUVERixJQUFJQSxhQUFhQSxLQUFjRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRWhHSCxJQUFJQSxXQUFXQSxDQUFDQSxPQUFjQTtRQUM1QkksSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDNUJBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVESixPQUFPQTtRQUNMSyx3RUFBd0VBO1FBQ3hFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyREEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBO1lBQ2hFQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtBQUNITCxDQUFDQTtBQS9DRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxjQUFjO1FBQ3hCLE1BQU0sRUFBRSxDQUFDLHlCQUF5QixFQUFFLGdCQUFnQixDQUFDO1FBQ3JELElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxXQUFXO1lBQ3RCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLDRCQUE0QixFQUFFLGVBQWU7U0FDOUM7S0FDRixDQUFDOztlQXVDRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1N0cmluZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuLi9sb2NhdGlvbi9sb2NhdGlvbic7XG5pbXBvcnQge0luc3RydWN0aW9ufSBmcm9tICcuLi9pbnN0cnVjdGlvbic7XG5cbi8qKlxuICogVGhlIFJvdXRlckxpbmsgZGlyZWN0aXZlIGxldHMgeW91IGxpbmsgdG8gc3BlY2lmaWMgcGFydHMgb2YgeW91ciBhcHAuXG4gKlxuICogQ29uc2lkZXIgdGhlIGZvbGxvd2luZyByb3V0ZSBjb25maWd1cmF0aW9uOlxuXG4gKiBgYGBcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIHsgcGF0aDogJy91c2VyJywgY29tcG9uZW50OiBVc2VyQ21wLCBhczogJ1VzZXInIH1cbiAqIF0pO1xuICogY2xhc3MgTXlDb21wIHt9XG4gKiBgYGBcbiAqXG4gKiBXaGVuIGxpbmtpbmcgdG8gdGhpcyBgVXNlcmAgcm91dGUsIHlvdSBjYW4gd3JpdGU6XG4gKlxuICogYGBgXG4gKiA8YSBbcm91dGVyTGlua109XCJbJy4vVXNlciddXCI+bGluayB0byB1c2VyIGNvbXBvbmVudDwvYT5cbiAqIGBgYFxuICpcbiAqIFJvdXRlckxpbmsgZXhwZWN0cyB0aGUgdmFsdWUgdG8gYmUgYW4gYXJyYXkgb2Ygcm91dGUgbmFtZXMsIGZvbGxvd2VkIGJ5IHRoZSBwYXJhbXNcbiAqIGZvciB0aGF0IGxldmVsIG9mIHJvdXRpbmcuIEZvciBpbnN0YW5jZSBgWycvVGVhbScsIHt0ZWFtSWQ6IDF9LCAnVXNlcicsIHt1c2VySWQ6IDJ9XWBcbiAqIG1lYW5zIHRoYXQgd2Ugd2FudCB0byBnZW5lcmF0ZSBhIGxpbmsgZm9yIHRoZSBgVGVhbWAgcm91dGUgd2l0aCBwYXJhbXMgYHt0ZWFtSWQ6IDF9YCxcbiAqIGFuZCB3aXRoIGEgY2hpbGQgcm91dGUgYFVzZXJgIHdpdGggcGFyYW1zIGB7dXNlcklkOiAyfWAuXG4gKlxuICogVGhlIGZpcnN0IHJvdXRlIG5hbWUgc2hvdWxkIGJlIHByZXBlbmRlZCB3aXRoIGAvYCwgYC4vYCwgb3IgYC4uL2AuXG4gKiBJZiB0aGUgcm91dGUgYmVnaW5zIHdpdGggYC9gLCB0aGUgcm91dGVyIHdpbGwgbG9vayB1cCB0aGUgcm91dGUgZnJvbSB0aGUgcm9vdCBvZiB0aGUgYXBwLlxuICogSWYgdGhlIHJvdXRlIGJlZ2lucyB3aXRoIGAuL2AsIHRoZSByb3V0ZXIgd2lsbCBpbnN0ZWFkIGxvb2sgaW4gdGhlIGN1cnJlbnQgY29tcG9uZW50J3NcbiAqIGNoaWxkcmVuIGZvciB0aGUgcm91dGUuIEFuZCBpZiB0aGUgcm91dGUgYmVnaW5zIHdpdGggYC4uL2AsIHRoZSByb3V0ZXIgd2lsbCBsb29rIGF0IHRoZVxuICogY3VycmVudCBjb21wb25lbnQncyBwYXJlbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tyb3V0ZXJMaW5rXScsXG4gIGlucHV0czogWydyb3V0ZVBhcmFtczogcm91dGVyTGluaycsICd0YXJnZXQ6IHRhcmdldCddLFxuICBob3N0OiB7XG4gICAgJyhjbGljayknOiAnb25DbGljaygpJyxcbiAgICAnW2F0dHIuaHJlZl0nOiAndmlzaWJsZUhyZWYnLFxuICAgICdbY2xhc3Mucm91dGVyLWxpbmstYWN0aXZlXSc6ICdpc1JvdXRlQWN0aXZlJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIFJvdXRlckxpbmsge1xuICBwcml2YXRlIF9yb3V0ZVBhcmFtczogYW55W107XG5cbiAgLy8gdGhlIHVybCBkaXNwbGF5ZWQgb24gdGhlIGFuY2hvciBlbGVtZW50LlxuICB2aXNpYmxlSHJlZjogc3RyaW5nO1xuICB0YXJnZXQ6IHN0cmluZztcblxuICAvLyB0aGUgaW5zdHJ1Y3Rpb24gcGFzc2VkIHRvIHRoZSByb3V0ZXIgdG8gbmF2aWdhdGVcbiAgcHJpdmF0ZSBfbmF2aWdhdGlvbkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSBfbG9jYXRpb246IExvY2F0aW9uKSB7XG4gICAgLy8gd2UgbmVlZCB0byB1cGRhdGUgdGhlIGxpbmsgd2hlbmV2ZXIgYSByb3V0ZSBjaGFuZ2VzIHRvIGFjY291bnQgZm9yIGF1eCByb3V0ZXNcbiAgICB0aGlzLl9yb3V0ZXIuc3Vic2NyaWJlKChfKSA9PiB0aGlzLl91cGRhdGVMaW5rKCkpO1xuICB9XG5cbiAgLy8gYmVjYXVzZSBhdXhpbGlhcnkgbGlua3MgdGFrZSBleGlzdGluZyBwcmltYXJ5IGFuZCBhdXhpbGlhcnkgcm91dGVzIGludG8gYWNjb3VudCxcbiAgLy8gd2UgbmVlZCB0byB1cGRhdGUgdGhlIGxpbmsgd2hlbmV2ZXIgcGFyYW1zIG9yIG90aGVyIHJvdXRlcyBjaGFuZ2UuXG4gIHByaXZhdGUgX3VwZGF0ZUxpbmsoKTogdm9pZCB7XG4gICAgdGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uID0gdGhpcy5fcm91dGVyLmdlbmVyYXRlKHRoaXMuX3JvdXRlUGFyYW1zKTtcbiAgICB2YXIgbmF2aWdhdGlvbkhyZWYgPSB0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24udG9MaW5rVXJsKCk7XG4gICAgdGhpcy52aXNpYmxlSHJlZiA9IHRoaXMuX2xvY2F0aW9uLnByZXBhcmVFeHRlcm5hbFVybChuYXZpZ2F0aW9uSHJlZik7XG4gIH1cblxuICBnZXQgaXNSb3V0ZUFjdGl2ZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3JvdXRlci5pc1JvdXRlQWN0aXZlKHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbik7IH1cblxuICBzZXQgcm91dGVQYXJhbXMoY2hhbmdlczogYW55W10pIHtcbiAgICB0aGlzLl9yb3V0ZVBhcmFtcyA9IGNoYW5nZXM7XG4gICAgdGhpcy5fdXBkYXRlTGluaygpO1xuICB9XG5cbiAgb25DbGljaygpOiBib29sZWFuIHtcbiAgICAvLyBJZiBubyB0YXJnZXQsIG9yIGlmIHRhcmdldCBpcyBfc2VsZiwgcHJldmVudCBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3JcbiAgICBpZiAoIWlzU3RyaW5nKHRoaXMudGFyZ2V0KSB8fCB0aGlzLnRhcmdldCA9PSAnX3NlbGYnKSB7XG4gICAgICB0aGlzLl9yb3V0ZXIubmF2aWdhdGVCeUluc3RydWN0aW9uKHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=