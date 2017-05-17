'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var _WHEN_DEFAULT = lang_1.CONST_EXPR(new Object());
var SwitchView = (function () {
    function SwitchView(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
    }
    SwitchView.prototype.create = function () { this._viewContainerRef.createEmbeddedView(this._templateRef); };
    SwitchView.prototype.destroy = function () { this._viewContainerRef.clear(); };
    return SwitchView;
})();
exports.SwitchView = SwitchView;
/**
 * Adds or removes DOM sub-trees when their match expressions match the switch expression.
 *
 * Elements within `NgSwitch` but without `NgSwitchWhen` or `NgSwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `NgSwitch` simply inserts nested elements based on which match expression matches the value
 * obtained from the evaluated switch expression. In other words, you define a container element
 * (where you place the directive with a switch expression on the
 * **`[ngSwitch]="..."` attribute**), define any inner elements inside of the directive and
 * place a `[ngSwitchWhen]` attribute per element.
 *
 * The `ngSwitchWhen` property is used to inform `NgSwitch` which element to display when the
 * expression is evaluated. If a matching expression is not found via a `ngSwitchWhen` property
 * then an element with the `ngSwitchDefault` attribute is displayed.
 *
 * ### Example ([live demo](http://plnkr.co/edit/DQMTII95CbuqWrl3lYAs?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ngSwitch]="value">
 *       <p *ngSwitchWhen="'init'">increment to start</p>
 *       <p *ngSwitchWhen="0">0, increment again</p>
 *       <p *ngSwitchWhen="1">1, increment again</p>
 *       <p *ngSwitchWhen="2">2, stop incrementing</p>
 *       <p *ngSwitchDefault>&gt; 2, STOP!</p>
 *     </div>
 *
 *     <!-- alternate syntax -->
 *
 *     <p [ngSwitch]="value">
 *       <template ngSwitchWhen="init">increment to start</template>
 *       <template [ngSwitchWhen]="0">0, increment again</template>
 *       <template [ngSwitchWhen]="1">1, increment again</template>
 *       <template [ngSwitchWhen]="2">2, stop incrementing</template>
 *       <template ngSwitchDefault>&gt; 2, STOP!</template>
 *     </p>
 *   `,
 *   directives: [NgSwitch, NgSwitchWhen, NgSwitchDefault]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * bootstrap(App).catch(err => console.error(err));
 * ```
 */
