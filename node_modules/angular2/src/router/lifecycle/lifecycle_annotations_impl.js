'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var RouteLifecycleHook = (function () {
    function RouteLifecycleHook(name) {
        this.name = name;
    }
    RouteLifecycleHook = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], RouteLifecycleHook);
    return RouteLifecycleHook;
})();
exports.RouteLifecycleHook = RouteLifecycleHook;
var CanActivate = (function () {
    function CanActivate(fn) {
        this.fn = fn;
    }
    CanActivate = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Function])
    ], CanActivate);
    return CanActivate;
})();
exports.CanActivate = CanActivate;
exports.routerCanReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("routerCanReuse"));
exports.routerCanDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("routerCanDeactivate"));
exports.routerOnActivate = lang_1.CONST_EXPR(new RouteLifecycleHook("routerOnActivate"));
exports.routerOnReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("routerOnReuse"));
exports.routerOnDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("routerOnDeactivate"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX2Fubm90YXRpb25zX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xpZmVjeWNsZS9saWZlY3ljbGVfYW5ub3RhdGlvbnNfaW1wbC50cyJdLCJuYW1lcyI6WyJSb3V0ZUxpZmVjeWNsZUhvb2siLCJSb3V0ZUxpZmVjeWNsZUhvb2suY29uc3RydWN0b3IiLCJDYW5BY3RpdmF0ZSIsIkNhbkFjdGl2YXRlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFBZ0MsMEJBQTBCLENBQUMsQ0FBQTtBQUUzRDtJQUVFQSw0QkFBbUJBLElBQVlBO1FBQVpDLFNBQUlBLEdBQUpBLElBQUlBLENBQVFBO0lBQUdBLENBQUNBO0lBRnJDRDtRQUFDQSxZQUFLQSxFQUFFQTs7MkJBR1BBO0lBQURBLHlCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSwwQkFBa0IscUJBRTlCLENBQUE7QUFFRDtJQUVFRSxxQkFBbUJBLEVBQVlBO1FBQVpDLE9BQUVBLEdBQUZBLEVBQUVBLENBQVVBO0lBQUdBLENBQUNBO0lBRnJDRDtRQUFDQSxZQUFLQSxFQUFFQTs7b0JBR1BBO0lBQURBLGtCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSxtQkFBVyxjQUV2QixDQUFBO0FBRVksc0JBQWMsR0FDdkIsaUJBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUM1QywyQkFBbUIsR0FDNUIsaUJBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztBQUNqRCx3QkFBZ0IsR0FDekIsaUJBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztBQUM5QyxxQkFBYSxHQUN0QixpQkFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztBQUMzQywwQkFBa0IsR0FDM0IsaUJBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1QsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUm91dGVMaWZlY3ljbGVIb29rIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZykge31cbn1cblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDYW5BY3RpdmF0ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmbjogRnVuY3Rpb24pIHt9XG59XG5cbmV4cG9ydCBjb25zdCByb3V0ZXJDYW5SZXVzZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJDYW5SZXVzZVwiKSk7XG5leHBvcnQgY29uc3Qgcm91dGVyQ2FuRGVhY3RpdmF0ZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJDYW5EZWFjdGl2YXRlXCIpKTtcbmV4cG9ydCBjb25zdCByb3V0ZXJPbkFjdGl2YXRlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlck9uQWN0aXZhdGVcIikpO1xuZXhwb3J0IGNvbnN0IHJvdXRlck9uUmV1c2U6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyT25SZXVzZVwiKSk7XG5leHBvcnQgY29uc3Qgcm91dGVyT25EZWFjdGl2YXRlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlck9uRGVhY3RpdmF0ZVwiKSk7XG4iXX0=