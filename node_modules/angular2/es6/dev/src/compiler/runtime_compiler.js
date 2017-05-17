var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Compiler, Compiler_ } from 'angular2/src/core/linker/compiler';
import { HostViewFactoryRef_ } from 'angular2/src/core/linker/view_ref';
import { TemplateCompiler } from './template_compiler';
import { Injectable } from 'angular2/src/core/di';
export class RuntimeCompiler extends Compiler {
}
export let RuntimeCompiler_ = class extends Compiler_ {
    constructor(_templateCompiler) {
        super();
        this._templateCompiler = _templateCompiler;
    }
    compileInHost(componentType) {
        return this._templateCompiler.compileHostComponentRuntime(componentType)
            .then(hostViewFactory => new HostViewFactoryRef_(hostViewFactory));
    }
    clearCache() {
        super.clearCache();
        this._templateCompiler.clearCache();
    }
};
RuntimeCompiler_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [TemplateCompiler])
], RuntimeCompiler_);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlJ1bnRpbWVDb21waWxlciIsIlJ1bnRpbWVDb21waWxlcl8iLCJSdW50aW1lQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiUnVudGltZUNvbXBpbGVyXy5jbGVhckNhY2hlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxtQ0FBbUM7T0FDOUQsRUFBcUIsbUJBQW1CLEVBQUMsTUFBTSxtQ0FBbUM7T0FDbEYsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQjtPQUU3QyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQUcvQyxxQ0FBOEMsUUFBUTtBQUd0REEsQ0FBQ0E7QUFFRCw0Q0FDc0MsU0FBUztJQUM3Q0MsWUFBb0JBLGlCQUFtQ0E7UUFBSUMsT0FBT0EsQ0FBQ0E7UUFBL0NBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO0lBQWFBLENBQUNBO0lBRXJFRCxhQUFhQSxDQUFDQSxhQUFtQkE7UUFDL0JFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxhQUFhQSxDQUFDQTthQUNuRUEsSUFBSUEsQ0FBQ0EsZUFBZUEsSUFBSUEsSUFBSUEsbUJBQW1CQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN6RUEsQ0FBQ0E7SUFFREYsVUFBVUE7UUFDUkcsS0FBS0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7SUFDdENBLENBQUNBO0FBQ0hILENBQUNBO0FBYkQ7SUFBQyxVQUFVLEVBQUU7O3FCQWFaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBpbGVyLCBDb21waWxlcl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21waWxlcic7XG5pbXBvcnQge0hvc3RWaWV3RmFjdG9yeVJlZiwgSG9zdFZpZXdGYWN0b3J5UmVmX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVmJztcbmltcG9ydCB7VGVtcGxhdGVDb21waWxlcn0gZnJvbSAnLi90ZW1wbGF0ZV9jb21waWxlcic7XG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUnVudGltZUNvbXBpbGVyIGV4dGVuZHMgQ29tcGlsZXIge1xuICBhYnN0cmFjdCBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPEhvc3RWaWV3RmFjdG9yeVJlZj47XG4gIGFic3RyYWN0IGNsZWFyQ2FjaGUoKTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVDb21waWxlcl8gZXh0ZW5kcyBDb21waWxlcl8gaW1wbGVtZW50cyBSdW50aW1lQ29tcGlsZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF90ZW1wbGF0ZUNvbXBpbGVyOiBUZW1wbGF0ZUNvbXBpbGVyKSB7IHN1cGVyKCk7IH1cblxuICBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPEhvc3RWaWV3RmFjdG9yeVJlZl8+IHtcbiAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVDb21waWxlci5jb21waWxlSG9zdENvbXBvbmVudFJ1bnRpbWUoY29tcG9uZW50VHlwZSlcbiAgICAgICAgLnRoZW4oaG9zdFZpZXdGYWN0b3J5ID0+IG5ldyBIb3N0Vmlld0ZhY3RvcnlSZWZfKGhvc3RWaWV3RmFjdG9yeSkpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHtcbiAgICBzdXBlci5jbGVhckNhY2hlKCk7XG4gICAgdGhpcy5fdGVtcGxhdGVDb21waWxlci5jbGVhckNhY2hlKCk7XG4gIH1cbn1cbiJdfQ==