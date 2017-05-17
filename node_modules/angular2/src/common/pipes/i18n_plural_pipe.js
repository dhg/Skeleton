'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
var interpolationExp = lang_1.RegExpWrapper.create('#');
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
var I18nPluralPipe = (function () {
    function I18nPluralPipe() {
    }
    I18nPluralPipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        var key;
        var valueStr;
        var pluralMap = (args[0]);
        if (!lang_1.isStringMap(pluralMap)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(I18nPluralPipe, pluralMap);
        }
        key = value === 0 || value === 1 ? "=" + value : 'other';
        valueStr = lang_1.isPresent(value) ? value.toString() : '';
        return lang_1.StringWrapper.replaceAll(pluralMap[key], interpolationExp, valueStr);
    };
    I18nPluralPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'i18nPlural', pure: true }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], I18nPluralPipe);
    return I18nPluralPipe;
})();
exports.I18nPluralPipe = I18nPluralPipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wbHVyYWxfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvaTE4bl9wbHVyYWxfcGlwZS50cyJdLCJuYW1lcyI6WyJJMThuUGx1cmFsUGlwZSIsIkkxOG5QbHVyYWxQaXBlLmNvbnN0cnVjdG9yIiwiSTE4blBsdXJhbFBpcGUudHJhbnNmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFNTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLHFCQUE4QyxlQUFlLENBQUMsQ0FBQTtBQUM5RCxnREFBMkMsbUNBQW1DLENBQUMsQ0FBQTtBQUUvRSxJQUFJLGdCQUFnQixHQUFXLG9CQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRXpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUFBQTtJQWtCQUMsQ0FBQ0E7SUFkQ0Qsa0NBQVNBLEdBQVRBLFVBQVVBLEtBQWFBLEVBQUVBLElBQWtCQTtRQUFsQkUsb0JBQWtCQSxHQUFsQkEsV0FBa0JBO1FBQ3pDQSxJQUFJQSxHQUFXQSxDQUFDQTtRQUNoQkEsSUFBSUEsUUFBZ0JBLENBQUNBO1FBQ3JCQSxJQUFJQSxTQUFTQSxHQUF5REEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaEZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGtCQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsSUFBSUEsOERBQTRCQSxDQUFDQSxjQUFjQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUNwRUEsQ0FBQ0E7UUFFREEsR0FBR0EsR0FBR0EsS0FBS0EsS0FBS0EsQ0FBQ0EsSUFBSUEsS0FBS0EsS0FBS0EsQ0FBQ0EsR0FBR0EsTUFBSUEsS0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDekRBLFFBQVFBLEdBQUdBLGdCQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUVwREEsTUFBTUEsQ0FBQ0Esb0JBQWFBLENBQUNBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLGdCQUFnQkEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDOUVBLENBQUNBO0lBakJIRjtRQUFDQSxZQUFLQSxFQUFFQTtRQUNQQSxXQUFJQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxZQUFZQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFDQSxDQUFDQTtRQUN0Q0EsaUJBQVVBLEVBQUVBOzt1QkFnQlpBO0lBQURBLHFCQUFDQTtBQUFEQSxDQUFDQSxBQWxCRCxJQWtCQztBQWZZLHNCQUFjLGlCQWUxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ09OU1QsXG4gIGlzU3RyaW5nTWFwLFxuICBTdHJpbmdXcmFwcGVyLFxuICBpc1ByZXNlbnQsXG4gIFJlZ0V4cFdyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZVRyYW5zZm9ybSwgUGlwZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0ludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb259IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbic7XG5cbnZhciBpbnRlcnBvbGF0aW9uRXhwOiBSZWdFeHAgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnIycpO1xuXG4vKipcbiAqXG4gKiAgTWFwcyBhIHZhbHVlIHRvIGEgc3RyaW5nIHRoYXQgcGx1cmFsaXplcyB0aGUgdmFsdWUgcHJvcGVybHkuXG4gKlxuICogICMjIFVzYWdlXG4gKlxuICogIGV4cHJlc3Npb24gfCBpMThuUGx1cmFsOm1hcHBpbmdcbiAqXG4gKiAgd2hlcmUgYGV4cHJlc3Npb25gIGlzIGEgbnVtYmVyIGFuZCBgbWFwcGluZ2AgaXMgYW4gb2JqZWN0IHRoYXQgaW5kaWNhdGVzIHRoZSBwcm9wZXIgdGV4dCBmb3JcbiAqICB3aGVuIHRoZSBgZXhwcmVzc2lvbmAgZXZhbHVhdGVzIHRvIDAsIDEsIG9yIHNvbWUgb3RoZXIgbnVtYmVyLiAgWW91IGNhbiBpbnRlcnBvbGF0ZSB0aGUgYWN0dWFsXG4gKiAgdmFsdWUgaW50byB0aGUgdGV4dCB1c2luZyB0aGUgYCNgIHNpZ24uXG4gKlxuICogICMjIEV4YW1wbGVcbiAqXG4gKiAgYGBgXG4gKiAgPGRpdj5cbiAqICAgIHt7IG1lc3NhZ2VzLmxlbmd0aCB8IGkxOG5QbHVyYWw6IG1lc3NhZ2VNYXBwaW5nIH19XG4gKiAgPC9kaXY+XG4gKlxuICogIGNsYXNzIE15QXBwIHtcbiAqICAgIG1lc3NhZ2VzOiBhbnlbXTtcbiAqICAgIG1lc3NhZ2VNYXBwaW5nOiBhbnkgPSB7XG4gKiAgICAgICc9MCc6ICdObyBtZXNzYWdlcy4nLFxuICogICAgICAnPTEnOiAnT25lIG1lc3NhZ2UuJyxcbiAqICAgICAgJ290aGVyJzogJyMgbWVzc2FnZXMuJ1xuICogICAgfVxuICogICAgLi4uXG4gKiAgfVxuICogIGBgYFxuICpcbiAqL1xuQENPTlNUKClcbkBQaXBlKHtuYW1lOiAnaTE4blBsdXJhbCcsIHB1cmU6IHRydWV9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEkxOG5QbHVyYWxQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVtYmVyLCBhcmdzOiBhbnlbXSA9IG51bGwpOiBzdHJpbmcge1xuICAgIHZhciBrZXk6IHN0cmluZztcbiAgICB2YXIgdmFsdWVTdHI6IHN0cmluZztcbiAgICB2YXIgcGx1cmFsTWFwOiB7W2NvdW50OiBzdHJpbmddOiBzdHJpbmd9ID0gPHtbY291bnQ6IHN0cmluZ106IHN0cmluZ30+KGFyZ3NbMF0pO1xuXG4gICAgaWYgKCFpc1N0cmluZ01hcChwbHVyYWxNYXApKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihJMThuUGx1cmFsUGlwZSwgcGx1cmFsTWFwKTtcbiAgICB9XG5cbiAgICBrZXkgPSB2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA9PT0gMSA/IGA9JHt2YWx1ZX1gIDogJ290aGVyJztcbiAgICB2YWx1ZVN0ciA9IGlzUHJlc2VudCh2YWx1ZSkgPyB2YWx1ZS50b1N0cmluZygpIDogJyc7XG5cbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHBsdXJhbE1hcFtrZXldLCBpbnRlcnBvbGF0aW9uRXhwLCB2YWx1ZVN0cik7XG4gIH1cbn1cbiJdfQ==