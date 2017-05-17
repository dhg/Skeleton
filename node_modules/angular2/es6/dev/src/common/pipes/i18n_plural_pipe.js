var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST, isStringMap, StringWrapper, isPresent, RegExpWrapper } from 'angular2/src/facade/lang';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
var interpolationExp = RegExpWrapper.create('#');
/**
 *
 *  Maps a value to a string that pluralizes the value properly.
 *
 *  ## Usage
 *
 *  expression | i18nPlural:mapping
 *
 *  where `expression` is a number and `mapping` is an object that indicates the proper text for
 *  when the `expression` evaluates to 0, 1, or some other number.  You can interpolate the actual
 *  value into the text using the `#` sign.
 *
 *  ## Example
 *
 *  ```
 *  <div>
 *    {{ messages.length | i18nPlural: messageMapping }}
 *  </div>
 *
 *  class MyApp {
 *    messages: any[];
 *    messageMapping: any = {
 *      '=0': 'No messages.',
 *      '=1': 'One message.',
 *      'other': '# messages.'
 *    }
 *    ...
 *  }
 *  ```
 *
 */
export let I18nPluralPipe = class {
    transform(value, args = null) {
        var key;
        var valueStr;
        var pluralMap = (args[0]);
        if (!isStringMap(pluralMap)) {
            throw new InvalidPipeArgumentException(I18nPluralPipe, pluralMap);
        }
        key = value === 0 || value === 1 ? `=${value}` : 'other';
        valueStr = isPresent(value) ? value.toString() : '';
        return StringWrapper.replaceAll(pluralMap[key], interpolationExp, valueStr);
    }
};
I18nPluralPipe = __decorate([
    CONST(),
    Pipe({ name: 'i18nPlural', pure: true }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], I18nPluralPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6WyJJMThuUGx1cmFsUGlwZSIsIkkxOG5QbHVyYWxQaXBlLnRyYW5zZm9ybSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFDTCxLQUFLLEVBQ0wsV0FBVyxFQUNYLGFBQWEsRUFDYixTQUFTLEVBQ1QsYUFBYSxFQUNkLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsVUFBVSxFQUFpQixJQUFJLEVBQUMsTUFBTSxlQUFlO09BQ3RELEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUM7QUFFOUUsSUFBSSxnQkFBZ0IsR0FBVyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRXpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUlFQSxTQUFTQSxDQUFDQSxLQUFhQSxFQUFFQSxJQUFJQSxHQUFVQSxJQUFJQTtRQUN6Q0MsSUFBSUEsR0FBV0EsQ0FBQ0E7UUFDaEJBLElBQUlBLFFBQWdCQSxDQUFDQTtRQUNyQkEsSUFBSUEsU0FBU0EsR0FBeURBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBRWhGQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsSUFBSUEsNEJBQTRCQSxDQUFDQSxjQUFjQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUNwRUEsQ0FBQ0E7UUFFREEsR0FBR0EsR0FBR0EsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsS0FBS0EsS0FBS0EsQ0FBQ0EsR0FBR0EsSUFBSUEsS0FBS0EsRUFBRUEsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDekRBLFFBQVFBLEdBQUdBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBO1FBRXBEQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxnQkFBZ0JBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO0lBQzlFQSxDQUFDQTtBQUNIRCxDQUFDQTtBQWxCRDtJQUFDLEtBQUssRUFBRTtJQUNQLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ3RDLFVBQVUsRUFBRTs7bUJBZ0JaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDT05TVCxcbiAgaXNTdHJpbmdNYXAsXG4gIFN0cmluZ1dyYXBwZXIsXG4gIGlzUHJlc2VudCxcbiAgUmVnRXhwV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxudmFyIGludGVycG9sYXRpb25FeHA6IFJlZ0V4cCA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCcjJyk7XG5cbi8qKlxuICpcbiAqICBNYXBzIGEgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBwbHVyYWxpemVzIHRoZSB2YWx1ZSBwcm9wZXJseS5cbiAqXG4gKiAgIyMgVXNhZ2VcbiAqXG4gKiAgZXhwcmVzc2lvbiB8IGkxOG5QbHVyYWw6bWFwcGluZ1xuICpcbiAqICB3aGVyZSBgZXhwcmVzc2lvbmAgaXMgYSBudW1iZXIgYW5kIGBtYXBwaW5nYCBpcyBhbiBvYmplY3QgdGhhdCBpbmRpY2F0ZXMgdGhlIHByb3BlciB0ZXh0IGZvclxuICogIHdoZW4gdGhlIGBleHByZXNzaW9uYCBldmFsdWF0ZXMgdG8gMCwgMSwgb3Igc29tZSBvdGhlciBudW1iZXIuICBZb3UgY2FuIGludGVycG9sYXRlIHRoZSBhY3R1YWxcbiAqICB2YWx1ZSBpbnRvIHRoZSB0ZXh0IHVzaW5nIHRoZSBgI2Agc2lnbi5cbiAqXG4gKiAgIyMgRXhhbXBsZVxuICpcbiAqICBgYGBcbiAqICA8ZGl2PlxuICogICAge3sgbWVzc2FnZXMubGVuZ3RoIHwgaTE4blBsdXJhbDogbWVzc2FnZU1hcHBpbmcgfX1cbiAqICA8L2Rpdj5cbiAqXG4gKiAgY2xhc3MgTXlBcHAge1xuICogICAgbWVzc2FnZXM6IGFueVtdO1xuICogICAgbWVzc2FnZU1hcHBpbmc6IGFueSA9IHtcbiAqICAgICAgJz0wJzogJ05vIG1lc3NhZ2VzLicsXG4gKiAgICAgICc9MSc6ICdPbmUgbWVzc2FnZS4nLFxuICogICAgICAnb3RoZXInOiAnIyBtZXNzYWdlcy4nXG4gKiAgICB9XG4gKiAgICAuLi5cbiAqICB9XG4gKiAgYGBgXG4gKlxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdpMThuUGx1cmFsJywgcHVyZTogdHJ1ZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSTE4blBsdXJhbFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBudW1iZXIsIGFyZ3M6IGFueVtdID0gbnVsbCk6IHN0cmluZyB7XG4gICAgdmFyIGtleTogc3RyaW5nO1xuICAgIHZhciB2YWx1ZVN0cjogc3RyaW5nO1xuICAgIHZhciBwbHVyYWxNYXA6IHtbY291bnQ6IHN0cmluZ106IHN0cmluZ30gPSA8e1tjb3VudDogc3RyaW5nXTogc3RyaW5nfT4oYXJnc1swXSk7XG5cbiAgICBpZiAoIWlzU3RyaW5nTWFwKHBsdXJhbE1hcCkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKEkxOG5QbHVyYWxQaXBlLCBwbHVyYWxNYXApO1xuICAgIH1cblxuICAgIGtleSA9IHZhbHVlID09PSAwIHx8IHZhbHVlID09PSAxID8gYD0ke3ZhbHVlfWAgOiAnb3RoZXInO1xuICAgIHZhbHVlU3RyID0gaXNQcmVzZW50KHZhbHVlKSA/IHZhbHVlLnRvU3RyaW5nKCkgOiAnJztcblxuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwocGx1cmFsTWFwW2tleV0sIGludGVycG9sYXRpb25FeHAsIHZhbHVlU3RyKTtcbiAgfVxufVxuIl19