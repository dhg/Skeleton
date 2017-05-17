'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var collection_1 = require('angular2/src/facade/collection');
/**
 * The `NgClass` directive conditionally adds and removes CSS classes on an HTML element based on
 * an expression's evaluation result.
 *
 * The result of an expression evaluation is interpreted differently depending on type of
 * the expression evaluation result:
 * - `string` - all the CSS classes listed in a string (space delimited) are added
 * - `Array` - all the CSS classes (Array elements) are added
 * - `Object` - each key corresponds to a CSS class name while values are interpreted as expressions
 * evaluating to `Boolean`. If a given expression evaluates to `true` a corresponding CSS class
 * is added - otherwise it is removed.
 *
 * While the `NgClass` directive can interpret expressions evaluating to `string`, `Array`
 * or `Object`, the `Object`-based version is the most often used and has an advantage of keeping
 * all the CSS class names in a template.
 *
 * ### Example ([live demo](http://plnkr.co/edit/a4YdtmWywhJ33uqfpPPn?p=preview)):
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {NgClass} from 'angular2/common';
 *
 * @Component({
 *   selector: 'toggle-button',
 *   inputs: ['isDisabled'],
 *   template: `
 *      <div class="button" [ngClass]="{active: isOn, disabled: isDisabled}"
 *          (click)="toggle(!isOn)">
 *          Click me!
 *      </div>`,
 *   styles: [`
 *     .button {
 *       width: 120px;
 *       border: medium solid black;
 *     }
 *
 *     .active {
 *       background-color: red;
 *    }
 *
 *     .disabled {
 *       color: gray;
 *       border: medium solid gray;
 *     }
 *   `]
 *   directives: [NgClass]
 * })
 * class ToggleButton {
 *   isOn = false;
 *   isDisabled = false;
 *
 *   toggle(newState) {
 *     if (!this.isDisabled) {
 *       this.isOn = newState;
 *     }
 *   }
 * }
 * ```
 */
