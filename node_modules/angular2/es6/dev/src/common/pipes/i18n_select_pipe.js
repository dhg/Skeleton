var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST, isStringMap } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
/**
 *
 *  Generic selector that displays the string that matches the current value.
 *
 *  ## Usage
 *
 *  expression | i18nSelect:mapping
 *
 *  where `mapping` is an object that indicates the text that should be displayed
 *  for different values of the provided `expression`.
 *
 *  ## Example
 *
 *  ```
 *  <div>
 *    {{ gender | i18nSelect: inviteMap }}
 *  </div>
 *
 *  class MyApp {
 *    gender: string = 'male';
 *    inviteMap: any = {
 *      'male': 'Invite her.',
 *      'female': 'Invite him.',
 *      'other': 'Invite them.'
 *    }
 *    ...
 *  }
 *  ```
 */
export let I18nSelectPipe = class {
    transform(value, args = null) {
        var mapping = (args[0]);
        if (!isStringMap(mapping)) {
            throw new InvalidPipeArgumentException(I18nSelectPipe, mapping);
        }
        return StringMapWrapper.contains(mapping, value) ? mapping[value] : mapping['other'];
    }
};
I18nSelectPipe = __decorate([
    CONST(),
    Pipe({ name: 'i18nSelect', pure: true }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], I18nSelectPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9zZWxlY3RfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvaTE4bl9zZWxlY3RfcGlwZS50cyJdLCJuYW1lcyI6WyJJMThuU2VsZWN0UGlwZSIsIkkxOG5TZWxlY3RQaXBlLnRyYW5zZm9ybSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxLQUFLLEVBQUUsV0FBVyxFQUFDLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDeEQsRUFBQyxVQUFVLEVBQWlCLElBQUksRUFBQyxNQUFNLGVBQWU7T0FDdEQsRUFBQyw0QkFBNEIsRUFBQyxNQUFNLG1DQUFtQztBQUU5RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNIO0lBSUVBLFNBQVNBLENBQUNBLEtBQWFBLEVBQUVBLElBQUlBLEdBQVVBLElBQUlBO1FBQ3pDQyxJQUFJQSxPQUFPQSxHQUF1REEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxNQUFNQSxJQUFJQSw0QkFBNEJBLENBQUNBLGNBQWNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQ2xFQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLEVBQUVBLEtBQUtBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0lBQ3ZGQSxDQUFDQTtBQUNIRCxDQUFDQTtBQVpEO0lBQUMsS0FBSyxFQUFFO0lBQ1AsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDdEMsVUFBVSxFQUFFOzttQkFVWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgaXNTdHJpbmdNYXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGUsIFBpcGVUcmFuc2Zvcm0sIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG4vKipcbiAqXG4gKiAgR2VuZXJpYyBzZWxlY3RvciB0aGF0IGRpc3BsYXlzIHRoZSBzdHJpbmcgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHZhbHVlLlxuICpcbiAqICAjIyBVc2FnZVxuICpcbiAqICBleHByZXNzaW9uIHwgaTE4blNlbGVjdDptYXBwaW5nXG4gKlxuICogIHdoZXJlIGBtYXBwaW5nYCBpcyBhbiBvYmplY3QgdGhhdCBpbmRpY2F0ZXMgdGhlIHRleHQgdGhhdCBzaG91bGQgYmUgZGlzcGxheWVkXG4gKiAgZm9yIGRpZmZlcmVudCB2YWx1ZXMgb2YgdGhlIHByb3ZpZGVkIGBleHByZXNzaW9uYC5cbiAqXG4gKiAgIyMgRXhhbXBsZVxuICpcbiAqICBgYGBcbiAqICA8ZGl2PlxuICogICAge3sgZ2VuZGVyIHwgaTE4blNlbGVjdDogaW52aXRlTWFwIH19XG4gKiAgPC9kaXY+XG4gKlxuICogIGNsYXNzIE15QXBwIHtcbiAqICAgIGdlbmRlcjogc3RyaW5nID0gJ21hbGUnO1xuICogICAgaW52aXRlTWFwOiBhbnkgPSB7XG4gKiAgICAgICdtYWxlJzogJ0ludml0ZSBoZXIuJyxcbiAqICAgICAgJ2ZlbWFsZSc6ICdJbnZpdGUgaGltLicsXG4gKiAgICAgICdvdGhlcic6ICdJbnZpdGUgdGhlbS4nXG4gKiAgICB9XG4gKiAgICAuLi5cbiAqICB9XG4gKiAgYGBgXG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ2kxOG5TZWxlY3QnLCBwdXJlOiB0cnVlfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJMThuU2VsZWN0UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZywgYXJnczogYW55W10gPSBudWxsKTogc3RyaW5nIHtcbiAgICB2YXIgbWFwcGluZzoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSA8e1tjb3VudDogc3RyaW5nXTogc3RyaW5nfT4oYXJnc1swXSk7XG4gICAgaWYgKCFpc1N0cmluZ01hcChtYXBwaW5nKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oSTE4blNlbGVjdFBpcGUsIG1hcHBpbmcpO1xuICAgIH1cblxuICAgIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKG1hcHBpbmcsIHZhbHVlKSA/IG1hcHBpbmdbdmFsdWVdIDogbWFwcGluZ1snb3RoZXInXTtcbiAgfVxufVxuIl19