var NgSwitch = (function () {
    function NgSwitch() {
        this._useDefault = false;
        this._valueViews = new collection_1.Map();
        this._activeViews = [];
    }
    Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
        set: function (value) {
            // Empty the currently active ViewContainers
            this._emptyAllActiveViews();
            // Add the ViewContainers matching the value (with a fallback to default)
            this._useDefault = false;
            var views = this._valueViews.get(value);
            if (lang_1.isBlank(views)) {
                this._useDefault = true;
                views = lang_1.normalizeBlank(this._valueViews.get(_WHEN_DEFAULT));
            }
            this._activateViews(views);
            this._switchValue = value;
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    NgSwitch.prototype._onWhenValueChanged = function (oldWhen, newWhen, view) {
        this._deregisterView(oldWhen, view);
        this._registerView(newWhen, view);
        if (oldWhen === this._switchValue) {
            view.destroy();
            collection_1.ListWrapper.remove(this._activeViews, view);
        }
        else if (newWhen === this._switchValue) {
            if (this._useDefault) {
                this._useDefault = false;
                this._emptyAllActiveViews();
            }
            view.create();
            this._activeViews.push(view);
        }
        // Switch to default when there is no more active ViewContainers
        if (this._activeViews.length === 0 && !this._useDefault) {
            this._useDefault = true;
            this._activateViews(this._valueViews.get(_WHEN_DEFAULT));
        }
    };
    /** @internal */
    NgSwitch.prototype._emptyAllActiveViews = function () {
        var activeContainers = this._activeViews;
        for (var i = 0; i < activeContainers.length; i++) {
            activeContainers[i].destroy();
        }
        this._activeViews = [];
    };
    /** @internal */
    NgSwitch.prototype._activateViews = function (views) {
        // TODO(vicb): assert(this._activeViews.length === 0);
        if (lang_1.isPresent(views)) {
            for (var i = 0; i < views.length; i++) {
                views[i].create();
            }
            this._activeViews = views;
        }
    };
    /** @internal */
    NgSwitch.prototype._registerView = function (value, view) {
        var views = this._valueViews.get(value);
        if (lang_1.isBlank(views)) {
            views = [];
            this._valueViews.set(value, views);
        }
        views.push(view);
    };
    /** @internal */
    NgSwitch.prototype._deregisterView = function (value, view) {
        // `_WHEN_DEFAULT` is used a marker for non-registered whens
        if (value === _WHEN_DEFAULT)
            return;
        var views = this._valueViews.get(value);
        if (views.length == 1) {
            this._valueViews.delete(value);
        }
        else {
            collection_1.ListWrapper.remove(views, view);
        }
    };
    NgSwitch = __decorate([
        core_1.Directive({ selector: '[ngSwitch]', inputs: ['ngSwitch'] }), 
        __metadata('design:paramtypes', [])
    ], NgSwitch);
    return NgSwitch;
})();
exports.NgSwitch = NgSwitch;
/**
 * Insert the sub-tree when the `ngSwitchWhen` expression evaluates to the same value as the
 * enclosing switch expression.
 *
 * If multiple match expression match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 */
var NgSwitchWhen = (function () {
    function NgSwitchWhen(viewContainer, templateRef, ngSwitch) {
        // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
        /** @internal */
        this._value = _WHEN_DEFAULT;
        this._switch = ngSwitch;
        this._view = new SwitchView(viewContainer, templateRef);
    }
    Object.defineProperty(NgSwitchWhen.prototype, "ngSwitchWhen", {
        set: function (value) {
            this._switch._onWhenValueChanged(this._value, value, this._view);
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    NgSwitchWhen = __decorate([
        core_1.Directive({ selector: '[ngSwitchWhen]', inputs: ['ngSwitchWhen'] }),
        __param(2, core_1.Host()), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, NgSwitch])
    ], NgSwitchWhen);
    return NgSwitchWhen;
})();
exports.NgSwitchWhen = NgSwitchWhen;
/**
 * Default case statements are displayed when no match expression matches the switch expression
 * value.
 *
 * See {@link NgSwitch} for more details and example.
 */
var NgSwitchDefault = (function () {
    function NgSwitchDefault(viewContainer, templateRef, sswitch) {
        sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
    }
    NgSwitchDefault = __decorate([
        core_1.Directive({ selector: '[ngSwitchDefault]' }),
        __param(2, core_1.Host()), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, NgSwitch])
    ], NgSwitchDefault);
    return NgSwitchDefault;
})();
exports.NgSwitchDefault = NgSwitchDefault;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6WyJTd2l0Y2hWaWV3IiwiU3dpdGNoVmlldy5jb25zdHJ1Y3RvciIsIlN3aXRjaFZpZXcuY3JlYXRlIiwiU3dpdGNoVmlldy5kZXN0cm95IiwiTmdTd2l0Y2giLCJOZ1N3aXRjaC5jb25zdHJ1Y3RvciIsIk5nU3dpdGNoLm5nU3dpdGNoIiwiTmdTd2l0Y2guX29uV2hlblZhbHVlQ2hhbmdlZCIsIk5nU3dpdGNoLl9lbXB0eUFsbEFjdGl2ZVZpZXdzIiwiTmdTd2l0Y2guX2FjdGl2YXRlVmlld3MiLCJOZ1N3aXRjaC5fcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2guX2RlcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2hXaGVuIiwiTmdTd2l0Y2hXaGVuLmNvbnN0cnVjdG9yIiwiTmdTd2l0Y2hXaGVuLm5nU3dpdGNoV2hlbiIsIk5nU3dpdGNoRGVmYXVsdCIsIk5nU3dpdGNoRGVmYXVsdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTZELGVBQWUsQ0FBQyxDQUFBO0FBQzdFLHFCQUE2RCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3hGLDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRWhFLElBQU0sYUFBYSxHQUFHLGlCQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRS9DO0lBQ0VBLG9CQUFvQkEsaUJBQW1DQSxFQUFVQSxZQUF5QkE7UUFBdEVDLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO1FBQVVBLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFhQTtJQUFHQSxDQUFDQTtJQUU5RkQsMkJBQU1BLEdBQU5BLGNBQWlCRSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FB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QSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNuRkEsQ0FBQ0E7SUFMSEQ7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLG1CQUFtQkEsRUFBQ0EsQ0FBQ0E7UUFHN0JBLFdBQUNBLFdBQUlBLEVBQUVBLENBQUFBOzt3QkFHcEJBO0lBQURBLHNCQUFDQTtBQUFEQSxDQUFDQSxBQU5ELElBTUM7QUFMWSx1QkFBZSxrQkFLM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBIb3N0LCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmNvbnN0IF9XSEVOX0RFRkFVTFQgPSBDT05TVF9FWFBSKG5ldyBPYmplY3QoKSk7XG5cbmV4cG9ydCBjbGFzcyBTd2l0Y2hWaWV3IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmKSB7fVxuXG4gIGNyZWF0ZSgpOiB2b2lkIHsgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpOyB9XG59XG5cbi8qKlxuICogQWRkcyBvciByZW1vdmVzIERPTSBzdWItdHJlZXMgd2hlbiB0aGVpciBtYXRjaCBleHByZXNzaW9ucyBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogRWxlbWVudHMgd2l0aGluIGBOZ1N3aXRjaGAgYnV0IHdpdGhvdXQgYE5nU3dpdGNoV2hlbmAgb3IgYE5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlcyB3aWxsIGJlXG4gKiBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uIGFzIHNwZWNpZmllZCBpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogYE5nU3dpdGNoYCBzaW1wbHkgaW5zZXJ0cyBuZXN0ZWQgZWxlbWVudHMgYmFzZWQgb24gd2hpY2ggbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSB2YWx1ZVxuICogb2J0YWluZWQgZnJvbSB0aGUgZXZhbHVhdGVkIHN3aXRjaCBleHByZXNzaW9uLiBJbiBvdGhlciB3b3JkcywgeW91IGRlZmluZSBhIGNvbnRhaW5lciBlbGVtZW50XG4gKiAod2hlcmUgeW91IHBsYWNlIHRoZSBkaXJlY3RpdmUgd2l0aCBhIHN3aXRjaCBleHByZXNzaW9uIG9uIHRoZVxuICogKipgW25nU3dpdGNoXT1cIi4uLlwiYCBhdHRyaWJ1dGUqKiksIGRlZmluZSBhbnkgaW5uZXIgZWxlbWVudHMgaW5zaWRlIG9mIHRoZSBkaXJlY3RpdmUgYW5kXG4gKiBwbGFjZSBhIGBbbmdTd2l0Y2hXaGVuXWAgYXR0cmlidXRlIHBlciBlbGVtZW50LlxuICpcbiAqIFRoZSBgbmdTd2l0Y2hXaGVuYCBwcm9wZXJ0eSBpcyB1c2VkIHRvIGluZm9ybSBgTmdTd2l0Y2hgIHdoaWNoIGVsZW1lbnQgdG8gZGlzcGxheSB3aGVuIHRoZVxuICogZXhwcmVzc2lvbiBpcyBldmFsdWF0ZWQuIElmIGEgbWF0Y2hpbmcgZXhwcmVzc2lvbiBpcyBub3QgZm91bmQgdmlhIGEgYG5nU3dpdGNoV2hlbmAgcHJvcGVydHlcbiAqIHRoZW4gYW4gZWxlbWVudCB3aXRoIHRoZSBgbmdTd2l0Y2hEZWZhdWx0YCBhdHRyaWJ1dGUgaXMgZGlzcGxheWVkLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9EUU1USUk5NUNidXFXcmwzbFlBcz9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPHA+VmFsdWUgPSB7e3ZhbHVlfX08L3A+XG4gKiAgICAgPGJ1dHRvbiAoY2xpY2spPVwiaW5jKClcIj5JbmNyZW1lbnQ8L2J1dHRvbj5cbiAqXG4gKiAgICAgPGRpdiBbbmdTd2l0Y2hdPVwidmFsdWVcIj5cbiAqICAgICAgIDxwICpuZ1N3aXRjaFdoZW49XCInaW5pdCdcIj5pbmNyZW1lbnQgdG8gc3RhcnQ8L3A+XG4gKiAgICAgICA8cCAqbmdTd2l0Y2hXaGVuPVwiMFwiPjAsIGluY3JlbWVudCBhZ2FpbjwvcD5cbiAqICAgICAgIDxwICpuZ1N3aXRjaFdoZW49XCIxXCI+MSwgaW5jcmVtZW50IGFnYWluPC9wPlxuICogICAgICAgPHAgKm5nU3dpdGNoV2hlbj1cIjJcIj4yLCBzdG9wIGluY3JlbWVudGluZzwvcD5cbiAqICAgICAgIDxwICpuZ1N3aXRjaERlZmF1bHQ+Jmd0OyAyLCBTVE9QITwvcD5cbiAqICAgICA8L2Rpdj5cbiAqXG4gKiAgICAgPCEtLSBhbHRlcm5hdGUgc3ludGF4IC0tPlxuICpcbiAqICAgICA8cCBbbmdTd2l0Y2hdPVwidmFsdWVcIj5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1N3aXRjaFdoZW49XCJpbml0XCI+aW5jcmVtZW50IHRvIHN0YXJ0PC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBbbmdTd2l0Y2hXaGVuXT1cIjBcIj4wLCBpbmNyZW1lbnQgYWdhaW48L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIFtuZ1N3aXRjaFdoZW5dPVwiMVwiPjEsIGluY3JlbWVudCBhZ2FpbjwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgW25nU3dpdGNoV2hlbl09XCIyXCI+Miwgc3RvcCBpbmNyZW1lbnRpbmc8L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIG5nU3dpdGNoRGVmYXVsdD4mZ3Q7IDIsIFNUT1AhPC90ZW1wbGF0ZT5cbiAqICAgICA8L3A+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtOZ1N3aXRjaCwgTmdTd2l0Y2hXaGVuLCBOZ1N3aXRjaERlZmF1bHRdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlID0gJ2luaXQnO1xuICpcbiAqICAgaW5jKCkge1xuICogICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID09PSAnaW5pdCcgPyAwIDogdGhpcy52YWx1ZSArIDE7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKS5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaF0nLCBpbnB1dHM6IFsnbmdTd2l0Y2gnXX0pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2gge1xuICBwcml2YXRlIF9zd2l0Y2hWYWx1ZTogYW55O1xuICBwcml2YXRlIF91c2VEZWZhdWx0OiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3ZhbHVlVmlld3MgPSBuZXcgTWFwPGFueSwgU3dpdGNoVmlld1tdPigpO1xuICBwcml2YXRlIF9hY3RpdmVWaWV3czogU3dpdGNoVmlld1tdID0gW107XG5cbiAgc2V0IG5nU3dpdGNoKHZhbHVlOiBhbnkpIHtcbiAgICAvLyBFbXB0eSB0aGUgY3VycmVudGx5IGFjdGl2ZSBWaWV3Q29udGFpbmVyc1xuICAgIHRoaXMuX2VtcHR5QWxsQWN0aXZlVmlld3MoKTtcblxuICAgIC8vIEFkZCB0aGUgVmlld0NvbnRhaW5lcnMgbWF0Y2hpbmcgdGhlIHZhbHVlICh3aXRoIGEgZmFsbGJhY2sgdG8gZGVmYXVsdClcbiAgICB0aGlzLl91c2VEZWZhdWx0ID0gZmFsc2U7XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fdmFsdWVWaWV3cy5nZXQodmFsdWUpO1xuICAgIGlmIChpc0JsYW5rKHZpZXdzKSkge1xuICAgICAgdGhpcy5fdXNlRGVmYXVsdCA9IHRydWU7XG4gICAgICB2aWV3cyA9IG5vcm1hbGl6ZUJsYW5rKHRoaXMuX3ZhbHVlVmlld3MuZ2V0KF9XSEVOX0RFRkFVTFQpKTtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZhdGVWaWV3cyh2aWV3cyk7XG5cbiAgICB0aGlzLl9zd2l0Y2hWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfb25XaGVuVmFsdWVDaGFuZ2VkKG9sZFdoZW46IGFueSwgbmV3V2hlbjogYW55LCB2aWV3OiBTd2l0Y2hWaWV3KTogdm9pZCB7XG4gICAgdGhpcy5fZGVyZWdpc3RlclZpZXcob2xkV2hlbiwgdmlldyk7XG4gICAgdGhpcy5fcmVnaXN0ZXJWaWV3KG5ld1doZW4sIHZpZXcpO1xuXG4gICAgaWYgKG9sZFdoZW4gPT09IHRoaXMuX3N3aXRjaFZhbHVlKSB7XG4gICAgICB2aWV3LmRlc3Ryb3koKTtcbiAgICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9hY3RpdmVWaWV3cywgdmlldyk7XG4gICAgfSBlbHNlIGlmIChuZXdXaGVuID09PSB0aGlzLl9zd2l0Y2hWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX3VzZURlZmF1bHQpIHtcbiAgICAgICAgdGhpcy5fdXNlRGVmYXVsdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9lbXB0eUFsbEFjdGl2ZVZpZXdzKCk7XG4gICAgICB9XG4gICAgICB2aWV3LmNyZWF0ZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlVmlld3MucHVzaCh2aWV3KTtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2ggdG8gZGVmYXVsdCB3aGVuIHRoZXJlIGlzIG5vIG1vcmUgYWN0aXZlIFZpZXdDb250YWluZXJzXG4gICAgaWYgKHRoaXMuX2FjdGl2ZVZpZXdzLmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5fdXNlRGVmYXVsdCkge1xuICAgICAgdGhpcy5fdXNlRGVmYXVsdCA9IHRydWU7XG4gICAgICB0aGlzLl9hY3RpdmF0ZVZpZXdzKHRoaXMuX3ZhbHVlVmlld3MuZ2V0KF9XSEVOX0RFRkFVTFQpKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9lbXB0eUFsbEFjdGl2ZVZpZXdzKCk6IHZvaWQge1xuICAgIHZhciBhY3RpdmVDb250YWluZXJzID0gdGhpcy5fYWN0aXZlVmlld3M7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVDb250YWluZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhY3RpdmVDb250YWluZXJzW2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlVmlld3MgPSBbXTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FjdGl2YXRlVmlld3Modmlld3M6IFN3aXRjaFZpZXdbXSk6IHZvaWQge1xuICAgIC8vIFRPRE8odmljYik6IGFzc2VydCh0aGlzLl9hY3RpdmVWaWV3cy5sZW5ndGggPT09IDApO1xuICAgIGlmIChpc1ByZXNlbnQodmlld3MpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZpZXdzW2ldLmNyZWF0ZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fYWN0aXZlVmlld3MgPSB2aWV3cztcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWdpc3RlclZpZXcodmFsdWU6IGFueSwgdmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIHZhciB2aWV3cyA9IHRoaXMuX3ZhbHVlVmlld3MuZ2V0KHZhbHVlKTtcbiAgICBpZiAoaXNCbGFuayh2aWV3cykpIHtcbiAgICAgIHZpZXdzID0gW107XG4gICAgICB0aGlzLl92YWx1ZVZpZXdzLnNldCh2YWx1ZSwgdmlld3MpO1xuICAgIH1cbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGVyZWdpc3RlclZpZXcodmFsdWU6IGFueSwgdmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIC8vIGBfV0hFTl9ERUZBVUxUYCBpcyB1c2VkIGEgbWFya2VyIGZvciBub24tcmVnaXN0ZXJlZCB3aGVuc1xuICAgIGlmICh2YWx1ZSA9PT0gX1dIRU5fREVGQVVMVCkgcmV0dXJuO1xuICAgIHZhciB2aWV3cyA9IHRoaXMuX3ZhbHVlVmlld3MuZ2V0KHZhbHVlKTtcbiAgICBpZiAodmlld3MubGVuZ3RoID09IDEpIHtcbiAgICAgIHRoaXMuX3ZhbHVlVmlld3MuZGVsZXRlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHZpZXdzLCB2aWV3KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIHN1Yi10cmVlIHdoZW4gdGhlIGBuZ1N3aXRjaFdoZW5gIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoZVxuICogZW5jbG9zaW5nIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIElmIG11bHRpcGxlIG1hdGNoIGV4cHJlc3Npb24gbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uIHZhbHVlLCBhbGwgb2YgdGhlbSBhcmUgZGlzcGxheWVkLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoV2hlbl0nLCBpbnB1dHM6IFsnbmdTd2l0Y2hXaGVuJ119KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoV2hlbiB7XG4gIC8vIGBfV0hFTl9ERUZBVUxUYCBpcyB1c2VkIGFzIGEgbWFya2VyIGZvciBhIG5vdCB5ZXQgaW5pdGlhbGl6ZWQgdmFsdWVcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmFsdWU6IGFueSA9IF9XSEVOX0RFRkFVTFQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXc6IFN3aXRjaFZpZXc7XG4gIHByaXZhdGUgX3N3aXRjaDogTmdTd2l0Y2g7XG5cbiAgY29uc3RydWN0b3Iodmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmLFxuICAgICAgICAgICAgICBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIHRoaXMuX3N3aXRjaCA9IG5nU3dpdGNoO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBzZXQgbmdTd2l0Y2hXaGVuKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9zd2l0Y2guX29uV2hlblZhbHVlQ2hhbmdlZCh0aGlzLl92YWx1ZSwgdmFsdWUsIHRoaXMuX3ZpZXcpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IGNhc2Ugc3RhdGVtZW50cyBhcmUgZGlzcGxheWVkIHdoZW4gbm8gbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdmFsdWUuXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZixcbiAgICAgICAgICAgICAgQEhvc3QoKSBzc3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIHNzd2l0Y2guX3JlZ2lzdGVyVmlldyhfV0hFTl9ERUZBVUxULCBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZikpO1xuICB9XG59XG4iXX0=