var NgClass = (function () {
    function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    Object.defineProperty(NgClass.prototype, "initialClasses", {
        set: function (v) {
            this._applyInitialClasses(true);
            this._initialClasses = lang_1.isPresent(v) && lang_1.isString(v) ? v.split(' ') : [];
            this._applyInitialClasses(false);
            this._applyClasses(this._rawClass, false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgClass.prototype, "rawClass", {
        set: function (v) {
            this._cleanupClasses(this._rawClass);
            if (lang_1.isString(v)) {
                v = v.split(' ');
            }
            this._rawClass = v;
            this._iterableDiffer = null;
            this._keyValueDiffer = null;
            if (lang_1.isPresent(v)) {
                if (collection_1.isListLikeIterable(v)) {
                    this._iterableDiffer = this._iterableDiffers.find(v).create(null);
                }
                else {
                    this._keyValueDiffer = this._keyValueDiffers.find(v).create(null);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    NgClass.prototype.ngDoCheck = function () {
        if (lang_1.isPresent(this._iterableDiffer)) {
            var changes = this._iterableDiffer.diff(this._rawClass);
            if (lang_1.isPresent(changes)) {
                this._applyIterableChanges(changes);
            }
        }
        if (lang_1.isPresent(this._keyValueDiffer)) {
            var changes = this._keyValueDiffer.diff(this._rawClass);
            if (lang_1.isPresent(changes)) {
                this._applyKeyValueChanges(changes);
            }
        }
    };
    NgClass.prototype.ngOnDestroy = function () { this._cleanupClasses(this._rawClass); };
    NgClass.prototype._cleanupClasses = function (rawClassVal) {
        this._applyClasses(rawClassVal, true);
        this._applyInitialClasses(false);
    };
    NgClass.prototype._applyKeyValueChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
        changes.forEachRemovedItem(function (record) {
            if (record.previousValue) {
                _this._toggleClass(record.key, false);
            }
        });
    };
    NgClass.prototype._applyIterableChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._toggleClass(record.item, true); });
        changes.forEachRemovedItem(function (record) { _this._toggleClass(record.item, false); });
    };
    NgClass.prototype._applyInitialClasses = function (isCleanup) {
        var _this = this;
        this._initialClasses.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
    };
    NgClass.prototype._applyClasses = function (rawClassVal, isCleanup) {
        var _this = this;
        if (lang_1.isPresent(rawClassVal)) {
            if (lang_1.isArray(rawClassVal)) {
                rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
            }
            else if (rawClassVal instanceof Set) {
                rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
            }
            else {
                collection_1.StringMapWrapper.forEach(rawClassVal, function (expVal, className) {
                    if (lang_1.isPresent(expVal))
                        _this._toggleClass(className, !isCleanup);
                });
            }
        }
    };
    NgClass.prototype._toggleClass = function (className, enabled) {
        className = className.trim();
        if (className.length > 0) {
            if (className.indexOf(' ') > -1) {
                var classes = className.split(/\s+/g);
                for (var i = 0, len = classes.length; i < len; i++) {
                    this._renderer.setElementClass(this._ngEl.nativeElement, classes[i], enabled);
                }
            }
            else {
                this._renderer.setElementClass(this._ngEl.nativeElement, className, enabled);
            }
        }
    };
    NgClass = __decorate([
        core_1.Directive({ selector: '[ngClass]', inputs: ['rawClass: ngClass', 'initialClasses: class'] }), 
        __metadata('design:paramtypes', [core_1.IterableDiffers, core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer])
    ], NgClass);
    return NgClass;
})();
exports.NgClass = NgClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOlsiTmdDbGFzcyIsIk5nQ2xhc3MuY29uc3RydWN0b3IiLCJOZ0NsYXNzLmluaXRpYWxDbGFzc2VzIiwiTmdDbGFzcy5yYXdDbGFzcyIsIk5nQ2xhc3MubmdEb0NoZWNrIiwiTmdDbGFzcy5uZ09uRGVzdHJveSIsIk5nQ2xhc3MuX2NsZWFudXBDbGFzc2VzIiwiTmdDbGFzcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMiLCJOZ0NsYXNzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyIsIk5nQ2xhc3MuX2FwcGx5SW5pdGlhbENsYXNzZXMiLCJOZ0NsYXNzLl9hcHBseUNsYXNzZXMiLCJOZ0NsYXNzLl90b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQTJDLDBCQUEwQixDQUFDLENBQUE7QUFDdEUscUJBWU8sZUFBZSxDQUFDLENBQUE7QUFDdkIsMkJBQW1ELGdDQUFnQyxDQUFDLENBQUE7QUFFcEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwREc7QUFDSDtJQU9FQSxpQkFBb0JBLGdCQUFpQ0EsRUFBVUEsZ0JBQWlDQSxFQUM1RUEsS0FBaUJBLEVBQVVBLFNBQW1CQTtRQUQ5Q0MscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFpQkE7UUFBVUEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFpQkE7UUFDNUVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVlBO1FBQVVBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBSjFEQSxvQkFBZUEsR0FBYUEsRUFBRUEsQ0FBQ0E7SUFJOEJBLENBQUNBO0lBRXRFRCxzQkFBSUEsbUNBQWNBO2FBQWxCQSxVQUFtQkEsQ0FBU0E7WUFDMUJFLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxlQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUN2RUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLENBQUNBOzs7T0FBQUY7SUFFREEsc0JBQUlBLDZCQUFRQTthQUFaQSxVQUFhQSxDQUF3REE7WUFDbkVHLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBRXJDQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaEJBLENBQUNBLEdBQVlBLENBQUVBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQzdCQSxDQUFDQTtZQUVEQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUEyQkEsQ0FBQ0EsQ0FBQ0E7WUFDM0NBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBO1lBQzVCQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNqQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsK0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDMUJBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQTs7O09BQUFIO0lBRURBLDJCQUFTQSxHQUFUQTtRQUNFSSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3RDQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3RDQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJ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QSxFQUFFQSxFQUFFQSxDQUFDQTtvQkFDbkRBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGFBQWFBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO2dCQUNoRkEsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGFBQWFBLEVBQUVBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1lBQy9FQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQTdHSFg7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLFdBQVdBLEVBQUVBLE1BQU1BLEVBQUVBLENBQUNBLG1CQUFtQkEsRUFBRUEsdUJBQXVCQSxDQUFDQSxFQUFDQSxDQUFDQTs7Z0JBOEcxRkE7SUFBREEsY0FBQ0E7QUFBREEsQ0FBQ0EsQUE5R0QsSUE4R0M7QUE3R1ksZUFBTyxVQTZHbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc1N0cmluZywgaXNBcnJheX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7XG4gIERvQ2hlY2ssXG4gIE9uRGVzdHJveSxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgUmVuZGVyZXIsXG4gIEl0ZXJhYmxlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcixcbiAgQ29sbGVjdGlvbkNoYW5nZVJlY29yZCxcbiAgS2V5VmFsdWVDaGFuZ2VSZWNvcmRcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIGlzTGlzdExpa2VJdGVyYWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBUaGUgYE5nQ2xhc3NgIGRpcmVjdGl2ZSBjb25kaXRpb25hbGx5IGFkZHMgYW5kIHJlbW92ZXMgQ1NTIGNsYXNzZXMgb24gYW4gSFRNTCBlbGVtZW50IGJhc2VkIG9uXG4gKiBhbiBleHByZXNzaW9uJ3MgZXZhbHVhdGlvbiByZXN1bHQuXG4gKlxuICogVGhlIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uIGV2YWx1YXRpb24gaXMgaW50ZXJwcmV0ZWQgZGlmZmVyZW50bHkgZGVwZW5kaW5nIG9uIHR5cGUgb2ZcbiAqIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb24gcmVzdWx0OlxuICogLSBgc3RyaW5nYCAtIGFsbCB0aGUgQ1NTIGNsYXNzZXMgbGlzdGVkIGluIGEgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZFxuICogLSBgQXJyYXlgIC0gYWxsIHRoZSBDU1MgY2xhc3NlcyAoQXJyYXkgZWxlbWVudHMpIGFyZSBhZGRlZFxuICogLSBgT2JqZWN0YCAtIGVhY2gga2V5IGNvcnJlc3BvbmRzIHRvIGEgQ1NTIGNsYXNzIG5hbWUgd2hpbGUgdmFsdWVzIGFyZSBpbnRlcnByZXRlZCBhcyBleHByZXNzaW9uc1xuICogZXZhbHVhdGluZyB0byBgQm9vbGVhbmAuIElmIGEgZ2l2ZW4gZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gYHRydWVgIGEgY29ycmVzcG9uZGluZyBDU1MgY2xhc3NcbiAqIGlzIGFkZGVkIC0gb3RoZXJ3aXNlIGl0IGlzIHJlbW92ZWQuXG4gKlxuICogV2hpbGUgdGhlIGBOZ0NsYXNzYCBkaXJlY3RpdmUgY2FuIGludGVycHJldCBleHByZXNzaW9ucyBldmFsdWF0aW5nIHRvIGBzdHJpbmdgLCBgQXJyYXlgXG4gKiBvciBgT2JqZWN0YCwgdGhlIGBPYmplY3RgLWJhc2VkIHZlcnNpb24gaXMgdGhlIG1vc3Qgb2Z0ZW4gdXNlZCBhbmQgaGFzIGFuIGFkdmFudGFnZSBvZiBrZWVwaW5nXG4gKiBhbGwgdGhlIENTUyBjbGFzcyBuYW1lcyBpbiBhIHRlbXBsYXRlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9hNFlkdG1XeXdoSjMzdXFmcFBQbj9wPXByZXZpZXcpKTpcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7TmdDbGFzc30gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICd0b2dnbGUtYnV0dG9uJyxcbiAqICAgaW5wdXRzOiBbJ2lzRGlzYWJsZWQnXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvblwiIFtuZ0NsYXNzXT1cInthY3RpdmU6IGlzT24sIGRpc2FibGVkOiBpc0Rpc2FibGVkfVwiXG4gKiAgICAgICAgICAoY2xpY2spPVwidG9nZ2xlKCFpc09uKVwiPlxuICogICAgICAgICAgQ2xpY2sgbWUhXG4gKiAgICAgIDwvZGl2PmAsXG4gKiAgIHN0eWxlczogW2BcbiAqICAgICAuYnV0dG9uIHtcbiAqICAgICAgIHdpZHRoOiAxMjBweDtcbiAqICAgICAgIGJvcmRlcjogbWVkaXVtIHNvbGlkIGJsYWNrO1xuICogICAgIH1cbiAqXG4gKiAgICAgLmFjdGl2ZSB7XG4gKiAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XG4gKiAgICB9XG4gKlxuICogICAgIC5kaXNhYmxlZCB7XG4gKiAgICAgICBjb2xvcjogZ3JheTtcbiAqICAgICAgIGJvcmRlcjogbWVkaXVtIHNvbGlkIGdyYXk7XG4gKiAgICAgfVxuICogICBgXVxuICogICBkaXJlY3RpdmVzOiBbTmdDbGFzc11cbiAqIH0pXG4gKiBjbGFzcyBUb2dnbGVCdXR0b24ge1xuICogICBpc09uID0gZmFsc2U7XG4gKiAgIGlzRGlzYWJsZWQgPSBmYWxzZTtcbiAqXG4gKiAgIHRvZ2dsZShuZXdTdGF0ZSkge1xuICogICAgIGlmICghdGhpcy5pc0Rpc2FibGVkKSB7XG4gKiAgICAgICB0aGlzLmlzT24gPSBuZXdTdGF0ZTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0NsYXNzXScsIGlucHV0czogWydyYXdDbGFzczogbmdDbGFzcycsICdpbml0aWFsQ2xhc3NlczogY2xhc3MnXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBpbXBsZW1lbnRzIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyOiBJdGVyYWJsZURpZmZlcjtcbiAgcHJpdmF0ZSBfa2V5VmFsdWVEaWZmZXI6IEtleVZhbHVlRGlmZmVyO1xuICBwcml2YXRlIF9pbml0aWFsQ2xhc3Nlczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfcmF3Q2xhc3M6IHN0cmluZ1tdIHwgU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaXRlcmFibGVEaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsIHByaXZhdGUgX2tleVZhbHVlRGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgICAgICAgICAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIpIHt9XG5cbiAgc2V0IGluaXRpYWxDbGFzc2VzKHY6IHN0cmluZykge1xuICAgIHRoaXMuX2FwcGx5SW5pdGlhbENsYXNzZXModHJ1ZSk7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMgPSBpc1ByZXNlbnQodikgJiYgaXNTdHJpbmcodikgPyB2LnNwbGl0KCcgJykgOiBbXTtcbiAgICB0aGlzLl9hcHBseUluaXRpYWxDbGFzc2VzKGZhbHNlKTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5fcmF3Q2xhc3MsIGZhbHNlKTtcbiAgfVxuXG4gIHNldCByYXdDbGFzcyh2OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFNldDxzdHJpbmc+fCB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX2NsZWFudXBDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTtcblxuICAgIGlmIChpc1N0cmluZyh2KSkge1xuICAgICAgdiA9ICg8c3RyaW5nPnYpLnNwbGl0KCcgJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmF3Q2xhc3MgPSA8c3RyaW5nW10gfCBTZXQ8c3RyaW5nPj52O1xuICAgIHRoaXMuX2l0ZXJhYmxlRGlmZmVyID0gbnVsbDtcbiAgICB0aGlzLl9rZXlWYWx1ZURpZmZlciA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudCh2KSkge1xuICAgICAgaWYgKGlzTGlzdExpa2VJdGVyYWJsZSh2KSkge1xuICAgICAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVycy5maW5kKHYpLmNyZWF0ZShudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2tleVZhbHVlRGlmZmVyID0gdGhpcy5fa2V5VmFsdWVEaWZmZXJzLmZpbmQodikuY3JlYXRlKG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2l0ZXJhYmxlRGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9pdGVyYWJsZURpZmZlci5kaWZmKHRoaXMuX3Jhd0NsYXNzKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlcykpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlJdGVyYWJsZUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fa2V5VmFsdWVEaWZmZXIpKSB7XG4gICAgICB2YXIgY2hhbmdlcyA9IHRoaXMuX2tleVZhbHVlRGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MpO1xuICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VzKSkge1xuICAgICAgICB0aGlzLl9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fY2xlYW51cENsYXNzZXModGhpcy5fcmF3Q2xhc3MpOyB9XG5cbiAgcHJpdmF0ZSBfY2xlYW51cENsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdIHwgU2V0PHN0cmluZz58IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHJhd0NsYXNzVmFsLCB0cnVlKTtcbiAgICB0aGlzLl9hcHBseUluaXRpYWxDbGFzc2VzKGZhbHNlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbShcbiAgICAgICAgKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKFxuICAgICAgICAocmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpID0+IHtcbiAgICAgIGlmIChyZWNvcmQucHJldmlvdXNWYWx1ZSkge1xuICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oXG4gICAgICAgIChyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIHRydWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbShcbiAgICAgICAgKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgZmFsc2UpOyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5SW5pdGlhbENsYXNzZXMoaXNDbGVhbnVwOiBib29sZWFuKSB7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdIHwgU2V0PHN0cmluZz58IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNDbGVhbnVwOiBib29sZWFuKSB7XG4gICAgaWYgKGlzUHJlc2VudChyYXdDbGFzc1ZhbCkpIHtcbiAgICAgIGlmIChpc0FycmF5KHJhd0NsYXNzVmFsKSkge1xuICAgICAgICAoPHN0cmluZ1tdPnJhd0NsYXNzVmFsKS5mb3JFYWNoKGNsYXNzTmFtZSA9PiB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApKTtcbiAgICAgIH0gZWxzZSBpZiAocmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxTZXQ8c3RyaW5nPj5yYXdDbGFzc1ZhbCkuZm9yRWFjaChjbGFzc05hbWUgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goPHtbazogc3RyaW5nXTogYW55fT5yYXdDbGFzc1ZhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChleHBWYWw6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChleHBWYWwpKSB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjbGFzc05hbWUgPSBjbGFzc05hbWUudHJpbSgpO1xuICAgIGlmIChjbGFzc05hbWUubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCcgJykgPiAtMSkge1xuICAgICAgICB2YXIgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50Q2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBjbGFzc2VzW2ldLCBlbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgY2xhc3NOYW1lLCBlbmFibGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==