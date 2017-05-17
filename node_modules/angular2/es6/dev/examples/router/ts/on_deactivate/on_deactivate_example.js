var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Injectable, provide } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, ROUTER_DIRECTIVES, APP_BASE_HREF } from 'angular2/router';
let LogService = class {
    constructor() {
        this.logs = [];
    }
    addLog(message) { this.logs.push(message); }
};
LogService = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], LogService);
// #docregion routerOnDeactivate
let MyCmp = class {
    constructor(logService) {
        this.logService = logService;
    }
    routerOnDeactivate(next, prev) {
        this.logService.addLog(`Navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`);
    }
};
MyCmp = __decorate([
    Component({ selector: 'my-cmp', template: `<div>hello</div>` }), 
    __metadata('design:paramtypes', [LogService])
], MyCmp);
// #enddocregion
let AppCmp = class {
    constructor(logService) {
        this.logService = logService;
    }
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My App</h1>
    <nav>
      <a [routerLink]="['/HomeCmp']" id="home-link">Navigate Home</a> |
      <a [routerLink]="['/ParamCmp', {param: 1}]" id="param-link">Navigate with a Param</a>
    </nav>
    <router-outlet></router-outlet>
    <div id="log">
      <h2>Log:</h2>
      <p *ngFor="#logItem of logService.logs">{{ logItem }}</p>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([
        { path: '/', component: MyCmp, name: 'HomeCmp' },
        { path: '/:param', component: MyCmp, name: 'ParamCmp' }
    ]), 
    __metadata('design:paramtypes', [LogService])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [
        provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_deactivate' }),
        LogService
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fZGVhY3RpdmF0ZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvcm91dGVyL3RzL29uX2RlYWN0aXZhdGUvb25fZGVhY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbIkxvZ1NlcnZpY2UiLCJMb2dTZXJ2aWNlLmNvbnN0cnVjdG9yIiwiTG9nU2VydmljZS5hZGRMb2ciLCJNeUNtcCIsIk15Q21wLmNvbnN0cnVjdG9yIiwiTXlDbXAucm91dGVyT25EZWFjdGl2YXRlIiwiQXBwQ21wIiwiQXBwQ21wLmNvbnN0cnVjdG9yIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLGVBQWU7T0FDckQsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7T0FDNUMsRUFHTCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDZCxNQUFNLGlCQUFpQjtBQUd4QjtJQUFBQTtRQUVFQyxTQUFJQSxHQUFhQSxFQUFFQSxDQUFDQTtJQUd0QkEsQ0FBQ0E7SUFEQ0QsTUFBTUEsQ0FBQ0EsT0FBZUEsSUFBVUUsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDNURGLENBQUNBO0FBTEQ7SUFBQyxVQUFVLEVBQUU7O2VBS1o7QUFHRCxnQ0FBZ0M7QUFDaEM7SUFFRUcsWUFBb0JBLFVBQXNCQTtRQUF0QkMsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBWUE7SUFBR0EsQ0FBQ0E7SUFFOUNELGtCQUFrQkEsQ0FBQ0EsSUFBMEJBLEVBQUVBLElBQTBCQTtRQUN2RUUsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FDbEJBLG9CQUFvQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsU0FBU0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0FBQ0hGLENBQUNBO0FBUkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBQyxDQUFDOztVQVE3RDtBQUNELGdCQUFnQjtBQUdoQjtJQXFCRUcsWUFBbUJBLFVBQXNCQTtRQUF0QkMsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBWUE7SUFBR0EsQ0FBQ0E7QUFDL0NELENBQUNBO0FBdEJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFOzs7Ozs7Ozs7OztHQVdUO1FBQ0QsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQztRQUNYLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7UUFDOUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztLQUN0RCxDQUFDOztXQUdEO0FBR0Q7SUFDRUUsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUE7UUFDdkJBLE9BQU9BLENBQUNBLGFBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLDRDQUE0Q0EsRUFBQ0EsQ0FBQ0E7UUFDaEZBLFVBQVVBO0tBQ1hBLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEluamVjdGFibGUsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuaW1wb3J0IHtcbiAgT25EZWFjdGl2YXRlLFxuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgUm91dGVDb25maWcsXG4gIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICBBUFBfQkFTRV9IUkVGXG59IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5cblxuQEluamVjdGFibGUoKVxuY2xhc3MgTG9nU2VydmljZSB7XG4gIGxvZ3M6IHN0cmluZ1tdID0gW107XG5cbiAgYWRkTG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgeyB0aGlzLmxvZ3MucHVzaChtZXNzYWdlKTsgfVxufVxuXG5cbi8vICNkb2NyZWdpb24gcm91dGVyT25EZWFjdGl2YXRlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ215LWNtcCcsIHRlbXBsYXRlOiBgPGRpdj5oZWxsbzwvZGl2PmB9KVxuY2xhc3MgTXlDbXAgaW1wbGVtZW50cyBPbkRlYWN0aXZhdGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxvZ1NlcnZpY2U6IExvZ1NlcnZpY2UpIHt9XG5cbiAgcm91dGVyT25EZWFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubG9nU2VydmljZS5hZGRMb2coXG4gICAgICAgIGBOYXZpZ2F0aW5nIGZyb20gXCIke3ByZXYgPyBwcmV2LnVybFBhdGggOiAnbnVsbCd9XCIgdG8gXCIke25leHQudXJsUGF0aH1cImApO1xuICB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5NeSBBcHA8L2gxPlxuICAgIDxuYXY+XG4gICAgICA8YSBbcm91dGVyTGlua109XCJbJy9Ib21lQ21wJ11cIiBpZD1cImhvbWUtbGlua1wiPk5hdmlnYXRlIEhvbWU8L2E+IHxcbiAgICAgIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL1BhcmFtQ21wJywge3BhcmFtOiAxfV1cIiBpZD1cInBhcmFtLWxpbmtcIj5OYXZpZ2F0ZSB3aXRoIGEgUGFyYW08L2E+XG4gICAgPC9uYXY+XG4gICAgPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICAgIDxkaXYgaWQ9XCJsb2dcIj5cbiAgICAgIDxoMj5Mb2c6PC9oMj5cbiAgICAgIDxwICpuZ0Zvcj1cIiNsb2dJdGVtIG9mIGxvZ1NlcnZpY2UubG9nc1wiPnt7IGxvZ0l0ZW0gfX08L3A+XG4gICAgPC9kaXY+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU11cbn0pXG5AUm91dGVDb25maWcoW1xuICB7cGF0aDogJy8nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnSG9tZUNtcCd9LFxuICB7cGF0aDogJy86cGFyYW0nLCBjb21wb25lbnQ6IE15Q21wLCBuYW1lOiAnUGFyYW1DbXAnfVxuXSlcbmNsYXNzIEFwcENtcCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBsb2dTZXJ2aWNlOiBMb2dTZXJ2aWNlKSB7fVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICByZXR1cm4gYm9vdHN0cmFwKEFwcENtcCwgW1xuICAgIHByb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9kZWFjdGl2YXRlJ30pLFxuICAgIExvZ1NlcnZpY2VcbiAgXSk7XG59XG4iXX0=