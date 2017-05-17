var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di/decorators';
import { isBlank, isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { Lexer, EOF, isIdentifier, $PERIOD, $COLON, $SEMICOLON, $LBRACKET, $RBRACKET, $COMMA, $LBRACE, $RBRACE, $LPAREN, $RPAREN } from './lexer';
import { reflector, Reflector } from 'angular2/src/core/reflection/reflection';
import { EmptyExpr, ImplicitReceiver, PropertyRead, PropertyWrite, SafePropertyRead, LiteralPrimitive, Binary, PrefixNot, Conditional, BindingPipe, Chain, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, Interpolation, MethodCall, SafeMethodCall, FunctionCall, TemplateBinding, ASTWithSource, Quote } from './ast';
var _implicitReceiver = new ImplicitReceiver();
// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var INTERPOLATION_REGEXP = /\{\{([\s\S]*?)\}\}/g;
class ParseException extends BaseException {
    constructor(message, input, errLocation, ctxLocation) {
        super(`Parser Error: ${message} ${errLocation} [${input}] in ${ctxLocation}`);
    }
}
export class SplitInterpolation {
    constructor(strings, expressions) {
        this.strings = strings;
        this.expressions = expressions;
    }
}
export let Parser = class {
    constructor(/** @internal */ _lexer, providedReflector = null) {
        this._lexer = _lexer;
        this._reflector = isPresent(providedReflector) ? providedReflector : reflector;
    }
    parseAction(input, location) {
        this._checkNoInterpolation(input, location);
        var tokens = this._lexer.tokenize(input);
        var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
        return new ASTWithSource(ast, input, location);
    }
    parseBinding(input, location) {
        var ast = this._parseBindingAst(input, location);
        return new ASTWithSource(ast, input, location);
    }
    parseSimpleBinding(input, location) {
        var ast = this._parseBindingAst(input, location);
        if (!SimpleExpressionChecker.check(ast)) {
            throw new ParseException('Host binding expression can only contain field access and constants', input, location);
        }
        return new ASTWithSource(ast, input, location);
    }
    _parseBindingAst(input, location) {
        // Quotes expressions use 3rd-party expression language. We don't want to use
        // our lexer or parser for that, so we check for that ahead of time.
        var quote = this._parseQuote(input, location);
        if (isPresent(quote)) {
            return quote;
        }
        this._checkNoInterpolation(input, location);
        var tokens = this._lexer.tokenize(input);
        return new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
    }
    _parseQuote(input, location) {
        if (isBlank(input))
            return null;
        var prefixSeparatorIndex = input.indexOf(':');
        if (prefixSeparatorIndex == -1)
            return null;
        var prefix = input.substring(0, prefixSeparatorIndex).trim();
        if (!isIdentifier(prefix))
            return null;
        var uninterpretedExpression = input.substring(prefixSeparatorIndex + 1);
        return new Quote(prefix, uninterpretedExpression, location);
    }
    parseTemplateBindings(input, location) {
        var tokens = this._lexer.tokenize(input);
        return new _ParseAST(input, location, tokens, this._reflector, false).parseTemplateBindings();
    }
    parseInterpolation(input, location) {
        let split = this.splitInterpolation(input, location);
        if (split == null)
            return null;
        let expressions = [];
        for (let i = 0; i < split.expressions.length; ++i) {
            var tokens = this._lexer.tokenize(split.expressions[i]);
            var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
            expressions.push(ast);
        }
        return new ASTWithSource(new Interpolation(split.strings, expressions), input, location);
    }
    splitInterpolation(input, location) {
        var parts = StringWrapper.split(input, INTERPOLATION_REGEXP);
        if (parts.length <= 1) {
            return null;
        }
        var strings = [];
        var expressions = [];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (i % 2 === 0) {
                // fixed string
                strings.push(part);
            }
            else if (part.trim().length > 0) {
                expressions.push(part);
            }
            else {
                throw new ParseException('Blank expressions are not allowed in interpolated strings', input, `at column ${this._findInterpolationErrorColumn(parts, i)} in`, location);
            }
        }
        return new SplitInterpolation(strings, expressions);
    }
    wrapLiteralPrimitive(input, location) {
        return new ASTWithSource(new LiteralPrimitive(input), input, location);
    }
    _checkNoInterpolation(input, location) {
        var parts = StringWrapper.split(input, INTERPOLATION_REGEXP);
        if (parts.length > 1) {
            throw new ParseException('Got interpolation ({{}}) where expression was expected', input, `at column ${this._findInterpolationErrorColumn(parts, 1)} in`, location);
        }
    }
    _findInterpolationErrorColumn(parts, partInErrIdx) {
        var errLocation = '';
        for (var j = 0; j < partInErrIdx; j++) {
            errLocation += j % 2 === 0 ? parts[j] : `{{${parts[j]}}}`;
        }
        return errLocation.length;
    }
};
Parser = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Lexer, Reflector])
], Parser);
export class _ParseAST {
    constructor(input, location, tokens, reflector, parseAction) {
        this.input = input;
        this.location = location;
        this.tokens = tokens;
        this.reflector = reflector;
        this.parseAction = parseAction;
        this.index = 0;
    }
    peek(offset) {
        var i = this.index + offset;
        return i < this.tokens.length ? this.tokens[i] : EOF;
    }
    get next() { return this.peek(0); }
    get inputIndex() {
        return (this.index < this.tokens.length) ? this.next.index : this.input.length;
    }
    advance() { this.index++; }
    optionalCharacter(code) {
        if (this.next.isCharacter(code)) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    }
    optionalKeywordVar() {
        if (this.peekKeywordVar()) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    }
    peekKeywordVar() { return this.next.isKeywordVar() || this.next.isOperator('#'); }
    expectCharacter(code) {
        if (this.optionalCharacter(code))
            return;
        this.error(`Missing expected ${StringWrapper.fromCharCode(code)}`);
    }
    optionalOperator(op) {
        if (this.next.isOperator(op)) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    }
    expectOperator(operator) {
        if (this.optionalOperator(operator))
            return;
        this.error(`Missing expected operator ${operator}`);
    }
    expectIdentifierOrKeyword() {
        var n = this.next;
        if (!n.isIdentifier() && !n.isKeyword()) {
            this.error(`Unexpected token ${n}, expected identifier or keyword`);
        }
        this.advance();
        return n.toString();
    }
    expectIdentifierOrKeywordOrString() {
        var n = this.next;
        if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
            this.error(`Unexpected token ${n}, expected identifier, keyword, or string`);
        }
        this.advance();
        return n.toString();
    }
    parseChain() {
        var exprs = [];
        while (this.index < this.tokens.length) {
            var expr = this.parsePipe();
            exprs.push(expr);
            if (this.optionalCharacter($SEMICOLON)) {
                if (!this.parseAction) {
                    this.error("Binding expression cannot contain chained expression");
                }
                while (this.optionalCharacter($SEMICOLON)) {
                } // read all semicolons
            }
            else if (this.index < this.tokens.length) {
                this.error(`Unexpected token '${this.next}'`);
            }
        }
        if (exprs.length == 0)
            return new EmptyExpr();
        if (exprs.length == 1)
            return exprs[0];
        return new Chain(exprs);
    }
    parsePipe() {
        var result = this.parseExpression();
        if (this.optionalOperator("|")) {
            if (this.parseAction) {
                this.error("Cannot have a pipe in an action expression");
            }
            do {
                var name = this.expectIdentifierOrKeyword();
                var args = [];
                while (this.optionalCharacter($COLON)) {
                    args.push(this.parseExpression());
                }
                result = new BindingPipe(result, name, args);
            } while (this.optionalOperator("|"));
        }
        return result;
    }
    parseExpression() { return this.parseConditional(); }
    parseConditional() {
        var start = this.inputIndex;
        var result = this.parseLogicalOr();
        if (this.optionalOperator('?')) {
            var yes = this.parsePipe();
            if (!this.optionalCharacter($COLON)) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error(`Conditional expression ${expression} requires all 3 expressions`);
            }
            var no = this.parsePipe();
            return new Conditional(result, yes, no);
        }
        else {
            return result;
        }
    }
    parseLogicalOr() {
        // '||'
        var result = this.parseLogicalAnd();
        while (this.optionalOperator('||')) {
            result = new Binary('||', result, this.parseLogicalAnd());
        }
        return result;
    }
    parseLogicalAnd() {
        // '&&'
        var result = this.parseEquality();
        while (this.optionalOperator('&&')) {
            result = new Binary('&&', result, this.parseEquality());
        }
        return result;
    }
    parseEquality() {
        // '==','!=','===','!=='
        var result = this.parseRelational();
        while (true) {
            if (this.optionalOperator('==')) {
                result = new Binary('==', result, this.parseRelational());
            }
            else if (this.optionalOperator('===')) {
                result = new Binary('===', result, this.parseRelational());
            }
            else if (this.optionalOperator('!=')) {
                result = new Binary('!=', result, this.parseRelational());
            }
            else if (this.optionalOperator('!==')) {
                result = new Binary('!==', result, this.parseRelational());
            }
            else {
                return result;
            }
        }
    }
    parseRelational() {
        // '<', '>', '<=', '>='
        var result = this.parseAdditive();
        while (true) {
            if (this.optionalOperator('<')) {
                result = new Binary('<', result, this.parseAdditive());
            }
            else if (this.optionalOperator('>')) {
                result = new Binary('>', result, this.parseAdditive());
            }
            else if (this.optionalOperator('<=')) {
                result = new Binary('<=', result, this.parseAdditive());
            }
            else if (this.optionalOperator('>=')) {
                result = new Binary('>=', result, this.parseAdditive());
            }
            else {
                return result;
            }
        }
    }
    parseAdditive() {
        // '+', '-'
        var result = this.parseMultiplicative();
        while (true) {
            if (this.optionalOperator('+')) {
                result = new Binary('+', result, this.parseMultiplicative());
            }
            else if (this.optionalOperator('-')) {
                result = new Binary('-', result, this.parseMultiplicative());
            }
            else {
                return result;
            }
        }
    }
    parseMultiplicative() {
        // '*', '%', '/'
        var result = this.parsePrefix();
        while (true) {
            if (this.optionalOperator('*')) {
                result = new Binary('*', result, this.parsePrefix());
            }
            else if (this.optionalOperator('%')) {
                result = new Binary('%', result, this.parsePrefix());
            }
            else if (this.optionalOperator('/')) {
                result = new Binary('/', result, this.parsePrefix());
            }
            else {
                return result;
            }
        }
    }
    parsePrefix() {
        if (this.optionalOperator('+')) {
            return this.parsePrefix();
        }
        else if (this.optionalOperator('-')) {
            return new Binary('-', new LiteralPrimitive(0), this.parsePrefix());
        }
        else if (this.optionalOperator('!')) {
            return new PrefixNot(this.parsePrefix());
        }
        else {
            return this.parseCallChain();
        }
    }
    parseCallChain() {
        var result = this.parsePrimary();
        while (true) {
            if (this.optionalCharacter($PERIOD)) {
                result = this.parseAccessMemberOrMethodCall(result, false);
            }
            else if (this.optionalOperator('?.')) {
                result = this.parseAccessMemberOrMethodCall(result, true);
            }
            else if (this.optionalCharacter($LBRACKET)) {
                var key = this.parsePipe();
                this.expectCharacter($RBRACKET);
                if (this.optionalOperator("=")) {
                    var value = this.parseConditional();
                    result = new KeyedWrite(result, key, value);
                }
                else {
                    result = new KeyedRead(result, key);
                }
            }
            else if (this.optionalCharacter($LPAREN)) {
                var args = this.parseCallArguments();
                this.expectCharacter($RPAREN);
                result = new FunctionCall(result, args);
            }
            else {
                return result;
            }
        }
    }
    parsePrimary() {
        if (this.optionalCharacter($LPAREN)) {
            let result = this.parsePipe();
            this.expectCharacter($RPAREN);
            return result;
        }
        else if (this.next.isKeywordNull() || this.next.isKeywordUndefined()) {
            this.advance();
            return new LiteralPrimitive(null);
        }
        else if (this.next.isKeywordTrue()) {
            this.advance();
            return new LiteralPrimitive(true);
        }
        else if (this.next.isKeywordFalse()) {
            this.advance();
            return new LiteralPrimitive(false);
        }
        else if (this.optionalCharacter($LBRACKET)) {
            var elements = this.parseExpressionList($RBRACKET);
            this.expectCharacter($RBRACKET);
            return new LiteralArray(elements);
        }
        else if (this.next.isCharacter($LBRACE)) {
            return this.parseLiteralMap();
        }
        else if (this.next.isIdentifier()) {
            return this.parseAccessMemberOrMethodCall(_implicitReceiver, false);
        }
        else if (this.next.isNumber()) {
            var value = this.next.toNumber();
            this.advance();
            return new LiteralPrimitive(value);
        }
        else if (this.next.isString()) {
            var literalValue = this.next.toString();
            this.advance();
            return new LiteralPrimitive(literalValue);
        }
        else if (this.index >= this.tokens.length) {
            this.error(`Unexpected end of expression: ${this.input}`);
        }
        else {
            this.error(`Unexpected token ${this.next}`);
        }
        // error() throws, so we don't reach here.
        throw new BaseException("Fell through all cases in parsePrimary");
    }
    parseExpressionList(terminator) {
        var result = [];
        if (!this.next.isCharacter(terminator)) {
            do {
                result.push(this.parsePipe());
            } while (this.optionalCharacter($COMMA));
        }
        return result;
    }
    parseLiteralMap() {
        var keys = [];
        var values = [];
        this.expectCharacter($LBRACE);
        if (!this.optionalCharacter($RBRACE)) {
            do {
                var key = this.expectIdentifierOrKeywordOrString();
                keys.push(key);
                this.expectCharacter($COLON);
                values.push(this.parsePipe());
            } while (this.optionalCharacter($COMMA));
            this.expectCharacter($RBRACE);
        }
        return new LiteralMap(keys, values);
    }
    parseAccessMemberOrMethodCall(receiver, isSafe = false) {
        let id = this.expectIdentifierOrKeyword();
        if (this.optionalCharacter($LPAREN)) {
            let args = this.parseCallArguments();
            this.expectCharacter($RPAREN);
            let fn = this.reflector.method(id);
            return isSafe ? new SafeMethodCall(receiver, id, fn, args) :
                new MethodCall(receiver, id, fn, args);
        }
        else {
            if (isSafe) {
                if (this.optionalOperator("=")) {
                    this.error("The '?.' operator cannot be used in the assignment");
                }
                else {
                    return new SafePropertyRead(receiver, id, this.reflector.getter(id));
                }
            }
            else {
                if (this.optionalOperator("=")) {
                    if (!this.parseAction) {
                        this.error("Bindings cannot contain assignments");
                    }
                    let value = this.parseConditional();
                    return new PropertyWrite(receiver, id, this.reflector.setter(id), value);
                }
                else {
                    return new PropertyRead(receiver, id, this.reflector.getter(id));
                }
            }
        }
        return null;
    }
    parseCallArguments() {
        if (this.next.isCharacter($RPAREN))
            return [];
        var positionals = [];
        do {
            positionals.push(this.parsePipe());
        } while (this.optionalCharacter($COMMA));
        return positionals;
    }
    parseBlockContent() {
        if (!this.parseAction) {
            this.error("Binding expression cannot contain chained expression");
        }
        var exprs = [];
        while (this.index < this.tokens.length && !this.next.isCharacter($RBRACE)) {
            var expr = this.parseExpression();
            exprs.push(expr);
            if (this.optionalCharacter($SEMICOLON)) {
                while (this.optionalCharacter($SEMICOLON)) {
                } // read all semicolons
            }
        }
        if (exprs.length == 0)
            return new EmptyExpr();
        if (exprs.length == 1)
            return exprs[0];
        return new Chain(exprs);
    }
    /**
     * An identifier, a keyword, a string with an optional `-` inbetween.
     */
    expectTemplateBindingKey() {
        var result = '';
        var operatorFound = false;
        do {
            result += this.expectIdentifierOrKeywordOrString();
            operatorFound = this.optionalOperator('-');
            if (operatorFound) {
                result += '-';
            }
        } while (operatorFound);
        return result.toString();
    }
    parseTemplateBindings() {
        var bindings = [];
        var prefix = null;
        while (this.index < this.tokens.length) {
            var keyIsVar = this.optionalKeywordVar();
            var key = this.expectTemplateBindingKey();
            if (!keyIsVar) {
                if (prefix == null) {
                    prefix = key;
                }
                else {
                    key = prefix + key[0].toUpperCase() + key.substring(1);
                }
            }
            this.optionalCharacter($COLON);
            var name = null;
            var expression = null;
            if (keyIsVar) {
                if (this.optionalOperator("=")) {
                    name = this.expectTemplateBindingKey();
                }
                else {
                    name = '\$implicit';
                }
            }
            else if (this.next !== EOF && !this.peekKeywordVar()) {
                var start = this.inputIndex;
                var ast = this.parsePipe();
                var source = this.input.substring(start, this.inputIndex);
                expression = new ASTWithSource(ast, source, this.location);
            }
            bindings.push(new TemplateBinding(key, keyIsVar, name, expression));
            if (!this.optionalCharacter($SEMICOLON)) {
                this.optionalCharacter($COMMA);
            }
        }
        return bindings;
    }
    error(message, index = null) {
        if (isBlank(index))
            index = this.index;
        var location = (index < this.tokens.length) ? `at column ${this.tokens[index].index + 1} in` :
            `at the end of the expression`;
        throw new ParseException(message, this.input, location, this.location);
    }
}
class SimpleExpressionChecker {
    constructor() {
        this.simple = true;
    }
    static check(ast) {
        var s = new SimpleExpressionChecker();
        ast.visit(s);
        return s.simple;
    }
    visitImplicitReceiver(ast) { }
    visitInterpolation(ast) { this.simple = false; }
    visitLiteralPrimitive(ast) { }
    visitPropertyRead(ast) { }
    visitPropertyWrite(ast) { this.simple = false; }
    visitSafePropertyRead(ast) { this.simple = false; }
    visitMethodCall(ast) { this.simple = false; }
    visitSafeMethodCall(ast) { this.simple = false; }
    visitFunctionCall(ast) { this.simple = false; }
    visitLiteralArray(ast) { this.visitAll(ast.expressions); }
    visitLiteralMap(ast) { this.visitAll(ast.values); }
    visitBinary(ast) { this.simple = false; }
    visitPrefixNot(ast) { this.simple = false; }
    visitConditional(ast) { this.simple = false; }
    visitPipe(ast) { this.simple = false; }
    visitKeyedRead(ast) { this.simple = false; }
    visitKeyedWrite(ast) { this.simple = false; }
    visitAll(asts) {
        var res = ListWrapper.createFixedSize(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    }
    visitChain(ast) { this.simple = false; }
    visitQuote(ast) { this.simple = false; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvcGFyc2VyLnRzIl0sIm5hbWVzIjpbIlBhcnNlRXhjZXB0aW9uIiwiUGFyc2VFeGNlcHRpb24uY29uc3RydWN0b3IiLCJTcGxpdEludGVycG9sYXRpb24iLCJTcGxpdEludGVycG9sYXRpb24uY29uc3RydWN0b3IiLCJQYXJzZXIiLCJQYXJzZXIuY29uc3RydWN0b3IiLCJQYXJzZXIucGFyc2VBY3Rpb24iLCJQYXJzZXIucGFyc2VCaW5kaW5nIiwiUGFyc2VyLnBhcnNlU2ltcGxlQmluZGluZyIsIlBhcnNlci5fcGFyc2VCaW5kaW5nQXN0IiwiUGFyc2VyLl9wYXJzZVF1b3RlIiwiUGFyc2VyLnBhcnNlVGVtcGxhdGVCaW5kaW5ncyIsIlBhcnNlci5wYXJzZUludGVycG9sYXRpb24iLCJQYXJzZXIuc3BsaXRJbnRlcnBvbGF0aW9uIiwiUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlIiwiUGFyc2VyLl9jaGVja05vSW50ZXJwb2xhdGlvbiIsIlBhcnNlci5fZmluZEludGVycG9sYXRpb25FcnJvckNvbHVtbiIsIl9QYXJzZUFTVCIsIl9QYXJzZUFTVC5jb25zdHJ1Y3RvciIsIl9QYXJzZUFTVC5wZWVrIiwiX1BhcnNlQVNULm5leHQiLCJfUGFyc2VBU1QuaW5wdXRJbmRleCIsIl9QYXJzZUFTVC5hZHZhbmNlIiwiX1BhcnNlQVNULm9wdGlvbmFsQ2hhcmFjdGVyIiwiX1BhcnNlQVNULm9wdGlvbmFsS2V5d29yZFZhciIsIl9QYXJzZUFTVC5wZWVrS2V5d29yZFZhciIsIl9QYXJzZUFTVC5leHBlY3RDaGFyYWN0ZXIiLCJfUGFyc2VBU1Qub3B0aW9uYWxPcGVyYXRvciIsIl9QYXJzZUFTVC5leHBlY3RPcGVyYXRvciIsIl9QYXJzZUFTVC5leHBlY3RJZGVudGlmaWVyT3JLZXl3b3JkIiwiX1BhcnNlQVNULmV4cGVjdElkZW50aWZpZXJPcktleXdvcmRPclN0cmluZyIsIl9QYXJzZUFTVC5wYXJzZUNoYWluIiwiX1BhcnNlQVNULnBhcnNlUGlwZSIsIl9QYXJzZUFTVC5wYXJzZUV4cHJlc3Npb24iLCJfUGFyc2VBU1QucGFyc2VDb25kaXRpb25hbCIsIl9QYXJzZUFTVC5wYXJzZUxvZ2ljYWxPciIsIl9QYXJzZUFTVC5wYXJzZUxvZ2ljYWxBbmQiLCJfUGFyc2VBU1QucGFyc2VFcXVhbGl0eSIsIl9QYXJzZUFTVC5wYXJzZVJlbGF0aW9uYWwiLCJfUGFyc2VBU1QucGFyc2VBZGRpdGl2ZSIsIl9QYXJzZUFTVC5wYXJzZU11bHRpcGxpY2F0aXZlIiwiX1BhcnNlQVNULnBhcnNlUHJlZml4IiwiX1BhcnNlQVNULnBhcnNlQ2FsbENoYWluIiwiX1BhcnNlQVNULnBhcnNlUHJpbWFyeSIsIl9QYXJzZUFTVC5wYXJzZUV4cHJlc3Npb25MaXN0IiwiX1BhcnNlQVNULnBhcnNlTGl0ZXJhbE1hcCIsIl9QYXJzZUFTVC5wYXJzZUFjY2Vzc01lbWJlck9yTWV0aG9kQ2FsbCIsIl9QYXJzZUFTVC5wYXJzZUNhbGxBcmd1bWVudHMiLCJfUGFyc2VBU1QucGFyc2VCbG9ja0NvbnRlbnQiLCJfUGFyc2VBU1QuZXhwZWN0VGVtcGxhdGVCaW5kaW5nS2V5IiwiX1BhcnNlQVNULnBhcnNlVGVtcGxhdGVCaW5kaW5ncyIsIl9QYXJzZUFTVC5lcnJvciIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIuY29uc3RydWN0b3IiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci5jaGVjayIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0SW1wbGljaXRSZWNlaXZlciIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0SW50ZXJwb2xhdGlvbiIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0TGl0ZXJhbFByaW1pdGl2ZSIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0UHJvcGVydHlSZWFkIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRQcm9wZXJ0eVdyaXRlIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRTYWZlUHJvcGVydHlSZWFkIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRNZXRob2RDYWxsIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRTYWZlTWV0aG9kQ2FsbCIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0RnVuY3Rpb25DYWxsIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRMaXRlcmFsQXJyYXkiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdExpdGVyYWxNYXAiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdEJpbmFyeSIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0UHJlZml4Tm90IiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRDb25kaXRpb25hbCIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0UGlwZSIsIlNpbXBsZUV4cHJlc3Npb25DaGVja2VyLnZpc2l0S2V5ZWRSZWFkIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRLZXllZFdyaXRlIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRBbGwiLCJTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci52aXNpdENoYWluIiwiU2ltcGxlRXhwcmVzc2lvbkNoZWNrZXIudmlzaXRRdW90ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxpQ0FBaUM7T0FDbkQsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUNuRSxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFDTCxLQUFLLEVBQ0wsR0FBRyxFQUNILFlBQVksRUFFWixPQUFPLEVBQ1AsTUFBTSxFQUNO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LENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxNQUFNQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN2REEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdENBLE1BQU1BLEdBQUdBLElBQUlBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBLENBQUNBO1lBQ3ZEQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUR2QixXQUFXQTtRQUNUd0IsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDdEVBLENBQUNBO1FBQUNBLElBQUlB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QSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNoQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsWUFBWUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFFcENBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQTtRQUVoQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUV0RUEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2pDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtZQUNmQSxNQUFNQSxDQUFDQSxJQUFJQSxnQkFBZ0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBRXJDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDeENBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1lBQ2ZBLE1BQU1B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WUFDREEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUMvQkEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDaEJBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO1lBQ3RCQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDYkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDL0JBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLHdCQUF3QkEsRUFBRUEsQ0FBQ0E7Z0JBQ3pDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLElBQUlBLEdBQUdBLFlBQVlBLENBQUNBO2dCQUN0QkEsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZEQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtnQkFDNUJBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO2dCQUMzQkEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzFEQSxVQUFVQSxHQUFHQSxJQUFJQSxhQUFhQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUM3REEsQ0FBQ0E7WUFDREEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsR0FBR0EsRUFBRUEsUUFB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Q0E7SUFFL0NyQixVQUFVQSxDQUFDQSxHQUFVQSxJQUFJc0IsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakR0QixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9kZWNvcmF0b3JzJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIExleGVyLFxuICBFT0YsXG4gIGlzSWRlbnRpZmllcixcbiAgVG9rZW4sXG4gICRQRVJJT0QsXG4gICRDT0xPTixcbiAgJFNFTUlDT0xPTixcbiAgJExCUkFDS0VULFxuICAkUkJSQUNLRVQsXG4gICRDT01NQSxcbiAgJExCUkFDRSxcbiAgJFJCUkFDRSxcbiAgJExQQVJFTixcbiAgJFJQQVJFTlxufSBmcm9tICcuL2xleGVyJztcbmltcG9ydCB7cmVmbGVjdG9yLCBSZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1xuICBBU1QsXG4gIEVtcHR5RXhwcixcbiAgSW1wbGljaXRSZWNlaXZlcixcbiAgUHJvcGVydHlSZWFkLFxuICBQcm9wZXJ0eVdyaXRlLFxuICBTYWZlUHJvcGVydHlSZWFkLFxuICBMaXRlcmFsUHJpbWl0aXZlLFxuICBCaW5hcnksXG4gIFByZWZpeE5vdCxcbiAgQ29uZGl0aW9uYWwsXG4gIEJpbmRpbmdQaXBlLFxuICBDaGFpbixcbiAgS2V5ZWRSZWFkLFxuICBLZXllZFdyaXRlLFxuICBMaXRlcmFsQXJyYXksXG4gIExpdGVyYWxNYXAsXG4gIEludGVycG9sYXRpb24sXG4gIE1ldGhvZENhbGwsXG4gIFNhZmVNZXRob2RDYWxsLFxuICBGdW5jdGlvbkNhbGwsXG4gIFRlbXBsYXRlQmluZGluZyxcbiAgQVNUV2l0aFNvdXJjZSxcbiAgQXN0VmlzaXRvcixcbiAgUXVvdGVcbn0gZnJvbSAnLi9hc3QnO1xuXG5cbnZhciBfaW1wbGljaXRSZWNlaXZlciA9IG5ldyBJbXBsaWNpdFJlY2VpdmVyKCk7XG4vLyBUT0RPKHRib3NjaCk6IENhbm5vdCBtYWtlIHRoaXMgY29uc3QvZmluYWwgcmlnaHQgbm93IGJlY2F1c2Ugb2YgdGhlIHRyYW5zcGlsZXIuLi5cbnZhciBJTlRFUlBPTEFUSU9OX1JFR0VYUCA9IC9cXHtcXHsoW1xcc1xcU10qPylcXH1cXH0vZztcblxuY2xhc3MgUGFyc2VFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBpbnB1dDogc3RyaW5nLCBlcnJMb2NhdGlvbjogc3RyaW5nLCBjdHhMb2NhdGlvbj86IGFueSkge1xuICAgIHN1cGVyKGBQYXJzZXIgRXJyb3I6ICR7bWVzc2FnZX0gJHtlcnJMb2NhdGlvbn0gWyR7aW5wdXR9XSBpbiAke2N0eExvY2F0aW9ufWApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTcGxpdEludGVycG9sYXRpb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RyaW5nczogc3RyaW5nW10sIHB1YmxpYyBleHByZXNzaW9uczogc3RyaW5nW10pIHt9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYXJzZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9yZWZsZWN0b3I6IFJlZmxlY3RvcjtcblxuICBjb25zdHJ1Y3RvcigvKiogQGludGVybmFsICovXG4gICAgICAgICAgICAgIHB1YmxpYyBfbGV4ZXI6IExleGVyLCBwcm92aWRlZFJlZmxlY3RvcjogUmVmbGVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX3JlZmxlY3RvciA9IGlzUHJlc2VudChwcm92aWRlZFJlZmxlY3RvcikgPyBwcm92aWRlZFJlZmxlY3RvciA6IHJlZmxlY3RvcjtcbiAgfVxuXG4gIHBhcnNlQWN0aW9uKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBhbnkpOiBBU1RXaXRoU291cmNlIHtcbiAgICB0aGlzLl9jaGVja05vSW50ZXJwb2xhdGlvbihpbnB1dCwgbG9jYXRpb24pO1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLl9sZXhlci50b2tlbml6ZShpbnB1dCk7XG4gICAgdmFyIGFzdCA9IG5ldyBfUGFyc2VBU1QoaW5wdXQsIGxvY2F0aW9uLCB0b2tlbnMsIHRoaXMuX3JlZmxlY3RvciwgdHJ1ZSkucGFyc2VDaGFpbigpO1xuICAgIHJldHVybiBuZXcgQVNUV2l0aFNvdXJjZShhc3QsIGlucHV0LCBsb2NhdGlvbik7XG4gIH1cblxuICBwYXJzZUJpbmRpbmcoaW5wdXQ6IHN0cmluZywgbG9jYXRpb246IGFueSk6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHZhciBhc3QgPSB0aGlzLl9wYXJzZUJpbmRpbmdBc3QoaW5wdXQsIGxvY2F0aW9uKTtcbiAgICByZXR1cm4gbmV3IEFTVFdpdGhTb3VyY2UoYXN0LCBpbnB1dCwgbG9jYXRpb24pO1xuICB9XG5cbiAgcGFyc2VTaW1wbGVCaW5kaW5nKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcpOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgYXN0ID0gdGhpcy5fcGFyc2VCaW5kaW5nQXN0KGlucHV0LCBsb2NhdGlvbik7XG4gICAgaWYgKCFTaW1wbGVFeHByZXNzaW9uQ2hlY2tlci5jaGVjayhhc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24oXG4gICAgICAgICAgJ0hvc3QgYmluZGluZyBleHByZXNzaW9uIGNhbiBvbmx5IGNvbnRhaW4gZmllbGQgYWNjZXNzIGFuZCBjb25zdGFudHMnLCBpbnB1dCwgbG9jYXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEFTVFdpdGhTb3VyY2UoYXN0LCBpbnB1dCwgbG9jYXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VCaW5kaW5nQXN0KGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcpOiBBU1Qge1xuICAgIC8vIFF1b3RlcyBleHByZXNzaW9ucyB1c2UgM3JkLXBhcnR5IGV4cHJlc3Npb24gbGFuZ3VhZ2UuIFdlIGRvbid0IHdhbnQgdG8gdXNlXG4gICAgLy8gb3VyIGxleGVyIG9yIHBhcnNlciBmb3IgdGhhdCwgc28gd2UgY2hlY2sgZm9yIHRoYXQgYWhlYWQgb2YgdGltZS5cbiAgICB2YXIgcXVvdGUgPSB0aGlzLl9wYXJzZVF1b3RlKGlucHV0LCBsb2NhdGlvbik7XG5cbiAgICBpZiAoaXNQcmVzZW50KHF1b3RlKSkge1xuICAgICAgcmV0dXJuIHF1b3RlO1xuICAgIH1cblxuICAgIHRoaXMuX2NoZWNrTm9JbnRlcnBvbGF0aW9uKGlucHV0LCBsb2NhdGlvbik7XG4gICAgdmFyIHRva2VucyA9IHRoaXMuX2xleGVyLnRva2VuaXplKGlucHV0KTtcbiAgICByZXR1cm4gbmV3IF9QYXJzZUFTVChpbnB1dCwgbG9jYXRpb24sIHRva2VucywgdGhpcy5fcmVmbGVjdG9yLCBmYWxzZSkucGFyc2VDaGFpbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VRdW90ZShpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogYW55KTogQVNUIHtcbiAgICBpZiAoaXNCbGFuayhpbnB1dCkpIHJldHVybiBudWxsO1xuICAgIHZhciBwcmVmaXhTZXBhcmF0b3JJbmRleCA9IGlucHV0LmluZGV4T2YoJzonKTtcbiAgICBpZiAocHJlZml4U2VwYXJhdG9ySW5kZXggPT0gLTEpIHJldHVybiBudWxsO1xuICAgIHZhciBwcmVmaXggPSBpbnB1dC5zdWJzdHJpbmcoMCwgcHJlZml4U2VwYXJhdG9ySW5kZXgpLnRyaW0oKTtcbiAgICBpZiAoIWlzSWRlbnRpZmllcihwcmVmaXgpKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgdW5pbnRlcnByZXRlZEV4cHJlc3Npb24gPSBpbnB1dC5zdWJzdHJpbmcocHJlZml4U2VwYXJhdG9ySW5kZXggKyAxKTtcbiAgICByZXR1cm4gbmV3IFF1b3RlKHByZWZpeCwgdW5pbnRlcnByZXRlZEV4cHJlc3Npb24sIGxvY2F0aW9uKTtcbiAgfVxuXG4gIHBhcnNlVGVtcGxhdGVCaW5kaW5ncyhpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogYW55KTogVGVtcGxhdGVCaW5kaW5nW10ge1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLl9sZXhlci50b2tlbml6ZShpbnB1dCk7XG4gICAgcmV0dXJuIG5ldyBfUGFyc2VBU1QoaW5wdXQsIGxvY2F0aW9uLCB0b2tlbnMsIHRoaXMuX3JlZmxlY3RvciwgZmFsc2UpLnBhcnNlVGVtcGxhdGVCaW5kaW5ncygpO1xuICB9XG5cbiAgcGFyc2VJbnRlcnBvbGF0aW9uKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBhbnkpOiBBU1RXaXRoU291cmNlIHtcbiAgICBsZXQgc3BsaXQgPSB0aGlzLnNwbGl0SW50ZXJwb2xhdGlvbihpbnB1dCwgbG9jYXRpb24pO1xuICAgIGlmIChzcGxpdCA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgIGxldCBleHByZXNzaW9ucyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdC5leHByZXNzaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMuX2xleGVyLnRva2VuaXplKHNwbGl0LmV4cHJlc3Npb25zW2ldKTtcbiAgICAgIHZhciBhc3QgPSBuZXcgX1BhcnNlQVNUKGlucHV0LCBsb2NhdGlvbiwgdG9rZW5zLCB0aGlzLl9yZWZsZWN0b3IsIGZhbHNlKS5wYXJzZUNoYWluKCk7XG4gICAgICBleHByZXNzaW9ucy5wdXNoKGFzdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBBU1RXaXRoU291cmNlKG5ldyBJbnRlcnBvbGF0aW9uKHNwbGl0LnN0cmluZ3MsIGV4cHJlc3Npb25zKSwgaW5wdXQsIGxvY2F0aW9uKTtcbiAgfVxuXG4gIHNwbGl0SW50ZXJwb2xhdGlvbihpbnB1dDogc3RyaW5nLCBsb2NhdGlvbjogc3RyaW5nKTogU3BsaXRJbnRlcnBvbGF0aW9uIHtcbiAgICB2YXIgcGFydHMgPSBTdHJpbmdXcmFwcGVyLnNwbGl0KGlucHV0LCBJTlRFUlBPTEFUSU9OX1JFR0VYUCk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHN0cmluZ3MgPSBbXTtcbiAgICB2YXIgZXhwcmVzc2lvbnMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXJ0OiBzdHJpbmcgPSBwYXJ0c1tpXTtcbiAgICAgIGlmIChpICUgMiA9PT0gMCkge1xuICAgICAgICAvLyBmaXhlZCBzdHJpbmdcbiAgICAgICAgc3RyaW5ncy5wdXNoKHBhcnQpO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0LnRyaW0oKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGV4cHJlc3Npb25zLnB1c2gocGFydCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24oJ0JsYW5rIGV4cHJlc3Npb25zIGFyZSBub3QgYWxsb3dlZCBpbiBpbnRlcnBvbGF0ZWQgc3RyaW5ncycsIGlucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYGF0IGNvbHVtbiAke3RoaXMuX2ZpbmRJbnRlcnBvbGF0aW9uRXJyb3JDb2x1bW4ocGFydHMsIGkpfSBpbmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3BsaXRJbnRlcnBvbGF0aW9uKHN0cmluZ3MsIGV4cHJlc3Npb25zKTtcbiAgfVxuXG4gIHdyYXBMaXRlcmFsUHJpbWl0aXZlKGlucHV0OiBzdHJpbmcsIGxvY2F0aW9uOiBhbnkpOiBBU1RXaXRoU291cmNlIHtcbiAgICByZXR1cm4gbmV3IEFTVFdpdGhTb3VyY2UobmV3IExpdGVyYWxQcmltaXRpdmUoaW5wdXQpLCBpbnB1dCwgbG9jYXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tOb0ludGVycG9sYXRpb24oaW5wdXQ6IHN0cmluZywgbG9jYXRpb246IGFueSk6IHZvaWQge1xuICAgIHZhciBwYXJ0cyA9IFN0cmluZ1dyYXBwZXIuc3BsaXQoaW5wdXQsIElOVEVSUE9MQVRJT05fUkVHRVhQKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uKCdHb3QgaW50ZXJwb2xhdGlvbiAoe3t9fSkgd2hlcmUgZXhwcmVzc2lvbiB3YXMgZXhwZWN0ZWQnLCBpbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgYXQgY29sdW1uICR7dGhpcy5fZmluZEludGVycG9sYXRpb25FcnJvckNvbHVtbihwYXJ0cywgMSl9IGluYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZmluZEludGVycG9sYXRpb25FcnJvckNvbHVtbihwYXJ0czogc3RyaW5nW10sIHBhcnRJbkVycklkeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB2YXIgZXJyTG9jYXRpb24gPSAnJztcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRJbkVycklkeDsgaisrKSB7XG4gICAgICBlcnJMb2NhdGlvbiArPSBqICUgMiA9PT0gMCA/IHBhcnRzW2pdIDogYHt7JHtwYXJ0c1tqXX19fWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVyckxvY2F0aW9uLmxlbmd0aDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgX1BhcnNlQVNUIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbnB1dDogc3RyaW5nLCBwdWJsaWMgbG9jYXRpb246IGFueSwgcHVibGljIHRva2VuczogYW55W10sXG4gICAgICAgICAgICAgIHB1YmxpYyByZWZsZWN0b3I6IFJlZmxlY3RvciwgcHVibGljIHBhcnNlQWN0aW9uOiBib29sZWFuKSB7fVxuXG4gIHBlZWsob2Zmc2V0OiBudW1iZXIpOiBUb2tlbiB7XG4gICAgdmFyIGkgPSB0aGlzLmluZGV4ICsgb2Zmc2V0O1xuICAgIHJldHVybiBpIDwgdGhpcy50b2tlbnMubGVuZ3RoID8gdGhpcy50b2tlbnNbaV0gOiBFT0Y7XG4gIH1cblxuICBnZXQgbmV4dCgpOiBUb2tlbiB7IHJldHVybiB0aGlzLnBlZWsoMCk7IH1cblxuICBnZXQgaW5wdXRJbmRleCgpOiBudW1iZXIge1xuICAgIHJldHVybiAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCkgPyB0aGlzLm5leHQuaW5kZXggOiB0aGlzLmlucHV0Lmxlbmd0aDtcbiAgfVxuXG4gIGFkdmFuY2UoKSB7IHRoaXMuaW5kZXgrKzsgfVxuXG4gIG9wdGlvbmFsQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLm5leHQuaXNDaGFyYWN0ZXIoY29kZSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBvcHRpb25hbEtleXdvcmRWYXIoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucGVla0tleXdvcmRWYXIoKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHBlZWtLZXl3b3JkVmFyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5uZXh0LmlzS2V5d29yZFZhcigpIHx8IHRoaXMubmV4dC5pc09wZXJhdG9yKCcjJyk7IH1cblxuICBleHBlY3RDaGFyYWN0ZXIoY29kZTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoY29kZSkpIHJldHVybjtcbiAgICB0aGlzLmVycm9yKGBNaXNzaW5nIGV4cGVjdGVkICR7U3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUoY29kZSl9YCk7XG4gIH1cblxuXG4gIG9wdGlvbmFsT3BlcmF0b3Iob3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLm5leHQuaXNPcGVyYXRvcihvcCkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBleHBlY3RPcGVyYXRvcihvcGVyYXRvcjogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcihvcGVyYXRvcikpIHJldHVybjtcbiAgICB0aGlzLmVycm9yKGBNaXNzaW5nIGV4cGVjdGVkIG9wZXJhdG9yICR7b3BlcmF0b3J9YCk7XG4gIH1cblxuICBleHBlY3RJZGVudGlmaWVyT3JLZXl3b3JkKCk6IHN0cmluZyB7XG4gICAgdmFyIG4gPSB0aGlzLm5leHQ7XG4gICAgaWYgKCFuLmlzSWRlbnRpZmllcigpICYmICFuLmlzS2V5d29yZCgpKSB7XG4gICAgICB0aGlzLmVycm9yKGBVbmV4cGVjdGVkIHRva2VuICR7bn0sIGV4cGVjdGVkIGlkZW50aWZpZXIgb3Iga2V5d29yZGApO1xuICAgIH1cbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbi50b1N0cmluZygpO1xuICB9XG5cbiAgZXhwZWN0SWRlbnRpZmllck9yS2V5d29yZE9yU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdmFyIG4gPSB0aGlzLm5leHQ7XG4gICAgaWYgKCFuLmlzSWRlbnRpZmllcigpICYmICFuLmlzS2V5d29yZCgpICYmICFuLmlzU3RyaW5nKCkpIHtcbiAgICAgIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW4gJHtufSwgZXhwZWN0ZWQgaWRlbnRpZmllciwga2V5d29yZCwgb3Igc3RyaW5nYCk7XG4gICAgfVxuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuLnRvU3RyaW5nKCk7XG4gIH1cblxuICBwYXJzZUNoYWluKCk6IEFTVCB7XG4gICAgdmFyIGV4cHJzID0gW107XG4gICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGgpIHtcbiAgICAgIHZhciBleHByID0gdGhpcy5wYXJzZVBpcGUoKTtcbiAgICAgIGV4cHJzLnB1c2goZXhwcik7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRTRU1JQ09MT04pKSB7XG4gICAgICAgIGlmICghdGhpcy5wYXJzZUFjdGlvbikge1xuICAgICAgICAgIHRoaXMuZXJyb3IoXCJCaW5kaW5nIGV4cHJlc3Npb24gY2Fubm90IGNvbnRhaW4gY2hhaW5lZCBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRTRU1JQ09MT04pKSB7XG4gICAgICAgIH0gIC8vIHJlYWQgYWxsIHNlbWljb2xvbnNcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmVycm9yKGBVbmV4cGVjdGVkIHRva2VuICcke3RoaXMubmV4dH0nYCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChleHBycy5sZW5ndGggPT0gMCkgcmV0dXJuIG5ldyBFbXB0eUV4cHIoKTtcbiAgICBpZiAoZXhwcnMubGVuZ3RoID09IDEpIHJldHVybiBleHByc1swXTtcbiAgICByZXR1cm4gbmV3IENoYWluKGV4cHJzKTtcbiAgfVxuXG4gIHBhcnNlUGlwZSgpOiBBU1Qge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoXCJ8XCIpKSB7XG4gICAgICBpZiAodGhpcy5wYXJzZUFjdGlvbikge1xuICAgICAgICB0aGlzLmVycm9yKFwiQ2Fubm90IGhhdmUgYSBwaXBlIGluIGFuIGFjdGlvbiBleHByZXNzaW9uXCIpO1xuICAgICAgfVxuXG4gICAgICBkbyB7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5leHBlY3RJZGVudGlmaWVyT3JLZXl3b3JkKCk7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIHdoaWxlICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRDT0xPTikpIHtcbiAgICAgICAgICBhcmdzLnB1c2godGhpcy5wYXJzZUV4cHJlc3Npb24oKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmRpbmdQaXBlKHJlc3VsdCwgbmFtZSwgYXJncyk7XG4gICAgICB9IHdoaWxlICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoXCJ8XCIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcGFyc2VFeHByZXNzaW9uKCk6IEFTVCB7IHJldHVybiB0aGlzLnBhcnNlQ29uZGl0aW9uYWwoKTsgfVxuXG4gIHBhcnNlQ29uZGl0aW9uYWwoKTogQVNUIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VMb2dpY2FsT3IoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJz8nKSkge1xuICAgICAgdmFyIHllcyA9IHRoaXMucGFyc2VQaXBlKCk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJENPTE9OKSkge1xuICAgICAgICB2YXIgZW5kID0gdGhpcy5pbnB1dEluZGV4O1xuICAgICAgICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgICAgICB0aGlzLmVycm9yKGBDb25kaXRpb25hbCBleHByZXNzaW9uICR7ZXhwcmVzc2lvbn0gcmVxdWlyZXMgYWxsIDMgZXhwcmVzc2lvbnNgKTtcbiAgICAgIH1cbiAgICAgIHZhciBubyA9IHRoaXMucGFyc2VQaXBlKCk7XG4gICAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsKHJlc3VsdCwgeWVzLCBubyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgcGFyc2VMb2dpY2FsT3IoKTogQVNUIHtcbiAgICAvLyAnfHwnXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VMb2dpY2FsQW5kKCk7XG4gICAgd2hpbGUgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignfHwnKSkge1xuICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnfHwnLCByZXN1bHQsIHRoaXMucGFyc2VMb2dpY2FsQW5kKCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcGFyc2VMb2dpY2FsQW5kKCk6IEFTVCB7XG4gICAgLy8gJyYmJ1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhcnNlRXF1YWxpdHkoKTtcbiAgICB3aGlsZSAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCcmJicpKSB7XG4gICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCcmJicsIHJlc3VsdCwgdGhpcy5wYXJzZUVxdWFsaXR5KCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcGFyc2VFcXVhbGl0eSgpOiBBU1Qge1xuICAgIC8vICc9PScsJyE9JywnPT09JywnIT09J1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhcnNlUmVsYXRpb25hbCgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCc9PScpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJz09JywgcmVzdWx0LCB0aGlzLnBhcnNlUmVsYXRpb25hbCgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCc9PT0nKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCc9PT0nLCByZXN1bHQsIHRoaXMucGFyc2VSZWxhdGlvbmFsKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJyE9JykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnIT0nLCByZXN1bHQsIHRoaXMucGFyc2VSZWxhdGlvbmFsKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJyE9PScpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJyE9PScsIHJlc3VsdCwgdGhpcy5wYXJzZVJlbGF0aW9uYWwoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHBhcnNlUmVsYXRpb25hbCgpOiBBU1Qge1xuICAgIC8vICc8JywgJz4nLCAnPD0nLCAnPj0nXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VBZGRpdGl2ZSgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCc8JykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnPCcsIHJlc3VsdCwgdGhpcy5wYXJzZUFkZGl0aXZlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJz4nKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCc+JywgcmVzdWx0LCB0aGlzLnBhcnNlQWRkaXRpdmUoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignPD0nKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCc8PScsIHJlc3VsdCwgdGhpcy5wYXJzZUFkZGl0aXZlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJz49JykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnPj0nLCByZXN1bHQsIHRoaXMucGFyc2VBZGRpdGl2ZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGFyc2VBZGRpdGl2ZSgpOiBBU1Qge1xuICAgIC8vICcrJywgJy0nXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCcrJykpIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEJpbmFyeSgnKycsIHJlc3VsdCwgdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJy0nKSkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQmluYXJ5KCctJywgcmVzdWx0LCB0aGlzLnBhcnNlTXVsdGlwbGljYXRpdmUoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHBhcnNlTXVsdGlwbGljYXRpdmUoKTogQVNUIHtcbiAgICAvLyAnKicsICclJywgJy8nXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFyc2VQcmVmaXgoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignKicpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJyonLCByZXN1bHQsIHRoaXMucGFyc2VQcmVmaXgoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignJScpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJyUnLCByZXN1bHQsIHRoaXMucGFyc2VQcmVmaXgoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignLycpKSB7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnkoJy8nLCByZXN1bHQsIHRoaXMucGFyc2VQcmVmaXgoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHBhcnNlUHJlZml4KCk6IEFTVCB7XG4gICAgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignKycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZVByZWZpeCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKCctJykpIHtcbiAgICAgIHJldHVybiBuZXcgQmluYXJ5KCctJywgbmV3IExpdGVyYWxQcmltaXRpdmUoMCksIHRoaXMucGFyc2VQcmVmaXgoKSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoJyEnKSkge1xuICAgICAgcmV0dXJuIG5ldyBQcmVmaXhOb3QodGhpcy5wYXJzZVByZWZpeCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VDYWxsQ2hhaW4oKTtcbiAgICB9XG4gIH1cblxuICBwYXJzZUNhbGxDaGFpbigpOiBBU1Qge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhcnNlUHJpbWFyeSgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25hbENoYXJhY3RlcigkUEVSSU9EKSkge1xuICAgICAgICByZXN1bHQgPSB0aGlzLnBhcnNlQWNjZXNzTWVtYmVyT3JNZXRob2RDYWxsKHJlc3VsdCwgZmFsc2UpO1xuXG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9uYWxPcGVyYXRvcignPy4nKSkge1xuICAgICAgICByZXN1bHQgPSB0aGlzLnBhcnNlQWNjZXNzTWVtYmVyT3JNZXRob2RDYWxsKHJlc3VsdCwgdHJ1ZSk7XG5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25hbENoYXJhY3RlcigkTEJSQUNLRVQpKSB7XG4gICAgICAgIHZhciBrZXkgPSB0aGlzLnBhcnNlUGlwZSgpO1xuICAgICAgICB0aGlzLmV4cGVjdENoYXJhY3RlcigkUkJSQUNLRVQpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKFwiPVwiKSkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMucGFyc2VDb25kaXRpb25hbCgpO1xuICAgICAgICAgIHJlc3VsdCA9IG5ldyBLZXllZFdyaXRlKHJlc3VsdCwga2V5LCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0ID0gbmV3IEtleWVkUmVhZChyZXN1bHQsIGtleSk7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRMUEFSRU4pKSB7XG4gICAgICAgIHZhciBhcmdzID0gdGhpcy5wYXJzZUNhbGxBcmd1bWVudHMoKTtcbiAgICAgICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoJFJQQVJFTik7XG4gICAgICAgIHJlc3VsdCA9IG5ldyBGdW5jdGlvbkNhbGwocmVzdWx0LCBhcmdzKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwYXJzZVByaW1hcnkoKTogQVNUIHtcbiAgICBpZiAodGhpcy5vcHRpb25hbENoYXJhY3RlcigkTFBBUkVOKSkge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMucGFyc2VQaXBlKCk7XG4gICAgICB0aGlzLmV4cGVjdENoYXJhY3RlcigkUlBBUkVOKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHQuaXNLZXl3b3JkTnVsbCgpIHx8IHRoaXMubmV4dC5pc0tleXdvcmRVbmRlZmluZWQoKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUobnVsbCk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc0tleXdvcmRUcnVlKCkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsUHJpbWl0aXZlKHRydWUpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHQuaXNLZXl3b3JkRmFsc2UoKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUoZmFsc2UpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRMQlJBQ0tFVCkpIHtcbiAgICAgIHZhciBlbGVtZW50cyA9IHRoaXMucGFyc2VFeHByZXNzaW9uTGlzdCgkUkJSQUNLRVQpO1xuICAgICAgdGhpcy5leHBlY3RDaGFyYWN0ZXIoJFJCUkFDS0VUKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbEFycmF5KGVsZW1lbnRzKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzQ2hhcmFjdGVyKCRMQlJBQ0UpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUxpdGVyYWxNYXAoKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0LmlzSWRlbnRpZmllcigpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUFjY2Vzc01lbWJlck9yTWV0aG9kQ2FsbChfaW1wbGljaXRSZWNlaXZlciwgZmFsc2UpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHQuaXNOdW1iZXIoKSkge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5uZXh0LnRvTnVtYmVyKCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbFByaW1pdGl2ZSh2YWx1ZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dC5pc1N0cmluZygpKSB7XG4gICAgICB2YXIgbGl0ZXJhbFZhbHVlID0gdGhpcy5uZXh0LnRvU3RyaW5nKCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgTGl0ZXJhbFByaW1pdGl2ZShsaXRlcmFsVmFsdWUpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmluZGV4ID49IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgdGhpcy5lcnJvcihgVW5leHBlY3RlZCBlbmQgb2YgZXhwcmVzc2lvbjogJHt0aGlzLmlucHV0fWApO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW4gJHt0aGlzLm5leHR9YCk7XG4gICAgfVxuICAgIC8vIGVycm9yKCkgdGhyb3dzLCBzbyB3ZSBkb24ndCByZWFjaCBoZXJlLlxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiRmVsbCB0aHJvdWdoIGFsbCBjYXNlcyBpbiBwYXJzZVByaW1hcnlcIik7XG4gIH1cblxuICBwYXJzZUV4cHJlc3Npb25MaXN0KHRlcm1pbmF0b3I6IG51bWJlcik6IGFueVtdIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgaWYgKCF0aGlzLm5leHQuaXNDaGFyYWN0ZXIodGVybWluYXRvcikpIHtcbiAgICAgIGRvIHtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5wYXJzZVBpcGUoKSk7XG4gICAgICB9IHdoaWxlICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRDT01NQSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcGFyc2VMaXRlcmFsTWFwKCk6IExpdGVyYWxNYXAge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKCRMQlJBQ0UpO1xuICAgIGlmICghdGhpcy5vcHRpb25hbENoYXJhY3RlcigkUkJSQUNFKSkge1xuICAgICAgZG8ge1xuICAgICAgICB2YXIga2V5ID0gdGhpcy5leHBlY3RJZGVudGlmaWVyT3JLZXl3b3JkT3JTdHJpbmcoKTtcbiAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKCRDT0xPTik7XG4gICAgICAgIHZhbHVlcy5wdXNoKHRoaXMucGFyc2VQaXBlKCkpO1xuICAgICAgfSB3aGlsZSAodGhpcy5vcHRpb25hbENoYXJhY3RlcigkQ09NTUEpKTtcbiAgICAgIHRoaXMuZXhwZWN0Q2hhcmFjdGVyKCRSQlJBQ0UpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IExpdGVyYWxNYXAoa2V5cywgdmFsdWVzKTtcbiAgfVxuXG4gIHBhcnNlQWNjZXNzTWVtYmVyT3JNZXRob2RDYWxsKHJlY2VpdmVyOiBBU1QsIGlzU2FmZTogYm9vbGVhbiA9IGZhbHNlKTogQVNUIHtcbiAgICBsZXQgaWQgPSB0aGlzLmV4cGVjdElkZW50aWZpZXJPcktleXdvcmQoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRMUEFSRU4pKSB7XG4gICAgICBsZXQgYXJncyA9IHRoaXMucGFyc2VDYWxsQXJndW1lbnRzKCk7XG4gICAgICB0aGlzLmV4cGVjdENoYXJhY3RlcigkUlBBUkVOKTtcbiAgICAgIGxldCBmbiA9IHRoaXMucmVmbGVjdG9yLm1ldGhvZChpZCk7XG4gICAgICByZXR1cm4gaXNTYWZlID8gbmV3IFNhZmVNZXRob2RDYWxsKHJlY2VpdmVyLCBpZCwgZm4sIGFyZ3MpIDpcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgTWV0aG9kQ2FsbChyZWNlaXZlciwgaWQsIGZuLCBhcmdzKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNTYWZlKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoXCI9XCIpKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcihcIlRoZSAnPy4nIG9wZXJhdG9yIGNhbm5vdCBiZSB1c2VkIGluIHRoZSBhc3NpZ25tZW50XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgU2FmZVByb3BlcnR5UmVhZChyZWNlaXZlciwgaWQsIHRoaXMucmVmbGVjdG9yLmdldHRlcihpZCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25hbE9wZXJhdG9yKFwiPVwiKSkge1xuICAgICAgICAgIGlmICghdGhpcy5wYXJzZUFjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcihcIkJpbmRpbmdzIGNhbm5vdCBjb250YWluIGFzc2lnbm1lbnRzXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMucGFyc2VDb25kaXRpb25hbCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXcml0ZShyZWNlaXZlciwgaWQsIHRoaXMucmVmbGVjdG9yLnNldHRlcihpZCksIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5UmVhZChyZWNlaXZlciwgaWQsIHRoaXMucmVmbGVjdG9yLmdldHRlcihpZCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwYXJzZUNhbGxBcmd1bWVudHMoKTogQmluZGluZ1BpcGVbXSB7XG4gICAgaWYgKHRoaXMubmV4dC5pc0NoYXJhY3RlcigkUlBBUkVOKSkgcmV0dXJuIFtdO1xuICAgIHZhciBwb3NpdGlvbmFscyA9IFtdO1xuICAgIGRvIHtcbiAgICAgIHBvc2l0aW9uYWxzLnB1c2godGhpcy5wYXJzZVBpcGUoKSk7XG4gICAgfSB3aGlsZSAodGhpcy5vcHRpb25hbENoYXJhY3RlcigkQ09NTUEpKTtcbiAgICByZXR1cm4gcG9zaXRpb25hbHM7XG4gIH1cblxuICBwYXJzZUJsb2NrQ29udGVudCgpOiBBU1Qge1xuICAgIGlmICghdGhpcy5wYXJzZUFjdGlvbikge1xuICAgICAgdGhpcy5lcnJvcihcIkJpbmRpbmcgZXhwcmVzc2lvbiBjYW5ub3QgY29udGFpbiBjaGFpbmVkIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIHZhciBleHBycyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLmluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoICYmICF0aGlzLm5leHQuaXNDaGFyYWN0ZXIoJFJCUkFDRSkpIHtcbiAgICAgIHZhciBleHByID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgIGV4cHJzLnB1c2goZXhwcik7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRTRU1JQ09MT04pKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRTRU1JQ09MT04pKSB7XG4gICAgICAgIH0gIC8vIHJlYWQgYWxsIHNlbWljb2xvbnNcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV4cHJzLmxlbmd0aCA9PSAwKSByZXR1cm4gbmV3IEVtcHR5RXhwcigpO1xuICAgIGlmIChleHBycy5sZW5ndGggPT0gMSkgcmV0dXJuIGV4cHJzWzBdO1xuXG4gICAgcmV0dXJuIG5ldyBDaGFpbihleHBycyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGlmaWVyLCBhIGtleXdvcmQsIGEgc3RyaW5nIHdpdGggYW4gb3B0aW9uYWwgYC1gIGluYmV0d2Vlbi5cbiAgICovXG4gIGV4cGVjdFRlbXBsYXRlQmluZGluZ0tleSgpOiBzdHJpbmcge1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgb3BlcmF0b3JGb3VuZCA9IGZhbHNlO1xuICAgIGRvIHtcbiAgICAgIHJlc3VsdCArPSB0aGlzLmV4cGVjdElkZW50aWZpZXJPcktleXdvcmRPclN0cmluZygpO1xuICAgICAgb3BlcmF0b3JGb3VuZCA9IHRoaXMub3B0aW9uYWxPcGVyYXRvcignLScpO1xuICAgICAgaWYgKG9wZXJhdG9yRm91bmQpIHtcbiAgICAgICAgcmVzdWx0ICs9ICctJztcbiAgICAgIH1cbiAgICB9IHdoaWxlIChvcGVyYXRvckZvdW5kKTtcblxuICAgIHJldHVybiByZXN1bHQudG9TdHJpbmcoKTtcbiAgfVxuXG4gIHBhcnNlVGVtcGxhdGVCaW5kaW5ncygpOiBhbnlbXSB7XG4gICAgdmFyIGJpbmRpbmdzID0gW107XG4gICAgdmFyIHByZWZpeCA9IG51bGw7XG4gICAgd2hpbGUgKHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGgpIHtcbiAgICAgIHZhciBrZXlJc1ZhcjogYm9vbGVhbiA9IHRoaXMub3B0aW9uYWxLZXl3b3JkVmFyKCk7XG4gICAgICB2YXIga2V5ID0gdGhpcy5leHBlY3RUZW1wbGF0ZUJpbmRpbmdLZXkoKTtcbiAgICAgIGlmICgha2V5SXNWYXIpIHtcbiAgICAgICAgaWYgKHByZWZpeCA9PSBudWxsKSB7XG4gICAgICAgICAgcHJlZml4ID0ga2V5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleSA9IHByZWZpeCArIGtleVswXS50b1VwcGVyQ2FzZSgpICsga2V5LnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5vcHRpb25hbENoYXJhY3RlcigkQ09MT04pO1xuICAgICAgdmFyIG5hbWUgPSBudWxsO1xuICAgICAgdmFyIGV4cHJlc3Npb24gPSBudWxsO1xuICAgICAgaWYgKGtleUlzVmFyKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbmFsT3BlcmF0b3IoXCI9XCIpKSB7XG4gICAgICAgICAgbmFtZSA9IHRoaXMuZXhwZWN0VGVtcGxhdGVCaW5kaW5nS2V5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmFtZSA9ICdcXCRpbXBsaWNpdCc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0ICE9PSBFT0YgJiYgIXRoaXMucGVla0tleXdvcmRWYXIoKSkge1xuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmlucHV0SW5kZXg7XG4gICAgICAgIHZhciBhc3QgPSB0aGlzLnBhcnNlUGlwZSgpO1xuICAgICAgICB2YXIgc291cmNlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5wdXRJbmRleCk7XG4gICAgICAgIGV4cHJlc3Npb24gPSBuZXcgQVNUV2l0aFNvdXJjZShhc3QsIHNvdXJjZSwgdGhpcy5sb2NhdGlvbik7XG4gICAgICB9XG4gICAgICBiaW5kaW5ncy5wdXNoKG5ldyBUZW1wbGF0ZUJpbmRpbmcoa2V5LCBrZXlJc1ZhciwgbmFtZSwgZXhwcmVzc2lvbikpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbmFsQ2hhcmFjdGVyKCRTRU1JQ09MT04pKSB7XG4gICAgICAgIHRoaXMub3B0aW9uYWxDaGFyYWN0ZXIoJENPTU1BKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJpbmRpbmdzO1xuICB9XG5cbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBpbmRleDogbnVtYmVyID0gbnVsbCkge1xuICAgIGlmIChpc0JsYW5rKGluZGV4KSkgaW5kZXggPSB0aGlzLmluZGV4O1xuXG4gICAgdmFyIGxvY2F0aW9uID0gKGluZGV4IDwgdGhpcy50b2tlbnMubGVuZ3RoKSA/IGBhdCBjb2x1bW4gJHt0aGlzLnRva2Vuc1tpbmRleF0uaW5kZXggKyAxfSBpbmAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgYXQgdGhlIGVuZCBvZiB0aGUgZXhwcmVzc2lvbmA7XG5cbiAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24obWVzc2FnZSwgdGhpcy5pbnB1dCwgbG9jYXRpb24sIHRoaXMubG9jYXRpb24pO1xuICB9XG59XG5cbmNsYXNzIFNpbXBsZUV4cHJlc3Npb25DaGVja2VyIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHN0YXRpYyBjaGVjayhhc3Q6IEFTVCk6IGJvb2xlYW4ge1xuICAgIHZhciBzID0gbmV3IFNpbXBsZUV4cHJlc3Npb25DaGVja2VyKCk7XG4gICAgYXN0LnZpc2l0KHMpO1xuICAgIHJldHVybiBzLnNpbXBsZTtcbiAgfVxuXG4gIHNpbXBsZSA9IHRydWU7XG5cbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlcikge31cblxuICB2aXNpdEludGVycG9sYXRpb24oYXN0OiBJbnRlcnBvbGF0aW9uKSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKSB7fVxuXG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkKSB7fVxuXG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KSB7IHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTsgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApIHsgdGhpcy52aXNpdEFsbChhc3QudmFsdWVzKTsgfVxuXG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5KSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSkgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpIHsgdGhpcy5zaW1wbGUgPSBmYWxzZTsgfVxuXG4gIHZpc2l0QWxsKGFzdHM6IGFueVtdKTogYW55W10ge1xuICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUoYXN0cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXN0cy5sZW5ndGg7ICsraSkge1xuICAgICAgcmVzW2ldID0gYXN0c1tpXS52aXNpdCh0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbikgeyB0aGlzLnNpbXBsZSA9IGZhbHNlOyB9XG5cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlKSB7IHRoaXMuc2ltcGxlID0gZmFsc2U7IH1cbn1cbiJdfQ==