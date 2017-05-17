"use strict";
var Observable_1 = require('../../Observable');
var ErrorObservable_1 = require('../../observable/ErrorObservable');
Observable_1.Observable.throw = ErrorObservable_1.ErrorObservable.create;
//# sourceMappingURL=throw.js.map