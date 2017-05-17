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
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
/**
 * Creates a new String with some or all of the matches of a pattern replaced by
 * a replacement.
 *
 * The pattern to be matched is specified by the 'pattern' parameter.
 *
 * The replacement to be set is specified by the 'replacement' parameter.
 *
 * An optional 'flags' parameter can be set.
 *
 * ### Usage
 *
 *     expression | replace:pattern:replacement
 *
 * All behavior is based on the expected behavior of the JavaScript API
 * String.prototype.replace() function.
 *
 * Where the input expression is a [String] or [Number] (to be treated as a string),
 * the `pattern` is a [String] or [RegExp],
 * the 'replacement' is a [String] or [Function].
 *
 * --Note--: The 'pattern' parameter will be converted to a RegExp instance. Make sure to escape the
 * string properly if you are matching for regular expression special characters like parenthesis,
 * brackets etc.
 */
var ReplacePipe = (function () {
    function ReplacePipe() {
    }
    ReplacePipe.prototype.transform = function (value, args) {
        if (lang_1.isBlank(args) || args.length !== 2) {
            throw new exceptions_1.BaseException('ReplacePipe requires two arguments');
        }
        if (lang_1.isBlank(value)) {
            return value;
        }
        if (!this._supportedInput(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, value);
        }
        var input = value.toString();
        var pattern = args[0];
        var replacement = args[1];
        if (!this._supportedPattern(pattern)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, pattern);
        }
        if (!this._supportedReplacement(replacement)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, replacement);
        }
        // template fails with literal RegExp e.g /pattern/igm
        // var rgx = pattern instanceof RegExp ? pattern : RegExpWrapper.create(pattern);
        if (lang_1.isFunction(replacement)) {
            var rgxPattern = lang_1.isString(pattern) ? lang_1.RegExpWrapper.create(pattern) : pattern;
            return lang_1.StringWrapper.replaceAllMapped(input, rgxPattern, replacement);
        }
        if (pattern instanceof RegExp) {
            // use the replaceAll variant
            return lang_1.StringWrapper.replaceAll(input, pattern, replacement);
        }
        return lang_1.StringWrapper.replace(input, pattern, replacement);
    };
    ReplacePipe.prototype._supportedInput = function (input) { return lang_1.isString(input) || lang_1.isNumber(input); };
    ReplacePipe.prototype._supportedPattern = function (pattern) {
        return lang_1.isString(pattern) || pattern instanceof RegExp;
    };
    ReplacePipe.prototype._supportedReplacement = function (replacement) {
        return lang_1.isString(replacement) || lang_1.isFunction(replacement);
    };
    ReplacePipe = __decorate([
        core_1.Pipe({ name: 'replace' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ReplacePipe);
    return ReplacePipe;
})();
exports.ReplacePipe = ReplacePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9yZXBsYWNlX3BpcGUudHMiXSwibmFtZXMiOlsiUmVwbGFjZVBpcGUiLCJSZXBsYWNlUGlwZS5jb25zdHJ1Y3RvciIsIlJlcGxhY2VQaXBlLnRyYW5zZm9ybSIsIlJlcGxhY2VQaXBlLl9zdXBwb3J0ZWRJbnB1dCIsIlJlcGxhY2VQaXBlLl9zdXBwb3J0ZWRQYXR0ZXJuIiwiUmVwbGFjZVBpcGUuX3N1cHBvcnRlZFJlcGxhY2VtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHFCQUE4QyxlQUFlLENBQUMsQ0FBQTtBQUM5RCxnREFBMkMsbUNBQW1DLENBQUMsQ0FBQTtBQUUvRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0JHO0FBRUg7SUFBQUE7SUFvREFDLENBQUNBO0lBakRDRCwrQkFBU0EsR0FBVEEsVUFBVUEsS0FBVUEsRUFBRUEsSUFBV0E7UUFDL0JFLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0Esb0NBQW9DQSxDQUFDQSxDQUFDQTtRQUNoRUEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxJQUFJQSw4REFBNEJBLENBQUNBLFdBQVdBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQzdEQSxDQUFDQTtRQUVEQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUM3QkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDdEJBLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBRzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxJQUFJQSw4REFBNEJBLENBQUNBLFdBQVdBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQy9EQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdDQSxNQUFNQSxJQUFJQSw4REFBNEJBLENBQUNBLFdBQVdBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO1FBQ25FQSxDQUFDQTtRQUNEQSxzREFBc0RBO1FBQ3REQSxpRkFBaUZBO1FBRWpGQSxFQUFFQSxDQUFDQSxDQUFDQSxpQkFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLElBQUlBLFVBQVVBLEdBQUdBLGVBQVFBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLG9CQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQTtZQUU3RUEsTUFBTUEsQ0FBQ0Esb0JBQWFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsVUFBVUEsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLFlBQVlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQzlCQSw2QkFBNkJBO1lBQzdCQSxNQUFNQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLG9CQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxFQUFFQSxPQUFPQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUM1REEsQ0FBQ0E7SUFFT0YscUNBQWVBLEdBQXZCQSxVQUF3QkEsS0FBVUEsSUFBYUcsTUFBTUEsQ0FBQ0EsZUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsZUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFbkZILHVDQUFpQkEsR0FBekJBLFVBQTBCQSxPQUFZQTtRQUNwQ0ksTUFBTUEsQ0FBQ0EsZUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsT0FBT0EsWUFBWUEsTUFBTUEsQ0FBQ0E7SUFDeERBLENBQUNBO0lBRU9KLDJDQUFxQkEsR0FBN0JBLFVBQThCQSxXQUFnQkE7UUFDNUNLLE1BQU1BLENBQUNBLGVBQVFBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLGlCQUFVQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUMxREEsQ0FBQ0E7SUFuREhMO1FBQUNBLFdBQUlBLENBQUNBLEVBQUNBLElBQUlBLEVBQUVBLFNBQVNBLEVBQUNBLENBQUNBO1FBQ3ZCQSxpQkFBVUEsRUFBRUE7O29CQW1EWkE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBcERELElBb0RDO0FBbERZLG1CQUFXLGNBa0R2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNCbGFuayxcbiAgaXNTdHJpbmcsXG4gIGlzTnVtYmVyLFxuICBpc0Z1bmN0aW9uLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGUsIFBpcGVUcmFuc2Zvcm0sIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgU3RyaW5nIHdpdGggc29tZSBvciBhbGwgb2YgdGhlIG1hdGNoZXMgb2YgYSBwYXR0ZXJuIHJlcGxhY2VkIGJ5XG4gKiBhIHJlcGxhY2VtZW50LlxuICpcbiAqIFRoZSBwYXR0ZXJuIHRvIGJlIG1hdGNoZWQgaXMgc3BlY2lmaWVkIGJ5IHRoZSAncGF0dGVybicgcGFyYW1ldGVyLlxuICpcbiAqIFRoZSByZXBsYWNlbWVudCB0byBiZSBzZXQgaXMgc3BlY2lmaWVkIGJ5IHRoZSAncmVwbGFjZW1lbnQnIHBhcmFtZXRlci5cbiAqXG4gKiBBbiBvcHRpb25hbCAnZmxhZ3MnIHBhcmFtZXRlciBjYW4gYmUgc2V0LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgcmVwbGFjZTpwYXR0ZXJuOnJlcGxhY2VtZW50XG4gKlxuICogQWxsIGJlaGF2aW9yIGlzIGJhc2VkIG9uIHRoZSBleHBlY3RlZCBiZWhhdmlvciBvZiB0aGUgSmF2YVNjcmlwdCBBUElcbiAqIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSgpIGZ1bmN0aW9uLlxuICpcbiAqIFdoZXJlIHRoZSBpbnB1dCBleHByZXNzaW9uIGlzIGEgW1N0cmluZ10gb3IgW051bWJlcl0gKHRvIGJlIHRyZWF0ZWQgYXMgYSBzdHJpbmcpLFxuICogdGhlIGBwYXR0ZXJuYCBpcyBhIFtTdHJpbmddIG9yIFtSZWdFeHBdLFxuICogdGhlICdyZXBsYWNlbWVudCcgaXMgYSBbU3RyaW5nXSBvciBbRnVuY3Rpb25dLlxuICpcbiAqIC0tTm90ZS0tOiBUaGUgJ3BhdHRlcm4nIHBhcmFtZXRlciB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIFJlZ0V4cCBpbnN0YW5jZS4gTWFrZSBzdXJlIHRvIGVzY2FwZSB0aGVcbiAqIHN0cmluZyBwcm9wZXJseSBpZiB5b3UgYXJlIG1hdGNoaW5nIGZvciByZWd1bGFyIGV4cHJlc3Npb24gc3BlY2lhbCBjaGFyYWN0ZXJzIGxpa2UgcGFyZW50aGVzaXMsXG4gKiBicmFja2V0cyBldGMuXG4gKi9cblxuQFBpcGUoe25hbWU6ICdyZXBsYWNlJ30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVwbGFjZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogYW55IHtcbiAgICBpZiAoaXNCbGFuayhhcmdzKSB8fCBhcmdzLmxlbmd0aCAhPT0gMikge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ1JlcGxhY2VQaXBlIHJlcXVpcmVzIHR3byBhcmd1bWVudHMnKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX3N1cHBvcnRlZElucHV0KHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oUmVwbGFjZVBpcGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICB2YXIgaW5wdXQgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgIHZhciBwYXR0ZXJuID0gYXJnc1swXTtcbiAgICB2YXIgcmVwbGFjZW1lbnQgPSBhcmdzWzFdO1xuXG5cbiAgICBpZiAoIXRoaXMuX3N1cHBvcnRlZFBhdHRlcm4ocGF0dGVybikpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKFJlcGxhY2VQaXBlLCBwYXR0ZXJuKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9zdXBwb3J0ZWRSZXBsYWNlbWVudChyZXBsYWNlbWVudCkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKFJlcGxhY2VQaXBlLCByZXBsYWNlbWVudCk7XG4gICAgfVxuICAgIC8vIHRlbXBsYXRlIGZhaWxzIHdpdGggbGl0ZXJhbCBSZWdFeHAgZS5nIC9wYXR0ZXJuL2lnbVxuICAgIC8vIHZhciByZ3ggPSBwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwID8gcGF0dGVybiA6IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKHBhdHRlcm4pO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24ocmVwbGFjZW1lbnQpKSB7XG4gICAgICB2YXIgcmd4UGF0dGVybiA9IGlzU3RyaW5nKHBhdHRlcm4pID8gUmVnRXhwV3JhcHBlci5jcmVhdGUocGF0dGVybikgOiBwYXR0ZXJuO1xuXG4gICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGlucHV0LCByZ3hQYXR0ZXJuLCByZXBsYWNlbWVudCk7XG4gICAgfVxuICAgIGlmIChwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAvLyB1c2UgdGhlIHJlcGxhY2VBbGwgdmFyaWFudFxuICAgICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChpbnB1dCwgcGF0dGVybiwgcmVwbGFjZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2UoaW5wdXQsIHBhdHRlcm4sIHJlcGxhY2VtZW50KTtcbiAgfVxuXG4gIHByaXZhdGUgX3N1cHBvcnRlZElucHV0KGlucHV0OiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIGlzU3RyaW5nKGlucHV0KSB8fCBpc051bWJlcihpbnB1dCk7IH1cblxuICBwcml2YXRlIF9zdXBwb3J0ZWRQYXR0ZXJuKHBhdHRlcm46IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1N0cmluZyhwYXR0ZXJuKSB8fCBwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3VwcG9ydGVkUmVwbGFjZW1lbnQocmVwbGFjZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1N0cmluZyhyZXBsYWNlbWVudCkgfHwgaXNGdW5jdGlvbihyZXBsYWNlbWVudCk7XG4gIH1cbn1cbiJdfQ==