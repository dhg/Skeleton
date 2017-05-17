var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST, CONST_EXPR } from 'angular2/src/facade/lang';
export let RouteLifecycleHook = class {
    constructor(name) {
        this.name = name;
    }
};
RouteLifecycleHook = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], RouteLifecycleHook);
export let CanActivate = class {
    constructor(fn) {
        this.fn = fn;
    }
};
CanActivate = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Function])
], CanActivate);
export const routerCanReuse = CONST_EXPR(new RouteLifecycleHook("routerCanReuse"));
export const routerCanDeactivate = CONST_EXPR(new RouteLifecycleHook("routerCanDeactivate"));
export const routerOnActivate = CONST_EXPR(new RouteLifecycleHook("routerOnActivate"));
export const routerOnReuse = CONST_EXPR(new RouteLifecycleHook("routerOnReuse"));
export const routerOnDeactivate = CONST_EXPR(new RouteLifecycleHook("routerOnDeactivate"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX2Fubm90YXRpb25zX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xpZmVjeWNsZS9saWZlY3ljbGVfYW5ub3RhdGlvbnNfaW1wbC50cyJdLCJuYW1lcyI6WyJSb3V0ZUxpZmVjeWNsZUhvb2siLCJSb3V0ZUxpZmVjeWNsZUhvb2suY29uc3RydWN0b3IiLCJDYW5BY3RpdmF0ZSIsIkNhbkFjdGl2YXRlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7QUFFMUQ7SUFFRUEsWUFBbUJBLElBQVlBO1FBQVpDLFNBQUlBLEdBQUpBLElBQUlBLENBQVFBO0lBQUdBLENBQUNBO0FBQ3JDRCxDQUFDQTtBQUhEO0lBQUMsS0FBSyxFQUFFOzt1QkFHUDtBQUVEO0lBRUVFLFlBQW1CQSxFQUFZQTtRQUFaQyxPQUFFQSxHQUFGQSxFQUFFQSxDQUFVQTtJQUFHQSxDQUFDQTtBQUNyQ0QsQ0FBQ0E7QUFIRDtJQUFDLEtBQUssRUFBRTs7Z0JBR1A7QUFFRCxhQUFhLGNBQWMsR0FDdkIsVUFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0FBQ3pELGFBQWEsbUJBQW1CLEdBQzVCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztBQUM5RCxhQUFhLGdCQUFnQixHQUN6QixVQUFVLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7QUFDM0QsYUFBYSxhQUFhLEdBQ3RCLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDeEQsYUFBYSxrQkFBa0IsR0FDM0IsVUFBVSxDQUFDLElBQUksa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBSb3V0ZUxpZmVjeWNsZUhvb2sge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nKSB7fVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENhbkFjdGl2YXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGZuOiBGdW5jdGlvbikge31cbn1cblxuZXhwb3J0IGNvbnN0IHJvdXRlckNhblJldXNlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlckNhblJldXNlXCIpKTtcbmV4cG9ydCBjb25zdCByb3V0ZXJDYW5EZWFjdGl2YXRlOiBSb3V0ZUxpZmVjeWNsZUhvb2sgPVxuICAgIENPTlNUX0VYUFIobmV3IFJvdXRlTGlmZWN5Y2xlSG9vayhcInJvdXRlckNhbkRlYWN0aXZhdGVcIikpO1xuZXhwb3J0IGNvbnN0IHJvdXRlck9uQWN0aXZhdGU6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyT25BY3RpdmF0ZVwiKSk7XG5leHBvcnQgY29uc3Qgcm91dGVyT25SZXVzZTogUm91dGVMaWZlY3ljbGVIb29rID1cbiAgICBDT05TVF9FWFBSKG5ldyBSb3V0ZUxpZmVjeWNsZUhvb2soXCJyb3V0ZXJPblJldXNlXCIpKTtcbmV4cG9ydCBjb25zdCByb3V0ZXJPbkRlYWN0aXZhdGU6IFJvdXRlTGlmZWN5Y2xlSG9vayA9XG4gICAgQ09OU1RfRVhQUihuZXcgUm91dGVMaWZlY3ljbGVIb29rKFwicm91dGVyT25EZWFjdGl2YXRlXCIpKTtcbiJdfQ==