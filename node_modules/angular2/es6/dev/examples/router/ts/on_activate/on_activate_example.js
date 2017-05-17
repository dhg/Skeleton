var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, provide } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF } from 'angular2/router';
// #docregion routerOnActivate
let ChildCmp = class {
};
ChildCmp = __decorate([
    Component({ template: `Child` }), 
    __metadata('design:paramtypes', [])
], ChildCmp);
let ParentCmp = class {
    constructor() {
        this.log = '';
    }
    routerOnActivate(next, prev) {
        this.log = `Finished navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`;
        return new Promise(resolve => {
            // The ChildCmp gets instantiated only when the Promise is resolved
            setTimeout(() => resolve(null), 1000);
        });
    }
};
ParentCmp = __decorate([
    Component({
        template: `
    <h2>Parent</h2> (<router-outlet></router-outlet>) 
    <p>{{log}}</p>`,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/child', name: 'Child', component: ChildCmp }]), 
    __metadata('design:paramtypes', [])
], ParentCmp);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My app</h1>
    
    <nav>
      <a [routerLink]="['Parent', 'Child']">Child</a>
    </nav>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/parent/...', name: 'Parent', component: ParentCmp }]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_activate' })]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZS9vbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIkNoaWxkQ21wIiwiUGFyZW50Q21wIiwiUGFyZW50Q21wLmNvbnN0cnVjdG9yIiwiUGFyZW50Q21wLnJvdXRlck9uQWN0aXZhdGUiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxlQUFlO09BQ3pDLEVBQUMsU0FBUyxFQUFDLE1BQU0sMkJBQTJCO09BQzVDLEVBR0wsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixhQUFhLEVBQ2QsTUFBTSxpQkFBaUI7QUFFeEIsOEJBQThCO0FBQzlCO0FBRUFBLENBQUNBO0FBRkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUM7O2FBRTlCO0FBRUQ7SUFBQUM7UUFRRUMsUUFBR0EsR0FBV0EsRUFBRUEsQ0FBQ0E7SUFVbkJBLENBQUNBO0lBUkNELGdCQUFnQkEsQ0FBQ0EsSUFBMEJBLEVBQUVBLElBQTBCQTtRQUNyRUUsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsNkJBQTZCQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxNQUFNQSxTQUFTQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxDQUFDQTtRQUU3RkEsTUFBTUEsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsT0FBT0E7WUFDeEJBLG1FQUFtRUE7WUFDbkVBLFVBQVVBLENBQUNBLE1BQU1BLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtBQUNIRixDQUFDQTtBQWxCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRTs7bUJBRU87UUFDakIsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDOztjQVluRTtBQUNELGdCQUFnQjtBQUdoQjtBQWNBRyxDQUFDQTtBQWREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7Ozs7O0dBT1Q7UUFDRCxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQyxDQUFDO0lBQ0QsV0FBVyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7O1dBRTFFO0FBRUQ7SUFDRUMsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FDWkEsTUFBTUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsRUFBRUEsRUFBQ0EsUUFBUUEsRUFBRUEsMENBQTBDQSxFQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNoR0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5pbXBvcnQge1xuICBPbkFjdGl2YXRlLFxuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgUm91dGVDb25maWcsXG4gIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICBBUFBfQkFTRV9IUkVGXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5cbi8vICNkb2NyZWdpb24gcm91dGVyT25BY3RpdmF0ZVxuQENvbXBvbmVudCh7dGVtcGxhdGU6IGBDaGlsZGB9KVxuY2xhc3MgQ2hpbGRDbXAge1xufVxuXG5AQ29tcG9uZW50KHtcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDI+UGFyZW50PC9oMj4gKDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD4pIFxuICAgIDxwPnt7bG9nfX08L3A+YCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbe3BhdGg6ICcvY2hpbGQnLCBuYW1lOiAnQ2hpbGQnLCBjb21wb25lbnQ6IENoaWxkQ21wfV0pXG5jbGFzcyBQYXJlbnRDbXAgaW1wbGVtZW50cyBPbkFjdGl2YXRlIHtcbiAgbG9nOiBzdHJpbmcgPSAnJztcblxuICByb3V0ZXJPbkFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubG9nID0gYEZpbmlzaGVkIG5hdmlnYXRpbmcgZnJvbSBcIiR7cHJldiA/IHByZXYudXJsUGF0aCA6ICdudWxsJ31cIiB0byBcIiR7bmV4dC51cmxQYXRofVwiYDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIC8vIFRoZSBDaGlsZENtcCBnZXRzIGluc3RhbnRpYXRlZCBvbmx5IHdoZW4gdGhlIFByb21pc2UgaXMgcmVzb2x2ZWRcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZShudWxsKSwgMTAwMCk7XG4gICAgfSk7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IGFwcDwvaDE+XG4gICAgXG4gICAgPG5hdj5cbiAgICAgIDxhIFtyb3V0ZXJMaW5rXT1cIlsnUGFyZW50JywgJ0NoaWxkJ11cIj5DaGlsZDwvYT5cbiAgICA8L25hdj5cbiAgICA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU11cbn0pXG5AUm91dGVDb25maWcoW3twYXRoOiAnL3BhcmVudC8uLi4nLCBuYW1lOiAnUGFyZW50JywgY29tcG9uZW50OiBQYXJlbnRDbXB9XSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZSd9KV0pO1xufVxuIl19