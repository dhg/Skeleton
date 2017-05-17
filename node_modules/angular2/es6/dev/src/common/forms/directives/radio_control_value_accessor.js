var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ElementRef, Renderer, forwardRef, Provider, Input, Injector, Injectable } from 'angular2/core';
import { NG_VALUE_ACCESSOR } from 'angular2/src/common/forms/directives/control_value_accessor';
import { NgControl } from 'angular2/src/common/forms/directives/ng_control';
import { CONST_EXPR, isPresent } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
const RADIO_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => RadioControlValueAccessor), multi: true }));
/**
 * Internal class used by Angular to uncheck radio buttons with the matching name.
 */
export let RadioControlRegistry = class {
    constructor() {
        this._accessors = [];
    }
    add(control, accessor) {
        this._accessors.push([control, accessor]);
    }
    remove(accessor) {
        var indexToRemove = -1;
        for (var i = 0; i < this._accessors.length; ++i) {
            if (this._accessors[i][1] === accessor) {
                indexToRemove = i;
            }
        }
        ListWrapper.removeAt(this._accessors, indexToRemove);
    }
    select(accessor) {
        this._accessors.forEach((c) => {
            if (c[0].control.root === accessor._control.control.root && c[1] !== accessor) {
                c[1].fireUncheck();
            }
        });
    }
};
RadioControlRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], RadioControlRegistry);
/**
 * The value provided by the forms API for radio buttons.
 */
export class RadioButtonState {
    constructor(checked, value) {
        this.checked = checked;
        this.value = value;
    }
}
/**
 * The accessor for writing a radio control value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  @Component({
 *    template: `
 *      <input type="radio" name="food" [(ngModel)]="foodChicken">
 *      <input type="radio" name="food" [(ngModel)]="foodFish">
 *    `
 *  })
 *  class FoodCmp {
 *    foodChicken = new RadioButtonState(true, "chicken");
 *    foodFish = new RadioButtonState(false, "fish");
 *  }
 *  ```
 */
export let RadioControlValueAccessor = class {
    constructor(_renderer, _elementRef, _registry, _injector) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this._registry = _registry;
        this._injector = _injector;
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    ngOnInit() {
        this._control = this._injector.get(NgControl);
        this._registry.add(this._control, this);
    }
    ngOnDestroy() { this._registry.remove(this); }
    writeValue(value) {
        this._state = value;
        if (isPresent(value) && value.checked) {
            this._renderer.setElementProperty(this._elementRef.nativeElement, 'checked', true);
        }
    }
    registerOnChange(fn) {
        this._fn = fn;
        this.onChange = () => {
            fn(new RadioButtonState(true, this._state.value));
            this._registry.select(this);
        };
    }
    fireUncheck() { this._fn(new RadioButtonState(false, this._state.value)); }
    registerOnTouched(fn) { this.onTouched = fn; }
};
__decorate([
    Input(), 
    __metadata('design:type', String)
], RadioControlValueAccessor.prototype, "name", void 0);
RadioControlValueAccessor = __decorate([
    Directive({
        selector: 'input[type=radio][ngControl],input[type=radio][ngFormControl],input[type=radio][ngModel]',
        host: { '(change)': 'onChange()', '(blur)': 'onTouched()' },
        providers: [RADIO_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [Renderer, ElementRef, RadioControlRegistry, Injector])
], RadioControlValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW9fY29udHJvbF92YWx1ZV9hY2Nlc3Nvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9yYWRpb19jb250cm9sX3ZhbHVlX2FjY2Vzc29yLnRzIl0sIm5hbWVzIjpbIlJhZGlvQ29udHJvbFJlZ2lzdHJ5IiwiUmFkaW9Db250cm9sUmVnaXN0cnkuY29uc3RydWN0b3IiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5hZGQiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5yZW1vdmUiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5zZWxlY3QiLCJSYWRpb0J1dHRvblN0YXRlIiwiUmFkaW9CdXR0b25TdGF0ZS5jb25zdHJ1Y3RvciIsIlJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvci5uZ09uSW5pdCIsIlJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IubmdPbkRlc3Ryb3kiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2UiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLmZpcmVVbmNoZWNrIiwiUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uVG91Y2hlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFFBQVEsRUFFUixVQUFVLEVBQ1YsUUFBUSxFQUVSLEtBQUssRUFHTCxRQUFRLEVBQ1IsVUFBVSxFQUNYLE1BQU0sZUFBZTtPQUNmLEVBQ0wsaUJBQWlCLEVBRWxCLE1BQU0sNkRBQTZEO09BQzdELEVBQUMsU0FBUyxFQUFDLE1BQU0saURBQWlEO09BQ2xFLEVBQUMsVUFBVSxFQUFrQixTQUFTLEVBQUMsTUFBTSww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LEVBQVlBLElBQVVPLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ2hFUCxDQUFDQTtBQWpDQztJQUFDLEtBQUssRUFBRTs7R0FBQywyQ0FBSSxVQUFTO0FBVnhCO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUNKLDBGQUEwRjtRQUM5RixJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7UUFDekQsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7S0FDbEMsQ0FBQzs7OEJBc0NEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIFJlbmRlcmVyLFxuICBTZWxmLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgQXR0cmlidXRlLFxuICBJbnB1dCxcbiAgT25Jbml0LFxuICBPbkRlc3Ryb3ksXG4gIEluamVjdG9yLFxuICBJbmplY3RhYmxlXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtcbiAgTkdfVkFMVUVfQUNDRVNTT1IsXG4gIENvbnRyb2xWYWx1ZUFjY2Vzc29yXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfY29udHJvbCc7XG5pbXBvcnQge0NPTlNUX0VYUFIsIGxvb3NlSWRlbnRpY2FsLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5jb25zdCBSQURJT19WQUxVRV9BQ0NFU1NPUiA9IENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFxuICAgIE5HX1ZBTFVFX0FDQ0VTU09SLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUmFkaW9Db250cm9sVmFsdWVBY2Nlc3NvciksIG11bHRpOiB0cnVlfSkpO1xuXG5cbi8qKlxuICogSW50ZXJuYWwgY2xhc3MgdXNlZCBieSBBbmd1bGFyIHRvIHVuY2hlY2sgcmFkaW8gYnV0dG9ucyB3aXRoIHRoZSBtYXRjaGluZyBuYW1lLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmFkaW9Db250cm9sUmVnaXN0cnkge1xuICBwcml2YXRlIF9hY2Nlc3NvcnM6IGFueVtdID0gW107XG5cbiAgYWRkKGNvbnRyb2w6IE5nQ29udHJvbCwgYWNjZXNzb3I6IFJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IpIHtcbiAgICB0aGlzLl9hY2Nlc3NvcnMucHVzaChbY29udHJvbCwgYWNjZXNzb3JdKTtcbiAgfVxuXG4gIHJlbW92ZShhY2Nlc3NvcjogUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvcikge1xuICAgIHZhciBpbmRleFRvUmVtb3ZlID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hY2Nlc3NvcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh0aGlzLl9hY2Nlc3NvcnNbaV1bMV0gPT09IGFjY2Vzc29yKSB7XG4gICAgICAgIGluZGV4VG9SZW1vdmUgPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICBMaXN0V3JhcHBlci5yZW1vdmVBdCh0aGlzLl9hY2Nlc3NvcnMsIGluZGV4VG9SZW1vdmUpO1xuICB9XG5cbiAgc2VsZWN0KGFjY2Vzc29yOiBSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yKSB7XG4gICAgdGhpcy5fYWNjZXNzb3JzLmZvckVhY2goKGMpID0+IHtcbiAgICAgIGlmIChjWzBdLmNvbnRyb2wucm9vdCA9PT0gYWNjZXNzb3IuX2NvbnRyb2wuY29udHJvbC5yb290ICYmIGNbMV0gIT09IGFjY2Vzc29yKSB7XG4gICAgICAgIGNbMV0uZmlyZVVuY2hlY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSB2YWx1ZSBwcm92aWRlZCBieSB0aGUgZm9ybXMgQVBJIGZvciByYWRpbyBidXR0b25zLlxuICovXG5leHBvcnQgY2xhc3MgUmFkaW9CdXR0b25TdGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjaGVja2VkOiBib29sZWFuLCBwdWJsaWMgdmFsdWU6IHN0cmluZykge31cbn1cblxuXG4vKipcbiAqIFRoZSBhY2Nlc3NvciBmb3Igd3JpdGluZyBhIHJhZGlvIGNvbnRyb2wgdmFsdWUgYW5kIGxpc3RlbmluZyB0byBjaGFuZ2VzIHRoYXQgaXMgdXNlZCBieSB0aGVcbiAqIHtAbGluayBOZ01vZGVsfSwge0BsaW5rIE5nRm9ybUNvbnRyb2x9LCBhbmQge0BsaW5rIE5nQ29udHJvbE5hbWV9IGRpcmVjdGl2ZXMuXG4gKlxuICogICMjIyBFeGFtcGxlXG4gKiAgYGBgXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgICB0ZW1wbGF0ZTogYFxuICogICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImZvb2RcIiBbKG5nTW9kZWwpXT1cImZvb2RDaGlja2VuXCI+XG4gKiAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiZm9vZFwiIFsobmdNb2RlbCldPVwiZm9vZEZpc2hcIj5cbiAqICAgIGBcbiAqICB9KVxuICogIGNsYXNzIEZvb2RDbXAge1xuICogICAgZm9vZENoaWNrZW4gPSBuZXcgUmFkaW9CdXR0b25TdGF0ZSh0cnVlLCBcImNoaWNrZW5cIik7XG4gKiAgICBmb29kRmlzaCA9IG5ldyBSYWRpb0J1dHRvblN0YXRlKGZhbHNlLCBcImZpc2hcIik7XG4gKiAgfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6XG4gICAgICAnaW5wdXRbdHlwZT1yYWRpb11bbmdDb250cm9sXSxpbnB1dFt0eXBlPXJhZGlvXVtuZ0Zvcm1Db250cm9sXSxpbnB1dFt0eXBlPXJhZGlvXVtuZ01vZGVsXScsXG4gIGhvc3Q6IHsnKGNoYW5nZSknOiAnb25DaGFuZ2UoKScsICcoYmx1ciknOiAnb25Ub3VjaGVkKCknfSxcbiAgcHJvdmlkZXJzOiBbUkFESU9fVkFMVUVfQUNDRVNTT1JdXG59KVxuZXhwb3J0IGNsYXNzIFJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvcixcbiAgICBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIF9zdGF0ZTogUmFkaW9CdXR0b25TdGF0ZTtcbiAgX2NvbnRyb2w6IE5nQ29udHJvbDtcbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICBfZm46IEZ1bmN0aW9uO1xuICBvbkNoYW5nZSA9ICgpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3JlZ2lzdHJ5OiBSYWRpb0NvbnRyb2xSZWdpc3RyeSwgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRyb2wgPSB0aGlzLl9pbmplY3Rvci5nZXQoTmdDb250cm9sKTtcbiAgICB0aGlzLl9yZWdpc3RyeS5hZGQodGhpcy5fY29udHJvbCwgdGhpcyk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fcmVnaXN0cnkucmVtb3ZlKHRoaXMpOyB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fc3RhdGUgPSB2YWx1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHZhbHVlKSAmJiB2YWx1ZS5jaGVja2VkKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnY2hlY2tlZCcsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChfOiBhbnkpID0+IHt9KTogdm9pZCB7XG4gICAgdGhpcy5fZm4gPSBmbjtcbiAgICB0aGlzLm9uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgZm4obmV3IFJhZGlvQnV0dG9uU3RhdGUodHJ1ZSwgdGhpcy5fc3RhdGUudmFsdWUpKTtcbiAgICAgIHRoaXMuX3JlZ2lzdHJ5LnNlbGVjdCh0aGlzKTtcbiAgICB9O1xuICB9XG5cbiAgZmlyZVVuY2hlY2soKTogdm9pZCB7IHRoaXMuX2ZuKG5ldyBSYWRpb0J1dHRvblN0YXRlKGZhbHNlLCB0aGlzLl9zdGF0ZS52YWx1ZSkpOyB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cbn1cbiJdfQ==