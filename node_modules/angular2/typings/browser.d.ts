// Typings needed for compilation with --target=es5
///<reference path="./es6-collections/es6-collections.d.ts"/>
///<reference path="./es6-promise/es6-promise.d.ts"/>
// Workaround for https://github.com/ReactiveX/RxJS/issues/1270
// to be removed when angular2 upgrades to rxjs beta.2
declare type PromiseConstructor = typeof Promise;
