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
import { Observable } from 'rxjs/Rx';
// #docregion AsyncPipe
export let AsyncPipeExample = class {
    constructor() {
        this.greeting = null;
        this.arrived = false;
        this.resolve = null;
        this.reset();
    }
    reset() {
        this.arrived = false;
        this.greeting = new Promise((resolve, reject) => { this.resolve = resolve; });
    }
    clicked() {
        if (this.arrived) {
            this.reset();
        }
        else {
            this.resolve("hi there!");
            this.arrived = true;
        }
    }
};
AsyncPipeExample = __decorate([
    Component({
        selector: 'async-example',
        template: `<div>
    <p>Wait for it... {{ greeting | async }}</p>
    <button (click)="clicked()">{{ arrived ? 'Reset' : 'Resolve' }}</button>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], AsyncPipeExample);
// #enddocregion
// #docregion AsyncPipeObservable
let Task = class {
    constructor() {
        this.time = new Observable((observer) => {
            setInterval(() => observer.next(new Date().getTime()), 500);
        });
    }
};
Task = __decorate([
    Component({ selector: "task-cmp", template: "Time: {{ time | async }}" }), 
    __metadata('design:paramtypes', [])
], Task);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [AsyncPipeExample],
        template: `
    <h1>AsyncPipe Example</h1>
    <async-example></async-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJBc3luY1BpcGVFeGFtcGxlIiwiQXN5bmNQaXBlRXhhbXBsZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZUV4YW1wbGUucmVzZXQiLCJBc3luY1BpcGVFeGFtcGxlLmNsaWNrZWQiLCJUYXNrIiwiVGFzay5jb25zdHJ1Y3RvciIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFVLE1BQU0sZUFBZTtPQUN6QyxFQUFDLFNBQVMsRUFBQyxNQUFNLDJCQUEyQjtPQUM1QyxFQUFDLFVBQVUsRUFBYSxNQUFNLFNBQVM7QUFFOUMsdUJBQXVCO0FBQ3ZCO0lBYUVBO1FBTEFDLGFBQVFBLEdBQW9CQSxJQUFJQSxDQUFDQTtRQUNqQ0EsWUFBT0EsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFakJBLFlBQU9BLEdBQWFBLElBQUlBLENBQUNBO1FBRWpCQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUUvQkQsS0FBS0E7UUFDSEUsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLE9BQU9BLENBQVNBLENBQUNBLE9BQU9BLEVBQUVBLE1BQU1BLE9BQU9BLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3hGQSxDQUFDQTtJQUVERixPQUFPQTtRQUNMRyxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO1FBQ3RCQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNISCxDQUFDQTtBQTVCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRTs7O1NBR0g7S0FDUixDQUFDOztxQkFzQkQ7QUFDRCxnQkFBZ0I7QUFFaEIsaUNBQWlDO0FBQ2pDO0lBQUFJO1FBRUVDLFNBQUlBLEdBQUdBLElBQUlBLFVBQVVBLENBQVNBLENBQUNBLFFBQTRCQTtZQUN6REEsV0FBV0EsQ0FBQ0EsTUFBTUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDOURBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0FBQURELENBQUNBO0FBTEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBQyxDQUFDOztTQUt2RTtBQUNELGdCQUFnQjtBQUVoQjtBQVNBRSxDQUFDQTtBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsUUFBUSxFQUFFOzs7R0FHVDtLQUNGLENBQUM7O1dBRUQ7QUFFRDtJQUNFQyxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtBQUNwQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmliZXJ9IGZyb20gJ3J4anMvUngnO1xuXG4vLyAjZG9jcmVnaW9uIEFzeW5jUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYXN5bmMtZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5XYWl0IGZvciBpdC4uLiB7eyBncmVldGluZyB8IGFzeW5jIH19PC9wPlxuICAgIDxidXR0b24gKGNsaWNrKT1cImNsaWNrZWQoKVwiPnt7IGFycml2ZWQgPyAnUmVzZXQnIDogJ1Jlc29sdmUnIH19PC9idXR0b24+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgQXN5bmNQaXBlRXhhbXBsZSB7XG4gIGdyZWV0aW5nOiBQcm9taXNlPHN0cmluZz4gPSBudWxsO1xuICBhcnJpdmVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSByZXNvbHZlOiBGdW5jdGlvbiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMucmVzZXQoKTsgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuYXJyaXZlZCA9IGZhbHNlO1xuICAgIHRoaXMuZ3JlZXRpbmcgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHsgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTsgfSk7XG4gIH1cblxuICBjbGlja2VkKCkge1xuICAgIGlmICh0aGlzLmFycml2ZWQpIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZXNvbHZlKFwiaGkgdGhlcmUhXCIpO1xuICAgICAgdGhpcy5hcnJpdmVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBBc3luY1BpcGVPYnNlcnZhYmxlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogXCJ0YXNrLWNtcFwiLCB0ZW1wbGF0ZTogXCJUaW1lOiB7eyB0aW1lIHwgYXN5bmMgfX1cIn0pXG5jbGFzcyBUYXNrIHtcbiAgdGltZSA9IG5ldyBPYnNlcnZhYmxlPG51bWJlcj4oKG9ic2VydmVyOiBTdWJzY3JpYmVyPG51bWJlcj4pID0+IHtcbiAgICBzZXRJbnRlcnZhbCgoKSA9PiBvYnNlcnZlci5uZXh0KG5ldyBEYXRlKCkuZ2V0VGltZSgpKSwgNTAwKTtcbiAgfSk7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0FzeW5jUGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5Bc3luY1BpcGUgRXhhbXBsZTwvaDE+XG4gICAgPGFzeW5jLWV4YW1wbGU+PC9hc3luYy1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==