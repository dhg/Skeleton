var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
import { forwardRef, Provider, Attribute, Directive } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { Validators, NG_VALIDATORS } from '../validators';
import { NumberWrapper } from "angular2/src/facade/lang";
const REQUIRED_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useValue: Validators.required, multi: true }));
/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input ngControl="fullName" required>
 * ```
 */
export let RequiredValidator = class {
};
RequiredValidator = __decorate([
    Directive({
        selector: '[required][ngControl],[required][ngFormControl],[required][ngModel]',
        providers: [REQUIRED_VALIDATOR]
    }), 
    __metadata('design:paramtypes', [])
], RequiredValidator);
/**
 * Provivder which adds {@link MinLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='min'}
 */
const MIN_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => MinLengthValidator), multi: true }));
/**
 * A directive which installs the {@link MinLengthValidator} for any `ngControl`,
 * `ngFormControl`, or control with `ngModel` that also has a `minlength` attribute.
 */
export let MinLengthValidator = class {
    constructor(minLength) {
        this._validator = Validators.minLength(NumberWrapper.parseInt(minLength, 10));
    }
    validate(c) { return this._validator(c); }
};
MinLengthValidator = __decorate([
    Directive({
        selector: '[minlength][ngControl],[minlength][ngFormControl],[minlength][ngModel]',
        providers: [MIN_LENGTH_VALIDATOR]
    }),
    __param(0, Attribute("minlength")), 
    __metadata('design:paramtypes', [String])
], MinLengthValidator);
/**
 * Provider which adds {@link MaxLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
const MAX_LENGTH_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => MaxLengthValidator), multi: true }));
/**
 * A directive which installs the {@link MaxLengthValidator} for any `ngControl, `ngFormControl`,
 * or control with `ngModel` that also has a `maxlength` attribute.
 */
export let MaxLengthValidator = class {
    constructor(maxLength) {
        this._validator = Validators.maxLength(NumberWrapper.parseInt(maxLength, 10));
    }
    validate(c) { return this._validator(c); }
};
MaxLengthValidator = __decorate([
    Directive({
        selector: '[maxlength][ngControl],[maxlength][ngFormControl],[maxlength][ngModel]',
        providers: [MAX_LENGTH_VALIDATOR]
    }),
    __param(0, Attribute("maxlength")), 
    __metadata('design:paramtypes', [String])
], MaxLengthValidator);
/**
 * A Directive that adds the `pattern` validator to any controls marked with the
 * `pattern` attribute, via the {@link NG_VALIDATORS} binding. Uses attribute value
 * as the regex to validate Control value against.  Follows pattern attribute
 * semantics; i.e. regex must match entire Control value.
 *
 * ### Example
 *
 * ```
 * <input [ngControl]="fullName" pattern="[a-zA-Z ]*">
 * ```
 */
