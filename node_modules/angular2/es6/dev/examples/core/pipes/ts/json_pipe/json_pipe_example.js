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
// #docregion JsonPipe
export let JsonPipeExample = class {
    constructor() {
        this.object = { foo: 'bar', baz: 'qux', nested: { xyz: 3, numbers: [1, 2, 3, 4, 5] } };
    }
};
JsonPipeExample = __decorate([
    Component({
        selector: 'json-example',
        template: `<div>
    <p>Without JSON pipe:</p>
    <pre>{{object}}</pre>
    <p>With JSON pipe:</p>
    <pre>{{object | json}}</pre>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], JsonPipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [JsonPipeExample],
        template: `
    <h1>JsonPipe Example</h1>
    <json-example></json-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2pzb25fcGlwZS9qc29uX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJKc29uUGlwZUV4YW1wbGUiLCJKc29uUGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsc0JBQXNCO0FBQ3RCO0lBQUFBO1FBVUVDLFdBQU1BLEdBQVdBLEVBQUNBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLE1BQU1BLEVBQUVBLEVBQUNBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUNBLEVBQUNBLENBQUFBO0lBQ3ZGQSxDQUFDQTtBQUFERCxDQUFDQTtBQVhEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGNBQWM7UUFDeEIsUUFBUSxFQUFFOzs7OztTQUtIO0tBQ1IsQ0FBQzs7b0JBR0Q7QUFDRCxnQkFBZ0I7QUFFaEI7QUFTQUUsQ0FBQ0E7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQztRQUM3QixRQUFRLEVBQUU7OztHQUdUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcblxuLy8gI2RvY3JlZ2lvbiBKc29uUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnanNvbi1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPldpdGhvdXQgSlNPTiBwaXBlOjwvcD5cbiAgICA8cHJlPnt7b2JqZWN0fX08L3ByZT5cbiAgICA8cD5XaXRoIEpTT04gcGlwZTo8L3A+XG4gICAgPHByZT57e29iamVjdCB8IGpzb259fTwvcHJlPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIEpzb25QaXBlRXhhbXBsZSB7XG4gIG9iamVjdDogT2JqZWN0ID0ge2ZvbzogJ2JhcicsIGJhejogJ3F1eCcsIG5lc3RlZDoge3h5ejogMywgbnVtYmVyczogWzEsIDIsIDMsIDQsIDVdfX1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbSnNvblBpcGVFeGFtcGxlXSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+SnNvblBpcGUgRXhhbXBsZTwvaDE+XG4gICAgPGpzb24tZXhhbXBsZT48L2pzb24tZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=