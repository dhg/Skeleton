import { AbstractControl } from '../model';
import * as modelModule from '../model';
/**
 * An interface that can be implemented by classes that can act as validators.
 *
 * ## Usage
 *
 * ```typescript
 * @Directive({
 *   selector: '[custom-validator]',
 *   providers: [provide(NG_VALIDATORS, {useExisting: CustomValidatorDirective, multi: true})]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(c: Control): {[key: string]: any} {
 *     return {"custom": true};
 *   }
 * }
 * ```
 */
export interface Validator {
    validate(c: modelModule.AbstractControl): {
        [key: string]: any;
    };
}
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
export declare class RequiredValidator {
}
export interface ValidatorFn {
    (c: AbstractControl): {
        [key: string]: any;
    };
}
export interface AsyncValidatorFn {
    (c: AbstractControl): any;
}
/**
 * A directive which installs the {@link MinLengthValidator} for any `ngControl`,
 * `ngFormControl`, or control with `ngModel` that also has a `minlength` attribute.
 */
export declare class MinLengthValidator implements Validator {
    private _validator;
    constructor(minLength: string);
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}
/**
 * A directive which installs the {@link MaxLengthValidator} for any `ngControl, `ngFormControl`,
 * or control with `ngModel` that also has a `maxlength` attribute.
 */
export declare class MaxLengthValidator implements Validator {
    private _validator;
    constructor(maxLength: string);
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}
export declare class PatternValidator implements Validator {
    private _validator;
    constructor(pattern: string);
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}
