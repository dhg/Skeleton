'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var view_1 = require('../metadata/view');
var directives_1 = require('../metadata/directives');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var reflector_reader_1 = require('angular2/src/core/reflection/reflector_reader');
var reflection_1 = require('angular2/src/core/reflection/reflection');
/**
 * Resolves types to {@link ViewMetadata}.
 */
var ViewResolver = (function () {
    function ViewResolver(_reflector) {
        /** @internal */
        this._cache = new collection_1.Map();
        if (lang_1.isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflection_1.reflector;
        }
    }
    ViewResolver.prototype.resolve = function (component) {
        var view = this._cache.get(component);
        if (lang_1.isBlank(view)) {
            view = this._resolve(component);
            this._cache.set(component, view);
        }
        return view;
    };
    /** @internal */
    ViewResolver.prototype._resolve = function (component) {
        var compMeta;
        var viewMeta;
        this._reflector.annotations(component).forEach(function (m) {
            if (m instanceof view_1.ViewMetadata) {
                viewMeta = m;
            }
            if (m instanceof directives_1.ComponentMetadata) {
                compMeta = m;
            }
        });
        if (lang_1.isPresent(compMeta)) {
            if (lang_1.isBlank(compMeta.template) && lang_1.isBlank(compMeta.templateUrl) && lang_1.isBlank(viewMeta)) {
                throw new exceptions_1.BaseException("Component '" + lang_1.stringify(component) + "' must have either 'template' or 'templateUrl' set.");
            }
            else if (lang_1.isPresent(compMeta.template) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("template", component);
            }
            else if (lang_1.isPresent(compMeta.templateUrl) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("templateUrl", component);
            }
            else if (lang_1.isPresent(compMeta.directives) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("directives", component);
            }
            else if (lang_1.isPresent(compMeta.pipes) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("pipes", component);
            }
            else if (lang_1.isPresent(compMeta.encapsulation) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("encapsulation", component);
            }
            else if (lang_1.isPresent(compMeta.styles) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("styles", component);
            }
            else if (lang_1.isPresent(compMeta.styleUrls) && lang_1.isPresent(viewMeta)) {
                this._throwMixingViewAndComponent("styleUrls", component);
            }
            else if (lang_1.isPresent(viewMeta)) {
                return viewMeta;
            }
            else {
                return new view_1.ViewMetadata({
                    templateUrl: compMeta.templateUrl,
                    template: compMeta.template,
                    directives: compMeta.directives,
                    pipes: compMeta.pipes,
                    encapsulation: compMeta.encapsulation,
                    styles: compMeta.styles,
                    styleUrls: compMeta.styleUrls
                });
            }
        }
        else {
            if (lang_1.isBlank(viewMeta)) {
                throw new exceptions_1.BaseException("Could not compile '" + lang_1.stringify(component) + "' because it is not a component.");
            }
            else {
                return viewMeta;
            }
        }
        return null;
    };
    /** @internal */
    ViewResolver.prototype._throwMixingViewAndComponent = function (propertyName, component) {
        throw new exceptions_1.BaseException("Component '" + lang_1.stringify(component) + "' cannot have both '" + propertyName + "' and '@View' set at the same time\"");
    };
    ViewResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [reflector_reader_1.ReflectorReader])
    ], ViewResolver);
    return ViewResolver;
})();
exports.ViewResolver = ViewResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbIlZpZXdSZXNvbHZlciIsIlZpZXdSZXNvbHZlci5jb25zdHJ1Y3RvciIsIlZpZXdSZXNvbHZlci5yZXNvbHZlIiwiVmlld1Jlc29sdmVyLl9yZXNvbHZlIiwiVmlld1Jlc29sdmVyLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHFCQUEyQixrQkFBa0IsQ0FBQyxDQUFBO0FBQzlDLDJCQUFnQyx3QkFBd0IsQ0FBQyxDQUFBO0FBRXpELHFCQUFrRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzdFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUFrQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRW5ELGlDQUE4QiwrQ0FBK0MsQ0FBQyxDQUFBO0FBQzlFLDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBRWxFOztHQUVHO0FBQ0g7SUFPRUEsc0JBQVlBLFVBQTRCQTtRQUh4Q0MsZ0JBQWdCQTtRQUNoQkEsV0FBTUEsR0FBR0EsSUFBSUEsZ0JBQUdBLEVBQXNCQSxDQUFDQTtRQUdyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0Esc0JBQVNBLENBQUNBO1FBQzlCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERCw4QkFBT0EsR0FBUEEsVUFBUUEsU0FBZUE7UUFDckJFLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBRXRDQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ25DQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVERixnQkFBZ0JBO0lBQ2hCQSwrQkFBUUEsR0FBUkEsVUFBU0EsU0FBZUE7UUFDdEJHLElBQUlBLFFBQTJCQSxDQUFDQTtRQUNoQ0EsSUFBSUEsUUFBc0JBLENBQUNBO1FBRTNCQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFBQSxDQUFDQTtZQUM5Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsbUJBQVlBLENBQUNBLENBQUNBLENBQUNBO2dCQUM5QkEsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsOEJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkNBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2ZBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JGQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLGdCQUFjQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0Esd0RBQXFEQSxDQUFDQSxDQUFDQTtZQUUvRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0RBLElBQUlBLENBQUNBLDRCQUE0QkEsQ0FBQ0EsVUFBVUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFFM0RBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xFQSxJQUFJQSxDQUFDQSw0QkFBNEJBLENBQUNBLGFBQWFBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1lBRTlEQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNqRUEsSUFBSUEsQ0FBQ0EsNEJBQTRCQSxDQUFDQSxZQUFZQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUU3REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNURBLElBQUlBLENBQUNBLDRCQUE0QkEsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFFeERBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxJQUFJQSxDQUFDQSw0QkFBNEJBLENBQUNBLGVBQWVBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1lBRWhFQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM3REEsSUFBSUEsQ0FBQ0EsNEJBQTRCQSxDQUFDQSxRQUFRQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUV6REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaEVBLElBQUlBLENBQUNBLDRCQUE0QkEsQ0FBQ0EsV0FBV0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFFNURBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0JBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBO1lBRWxCQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsbUJBQVlBLENBQUNBO29CQUN0QkEsV0FBV0EsRUFBRUEsUUFBUUEsQ0FBQ0EsV0FBV0E7b0JBQ2pDQSxRQUFRQSxFQUFFQSxRQUFRQSxDQUFDQSxRQUFRQTtvQkFDM0JBLFVBQVVBLEVBQUVBLFFBQVFBLENBQUNBLFVBQVVBO29CQUMvQkEsS0FBS0EsRUFBRUEsUUFBUUEsQ0FBQ0EsS0FBS0E7b0JBQ3JCQSxhQUFhQSxFQUFFQSxRQUFRQSxDQUFDQSxhQUFhQTtvQkFDckNBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLE1BQU1BO29CQUN2QkEsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsU0FBU0E7aUJBQzlCQSxDQUFDQSxDQUFDQTtZQUNMQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsd0JBQXNCQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EscUNBQWtDQSxDQUFDQSxDQUFDQTtZQUNwRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBO1lBQ2xCQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVESCxnQkFBZ0JBO0lBQ2hCQSxtREFBNEJBLEdBQTVCQSxVQUE2QkEsWUFBb0JBLEVBQUVBLFNBQWVBO1FBQ2hFSSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLGdCQUFjQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsNEJBQXVCQSxZQUFZQSx5Q0FBcUNBLENBQUNBLENBQUNBO0lBQ2xIQSxDQUFDQTtJQS9GSEo7UUFBQ0EsZUFBVUEsRUFBRUE7O3FCQWdHWkE7SUFBREEsbUJBQUNBO0FBQURBLENBQUNBLEFBaEdELElBZ0dDO0FBL0ZZLG9CQUFZLGVBK0Z4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1ZpZXdNZXRhZGF0YX0gZnJvbSAnLi4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0NvbXBvbmVudE1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuaW1wb3J0IHtUeXBlLCBzdHJpbmdpZnksIGlzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TWFwfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge1JlZmxlY3RvclJlYWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0b3JfcmVhZGVyJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuXG4vKipcbiAqIFJlc29sdmVzIHR5cGVzIHRvIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVmlld1Jlc29sdmVyIHtcbiAgcHJpdmF0ZSBfcmVmbGVjdG9yOiBSZWZsZWN0b3JSZWFkZXI7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2FjaGUgPSBuZXcgTWFwPFR5cGUsIFZpZXdNZXRhZGF0YT4oKTtcblxuICBjb25zdHJ1Y3RvcihfcmVmbGVjdG9yPzogUmVmbGVjdG9yUmVhZGVyKSB7XG4gICAgaWYgKGlzUHJlc2VudChfcmVmbGVjdG9yKSkge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gX3JlZmxlY3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gcmVmbGVjdG9yO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoY29tcG9uZW50OiBUeXBlKTogVmlld01ldGFkYXRhIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX2NhY2hlLmdldChjb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsodmlldykpIHtcbiAgICAgIHZpZXcgPSB0aGlzLl9yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgICB0aGlzLl9jYWNoZS5zZXQoY29tcG9uZW50LCB2aWV3KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmUoY29tcG9uZW50OiBUeXBlKTogVmlld01ldGFkYXRhIHtcbiAgICB2YXIgY29tcE1ldGE6IENvbXBvbmVudE1ldGFkYXRhO1xuICAgIHZhciB2aWV3TWV0YTogVmlld01ldGFkYXRhO1xuXG4gICAgdGhpcy5fcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCkuZm9yRWFjaChtID0+IHtcbiAgICAgIGlmIChtIGluc3RhbmNlb2YgVmlld01ldGFkYXRhKSB7XG4gICAgICAgIHZpZXdNZXRhID0gbTtcbiAgICAgIH1cbiAgICAgIGlmIChtIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgY29tcE1ldGEgPSBtO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGlzUHJlc2VudChjb21wTWV0YSkpIHtcbiAgICAgIGlmIChpc0JsYW5rKGNvbXBNZXRhLnRlbXBsYXRlKSAmJiBpc0JsYW5rKGNvbXBNZXRhLnRlbXBsYXRlVXJsKSAmJiBpc0JsYW5rKHZpZXdNZXRhKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9JyBtdXN0IGhhdmUgZWl0aGVyICd0ZW1wbGF0ZScgb3IgJ3RlbXBsYXRlVXJsJyBzZXQuYCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGNvbXBNZXRhLnRlbXBsYXRlKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcInRlbXBsYXRlXCIsIGNvbXBvbmVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGNvbXBNZXRhLnRlbXBsYXRlVXJsKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcInRlbXBsYXRlVXJsXCIsIGNvbXBvbmVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGNvbXBNZXRhLmRpcmVjdGl2ZXMpICYmIGlzUHJlc2VudCh2aWV3TWV0YSkpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dNaXhpbmdWaWV3QW5kQ29tcG9uZW50KFwiZGlyZWN0aXZlc1wiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS5waXBlcykgJiYgaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICB0aGlzLl90aHJvd01peGluZ1ZpZXdBbmRDb21wb25lbnQoXCJwaXBlc1wiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS5lbmNhcHN1bGF0aW9uKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcImVuY2Fwc3VsYXRpb25cIiwgY29tcG9uZW50KTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoY29tcE1ldGEuc3R5bGVzKSAmJiBpc1ByZXNlbnQodmlld01ldGEpKSB7XG4gICAgICAgIHRoaXMuX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChcInN0eWxlc1wiLCBjb21wb25lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChjb21wTWV0YS5zdHlsZVVybHMpICYmIGlzUHJlc2VudCh2aWV3TWV0YSkpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dNaXhpbmdWaWV3QW5kQ29tcG9uZW50KFwic3R5bGVVcmxzXCIsIGNvbXBvbmVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHZpZXdNZXRhKSkge1xuICAgICAgICByZXR1cm4gdmlld01ldGE7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgVmlld01ldGFkYXRhKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogY29tcE1ldGEudGVtcGxhdGVVcmwsXG4gICAgICAgICAgdGVtcGxhdGU6IGNvbXBNZXRhLnRlbXBsYXRlLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6IGNvbXBNZXRhLmRpcmVjdGl2ZXMsXG4gICAgICAgICAgcGlwZXM6IGNvbXBNZXRhLnBpcGVzLFxuICAgICAgICAgIGVuY2Fwc3VsYXRpb246IGNvbXBNZXRhLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgc3R5bGVzOiBjb21wTWV0YS5zdHlsZXMsXG4gICAgICAgICAgc3R5bGVVcmxzOiBjb21wTWV0YS5zdHlsZVVybHNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0JsYW5rKHZpZXdNZXRhKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb3VsZCBub3QgY29tcGlsZSAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nIGJlY2F1c2UgaXQgaXMgbm90IGEgY29tcG9uZW50LmApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZpZXdNZXRhO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Rocm93TWl4aW5nVmlld0FuZENvbXBvbmVudChwcm9wZXJ0eU5hbWU6IHN0cmluZywgY29tcG9uZW50OiBUeXBlKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgIGBDb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9JyBjYW5ub3QgaGF2ZSBib3RoICcke3Byb3BlcnR5TmFtZX0nIGFuZCAnQFZpZXcnIHNldCBhdCB0aGUgc2FtZSB0aW1lXCJgKTtcbiAgfVxufVxuIl19