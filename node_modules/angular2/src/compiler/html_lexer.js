'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var parse_util_1 = require('./parse_util');
var html_tags_1 = require('./html_tags');
(function (HtmlTokenType) {
    HtmlTokenType[HtmlTokenType["TAG_OPEN_START"] = 0] = "TAG_OPEN_START";
    HtmlTokenType[HtmlTokenType["TAG_OPEN_END"] = 1] = "TAG_OPEN_END";
    HtmlTokenType[HtmlTokenType["TAG_OPEN_END_VOID"] = 2] = "TAG_OPEN_END_VOID";
    HtmlTokenType[HtmlTokenType["TAG_CLOSE"] = 3] = "TAG_CLOSE";
    HtmlTokenType[HtmlTokenType["TEXT"] = 4] = "TEXT";
    HtmlTokenType[HtmlTokenType["ESCAPABLE_RAW_TEXT"] = 5] = "ESCAPABLE_RAW_TEXT";
    HtmlTokenType[HtmlTokenType["RAW_TEXT"] = 6] = "RAW_TEXT";
    HtmlTokenType[HtmlTokenType["COMMENT_START"] = 7] = "COMMENT_START";
    HtmlTokenType[HtmlTokenType["COMMENT_END"] = 8] = "COMMENT_END";
    HtmlTokenType[HtmlTokenType["CDATA_START"] = 9] = "CDATA_START";
    HtmlTokenType[HtmlTokenType["CDATA_END"] = 10] = "CDATA_END";
    HtmlTokenType[HtmlTokenType["ATTR_NAME"] = 11] = "ATTR_NAME";
    HtmlTokenType[HtmlTokenType["ATTR_VALUE"] = 12] = "ATTR_VALUE";
    HtmlTokenType[HtmlTokenType["DOC_TYPE"] = 13] = "DOC_TYPE";
    HtmlTokenType[HtmlTokenType["EOF"] = 14] = "EOF";
})(exports.HtmlTokenType || (exports.HtmlTokenType = {}));
var HtmlTokenType = exports.HtmlTokenType;
var HtmlToken = (function () {
    function HtmlToken(type, parts, sourceSpan) {
        this.type = type;
        this.parts = parts;
        this.sourceSpan = sourceSpan;
    }
    return HtmlToken;
})();
exports.HtmlToken = HtmlToken;
var HtmlTokenError = (function (_super) {
    __extends(HtmlTokenError, _super);
    function HtmlTokenError(errorMsg, tokenType, span) {
        _super.call(this, span, errorMsg);
        this.tokenType = tokenType;
    }
    return HtmlTokenError;
})(parse_util_1.ParseError);
exports.HtmlTokenError = HtmlTokenError;
var HtmlTokenizeResult = (function () {
    function HtmlTokenizeResult(tokens, errors) {
        this.tokens = tokens;
        this.errors = errors;
    }
    return HtmlTokenizeResult;
})();
exports.HtmlTokenizeResult = HtmlTokenizeResult;
function tokenizeHtml(sourceContent, sourceUrl) {
    return new _HtmlTokenizer(new parse_util_1.ParseSourceFile(sourceContent, sourceUrl)).tokenize();
}
exports.tokenizeHtml = tokenizeHtml;
var $EOF = 0;
var $TAB = 9;
var $LF = 10;
var $FF = 12;
var $CR = 13;
var $SPACE = 32;
var $BANG = 33;
var $DQ = 34;
var $HASH = 35;
var $$ = 36;
var $AMPERSAND = 38;
var $SQ = 39;
var $MINUS = 45;
var $SLASH = 47;
var $0 = 48;
var $SEMICOLON = 59;
var $9 = 57;
var $COLON = 58;
var $LT = 60;
var $EQ = 61;
var $GT = 62;
var $QUESTION = 63;
var $LBRACKET = 91;
var $RBRACKET = 93;
var $A = 65;
var $F = 70;
var $X = 88;
var $Z = 90;
var $a = 97;
var $f = 102;
var $z = 122;
var $x = 120;
var $NBSP = 160;
var CR_OR_CRLF_REGEXP = /\r\n?/g;
function unexpectedCharacterErrorMsg(charCode) {
    var char = charCode === $EOF ? 'EOF' : lang_1.StringWrapper.fromCharCode(charCode);
    return "Unexpected character \"" + char + "\"";
}
function unknownEntityErrorMsg(entitySrc) {
    return "Unknown entity \"" + entitySrc + "\" - use the \"&#<decimal>;\" or  \"&#x<hex>;\" syntax";
}
var ControlFlowError = (function () {
    function ControlFlowError(error) {
        this.error = error;
    }
    return ControlFlowError;
})();
// See http://www.w3.org/TR/html51/syntax.html#writing
var _HtmlTokenizer = (function () {
    function _HtmlTokenizer(file) {
        this.file = file;
        // Note: this is always lowercase!
        this.peek = -1;
        this.index = -1;
        this.line = 0;
        this.column = -1;
        this.tokens = [];
        this.errors = [];
        this.input = file.content;
        this.length = file.content.length;
        this._advance();
    }
    _HtmlTokenizer.prototype._processCarriageReturns = function (content) {
        // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream
        // In order to keep the original position in the source, we can not
        // pre-process it.
        // Instead CRs are processed right before instantiating the tokens.
        return lang_1.StringWrapper.replaceAll(content, CR_OR_CRLF_REGEXP, '\n');
    };
    _HtmlTokenizer.prototype.tokenize = function () {
        while (this.peek !== $EOF) {
            var start = this._getLocation();
            try {
                if (this._attemptCharCode($LT)) {
                    if (this._attemptCharCode($BANG)) {
                        if (this._attemptCharCode($LBRACKET)) {
                            this._consumeCdata(start);
                        }
                        else if (this._attemptCharCode($MINUS)) {
                            this._consumeComment(start);
                        }
                        else {
                            this._consumeDocType(start);
                        }
                    }
                    else if (this._attemptCharCode($SLASH)) {
                        this._consumeTagClose(start);
                    }
                    else {
                        this._consumeTagOpen(start);
                    }
                }
                else {
                    this._consumeText();
                }
            }
            catch (e) {
                if (e instanceof ControlFlowError) {
                    this.errors.push(e.error);
                }
                else {
                    throw e;
                }
            }
        }
        this._beginToken(HtmlTokenType.EOF);
        this._endToken([]);
        return new HtmlTokenizeResult(mergeTextTokens(this.tokens), this.errors);
    };
    _HtmlTokenizer.prototype._getLocation = function () {
        return new parse_util_1.ParseLocation(this.file, this.index, this.line, this.column);
    };
    _HtmlTokenizer.prototype._getSpan = function (start, end) {
        if (lang_1.isBlank(start)) {
            start = this._getLocation();
        }
        if (lang_1.isBlank(end)) {
            end = this._getLocation();
        }
        return new parse_util_1.ParseSourceSpan(start, end);
    };
    _HtmlTokenizer.prototype._beginToken = function (type, start) {
        if (start === void 0) { start = null; }
        if (lang_1.isBlank(start)) {
            start = this._getLocation();
        }
        this.currentTokenStart = start;
        this.currentTokenType = type;
    };
    _HtmlTokenizer.prototype._endToken = function (parts, end) {
        if (end === void 0) { end = null; }
        if (lang_1.isBlank(end)) {
            end = this._getLocation();
        }
        var token = new HtmlToken(this.currentTokenType, parts, new parse_util_1.ParseSourceSpan(this.currentTokenStart, end));
        this.tokens.push(token);
        this.currentTokenStart = null;
        this.currentTokenType = null;
        return token;
    };
    _HtmlTokenizer.prototype._createError = function (msg, span) {
        var error = new HtmlTokenError(msg, this.currentTokenType, span);
        this.currentTokenStart = null;
        this.currentTokenType = null;
        return new ControlFlowError(error);
    };
    _HtmlTokenizer.prototype._advance = function () {
        if (this.index >= this.length) {
            throw this._createError(unexpectedCharacterErrorMsg($EOF), this._getSpan());
        }
        if (this.peek === $LF) {
            this.line++;
            this.column = 0;
        }
        else if (this.peek !== $LF && this.peek !== $CR) {
            this.column++;
        }
        this.index++;
        this.peek = this.index >= this.length ? $EOF : lang_1.StringWrapper.charCodeAt(this.input, this.index);
    };
    _HtmlTokenizer.prototype._attemptCharCode = function (charCode) {
        if (this.peek === charCode) {
            this._advance();
            return true;
        }
        return false;
    };
    _HtmlTokenizer.prototype._attemptCharCodeCaseInsensitive = function (charCode) {
        if (compareCharCodeCaseInsensitive(this.peek, charCode)) {
            this._advance();
            return true;
        }
        return false;
    };
    _HtmlTokenizer.prototype._requireCharCode = function (charCode) {
        var location = this._getLocation();
        if (!this._attemptCharCode(charCode)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(location, location));
        }
    };
    _HtmlTokenizer.prototype._attemptStr = function (chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!this._attemptCharCode(lang_1.StringWrapper.charCodeAt(chars, i))) {
                return false;
            }
        }
        return true;
    };
    _HtmlTokenizer.prototype._attemptStrCaseInsensitive = function (chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!this._attemptCharCodeCaseInsensitive(lang_1.StringWrapper.charCodeAt(chars, i))) {
                return false;
            }
        }
        return true;
    };
    _HtmlTokenizer.prototype._requireStr = function (chars) {
        var location = this._getLocation();
        if (!this._attemptStr(chars)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(location));
        }
    };
    _HtmlTokenizer.prototype._attemptCharCodeUntilFn = function (predicate) {
        while (!predicate(this.peek)) {
            this._advance();
        }
    };
    _HtmlTokenizer.prototype._requireCharCodeUntilFn = function (predicate, len) {
        var start = this._getLocation();
        this._attemptCharCodeUntilFn(predicate);
        if (this.index - start.offset < len) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(start, start));
        }
    };
    _HtmlTokenizer.prototype._attemptUntilChar = function (char) {
        while (this.peek !== char) {
            this._advance();
        }
    };
    _HtmlTokenizer.prototype._readChar = function (decodeEntities) {
        if (decodeEntities && this.peek === $AMPERSAND) {
            return this._decodeEntity();
        }
        else {
            var index = this.index;
            this._advance();
            return this.input[index];
        }
    };
    _HtmlTokenizer.prototype._decodeEntity = function () {
        var start = this._getLocation();
        this._advance();
        if (this._attemptCharCode($HASH)) {
            var isHex = this._attemptCharCode($x) || this._attemptCharCode($X);
            var numberStart = this._getLocation().offset;
            this._attemptCharCodeUntilFn(isDigitEntityEnd);
            if (this.peek != $SEMICOLON) {
                throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan());
            }
            this._advance();
            var strNum = this.input.substring(numberStart, this.index - 1);
            try {
                var charCode = lang_1.NumberWrapper.parseInt(strNum, isHex ? 16 : 10);
                return lang_1.StringWrapper.fromCharCode(charCode);
            }
            catch (e) {
                var entity = this.input.substring(start.offset + 1, this.index - 1);
                throw this._createError(unknownEntityErrorMsg(entity), this._getSpan(start));
            }
        }
        else {
            var startPosition = this._savePosition();
            this._attemptCharCodeUntilFn(isNamedEntityEnd);
            if (this.peek != $SEMICOLON) {
                this._restorePosition(startPosition);
                return '&';
            }
            this._advance();
            var name_1 = this.input.substring(start.offset + 1, this.index - 1);
            var char = html_tags_1.NAMED_ENTITIES[name_1];
            if (lang_1.isBlank(char)) {
                throw this._createError(unknownEntityErrorMsg(name_1), this._getSpan(start));
            }
            return char;
        }
    };
    _HtmlTokenizer.prototype._consumeRawText = function (decodeEntities, firstCharOfEnd, attemptEndRest) {
        var tagCloseStart;
        var textStart = this._getLocation();
        this._beginToken(decodeEntities ? HtmlTokenType.ESCAPABLE_RAW_TEXT : HtmlTokenType.RAW_TEXT, textStart);
        var parts = [];
        while (true) {
            tagCloseStart = this._getLocation();
            if (this._attemptCharCode(firstCharOfEnd) && attemptEndRest()) {
                break;
            }
            if (this.index > tagCloseStart.offset) {
                parts.push(this.input.substring(tagCloseStart.offset, this.index));
            }
            while (this.peek !== firstCharOfEnd) {
                parts.push(this._readChar(decodeEntities));
            }
        }
        return this._endToken([this._processCarriageReturns(parts.join(''))], tagCloseStart);
    };
    _HtmlTokenizer.prototype._consumeComment = function (start) {
        var _this = this;
        this._beginToken(HtmlTokenType.COMMENT_START, start);
        this._requireCharCode($MINUS);
        this._endToken([]);
        var textToken = this._consumeRawText(false, $MINUS, function () { return _this._attemptStr('->'); });
        this._beginToken(HtmlTokenType.COMMENT_END, textToken.sourceSpan.end);
        this._endToken([]);
    };
    _HtmlTokenizer.prototype._consumeCdata = function (start) {
        var _this = this;
        this._beginToken(HtmlTokenType.CDATA_START, start);
        this._requireStr('CDATA[');
        this._endToken([]);
        var textToken = this._consumeRawText(false, $RBRACKET, function () { return _this._attemptStr(']>'); });
        this._beginToken(HtmlTokenType.CDATA_END, textToken.sourceSpan.end);
        this._endToken([]);
    };
    _HtmlTokenizer.prototype._consumeDocType = function (start) {
        this._beginToken(HtmlTokenType.DOC_TYPE, start);
        this._attemptUntilChar($GT);
        this._advance();
        this._endToken([this.input.substring(start.offset + 2, this.index - 1)]);
    };
    _HtmlTokenizer.prototype._consumePrefixAndName = function () {
        var nameOrPrefixStart = this.index;
        var prefix = null;
        while (this.peek !== $COLON && !isPrefixEnd(this.peek)) {
            this._advance();
        }
        var nameStart;
        if (this.peek === $COLON) {
            this._advance();
            prefix = this.input.substring(nameOrPrefixStart, this.index - 1);
            nameStart = this.index;
        }
        else {
            nameStart = nameOrPrefixStart;
        }
        this._requireCharCodeUntilFn(isNameEnd, this.index === nameStart ? 1 : 0);
        var name = this.input.substring(nameStart, this.index);
        return [prefix, name];
    };
    _HtmlTokenizer.prototype._consumeTagOpen = function (start) {
        var savedPos = this._savePosition();
        var lowercaseTagName;
        try {
            if (!isAsciiLetter(this.peek)) {
                throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan());
            }
            var nameStart = this.index;
            this._consumeTagOpenStart(start);
            lowercaseTagName = this.input.substring(nameStart, this.index).toLowerCase();
            this._attemptCharCodeUntilFn(isNotWhitespace);
            while (this.peek !== $SLASH && this.peek !== $GT) {
                this._consumeAttributeName();
                this._attemptCharCodeUntilFn(isNotWhitespace);
                if (this._attemptCharCode($EQ)) {
                    this._attemptCharCodeUntilFn(isNotWhitespace);
                    this._consumeAttributeValue();
                }
                this._attemptCharCodeUntilFn(isNotWhitespace);
            }
            this._consumeTagOpenEnd();
        }
        catch (e) {
            if (e instanceof ControlFlowError) {
                // When the start tag is invalid, assume we want a "<"
                this._restorePosition(savedPos);
                // Back to back text tokens are merged at the end
                this._beginToken(HtmlTokenType.TEXT, start);
                this._endToken(['<']);
                return;
            }
            throw e;
        }
        var contentTokenType = html_tags_1.getHtmlTagDefinition(lowercaseTagName).contentType;
        if (contentTokenType === html_tags_1.HtmlTagContentType.RAW_TEXT) {
            this._consumeRawTextWithTagClose(lowercaseTagName, false);
        }
        else if (contentTokenType === html_tags_1.HtmlTagContentType.ESCAPABLE_RAW_TEXT) {
            this._consumeRawTextWithTagClose(lowercaseTagName, true);
        }
    };
    _HtmlTokenizer.prototype._consumeRawTextWithTagClose = function (lowercaseTagName, decodeEntities) {
        var _this = this;
        var textToken = this._consumeRawText(decodeEntities, $LT, function () {
            if (!_this._attemptCharCode($SLASH))
                return false;
            _this._attemptCharCodeUntilFn(isNotWhitespace);
            if (!_this._attemptStrCaseInsensitive(lowercaseTagName))
                return false;
            _this._attemptCharCodeUntilFn(isNotWhitespace);
            if (!_this._attemptCharCode($GT))
                return false;
            return true;
        });
        this._beginToken(HtmlTokenType.TAG_CLOSE, textToken.sourceSpan.end);
        this._endToken([null, lowercaseTagName]);
    };
    _HtmlTokenizer.prototype._consumeTagOpenStart = function (start) {
        this._beginToken(HtmlTokenType.TAG_OPEN_START, start);
        var parts = this._consumePrefixAndName();
        this._endToken(parts);
    };
    _HtmlTokenizer.prototype._consumeAttributeName = function () {
        this._beginToken(HtmlTokenType.ATTR_NAME);
        var prefixAndName = this._consumePrefixAndName();
        this._endToken(prefixAndName);
    };
    _HtmlTokenizer.prototype._consumeAttributeValue = function () {
        this._beginToken(HtmlTokenType.ATTR_VALUE);
        var value;
        if (this.peek === $SQ || this.peek === $DQ) {
            var quoteChar = this.peek;
            this._advance();
            var parts = [];
            while (this.peek !== quoteChar) {
                parts.push(this._readChar(true));
            }
            value = parts.join('');
            this._advance();
        }
        else {
            var valueStart = this.index;
            this._requireCharCodeUntilFn(isNameEnd, 1);
            value = this.input.substring(valueStart, this.index);
        }
        this._endToken([this._processCarriageReturns(value)]);
    };
    _HtmlTokenizer.prototype._consumeTagOpenEnd = function () {
        var tokenType = this._attemptCharCode($SLASH) ? HtmlTokenType.TAG_OPEN_END_VOID :
            HtmlTokenType.TAG_OPEN_END;
        this._beginToken(tokenType);
        this._requireCharCode($GT);
        this._endToken([]);
    };
    _HtmlTokenizer.prototype._consumeTagClose = function (start) {
        this._beginToken(HtmlTokenType.TAG_CLOSE, start);
        this._attemptCharCodeUntilFn(isNotWhitespace);
        var prefixAndName;
        prefixAndName = this._consumePrefixAndName();
        this._attemptCharCodeUntilFn(isNotWhitespace);
        this._requireCharCode($GT);
        this._endToken(prefixAndName);
    };
    _HtmlTokenizer.prototype._consumeText = function () {
        var start = this._getLocation();
        this._beginToken(HtmlTokenType.TEXT, start);
        var parts = [this._readChar(true)];
        while (!isTextEnd(this.peek)) {
            parts.push(this._readChar(true));
        }
        this._endToken([this._processCarriageReturns(parts.join(''))]);
    };
    _HtmlTokenizer.prototype._savePosition = function () {
        return [this.peek, this.index, this.column, this.line, this.tokens.length];
    };
    _HtmlTokenizer.prototype._restorePosition = function (position) {
        this.peek = position[0];
        this.index = position[1];
        this.column = position[2];
        this.line = position[3];
        var nbTokens = position[4];
        if (nbTokens < this.tokens.length) {
            // remove any extra tokens
            this.tokens = collection_1.ListWrapper.slice(this.tokens, 0, nbTokens);
        }
    };
    return _HtmlTokenizer;
})();
function isNotWhitespace(code) {
    return !isWhitespace(code) || code === $EOF;
}
function isWhitespace(code) {
    return (code >= $TAB && code <= $SPACE) || (code === $NBSP);
}
function isNameEnd(code) {
    return isWhitespace(code) || code === $GT || code === $SLASH || code === $SQ || code === $DQ ||
        code === $EQ;
}
function isPrefixEnd(code) {
    return (code < $a || $z < code) && (code < $A || $Z < code) && (code < $0 || code > $9);
}
function isDigitEntityEnd(code) {
    return code == $SEMICOLON || code == $EOF || !isAsciiHexDigit(code);
}
function isNamedEntityEnd(code) {
    return code == $SEMICOLON || code == $EOF || !isAsciiLetter(code);
}
function isTextEnd(code) {
    return code === $LT || code === $EOF;
}
function isAsciiLetter(code) {
    return code >= $a && code <= $z || code >= $A && code <= $Z;
}
function isAsciiHexDigit(code) {
    return code >= $a && code <= $f || code >= $A && code <= $F || code >= $0 && code <= $9;
}
function compareCharCodeCaseInsensitive(code1, code2) {
    return toUpperCaseCharCode(code1) == toUpperCaseCharCode(code2);
}
function toUpperCaseCharCode(code) {
    return code >= $a && code <= $z ? code - $a + $A : code;
}
function mergeTextTokens(srcTokens) {
    var dstTokens = [];
    var lastDstToken;
    for (var i = 0; i < srcTokens.length; i++) {
        var token = srcTokens[i];
        if (lang_1.isPresent(lastDstToken) && lastDstToken.type == HtmlTokenType.TEXT &&
            token.type == HtmlTokenType.TEXT) {
            lastDstToken.parts[0] += token.parts[0];
            lastDstToken.sourceSpan.end = token.sourceSpan.end;
        }
        else {
            lastDstToken = token;
            dstTokens.push(lastDstToken);
        }
    }
    return dstTokens;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9sZXhlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX2xleGVyLnRzIl0sIm5hbWVzIjpbIkh0bWxUb2tlblR5cGUiLCJIdG1sVG9rZW4iLCJIdG1sVG9rZW4uY29uc3RydWN0b3IiLCJIdG1sVG9rZW5FcnJvciIsIkh0bWxUb2tlbkVycm9yLmNvbnN0cnVjdG9yIiwiSHRtbFRva2VuaXplUmVzdWx0IiwiSHRtbFRva2VuaXplUmVzdWx0LmNvbnN0cnVjdG9yIiwidG9rZW5pemVIdG1sIiwidW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnIiwidW5rbm93bkVudGl0eUVycm9yTXNnIiwiQ29udHJvbEZsb3dFcnJvciIsIkNvbnRyb2xGbG93RXJyb3IuY29uc3RydWN0b3IiLCJfSHRtbFRva2VuaXplciIsIl9IdG1sVG9rZW5pemVyLmNvbnN0cnVjdG9yIiwiX0h0bWxUb2tlbml6ZXIuX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMiLCJfSHRtbFRva2VuaXplci50b2tlbml6ZSIsIl9IdG1sVG9rZW5pemVyLl9nZXRMb2NhdGlvbiIsIl9IdG1sVG9rZW5pemVyLl9nZXRTcGFuIiwiX0h0bWxUb2tlbml6ZXIuX2JlZ2luVG9rZW4iLCJfSHRtbFRva2VuaXplci5fZW5kVG9rZW4iLCJfSHRtbFRva2VuaXplci5fY3JlYXRlRXJyb3IiLCJfSHRtbFRva2VuaXplci5fYWR2YW5jZSIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0Q2hhckNvZGUiLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdENoYXJDb2RlQ2FzZUluc2Vuc2l0aXZlIiwiX0h0bWxUb2tlbml6ZXIuX3JlcXVpcmVDaGFyQ29kZSIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0U3RyIiwiX0h0bWxUb2tlbml6ZXIuX2F0dGVtcHRTdHJDYXNlSW5zZW5zaXRpdmUiLCJfSHRtbFRva2VuaXplci5fcmVxdWlyZVN0ciIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuIiwiX0h0bWxUb2tlbml6ZXIuX3JlcXVpcmVDaGFyQ29kZVVudGlsRm4iLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdFVudGlsQ2hhciIsIl9IdG1sVG9rZW5pemVyLl9yZWFkQ2hhciIsIl9IdG1sVG9rZW5pemVyLl9kZWNvZGVFbnRpdHkiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVJhd1RleHQiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUNvbW1lbnQiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUNkYXRhIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVEb2NUeXBlIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVQcmVmaXhBbmROYW1lIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdPcGVuIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdPcGVuU3RhcnQiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUF0dHJpYnV0ZU5hbWUiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUF0dHJpYnV0ZVZhbHVlIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdPcGVuRW5kIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdDbG9zZSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lVGV4dCIsIl9IdG1sVG9rZW5pemVyLl9zYXZlUG9zaXRpb24iLCJfSHRtbFRva2VuaXplci5fcmVzdG9yZVBvc2l0aW9uIiwiaXNOb3RXaGl0ZXNwYWNlIiwiaXNXaGl0ZXNwYWNlIiwiaXNOYW1lRW5kIiwiaXNQcmVmaXhFbmQiLCJpc0RpZ2l0RW50aXR5RW5kIiwiaXNOYW1lZEVudGl0eUVuZCIsImlzVGV4dEVuZCIsImlzQXNjaWlMZXR0ZXIiLCJpc0FzY2lpSGV4RGlnaXQiLCJjb21wYXJlQ2hhckNvZGVDYXNlSW5zZW5zaXRpdmUiLCJ0b1VwcGVyQ2FzZUNoYXJDb2RlIiwibWVyZ2VUZXh0VG9rZW5z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QUNBLFlBQVlBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSx1QkFBdUJBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsTUFBTUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUNuRkEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaEJBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQy9EQSxJQUFJQSxDQUFDQTtnQkFDSEEsSUFBSUEsUUFBUUEsR0FBR0Esb0JBQWFBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO2dCQUMvREEsTUFBTUEsQ0FBQ0Esb0JBQWFBLENBQUNBLFlBQVlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1lBQzlDQSxDQUFFQTtZQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDWEEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxNQUFNQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxxQkFBcUJBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLElB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O1FBQ3JEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUNyQkEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBO0FBQ25CQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFN0cmluZ1dyYXBwZXIsXG4gIE51bWJlcldyYXBwZXIsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgQ09OU1RfRVhQUixcbiAgc2VyaWFsaXplRW51bVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UGFyc2VMb2NhdGlvbiwgUGFyc2VFcnJvciwgUGFyc2VTb3VyY2VGaWxlLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge2dldEh0bWxUYWdEZWZpbml0aW9uLCBIdG1sVGFnQ29udGVudFR5cGUsIE5BTUVEX0VOVElUSUVTfSBmcm9tICcuL2h0bWxfdGFncyc7XG5cbmV4cG9ydCBlbnVtIEh0bWxUb2tlblR5cGUge1xuICBUQUdfT1BFTl9TVEFSVCxcbiAgVEFHX09QRU5fRU5ELFxuICBUQUdfT1BFTl9FTkRfVk9JRCxcbiAgVEFHX0NMT1NFLFxuICBURVhULFxuICBFU0NBUEFCTEVfUkFXX1RFWFQsXG4gIFJBV19URVhULFxuICBDT01NRU5UX1NUQVJULFxuICBDT01NRU5UX0VORCxcbiAgQ0RBVEFfU1RBUlQsXG4gIENEQVRBX0VORCxcbiAgQVRUUl9OQU1FLFxuICBBVFRSX1ZBTFVFLFxuICBET0NfVFlQRSxcbiAgRU9GXG59XG5cbmV4cG9ydCBjbGFzcyBIdG1sVG9rZW4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHlwZTogSHRtbFRva2VuVHlwZSwgcHVibGljIHBhcnRzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbn1cblxuZXhwb3J0IGNsYXNzIEh0bWxUb2tlbkVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGVycm9yTXNnOiBzdHJpbmcsIHB1YmxpYyB0b2tlblR5cGU6IEh0bWxUb2tlblR5cGUsIHNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHN1cGVyKHNwYW4sIGVycm9yTXNnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSHRtbFRva2VuaXplUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuczogSHRtbFRva2VuW10sIHB1YmxpYyBlcnJvcnM6IEh0bWxUb2tlbkVycm9yW10pIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZUh0bWwoc291cmNlQ29udGVudDogc3RyaW5nLCBzb3VyY2VVcmw6IHN0cmluZyk6IEh0bWxUb2tlbml6ZVJlc3VsdCB7XG4gIHJldHVybiBuZXcgX0h0bWxUb2tlbml6ZXIobmV3IFBhcnNlU291cmNlRmlsZShzb3VyY2VDb250ZW50LCBzb3VyY2VVcmwpKS50b2tlbml6ZSgpO1xufVxuXG5jb25zdCAkRU9GID0gMDtcbmNvbnN0ICRUQUIgPSA5O1xuY29uc3QgJExGID0gMTA7XG5jb25zdCAkRkYgPSAxMjtcbmNvbnN0ICRDUiA9IDEzO1xuXG5jb25zdCAkU1BBQ0UgPSAzMjtcblxuY29uc3QgJEJBTkcgPSAzMztcbmNvbnN0ICREUSA9IDM0O1xuY29uc3QgJEhBU0ggPSAzNTtcbmNvbnN0ICQkID0gMzY7XG5jb25zdCAkQU1QRVJTQU5EID0gMzg7XG5jb25zdCAkU1EgPSAzOTtcbmNvbnN0ICRNSU5VUyA9IDQ1O1xuY29uc3QgJFNMQVNIID0gNDc7XG5jb25zdCAkMCA9IDQ4O1xuXG5jb25zdCAkU0VNSUNPTE9OID0gNTk7XG5cbmNvbnN0ICQ5ID0gNTc7XG5jb25zdCAkQ09MT04gPSA1ODtcbmNvbnN0ICRMVCA9IDYwO1xuY29uc3QgJEVRID0gNjE7XG5jb25zdCAkR1QgPSA2MjtcbmNvbnN0ICRRVUVTVElPTiA9IDYzO1xuY29uc3QgJExCUkFDS0VUID0gOTE7XG5jb25zdCAkUkJSQUNLRVQgPSA5MztcbmNvbnN0ICRBID0gNjU7XG5jb25zdCAkRiA9IDcwO1xuY29uc3QgJFggPSA4ODtcbmNvbnN0ICRaID0gOTA7XG5cbmNvbnN0ICRhID0gOTc7XG5jb25zdCAkZiA9IDEwMjtcbmNvbnN0ICR6ID0gMTIyO1xuY29uc3QgJHggPSAxMjA7XG5cbmNvbnN0ICROQlNQID0gMTYwO1xuXG52YXIgQ1JfT1JfQ1JMRl9SRUdFWFAgPSAvXFxyXFxuPy9nO1xuXG5mdW5jdGlvbiB1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2coY2hhckNvZGU6IG51bWJlcik6IHN0cmluZyB7XG4gIHZhciBjaGFyID0gY2hhckNvZGUgPT09ICRFT0YgPyAnRU9GJyA6IFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcbiAgcmV0dXJuIGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7Y2hhcn1cImA7XG59XG5cbmZ1bmN0aW9uIHVua25vd25FbnRpdHlFcnJvck1zZyhlbnRpdHlTcmM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgVW5rbm93biBlbnRpdHkgXCIke2VudGl0eVNyY31cIiAtIHVzZSB0aGUgXCImIzxkZWNpbWFsPjtcIiBvciAgXCImI3g8aGV4PjtcIiBzeW50YXhgO1xufVxuXG5jbGFzcyBDb250cm9sRmxvd0Vycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVycm9yOiBIdG1sVG9rZW5FcnJvcikge31cbn1cblxuLy8gU2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1MS9zeW50YXguaHRtbCN3cml0aW5nXG5jbGFzcyBfSHRtbFRva2VuaXplciB7XG4gIHByaXZhdGUgaW5wdXQ6IHN0cmluZztcbiAgcHJpdmF0ZSBsZW5ndGg6IG51bWJlcjtcbiAgLy8gTm90ZTogdGhpcyBpcyBhbHdheXMgbG93ZXJjYXNlIVxuICBwcml2YXRlIHBlZWs6IG51bWJlciA9IC0xO1xuICBwcml2YXRlIGluZGV4OiBudW1iZXIgPSAtMTtcbiAgcHJpdmF0ZSBsaW5lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGNvbHVtbjogbnVtYmVyID0gLTE7XG4gIHByaXZhdGUgY3VycmVudFRva2VuU3RhcnQ6IFBhcnNlTG9jYXRpb247XG4gIHByaXZhdGUgY3VycmVudFRva2VuVHlwZTogSHRtbFRva2VuVHlwZTtcblxuICB0b2tlbnM6IEh0bWxUb2tlbltdID0gW107XG4gIGVycm9yczogSHRtbFRva2VuRXJyb3JbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZmlsZTogUGFyc2VTb3VyY2VGaWxlKSB7XG4gICAgdGhpcy5pbnB1dCA9IGZpbGUuY29udGVudDtcbiAgICB0aGlzLmxlbmd0aCA9IGZpbGUuY29udGVudC5sZW5ndGg7XG4gICAgdGhpcy5fYWR2YW5jZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHJvY2Vzc0NhcnJpYWdlUmV0dXJucyhjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI3ByZXByb2Nlc3NpbmctdGhlLWlucHV0LXN0cmVhbVxuICAgIC8vIEluIG9yZGVyIHRvIGtlZXAgdGhlIG9yaWdpbmFsIHBvc2l0aW9uIGluIHRoZSBzb3VyY2UsIHdlIGNhbiBub3RcbiAgICAvLyBwcmUtcHJvY2VzcyBpdC5cbiAgICAvLyBJbnN0ZWFkIENScyBhcmUgcHJvY2Vzc2VkIHJpZ2h0IGJlZm9yZSBpbnN0YW50aWF0aW5nIHRoZSB0b2tlbnMuXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChjb250ZW50LCBDUl9PUl9DUkxGX1JFR0VYUCwgJ1xcbicpO1xuICB9XG5cbiAgdG9rZW5pemUoKTogSHRtbFRva2VuaXplUmVzdWx0IHtcbiAgICB3aGlsZSAodGhpcy5wZWVrICE9PSAkRU9GKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkTFQpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkQkFORykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJExCUkFDS0VUKSkge1xuICAgICAgICAgICAgICB0aGlzLl9jb25zdW1lQ2RhdGEoc3RhcnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJE1JTlVTKSkge1xuICAgICAgICAgICAgICB0aGlzLl9jb25zdW1lQ29tbWVudChzdGFydCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLl9jb25zdW1lRG9jVHlwZShzdGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJFNMQVNIKSkge1xuICAgICAgICAgICAgdGhpcy5fY29uc3VtZVRhZ0Nsb3NlKHN0YXJ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29uc3VtZVRhZ09wZW4oc3RhcnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lVGV4dCgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgQ29udHJvbEZsb3dFcnJvcikge1xuICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZS5lcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuRU9GKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbXSk7XG4gICAgcmV0dXJuIG5ldyBIdG1sVG9rZW5pemVSZXN1bHQobWVyZ2VUZXh0VG9rZW5zKHRoaXMudG9rZW5zKSwgdGhpcy5lcnJvcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TG9jYXRpb24oKTogUGFyc2VMb2NhdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBQYXJzZUxvY2F0aW9uKHRoaXMuZmlsZSwgdGhpcy5pbmRleCwgdGhpcy5saW5lLCB0aGlzLmNvbHVtbik7XG4gIH1cblxuICBwcml2YXRlIF9nZXRTcGFuKHN0YXJ0PzogUGFyc2VMb2NhdGlvbiwgZW5kPzogUGFyc2VMb2NhdGlvbik6IFBhcnNlU291cmNlU3BhbiB7XG4gICAgaWYgKGlzQmxhbmsoc3RhcnQpKSB7XG4gICAgICBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKGVuZCkpIHtcbiAgICAgIGVuZCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYmVnaW5Ub2tlbih0eXBlOiBIdG1sVG9rZW5UeXBlLCBzdGFydDogUGFyc2VMb2NhdGlvbiA9IG51bGwpIHtcbiAgICBpZiAoaXNCbGFuayhzdGFydCkpIHtcbiAgICAgIHN0YXJ0ID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50VG9rZW5TdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuY3VycmVudFRva2VuVHlwZSA9IHR5cGU7XG4gIH1cblxuICBwcml2YXRlIF9lbmRUb2tlbihwYXJ0czogc3RyaW5nW10sIGVuZDogUGFyc2VMb2NhdGlvbiA9IG51bGwpOiBIdG1sVG9rZW4ge1xuICAgIGlmIChpc0JsYW5rKGVuZCkpIHtcbiAgICAgIGVuZCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgfVxuICAgIHZhciB0b2tlbiA9IG5ldyBIdG1sVG9rZW4odGhpcy5jdXJyZW50VG9rZW5UeXBlLCBwYXJ0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYXJzZVNvdXJjZVNwYW4odGhpcy5jdXJyZW50VG9rZW5TdGFydCwgZW5kKSk7XG4gICAgdGhpcy50b2tlbnMucHVzaCh0b2tlbik7XG4gICAgdGhpcy5jdXJyZW50VG9rZW5TdGFydCA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50VG9rZW5UeXBlID0gbnVsbDtcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFcnJvcihtc2c6IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQ29udHJvbEZsb3dFcnJvciB7XG4gICAgdmFyIGVycm9yID0gbmV3IEh0bWxUb2tlbkVycm9yKG1zZywgdGhpcy5jdXJyZW50VG9rZW5UeXBlLCBzcGFuKTtcbiAgICB0aGlzLmN1cnJlbnRUb2tlblN0YXJ0ID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRUb2tlblR5cGUgPSBudWxsO1xuICAgIHJldHVybiBuZXcgQ29udHJvbEZsb3dFcnJvcihlcnJvcik7XG4gIH1cblxuICBwcml2YXRlIF9hZHZhbmNlKCkge1xuICAgIGlmICh0aGlzLmluZGV4ID49IHRoaXMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2coJEVPRiksIHRoaXMuX2dldFNwYW4oKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnBlZWsgPT09ICRMRikge1xuICAgICAgdGhpcy5saW5lKys7XG4gICAgICB0aGlzLmNvbHVtbiA9IDA7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBlZWsgIT09ICRMRiAmJiB0aGlzLnBlZWsgIT09ICRDUikge1xuICAgICAgdGhpcy5jb2x1bW4rKztcbiAgICB9XG4gICAgdGhpcy5pbmRleCsrO1xuICAgIHRoaXMucGVlayA9IHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGggPyAkRU9GIDogU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KHRoaXMuaW5wdXQsIHRoaXMuaW5kZXgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXR0ZW1wdENoYXJDb2RlKGNoYXJDb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5wZWVrID09PSBjaGFyQ29kZSkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2F0dGVtcHRDaGFyQ29kZUNhc2VJbnNlbnNpdGl2ZShjaGFyQ29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKGNvbXBhcmVDaGFyQ29kZUNhc2VJbnNlbnNpdGl2ZSh0aGlzLnBlZWssIGNoYXJDb2RlKSkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcXVpcmVDaGFyQ29kZShjaGFyQ29kZTogbnVtYmVyKSB7XG4gICAgdmFyIGxvY2F0aW9uID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyQ29kZShjaGFyQ29kZSkpIHtcbiAgICAgIHRocm93IHRoaXMuX2NyZWF0ZUVycm9yKHVuZXhwZWN0ZWRDaGFyYWN0ZXJFcnJvck1zZyh0aGlzLnBlZWspLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0U3Bhbihsb2NhdGlvbiwgbG9jYXRpb24pKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0U3RyKGNoYXJzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyQ29kZShTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoY2hhcnMsIGkpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXR0ZW1wdFN0ckNhc2VJbnNlbnNpdGl2ZShjaGFyczogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhckNvZGVDYXNlSW5zZW5zaXRpdmUoU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGNoYXJzLCBpKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcXVpcmVTdHIoY2hhcnM6IHN0cmluZykge1xuICAgIHZhciBsb2NhdGlvbiA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgaWYgKCF0aGlzLl9hdHRlbXB0U3RyKGNoYXJzKSkge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIHRoaXMuX2dldFNwYW4obG9jYXRpb24pKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKHByZWRpY2F0ZTogRnVuY3Rpb24pIHtcbiAgICB3aGlsZSAoIXByZWRpY2F0ZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVxdWlyZUNoYXJDb2RlVW50aWxGbihwcmVkaWNhdGU6IEZ1bmN0aW9uLCBsZW46IG51bWJlcikge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihwcmVkaWNhdGUpO1xuICAgIGlmICh0aGlzLmluZGV4IC0gc3RhcnQub2Zmc2V0IDwgbGVuKSB7XG4gICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2codGhpcy5wZWVrKSwgdGhpcy5fZ2V0U3BhbihzdGFydCwgc3RhcnQpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0VW50aWxDaGFyKGNoYXI6IG51bWJlcikge1xuICAgIHdoaWxlICh0aGlzLnBlZWsgIT09IGNoYXIpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWFkQ2hhcihkZWNvZGVFbnRpdGllczogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgaWYgKGRlY29kZUVudGl0aWVzICYmIHRoaXMucGVlayA9PT0gJEFNUEVSU0FORCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RlY29kZUVudGl0eSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5wdXRbaW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2RlY29kZUVudGl0eSgpOiBzdHJpbmcge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJEhBU0gpKSB7XG4gICAgICBsZXQgaXNIZXggPSB0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJHgpIHx8IHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkWCk7XG4gICAgICBsZXQgbnVtYmVyU3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpLm9mZnNldDtcbiAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNEaWdpdEVudGl0eUVuZCk7XG4gICAgICBpZiAodGhpcy5wZWVrICE9ICRTRU1JQ09MT04pIHtcbiAgICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIHRoaXMuX2dldFNwYW4oKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBsZXQgc3RyTnVtID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcobnVtYmVyU3RhcnQsIHRoaXMuaW5kZXggLSAxKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBjaGFyQ29kZSA9IE51bWJlcldyYXBwZXIucGFyc2VJbnQoc3RyTnVtLCBpc0hleCA/IDE2IDogMTApO1xuICAgICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0ICsgMSwgdGhpcy5pbmRleCAtIDEpO1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmtub3duRW50aXR5RXJyb3JNc2coZW50aXR5KSwgdGhpcy5fZ2V0U3BhbihzdGFydCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgc3RhcnRQb3NpdGlvbiA9IHRoaXMuX3NhdmVQb3NpdGlvbigpO1xuICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05hbWVkRW50aXR5RW5kKTtcbiAgICAgIGlmICh0aGlzLnBlZWsgIT0gJFNFTUlDT0xPTikge1xuICAgICAgICB0aGlzLl9yZXN0b3JlUG9zaXRpb24oc3RhcnRQb3NpdGlvbik7XG4gICAgICAgIHJldHVybiAnJic7XG4gICAgICB9XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBsZXQgbmFtZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDEsIHRoaXMuaW5kZXggLSAxKTtcbiAgICAgIGxldCBjaGFyID0gTkFNRURfRU5USVRJRVNbbmFtZV07XG4gICAgICBpZiAoaXNCbGFuayhjaGFyKSkge1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmtub3duRW50aXR5RXJyb3JNc2cobmFtZSksIHRoaXMuX2dldFNwYW4oc3RhcnQpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVSYXdUZXh0KGRlY29kZUVudGl0aWVzOiBib29sZWFuLCBmaXJzdENoYXJPZkVuZDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRlbXB0RW5kUmVzdDogRnVuY3Rpb24pOiBIdG1sVG9rZW4ge1xuICAgIHZhciB0YWdDbG9zZVN0YXJ0O1xuICAgIHZhciB0ZXh0U3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oZGVjb2RlRW50aXRpZXMgPyBIdG1sVG9rZW5UeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCA6IEh0bWxUb2tlblR5cGUuUkFXX1RFWFQsXG4gICAgICAgICAgICAgICAgICAgICB0ZXh0U3RhcnQpO1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB0YWdDbG9zZVN0YXJ0ID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoZmlyc3RDaGFyT2ZFbmQpICYmIGF0dGVtcHRFbmRSZXN0KCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pbmRleCA+IHRhZ0Nsb3NlU3RhcnQub2Zmc2V0KSB7XG4gICAgICAgIHBhcnRzLnB1c2godGhpcy5pbnB1dC5zdWJzdHJpbmcodGFnQ2xvc2VTdGFydC5vZmZzZXQsIHRoaXMuaW5kZXgpKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICh0aGlzLnBlZWsgIT09IGZpcnN0Q2hhck9mRW5kKSB7XG4gICAgICAgIHBhcnRzLnB1c2godGhpcy5fcmVhZENoYXIoZGVjb2RlRW50aXRpZXMpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VuZFRva2VuKFt0aGlzLl9wcm9jZXNzQ2FycmlhZ2VSZXR1cm5zKHBhcnRzLmpvaW4oJycpKV0sIHRhZ0Nsb3NlU3RhcnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNvbW1lbnQoc3RhcnQ6IFBhcnNlTG9jYXRpb24pIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQ09NTUVOVF9TVEFSVCwgc3RhcnQpO1xuICAgIHRoaXMuX3JlcXVpcmVDaGFyQ29kZSgkTUlOVVMpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgICB2YXIgdGV4dFRva2VuID0gdGhpcy5fY29uc3VtZVJhd1RleHQoZmFsc2UsICRNSU5VUywgKCkgPT4gdGhpcy5fYXR0ZW1wdFN0cignLT4nKSk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNPTU1FTlRfRU5ELCB0ZXh0VG9rZW4uc291cmNlU3Bhbi5lbmQpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDZGF0YShzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5DREFUQV9TVEFSVCwgc3RhcnQpO1xuICAgIHRoaXMuX3JlcXVpcmVTdHIoJ0NEQVRBWycpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgICB2YXIgdGV4dFRva2VuID0gdGhpcy5fY29uc3VtZVJhd1RleHQoZmFsc2UsICRSQlJBQ0tFVCwgKCkgPT4gdGhpcy5fYXR0ZW1wdFN0cignXT4nKSk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNEQVRBX0VORCwgdGV4dFRva2VuLnNvdXJjZVNwYW4uZW5kKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lRG9jVHlwZShzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5ET0NfVFlQRSwgc3RhcnQpO1xuICAgIHRoaXMuX2F0dGVtcHRVbnRpbENoYXIoJEdUKTtcbiAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW3RoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDIsIHRoaXMuaW5kZXggLSAxKV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVByZWZpeEFuZE5hbWUoKTogc3RyaW5nW10ge1xuICAgIHZhciBuYW1lT3JQcmVmaXhTdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHByZWZpeCA9IG51bGw7XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPT0gJENPTE9OICYmICFpc1ByZWZpeEVuZCh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBuYW1lU3RhcnQ7XG4gICAgaWYgKHRoaXMucGVlayA9PT0gJENPTE9OKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBwcmVmaXggPSB0aGlzLmlucHV0LnN1YnN0cmluZyhuYW1lT3JQcmVmaXhTdGFydCwgdGhpcy5pbmRleCAtIDEpO1xuICAgICAgbmFtZVN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZVN0YXJ0ID0gbmFtZU9yUHJlZml4U3RhcnQ7XG4gICAgfVxuICAgIHRoaXMuX3JlcXVpcmVDaGFyQ29kZVVudGlsRm4oaXNOYW1lRW5kLCB0aGlzLmluZGV4ID09PSBuYW1lU3RhcnQgPyAxIDogMCk7XG4gICAgdmFyIG5hbWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhuYW1lU3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBbcHJlZml4LCBuYW1lXTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUYWdPcGVuKHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgbGV0IHNhdmVkUG9zID0gdGhpcy5fc2F2ZVBvc2l0aW9uKCk7XG4gICAgbGV0IGxvd2VyY2FzZVRhZ05hbWU7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghaXNBc2NpaUxldHRlcih0aGlzLnBlZWspKSB7XG4gICAgICAgIHRocm93IHRoaXMuX2NyZWF0ZUVycm9yKHVuZXhwZWN0ZWRDaGFyYWN0ZXJFcnJvck1zZyh0aGlzLnBlZWspLCB0aGlzLl9nZXRTcGFuKCkpO1xuICAgICAgfVxuICAgICAgdmFyIG5hbWVTdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICB0aGlzLl9jb25zdW1lVGFnT3BlblN0YXJ0KHN0YXJ0KTtcbiAgICAgIGxvd2VyY2FzZVRhZ05hbWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhuYW1lU3RhcnQsIHRoaXMuaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICB3aGlsZSAodGhpcy5wZWVrICE9PSAkU0xBU0ggJiYgdGhpcy5wZWVrICE9PSAkR1QpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZUF0dHJpYnV0ZU5hbWUoKTtcbiAgICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgICBpZiAodGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRFUSkpIHtcbiAgICAgICAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICAgICAgdGhpcy5fY29uc3VtZUF0dHJpYnV0ZVZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uc3VtZVRhZ09wZW5FbmQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIENvbnRyb2xGbG93RXJyb3IpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgc3RhcnQgdGFnIGlzIGludmFsaWQsIGFzc3VtZSB3ZSB3YW50IGEgXCI8XCJcbiAgICAgICAgdGhpcy5fcmVzdG9yZVBvc2l0aW9uKHNhdmVkUG9zKTtcbiAgICAgICAgLy8gQmFjayB0byBiYWNrIHRleHQgdG9rZW5zIGFyZSBtZXJnZWQgYXQgdGhlIGVuZFxuICAgICAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEVYVCwgc3RhcnQpO1xuICAgICAgICB0aGlzLl9lbmRUb2tlbihbJzwnXSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgY29udGVudFRva2VuVHlwZSA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGxvd2VyY2FzZVRhZ05hbWUpLmNvbnRlbnRUeXBlO1xuICAgIGlmIChjb250ZW50VG9rZW5UeXBlID09PSBIdG1sVGFnQ29udGVudFR5cGUuUkFXX1RFWFQpIHtcbiAgICAgIHRoaXMuX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlKGxvd2VyY2FzZVRhZ05hbWUsIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRlbnRUb2tlblR5cGUgPT09IEh0bWxUYWdDb250ZW50VHlwZS5FU0NBUEFCTEVfUkFXX1RFWFQpIHtcbiAgICAgIHRoaXMuX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlKGxvd2VyY2FzZVRhZ05hbWUsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlKGxvd2VyY2FzZVRhZ05hbWU6IHN0cmluZywgZGVjb2RlRW50aXRpZXM6IGJvb2xlYW4pIHtcbiAgICB2YXIgdGV4dFRva2VuID0gdGhpcy5fY29uc3VtZVJhd1RleHQoZGVjb2RlRW50aXRpZXMsICRMVCwgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJFNMQVNIKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0U3RyQ2FzZUluc2Vuc2l0aXZlKGxvd2VyY2FzZVRhZ05hbWUpKSByZXR1cm4gZmFsc2U7XG4gICAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkR1QpKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEFHX0NMT1NFLCB0ZXh0VG9rZW4uc291cmNlU3Bhbi5lbmQpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtudWxsLCBsb3dlcmNhc2VUYWdOYW1lXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGFnT3BlblN0YXJ0KHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLlRBR19PUEVOX1NUQVJULCBzdGFydCk7XG4gICAgdmFyIHBhcnRzID0gdGhpcy5fY29uc3VtZVByZWZpeEFuZE5hbWUoKTtcbiAgICB0aGlzLl9lbmRUb2tlbihwYXJ0cyk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQXR0cmlidXRlTmFtZSgpIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQVRUUl9OQU1FKTtcbiAgICB2YXIgcHJlZml4QW5kTmFtZSA9IHRoaXMuX2NvbnN1bWVQcmVmaXhBbmROYW1lKCk7XG4gICAgdGhpcy5fZW5kVG9rZW4ocHJlZml4QW5kTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQXR0cmlidXRlVmFsdWUoKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkFUVFJfVkFMVUUpO1xuICAgIHZhciB2YWx1ZTtcbiAgICBpZiAodGhpcy5wZWVrID09PSAkU1EgfHwgdGhpcy5wZWVrID09PSAkRFEpIHtcbiAgICAgIHZhciBxdW90ZUNoYXIgPSB0aGlzLnBlZWs7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICB2YXIgcGFydHMgPSBbXTtcbiAgICAgIHdoaWxlICh0aGlzLnBlZWsgIT09IHF1b3RlQ2hhcikge1xuICAgICAgICBwYXJ0cy5wdXNoKHRoaXMuX3JlYWRDaGFyKHRydWUpKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gcGFydHMuam9pbignJyk7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2YWx1ZVN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICAgIHRoaXMuX3JlcXVpcmVDaGFyQ29kZVVudGlsRm4oaXNOYW1lRW5kLCAxKTtcbiAgICAgIHZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcodmFsdWVTdGFydCwgdGhpcy5pbmRleCk7XG4gICAgfVxuICAgIHRoaXMuX2VuZFRva2VuKFt0aGlzLl9wcm9jZXNzQ2FycmlhZ2VSZXR1cm5zKHZhbHVlKV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRhZ09wZW5FbmQoKSB7XG4gICAgdmFyIHRva2VuVHlwZSA9IHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkU0xBU0gpID8gSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9FTkRfVk9JRCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9FTkQ7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbih0b2tlblR5cGUpO1xuICAgIHRoaXMuX3JlcXVpcmVDaGFyQ29kZSgkR1QpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUYWdDbG9zZShzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5UQUdfQ0xPU0UsIHN0YXJ0KTtcbiAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgdmFyIHByZWZpeEFuZE5hbWU7XG4gICAgcHJlZml4QW5kTmFtZSA9IHRoaXMuX2NvbnN1bWVQcmVmaXhBbmROYW1lKCk7XG4gICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgIHRoaXMuX3JlcXVpcmVDaGFyQ29kZSgkR1QpO1xuICAgIHRoaXMuX2VuZFRva2VuKHByZWZpeEFuZE5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRleHQoKSB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEVYVCwgc3RhcnQpO1xuICAgIHZhciBwYXJ0cyA9IFt0aGlzLl9yZWFkQ2hhcih0cnVlKV07XG4gICAgd2hpbGUgKCFpc1RleHRFbmQodGhpcy5wZWVrKSkge1xuICAgICAgcGFydHMucHVzaCh0aGlzLl9yZWFkQ2hhcih0cnVlKSk7XG4gICAgfVxuICAgIHRoaXMuX2VuZFRva2VuKFt0aGlzLl9wcm9jZXNzQ2FycmlhZ2VSZXR1cm5zKHBhcnRzLmpvaW4oJycpKV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2F2ZVBvc2l0aW9uKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gW3RoaXMucGVlaywgdGhpcy5pbmRleCwgdGhpcy5jb2x1bW4sIHRoaXMubGluZSwgdGhpcy50b2tlbnMubGVuZ3RoXTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc3RvcmVQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyW10pOiB2b2lkIHtcbiAgICB0aGlzLnBlZWsgPSBwb3NpdGlvblswXTtcbiAgICB0aGlzLmluZGV4ID0gcG9zaXRpb25bMV07XG4gICAgdGhpcy5jb2x1bW4gPSBwb3NpdGlvblsyXTtcbiAgICB0aGlzLmxpbmUgPSBwb3NpdGlvblszXTtcbiAgICBsZXQgbmJUb2tlbnMgPSBwb3NpdGlvbls0XTtcbiAgICBpZiAobmJUb2tlbnMgPCB0aGlzLnRva2Vucy5sZW5ndGgpIHtcbiAgICAgIC8vIHJlbW92ZSBhbnkgZXh0cmEgdG9rZW5zXG4gICAgICB0aGlzLnRva2VucyA9IExpc3RXcmFwcGVyLnNsaWNlKHRoaXMudG9rZW5zLCAwLCBuYlRva2Vucyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzTm90V2hpdGVzcGFjZShjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1doaXRlc3BhY2UoY29kZSkgfHwgY29kZSA9PT0gJEVPRjtcbn1cblxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgPj0gJFRBQiAmJiBjb2RlIDw9ICRTUEFDRSkgfHwgKGNvZGUgPT09ICROQlNQKTtcbn1cblxuZnVuY3Rpb24gaXNOYW1lRW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNXaGl0ZXNwYWNlKGNvZGUpIHx8IGNvZGUgPT09ICRHVCB8fCBjb2RlID09PSAkU0xBU0ggfHwgY29kZSA9PT0gJFNRIHx8IGNvZGUgPT09ICREUSB8fFxuICAgICAgICAgY29kZSA9PT0gJEVRO1xufVxuXG5mdW5jdGlvbiBpc1ByZWZpeEVuZChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlIDwgJGEgfHwgJHogPCBjb2RlKSAmJiAoY29kZSA8ICRBIHx8ICRaIDwgY29kZSkgJiYgKGNvZGUgPCAkMCB8fCBjb2RlID4gJDkpO1xufVxuXG5mdW5jdGlvbiBpc0RpZ2l0RW50aXR5RW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkU0VNSUNPTE9OIHx8IGNvZGUgPT0gJEVPRiB8fCAhaXNBc2NpaUhleERpZ2l0KGNvZGUpO1xufVxuXG5mdW5jdGlvbiBpc05hbWVkRW50aXR5RW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkU0VNSUNPTE9OIHx8IGNvZGUgPT0gJEVPRiB8fCAhaXNBc2NpaUxldHRlcihjb2RlKTtcbn1cblxuZnVuY3Rpb24gaXNUZXh0RW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PT0gJExUIHx8IGNvZGUgPT09ICRFT0Y7XG59XG5cbmZ1bmN0aW9uIGlzQXNjaWlMZXR0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID49ICRhICYmIGNvZGUgPD0gJHogfHwgY29kZSA+PSAkQSAmJiBjb2RlIDw9ICRaO1xufVxuXG5mdW5jdGlvbiBpc0FzY2lpSGV4RGlnaXQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID49ICRhICYmIGNvZGUgPD0gJGYgfHwgY29kZSA+PSAkQSAmJiBjb2RlIDw9ICRGIHx8IGNvZGUgPj0gJDAgJiYgY29kZSA8PSAkOTtcbn1cblxuZnVuY3Rpb24gY29tcGFyZUNoYXJDb2RlQ2FzZUluc2Vuc2l0aXZlKGNvZGUxOiBudW1iZXIsIGNvZGUyOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIHRvVXBwZXJDYXNlQ2hhckNvZGUoY29kZTEpID09IHRvVXBwZXJDYXNlQ2hhckNvZGUoY29kZTIpO1xufVxuXG5mdW5jdGlvbiB0b1VwcGVyQ2FzZUNoYXJDb2RlKGNvZGU6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBjb2RlID49ICRhICYmIGNvZGUgPD0gJHogPyBjb2RlIC0gJGEgKyAkQSA6IGNvZGU7XG59XG5cbmZ1bmN0aW9uIG1lcmdlVGV4dFRva2VucyhzcmNUb2tlbnM6IEh0bWxUb2tlbltdKTogSHRtbFRva2VuW10ge1xuICBsZXQgZHN0VG9rZW5zID0gW107XG4gIGxldCBsYXN0RHN0VG9rZW46IEh0bWxUb2tlbjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcmNUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgdG9rZW4gPSBzcmNUb2tlbnNbaV07XG4gICAgaWYgKGlzUHJlc2VudChsYXN0RHN0VG9rZW4pICYmIGxhc3REc3RUb2tlbi50eXBlID09IEh0bWxUb2tlblR5cGUuVEVYVCAmJlxuICAgICAgICB0b2tlbi50eXBlID09IEh0bWxUb2tlblR5cGUuVEVYVCkge1xuICAgICAgbGFzdERzdFRva2VuLnBhcnRzWzBdICs9IHRva2VuLnBhcnRzWzBdO1xuICAgICAgbGFzdERzdFRva2VuLnNvdXJjZVNwYW4uZW5kID0gdG9rZW4uc291cmNlU3Bhbi5lbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3REc3RUb2tlbiA9IHRva2VuO1xuICAgICAgZHN0VG9rZW5zLnB1c2gobGFzdERzdFRva2VuKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZHN0VG9rZW5zO1xufVxuIl19