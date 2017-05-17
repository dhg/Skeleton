'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
/**
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `ngIf` evaluates to a false value then the element
 * is removed from the DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * ### Example ([live demo](http://plnkr.co/edit/fe0kgemFBtmQOY31b4tw?p=preview)):
 *
 * ```
 * <div *ngIf="errorCount > 0" class="error">
 *   <!-- Error message displayed when the errorCount property on the current context is greater
 * than 0. -->
 *   {{errorCount}} errors detected
 * </div>
 * ```
 *
 * ### Syntax
 *
 * - `<div *ngIf="condition">...</div>`
 * - `<div template="ngIf condition">...</div>`
 * - `<template [ngIf]="condition"><div>...</div></template>`
 */
var NgIf = (function () {
    function NgIf(_viewContainer, _templateRef) {
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._prevCondition = null;
    }
    Object.defineProperty(NgIf.prototype, "ngIf", {
        set: function (newCondition /* boolean */) {
            if (newCondition && (lang_1.isBlank(this._prevCondition) || !this._prevCondition)) {
                this._prevCondition = true;
                this._viewContainer.createEmbeddedView(this._templateRef);
            }
            else if (!newCondition && (lang_1.isBlank(this._prevCondition) || this._prevCondition)) {
                this._prevCondition = false;
                this._viewContainer.clear();
            }
        },
        enumerable: true,
        configurable: true
    });
    NgIf = __decorate([
        core_1.Directive({ selector: '[ngIf]', inputs: ['ngIf'] }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef])
    ], NgIf);
    return NgIf;
})();
exports.NgIf = NgIf;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfaWYudHMiXSwibmFtZXMiOlsiTmdJZiIsIk5nSWYuY29uc3RydWN0b3IiLCJOZ0lmLm5nSWYiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF1RCxlQUFlLENBQUMsQ0FBQTtBQUN2RSxxQkFBc0IsMEJBQTBCLENBQUMsQ0FBQTtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0g7SUFJRUEsY0FBb0JBLGNBQWdDQSxFQUFVQSxZQUF5QkE7UUFBbkVDLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFrQkE7UUFBVUEsaUJBQVlBLEdBQVpBLFlBQVlBLENBQWFBO1FBRi9FQSxtQkFBY0EsR0FBWUEsSUFBSUEsQ0FBQ0E7SUFFbURBLENBQUNBO0lBRTNGRCxzQkFBSUEsc0JBQUlBO2FBQVJBLFVBQVNBLFlBQWlCQSxDQUFDQSxhQUFhQTtZQUN0Q0UsRUFBRUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsSUFBSUEsQ0FBQ0EsY0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNFQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtnQkFDM0JBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7WUFDNURBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLElBQUlBLENBQUNBLGNBQU9BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNsRkEsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtZQUM5QkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7OztPQUFBRjtJQWRIQTtRQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBRUEsTUFBTUEsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBQ0EsQ0FBQ0E7O2FBZWpEQTtJQUFEQSxXQUFDQTtBQUFEQSxDQUFDQSxBQWZELElBZUM7QUFkWSxZQUFJLE9BY2hCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgVmlld0NvbnRhaW5lclJlZiwgVGVtcGxhdGVSZWZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFJlbW92ZXMgb3IgcmVjcmVhdGVzIGEgcG9ydGlvbiBvZiB0aGUgRE9NIHRyZWUgYmFzZWQgb24gYW4ge2V4cHJlc3Npb259LlxuICpcbiAqIElmIHRoZSBleHByZXNzaW9uIGFzc2lnbmVkIHRvIGBuZ0lmYCBldmFsdWF0ZXMgdG8gYSBmYWxzZSB2YWx1ZSB0aGVuIHRoZSBlbGVtZW50XG4gKiBpcyByZW1vdmVkIGZyb20gdGhlIERPTSwgb3RoZXJ3aXNlIGEgY2xvbmUgb2YgdGhlIGVsZW1lbnQgaXMgcmVpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2ZlMGtnZW1GQnRtUU9ZMzFiNHR3P3A9cHJldmlldykpOlxuICpcbiAqIGBgYFxuICogPGRpdiAqbmdJZj1cImVycm9yQ291bnQgPiAwXCIgY2xhc3M9XCJlcnJvclwiPlxuICogICA8IS0tIEVycm9yIG1lc3NhZ2UgZGlzcGxheWVkIHdoZW4gdGhlIGVycm9yQ291bnQgcHJvcGVydHkgb24gdGhlIGN1cnJlbnQgY29udGV4dCBpcyBncmVhdGVyXG4gKiB0aGFuIDAuIC0tPlxuICogICB7e2Vycm9yQ291bnR9fSBlcnJvcnMgZGV0ZWN0ZWRcbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxkaXYgKm5nSWY9XCJjb25kaXRpb25cIj4uLi48L2Rpdj5gXG4gKiAtIGA8ZGl2IHRlbXBsYXRlPVwibmdJZiBjb25kaXRpb25cIj4uLi48L2Rpdj5gXG4gKiAtIGA8dGVtcGxhdGUgW25nSWZdPVwiY29uZGl0aW9uXCI+PGRpdj4uLi48L2Rpdj48L3RlbXBsYXRlPmBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdJZl0nLCBpbnB1dHM6IFsnbmdJZiddfSlcbmV4cG9ydCBjbGFzcyBOZ0lmIHtcbiAgcHJpdmF0ZSBfcHJldkNvbmRpdGlvbjogYm9vbGVhbiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmKSB7fVxuXG4gIHNldCBuZ0lmKG5ld0NvbmRpdGlvbjogYW55IC8qIGJvb2xlYW4gKi8pIHtcbiAgICBpZiAobmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMuX3ByZXZDb25kaXRpb24pIHx8ICF0aGlzLl9wcmV2Q29uZGl0aW9uKSkge1xuICAgICAgdGhpcy5fcHJldkNvbmRpdGlvbiA9IHRydWU7XG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZik7XG4gICAgfSBlbHNlIGlmICghbmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMuX3ByZXZDb25kaXRpb24pIHx8IHRoaXMuX3ByZXZDb25kaXRpb24pKSB7XG4gICAgICB0aGlzLl9wcmV2Q29uZGl0aW9uID0gZmFsc2U7XG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=