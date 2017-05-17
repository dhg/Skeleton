var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
// #docregion SlicePipe_string
export let SlicePipeStringExample = class {
    constructor() {
        this.str = 'abcdefghij';
    }
};
SlicePipeStringExample = __decorate([
    Component({
        selector: 'slice-string-example',
        template: `<div>
    <p>{{str}}[0:4]: '{{str | slice:0:4}}' - output is expected to be 'abcd'</p>
    <p>{{str}}[4:0]: '{{str | slice:4:0}}' - output is expected to be ''</p>
    <p>{{str}}[-4]: '{{str | slice:-4}}' - output is expected to be 'ghij'</p>
    <p>{{str}}[-4:-2]: '{{str | slice:-4:-2}}' - output is expected to be 'gh'</p>
    <p>{{str}}[-100]: '{{str | slice:-100}}' - output is expected to be 'abcdefghij'</p>
    <p>{{str}}[100]: '{{str | slice:100}}' - output is expected to be ''</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], SlicePipeStringExample);
// #enddocregion
// #docregion SlicePipe_list
export let SlicePipeListExample = class {
    constructor() {
        this.collection = ['a', 'b', 'c', 'd'];
    }
};
SlicePipeListExample = __decorate([
    Component({
        selector: 'slice-list-example',
        template: `<div>
    <li *ngFor="var i of collection | slice:1:3">{{i}}</li>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], SlicePipeListExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [SlicePipeListExample, SlicePipeStringExample],
        template: `
    <h1>SlicePipe Examples</h1>
    <slice-list-example></slice-list-example>
    <slice-string-example></slice-string-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9zbGljZV9waXBlL3NsaWNlX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJTbGljZVBpcGVTdHJpbmdFeGFtcGxlIiwiU2xpY2VQaXBlU3RyaW5nRXhhbXBsZS5jb25zdHJ1Y3RvciIsIlNsaWNlUGlwZUxpc3RFeGFtcGxlIiwiU2xpY2VQaXBlTGlzdEV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsOEJBQThCO0FBQzlCO0lBQUFBO1FBWUVDLFFBQUdBLEdBQVdBLFlBQVlBLENBQUNBO0lBQzdCQSxDQUFDQTtBQUFERCxDQUFDQTtBQWJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHNCQUFzQjtRQUNoQyxRQUFRLEVBQUU7Ozs7Ozs7U0FPSDtLQUNSLENBQUM7OzJCQUdEO0FBQ0QsZ0JBQWdCO0FBRWhCLDRCQUE0QjtBQUM1QjtJQUFBRTtRQU9FQyxlQUFVQSxHQUFhQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFSRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsUUFBUSxFQUFFOztTQUVIO0tBQ1IsQ0FBQzs7eUJBR0Q7QUFDRCxnQkFBZ0I7QUFFaEI7QUFVQUUsQ0FBQ0E7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLG9CQUFvQixFQUFFLHNCQUFzQixDQUFDO1FBQzFELFFBQVEsRUFBRTs7OztHQUlUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcblxuLy8gI2RvY3JlZ2lvbiBTbGljZVBpcGVfc3RyaW5nXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdzbGljZS1zdHJpbmctZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD57e3N0cn19WzA6NF06ICd7e3N0ciB8IHNsaWNlOjA6NH19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnYWJjZCc8L3A+XG4gICAgPHA+e3tzdHJ9fVs0OjBdOiAne3tzdHIgfCBzbGljZTo0OjB9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJyc8L3A+XG4gICAgPHA+e3tzdHJ9fVstNF06ICd7e3N0ciB8IHNsaWNlOi00fX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICdnaGlqJzwvcD5cbiAgICA8cD57e3N0cn19Wy00Oi0yXTogJ3t7c3RyIHwgc2xpY2U6LTQ6LTJ9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJ2doJzwvcD5cbiAgICA8cD57e3N0cn19Wy0xMDBdOiAne3tzdHIgfCBzbGljZTotMTAwfX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICdhYmNkZWZnaGlqJzwvcD5cbiAgICA8cD57e3N0cn19WzEwMF06ICd7e3N0ciB8IHNsaWNlOjEwMH19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnJzwvcD5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBTbGljZVBpcGVTdHJpbmdFeGFtcGxlIHtcbiAgc3RyOiBzdHJpbmcgPSAnYWJjZGVmZ2hpaic7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gU2xpY2VQaXBlX2xpc3RcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3NsaWNlLWxpc3QtZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8bGkgKm5nRm9yPVwidmFyIGkgb2YgY29sbGVjdGlvbiB8IHNsaWNlOjE6M1wiPnt7aX19PC9saT5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBTbGljZVBpcGVMaXN0RXhhbXBsZSB7XG4gIGNvbGxlY3Rpb246IHN0cmluZ1tdID0gWydhJywgJ2InLCAnYycsICdkJ107XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW1NsaWNlUGlwZUxpc3RFeGFtcGxlLCBTbGljZVBpcGVTdHJpbmdFeGFtcGxlXSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+U2xpY2VQaXBlIEV4YW1wbGVzPC9oMT5cbiAgICA8c2xpY2UtbGlzdC1leGFtcGxlPjwvc2xpY2UtbGlzdC1leGFtcGxlPlxuICAgIDxzbGljZS1zdHJpbmctZXhhbXBsZT48L3NsaWNlLXN0cmluZy1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==