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
// #docregion NumberPipe
export let NumberPipeExample = class {
    constructor() {
        this.pi = 3.141;
        this.e = 2.718281828459045;
    }
};
NumberPipeExample = __decorate([
    Component({
        selector: 'number-example',
        template: `<div>
    <p>e (no formatting): {{e}}</p>
    <p>e (3.1-5): {{e | number:'3.1-5'}}</p>
    <p>pi (no formatting): {{pi}}</p>
    <p>pi (3.5-5): {{pi | number:'3.5-5'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], NumberPipeExample);
// #enddocregion
// #docregion PercentPipe
export let PercentPipeExample = class {
    constructor() {
        this.a = 0.259;
        this.b = 1.3495;
    }
};
PercentPipeExample = __decorate([
    Component({
        selector: 'percent-example',
        template: `<div>
    <p>A: {{a | percent}}</p>
    <p>B: {{b | percent:'4.3-5'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], PercentPipeExample);
// #enddocregion
// #docregion CurrencyPipe
export let CurrencyPipeExample = class {
    constructor() {
        this.a = 0.259;
        this.b = 1.3495;
    }
};
CurrencyPipeExample = __decorate([
    Component({
        selector: 'currency-example',
        template: `<div>
    <p>A: {{a | currency:'USD':false}}</p>
    <p>B: {{b | currency:'USD':true:'4.2-2'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], CurrencyPipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [NumberPipeExample, PercentPipeExample, CurrencyPipeExample],
        template: `
    <h1>Numeric Pipe Examples</h1>
    <h2>NumberPipe Example</h2>
    <number-example></number-example>
    <h2>PercentPipe Example</h2>
    <percent-example></percent-example>
    <h2>CurrencyPipeExample</h2>
    <currency-example></currency-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL2NvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJOdW1iZXJQaXBlRXhhbXBsZSIsIk51bWJlclBpcGVFeGFtcGxlLmNvbnN0cnVjdG9yIiwiUGVyY2VudFBpcGVFeGFtcGxlIiwiUGVyY2VudFBpcGVFeGFtcGxlLmNvbnN0cnVjdG9yIiwiQ3VycmVuY3lQaXBlRXhhbXBsZSIsIkN1cnJlbmN5UGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsd0JBQXdCO0FBQ3hCO0lBQUFBO1FBVUVDLE9BQUVBLEdBQVdBLEtBQUtBLENBQUNBO1FBQ25CQSxNQUFDQSxHQUFXQSxpQkFBaUJBLENBQUNBO0lBQ2hDQSxDQUFDQTtBQUFERCxDQUFDQTtBQVpEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUU7Ozs7O1NBS0g7S0FDUixDQUFDOztzQkFJRDtBQUNELGdCQUFnQjtBQUVoQix5QkFBeUI7QUFDekI7SUFBQUU7UUFRRUMsTUFBQ0EsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFDbEJBLE1BQUNBLEdBQVdBLE1BQU1BLENBQUNBO0lBQ3JCQSxDQUFDQTtBQUFERCxDQUFDQTtBQVZEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixRQUFRLEVBQUU7OztTQUdIO0tBQ1IsQ0FBQzs7dUJBSUQ7QUFDRCxnQkFBZ0I7QUFFaEIsMEJBQTBCO0FBQzFCO0lBQUFFO1FBUUVDLE1BQUNBLEdBQVdBLEtBQUtBLENBQUNBO1FBQ2xCQSxNQUFDQSxHQUFXQSxNQUFNQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxrQkFBa0I7UUFDNUIsUUFBUSxFQUFFOzs7U0FHSDtLQUNSLENBQUM7O3dCQUlEO0FBQ0QsZ0JBQWdCO0FBRWhCO0FBY0FFLENBQUNBO0FBZEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsQ0FBQztRQUN4RSxRQUFRLEVBQUU7Ozs7Ozs7O0dBUVQ7S0FDRixDQUFDOztXQUVEO0FBRUQ7SUFDRUMsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDcEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuXG4vLyAjZG9jcmVnaW9uIE51bWJlclBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ251bWJlci1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPmUgKG5vIGZvcm1hdHRpbmcpOiB7e2V9fTwvcD5cbiAgICA8cD5lICgzLjEtNSk6IHt7ZSB8IG51bWJlcjonMy4xLTUnfX08L3A+XG4gICAgPHA+cGkgKG5vIGZvcm1hdHRpbmcpOiB7e3BpfX08L3A+XG4gICAgPHA+cGkgKDMuNS01KToge3twaSB8IG51bWJlcjonMy41LTUnfX08L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgTnVtYmVyUGlwZUV4YW1wbGUge1xuICBwaTogbnVtYmVyID0gMy4xNDE7XG4gIGU6IG51bWJlciA9IDIuNzE4MjgxODI4NDU5MDQ1O1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIFBlcmNlbnRQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwZXJjZW50LWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+QToge3thIHwgcGVyY2VudH19PC9wPlxuICAgIDxwPkI6IHt7YiB8IHBlcmNlbnQ6JzQuMy01J319PC9wPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIFBlcmNlbnRQaXBlRXhhbXBsZSB7XG4gIGE6IG51bWJlciA9IDAuMjU5O1xuICBiOiBudW1iZXIgPSAxLjM0OTU7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gQ3VycmVuY3lQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjdXJyZW5jeS1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPkE6IHt7YSB8IGN1cnJlbmN5OidVU0QnOmZhbHNlfX08L3A+XG4gICAgPHA+Qjoge3tiIHwgY3VycmVuY3k6J1VTRCc6dHJ1ZTonNC4yLTInfX08L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lQaXBlRXhhbXBsZSB7XG4gIGE6IG51bWJlciA9IDAuMjU5O1xuICBiOiBudW1iZXIgPSAxLjM0OTU7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW051bWJlclBpcGVFeGFtcGxlLCBQZXJjZW50UGlwZUV4YW1wbGUsIEN1cnJlbmN5UGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5OdW1lcmljIFBpcGUgRXhhbXBsZXM8L2gxPlxuICAgIDxoMj5OdW1iZXJQaXBlIEV4YW1wbGU8L2gyPlxuICAgIDxudW1iZXItZXhhbXBsZT48L251bWJlci1leGFtcGxlPlxuICAgIDxoMj5QZXJjZW50UGlwZSBFeGFtcGxlPC9oMj5cbiAgICA8cGVyY2VudC1leGFtcGxlPjwvcGVyY2VudC1leGFtcGxlPlxuICAgIDxoMj5DdXJyZW5jeVBpcGVFeGFtcGxlPC9oMj5cbiAgICA8Y3VycmVuY3ktZXhhbXBsZT48L2N1cnJlbmN5LWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19