const PATTERN_VALIDATOR = CONST_EXPR(new Provider(NG_VALIDATORS, { useExisting: forwardRef(() => PatternValidator), multi: true }));
export let PatternValidator = class {
    constructor(pattern) {
        this._validator = Validators.pattern(pattern);
    }
    validate(c) { return this._validator(c); }
};
PatternValidator = __decorate([
    Directive({
        selector: '[pattern][ngControl],[pattern][ngFormControl],[pattern][ngModel]',
        providers: [PATTERN_VALIDATOR]
    }),
    __param(0, Attribute("pattern")), 
    __metadata('design:paramtypes', [String])
], PatternValidator);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbIlJlcXVpcmVkVmFsaWRhdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yLmNvbnN0cnVjdG9yIiwiTWluTGVuZ3RoVmFsaWRhdG9yLnZhbGlkYXRlIiwiTWF4TGVuZ3RoVmFsaWRhdG9yIiwiTWF4TGVuZ3RoVmFsaWRhdG9yLmNvbnN0cnVjdG9yIiwiTWF4TGVuZ3RoVmFsaWRhdG9yLnZhbGlkYXRlIiwiUGF0dGVyblZhbGlkYXRvciIsIlBhdHRlcm5WYWxpZGF0b3IuY29uc3RydWN0b3IiLCJQYXR0ZXJuVmFsaWRhdG9yLnZhbGlkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDakUsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxVQUFVLEVBQUUsYUFBYSxFQUFDLE1BQU0sZUFBZTtPQUdoRCxFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtBQXVCdEQsTUFBTSxrQkFBa0IsR0FDcEIsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLGFBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFMUY7Ozs7Ozs7OztHQVNHO0FBQ0g7QUFLQUEsQ0FBQ0E7QUFMRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxxRUFBcUU7UUFDL0UsU0FBUyxFQUFFLENBQUMsa0JBQWtCLENBQUM7S0FDaEMsQ0FBQzs7c0JBRUQ7QUFPRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FDbkMsSUFBSSxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVuRzs7O0dBR0c7QUFDSDtJQU9FQyxZQUFvQ0EsU0FBaUJBO1FBQ25EQyxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQsUUFBUUEsQ0FBQ0EsQ0FBa0JBLElBQTBCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNuRkYsQ0FBQ0E7QUFaRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSx3RUFBd0U7UUFDbEYsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7S0FDbEMsQ0FBQztJQUlZLFdBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBOzt1QkFLcEM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FDbkMsSUFBSSxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVuRzs7O0dBR0c7QUFDSDtJQU9FRyxZQUFvQ0EsU0FBaUJBO1FBQ25EQyxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQsUUFBUUEsQ0FBQ0EsQ0FBa0JBLElBQTBCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNuRkYsQ0FBQ0E7QUFaRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSx3RUFBd0U7UUFDbEYsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7S0FDbEMsQ0FBQztJQUlZLFdBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBOzt1QkFLcEM7QUFHRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUNoQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pHO0lBT0VHLFlBQWtDQSxPQUFlQTtRQUMvQ0MsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDaERBLENBQUNBO0lBRURELFFBQVFBLENBQUNBLENBQWtCQSxJQUEwQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDbkZGLENBQUNBO0FBWkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsa0VBQWtFO1FBQzVFLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQy9CLENBQUM7SUFJWSxXQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQTs7cUJBS2xDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2ZvcndhcmRSZWYsIFByb3ZpZGVyLCBBdHRyaWJ1dGUsIERpcmVjdGl2ZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1ZhbGlkYXRvcnMsIE5HX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2x9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCAqIGFzIG1vZGVsTW9kdWxlIGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7TnVtYmVyV3JhcHBlcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG5cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgdGhhdCBjYW4gYmUgaW1wbGVtZW50ZWQgYnkgY2xhc3NlcyB0aGF0IGNhbiBhY3QgYXMgdmFsaWRhdG9ycy5cbiAqXG4gKiAjIyBVc2FnZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tjdXN0b20tdmFsaWRhdG9yXScsXG4gKiAgIHByb3ZpZGVyczogW3Byb3ZpZGUoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUsIG11bHRpOiB0cnVlfSldXG4gKiB9KVxuICogY2xhc3MgQ3VzdG9tVmFsaWRhdG9yRGlyZWN0aXZlIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAqICAgdmFsaWRhdGUoYzogQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAqICAgICByZXR1cm4ge1wiY3VzdG9tXCI6IHRydWV9O1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0b3IgeyB2YWxpZGF0ZShjOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fTsgfVxuXG5jb25zdCBSRVFVSVJFRF9WQUxJREFUT1IgPVxuICAgIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VWYWx1ZTogVmFsaWRhdG9ycy5yZXF1aXJlZCwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBEaXJlY3RpdmUgdGhhdCBhZGRzIHRoZSBgcmVxdWlyZWRgIHZhbGlkYXRvciB0byBhbnkgY29udHJvbHMgbWFya2VkIHdpdGggdGhlXG4gKiBgcmVxdWlyZWRgIGF0dHJpYnV0ZSwgdmlhIHRoZSB7QGxpbmsgTkdfVkFMSURBVE9SU30gYmluZGluZy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogPGlucHV0IG5nQ29udHJvbD1cImZ1bGxOYW1lXCIgcmVxdWlyZWQ+XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3JlcXVpcmVkXVtuZ0NvbnRyb2xdLFtyZXF1aXJlZF1bbmdGb3JtQ29udHJvbF0sW3JlcXVpcmVkXVtuZ01vZGVsXScsXG4gIHByb3ZpZGVyczogW1JFUVVJUkVEX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgUmVxdWlyZWRWYWxpZGF0b3Ige1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRvckZuIHsgKGM6IEFic3RyYWN0Q29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9OyB9XG5leHBvcnQgaW50ZXJmYWNlIEFzeW5jVmFsaWRhdG9yRm4ge1xuICAoYzogQWJzdHJhY3RDb250cm9sKTogYW55IC8qUHJvbWlzZTx7W2tleTogc3RyaW5nXTogYW55fT58T2JzZXJ2YWJsZTx7W2tleTogc3RyaW5nXTogYW55fT4qLztcbn1cblxuLyoqXG4gKiBQcm92aXZkZXIgd2hpY2ggYWRkcyB7QGxpbmsgTWluTGVuZ3RoVmFsaWRhdG9yfSB0byB7QGxpbmsgTkdfVkFMSURBVE9SU30uXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL2Zvcm1zL3RzL3ZhbGlkYXRvcnMvdmFsaWRhdG9ycy50cyByZWdpb249J21pbid9XG4gKi9cbmNvbnN0IE1JTl9MRU5HVEhfVkFMSURBVE9SID0gQ09OU1RfRVhQUihcbiAgICBuZXcgUHJvdmlkZXIoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1pbkxlbmd0aFZhbGlkYXRvciksIG11bHRpOiB0cnVlfSkpO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHdoaWNoIGluc3RhbGxzIHRoZSB7QGxpbmsgTWluTGVuZ3RoVmFsaWRhdG9yfSBmb3IgYW55IGBuZ0NvbnRyb2xgLFxuICogYG5nRm9ybUNvbnRyb2xgLCBvciBjb250cm9sIHdpdGggYG5nTW9kZWxgIHRoYXQgYWxzbyBoYXMgYSBgbWlubGVuZ3RoYCBhdHRyaWJ1dGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttaW5sZW5ndGhdW25nQ29udHJvbF0sW21pbmxlbmd0aF1bbmdGb3JtQ29udHJvbF0sW21pbmxlbmd0aF1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtNSU5fTEVOR1RIX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgTWluTGVuZ3RoVmFsaWRhdG9yIGltcGxlbWVudHMgVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbjtcblxuICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKFwibWlubGVuZ3RoXCIpIG1pbkxlbmd0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5taW5MZW5ndGgoTnVtYmVyV3JhcHBlci5wYXJzZUludChtaW5MZW5ndGgsIDEwKSk7XG4gIH1cblxuICB2YWxpZGF0ZShjOiBBYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLl92YWxpZGF0b3IoYyk7IH1cbn1cblxuLyoqXG4gKiBQcm92aWRlciB3aGljaCBhZGRzIHtAbGluayBNYXhMZW5ndGhWYWxpZGF0b3J9IHRvIHtAbGluayBOR19WQUxJREFUT1JTfS5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vZm9ybXMvdHMvdmFsaWRhdG9ycy92YWxpZGF0b3JzLnRzIHJlZ2lvbj0nbWF4J31cbiAqL1xuY29uc3QgTUFYX0xFTkdUSF9WQUxJREFUT1IgPSBDT05TVF9FWFBSKFxuICAgIG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF4TGVuZ3RoVmFsaWRhdG9yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hpY2ggaW5zdGFsbHMgdGhlIHtAbGluayBNYXhMZW5ndGhWYWxpZGF0b3J9IGZvciBhbnkgYG5nQ29udHJvbCwgYG5nRm9ybUNvbnRyb2xgLFxuICogb3IgY29udHJvbCB3aXRoIGBuZ01vZGVsYCB0aGF0IGFsc28gaGFzIGEgYG1heGxlbmd0aGAgYXR0cmlidXRlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF4bGVuZ3RoXVtuZ0NvbnRyb2xdLFttYXhsZW5ndGhdW25nRm9ybUNvbnRyb2xdLFttYXhsZW5ndGhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX0xFTkdUSF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIE1heExlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogVmFsaWRhdG9yRm47XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSBtYXhMZW5ndGg6IHN0cmluZykge1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMubWF4TGVuZ3RoKE51bWJlcldyYXBwZXIucGFyc2VJbnQobWF4TGVuZ3RoLCAxMCkpO1xuICB9XG5cbiAgdmFsaWRhdGUoYzogQWJzdHJhY3RDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fdmFsaWRhdG9yKGMpOyB9XG59XG5cblxuLyoqXG4gKiBBIERpcmVjdGl2ZSB0aGF0IGFkZHMgdGhlIGBwYXR0ZXJuYCB2YWxpZGF0b3IgdG8gYW55IGNvbnRyb2xzIG1hcmtlZCB3aXRoIHRoZVxuICogYHBhdHRlcm5gIGF0dHJpYnV0ZSwgdmlhIHRoZSB7QGxpbmsgTkdfVkFMSURBVE9SU30gYmluZGluZy4gVXNlcyBhdHRyaWJ1dGUgdmFsdWVcbiAqIGFzIHRoZSByZWdleCB0byB2YWxpZGF0ZSBDb250cm9sIHZhbHVlIGFnYWluc3QuICBGb2xsb3dzIHBhdHRlcm4gYXR0cmlidXRlXG4gKiBzZW1hbnRpY3M7IGkuZS4gcmVnZXggbXVzdCBtYXRjaCBlbnRpcmUgQ29udHJvbCB2YWx1ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogPGlucHV0IFtuZ0NvbnRyb2xdPVwiZnVsbE5hbWVcIiBwYXR0ZXJuPVwiW2EtekEtWiBdKlwiPlxuICogYGBgXG4gKi9cbmNvbnN0IFBBVFRFUk5fVkFMSURBVE9SID0gQ09OU1RfRVhQUihcbiAgICBuZXcgUHJvdmlkZXIoTkdfVkFMSURBVE9SUywge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFBhdHRlcm5WYWxpZGF0b3IpLCBtdWx0aTogdHJ1ZX0pKTtcbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1twYXR0ZXJuXVtuZ0NvbnRyb2xdLFtwYXR0ZXJuXVtuZ0Zvcm1Db250cm9sXSxbcGF0dGVybl1bbmdNb2RlbF0nLFxuICBwcm92aWRlcnM6IFtQQVRURVJOX1ZBTElEQVRPUl1cbn0pXG5leHBvcnQgY2xhc3MgUGF0dGVyblZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogVmFsaWRhdG9yRm47XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZShcInBhdHRlcm5cIikgcGF0dGVybjogc3RyaW5nKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5wYXR0ZXJuKHBhdHRlcm4pO1xuICB9XG5cbiAgdmFsaWRhdGUoYzogQWJzdHJhY3RDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fdmFsaWRhdG9yKGMpOyB9XG59XG4iXX0=