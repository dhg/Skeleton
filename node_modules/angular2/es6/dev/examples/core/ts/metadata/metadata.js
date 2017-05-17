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
import { Component, Attribute, Directive, Pipe } from 'angular2/core';
var CustomDirective;
// #docregion component
let Greet = class {
    constructor() {
        this.name = 'World';
    }
};
Greet = __decorate([
    Component({ selector: 'greet', template: 'Hello {{name}}!', directives: [CustomDirective] }), 
    __metadata('design:paramtypes', [])
], Greet);
// #enddocregion
// #docregion attributeFactory
let Page = class {
    constructor(title) {
        this.title = title;
    }
};
Page = __decorate([
    Component({ selector: 'page', template: 'Title: {{title}}' }),
    __param(0, Attribute('title')), 
    __metadata('design:paramtypes', [String])
], Page);
// #enddocregion
// #docregion attributeMetadata
let InputAttrDirective = class {
    constructor(type) {
        // type would be 'text' in this example
    }
};
InputAttrDirective = __decorate([
    Directive({ selector: 'input' }),
    __param(0, Attribute('type')), 
    __metadata('design:paramtypes', [String])
], InputAttrDirective);
// #enddocregion
// #docregion directive
let InputDirective = class {
    constructor() {
        // Add some logic.
    }
};
InputDirective = __decorate([
    Directive({ selector: 'input' }), 
    __metadata('design:paramtypes', [])
], InputDirective);
// #enddocregion
// #docregion pipe
let Lowercase = class {
    transform(v, args) { return v.toLowerCase(); }
};
Lowercase = __decorate([
    Pipe({ name: 'lowercase' }), 
    __metadata('design:paramtypes', [])
], Lowercase);
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbIkdyZWV0IiwiR3JlZXQuY29uc3RydWN0b3IiLCJQYWdlIiwiUGFnZS5jb25zdHJ1Y3RvciIsIklucHV0QXR0ckRpcmVjdGl2ZSIsIklucHV0QXR0ckRpcmVjdGl2ZS5jb25zdHJ1Y3RvciIsIklucHV0RGlyZWN0aXZlIiwiSW5wdXREaXJlY3RpdmUuY29uc3RydWN0b3IiLCJMb3dlcmNhc2UiLCJMb3dlcmNhc2UudHJhbnNmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWU7QUFFbkUsSUFBSSxlQUF5QixDQUFDO0FBRTlCLHVCQUF1QjtBQUN2QjtJQUFBQTtRQUVFQyxTQUFJQSxHQUFXQSxPQUFPQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFIRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFDLENBQUM7O1VBRzFGO0FBQ0QsZ0JBQWdCO0FBRWhCLDhCQUE4QjtBQUM5QjtJQUdFRSxZQUFnQ0EsS0FBYUE7UUFBSUMsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7QUFDeEVELENBQUNBO0FBSkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBQyxDQUFDO0lBRzlDLFdBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBOztTQUNoQztBQUNELGdCQUFnQjtBQUVoQiwrQkFBK0I7QUFDL0I7SUFFRUUsWUFBK0JBLElBQVlBO1FBQ3pDQyx1Q0FBdUNBO0lBQ3pDQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUxEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBRWpCLFdBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBOzt1QkFHL0I7QUFDRCxnQkFBZ0I7QUFFaEIsdUJBQXVCO0FBQ3ZCO0lBRUVFO1FBQ0VDLGtCQUFrQkE7SUFDcEJBLENBQUNBO0FBQ0hELENBQUNBO0FBTEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUM7O21CQUs5QjtBQUNELGdCQUFnQjtBQUVoQixrQkFBa0I7QUFDbEI7SUFFRUUsU0FBU0EsQ0FBQ0EsQ0FBU0EsRUFBRUEsSUFBV0EsSUFBSUMsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDL0RELENBQUNBO0FBSEQ7SUFBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLENBQUM7O2NBR3pCO0FBQ0QsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEF0dHJpYnV0ZSwgRGlyZWN0aXZlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxudmFyIEN1c3RvbURpcmVjdGl2ZTogRnVuY3Rpb247XG5cbi8vICNkb2NyZWdpb24gY29tcG9uZW50XG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ2dyZWV0JywgdGVtcGxhdGU6ICdIZWxsbyB7e25hbWV9fSEnLCBkaXJlY3RpdmVzOiBbQ3VzdG9tRGlyZWN0aXZlXX0pXG5jbGFzcyBHcmVldCB7XG4gIG5hbWU6IHN0cmluZyA9ICdXb3JsZCc7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gYXR0cmlidXRlRmFjdG9yeVxuQENvbXBvbmVudCh7c2VsZWN0b3I6ICdwYWdlJywgdGVtcGxhdGU6ICdUaXRsZToge3t0aXRsZX19J30pXG5jbGFzcyBQYWdlIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgndGl0bGUnKSB0aXRsZTogc3RyaW5nKSB7IHRoaXMudGl0bGUgPSB0aXRsZTsgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIGF0dHJpYnV0ZU1ldGFkYXRhXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2lucHV0J30pXG5jbGFzcyBJbnB1dEF0dHJEaXJlY3RpdmUge1xuICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKCd0eXBlJykgdHlwZTogc3RyaW5nKSB7XG4gICAgLy8gdHlwZSB3b3VsZCBiZSAndGV4dCcgaW4gdGhpcyBleGFtcGxlXG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBkaXJlY3RpdmVcbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnaW5wdXQnfSlcbmNsYXNzIElucHV0RGlyZWN0aXZlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gQWRkIHNvbWUgbG9naWMuXG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBwaXBlXG5AUGlwZSh7bmFtZTogJ2xvd2VyY2FzZSd9KVxuY2xhc3MgTG93ZXJjYXNlIHtcbiAgdHJhbnNmb3JtKHY6IHN0cmluZywgYXJnczogYW55W10pIHsgcmV0dXJuIHYudG9Mb3dlckNhc2UoKTsgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuIl19