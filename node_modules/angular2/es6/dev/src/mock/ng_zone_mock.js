var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
/**
 * A mock implementation of {@link NgZone}.
 */
export let MockNgZone = class extends NgZone {
    constructor() {
        super({ enableLongStackTrace: false });
        /** @internal */
        this._mockOnStable = new EventEmitter(false);
    }
    get onStable() { return this._mockOnStable; }
    run(fn) { return fn(); }
    runOutsideAngular(fn) { return fn(); }
    simulateZoneExit() { ObservableWrapper.callNext(this.onStable, null); }
};
MockNgZone = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockNgZone);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL21vY2svbmdfem9uZV9tb2NrLnRzIl0sIm5hbWVzIjpbIk1vY2tOZ1pvbmUiLCJNb2NrTmdab25lLmNvbnN0cnVjdG9yIiwiTW9ja05nWm9uZS5vblN0YWJsZSIsIk1vY2tOZ1pvbmUucnVuIiwiTW9ja05nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciIsIk1vY2tOZ1pvbmUuc2ltdWxhdGVab25lRXhpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxNQUFNLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDOUMsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFFekU7O0dBRUc7QUFDSCxzQ0FDZ0MsTUFBTTtJQUlwQ0E7UUFBZ0JDLE1BQU1BLEVBQUNBLG9CQUFvQkEsRUFBRUEsS0FBS0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7UUFIckRBLGdCQUFnQkE7UUFDUkEsa0JBQWFBLEdBQXNCQSxJQUFJQSxZQUFZQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUViQSxDQUFDQTtJQUV2REQsSUFBSUEsUUFBUUEsS0FBS0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0NGLEdBQUdBLENBQUNBLEVBQVlBLElBQVNHLE1BQU1BLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXZDSCxpQkFBaUJBLENBQUNBLEVBQVlBLElBQVNJLE1BQU1BLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXJESixnQkFBZ0JBLEtBQVdLLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDL0VMLENBQUNBO0FBZEQ7SUFBQyxVQUFVLEVBQUU7O2VBY1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG4vKipcbiAqIEEgbW9jayBpbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgTmdab25lfS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tOZ1pvbmUgZXh0ZW5kcyBOZ1pvbmUge1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX21vY2tPblN0YWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKGZhbHNlKTtcblxuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoe2VuYWJsZUxvbmdTdGFja1RyYWNlOiBmYWxzZX0pOyB9XG5cbiAgZ2V0IG9uU3RhYmxlKCkgeyByZXR1cm4gdGhpcy5fbW9ja09uU3RhYmxlOyB9XG5cbiAgcnVuKGZuOiBGdW5jdGlvbik6IGFueSB7IHJldHVybiBmbigpOyB9XG5cbiAgcnVuT3V0c2lkZUFuZ3VsYXIoZm46IEZ1bmN0aW9uKTogYW55IHsgcmV0dXJuIGZuKCk7IH1cblxuICBzaW11bGF0ZVpvbmVFeGl0KCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsTmV4dCh0aGlzLm9uU3RhYmxlLCBudWxsKTsgfVxufVxuIl19