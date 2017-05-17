(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.buble = global.buble || {})));
}(this, function (exports) { 'use strict';

  var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
  function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }

  var acorn = __commonjs(function (module, exports, global) {
  (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.acorn = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

  "use strict";

  var _tokentype = _dereq_("./tokentype");

  var _state = _dereq_("./state");

  var pp = _state.Parser.prototype;

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  pp.checkPropClash = function (prop, propHash) {
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) return;
    var key = prop.key;var name = undefined;
    switch (key.type) {
      case "Identifier":
        name = key.name;break;
      case "Literal":
        name = String(key.value);break;
      default:
        return;
    }
    var kind = prop.kind;

    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        propHash.proto = true;
      }
      return;
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var isGetSet = kind !== "init";
      if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init)) this.raiseRecoverable(key.start, "Redefinition of property");
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The optional arguments are used to
  // forbid the `in` operator (in for loops initalization expressions)
  // and provide reference for storing '=' operator inside shorthand
  // property assignment in contexts where both object expression
  // and object pattern might appear (so it's possible to raise
  // delayed syntax error at correct position).

  pp.parseExpression = function (noIn, refDestructuringErrors) {
    var startPos = this.start,
        startLoc = this.startLoc;
    var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
    if (this.type === _tokentype.types.comma) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(_tokentype.types.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors));
      return this.finishNode(node, "SequenceExpression");
    }
    return expr;
  };

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  pp.parseMaybeAssign = function (noIn, refDestructuringErrors, afterLeftParse) {
    if (this.inGenerator && this.isContextual("yield")) return this.parseYield();

    var validateDestructuring = false;
    if (!refDestructuringErrors) {
      refDestructuringErrors = { shorthandAssign: 0, trailingComma: 0 };
      validateDestructuring = true;
    }
    var startPos = this.start,
        startLoc = this.startLoc;
    if (this.type == _tokentype.types.parenL || this.type == _tokentype.types.name) this.potentialArrowAt = this.start;
    var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
    if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
    if (this.type.isAssign) {
      if (validateDestructuring) this.checkPatternErrors(refDestructuringErrors, true);
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      node.left = this.type === _tokentype.types.eq ? this.toAssignable(left) : left;
      refDestructuringErrors.shorthandAssign = 0; // reset because shorthand default was used correctly
      this.checkLVal(left);
      this.next();
      node.right = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "AssignmentExpression");
    } else {
      if (validateDestructuring) this.checkExpressionErrors(refDestructuringErrors, true);
    }
    return left;
  };

  // Parse a ternary conditional (`?:`) operator.

  pp.parseMaybeConditional = function (noIn, refDestructuringErrors) {
    var startPos = this.start,
        startLoc = this.startLoc;
    var expr = this.parseExprOps(noIn, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
    if (this.eat(_tokentype.types.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(_tokentype.types.colon);
      node.alternate = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "ConditionalExpression");
    }
    return expr;
  };

  // Start the precedence parser.

  pp.parseExprOps = function (noIn, refDestructuringErrors) {
    var startPos = this.start,
        startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false);
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
    return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
  };

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  pp.parseExprOp = function (left, leftStartPos, leftStartLoc, minPrec, noIn) {
    var prec = this.type.binop;
    if (prec != null && (!noIn || this.type !== _tokentype.types._in)) {
      if (prec > minPrec) {
        var logical = this.type === _tokentype.types.logicalOR || this.type === _tokentype.types.logicalAND;
        var op = this.value;
        this.next();
        var startPos = this.start,
            startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
      }
    }
    return left;
  };

  pp.buildBinary = function (startPos, startLoc, left, right, op, logical) {
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
  };

  // Parse unary operators, both prefix and postfix.

  pp.parseMaybeUnary = function (refDestructuringErrors, sawUnary) {
    var startPos = this.start,
        startLoc = this.startLoc,
        expr = undefined;
    if (this.type.prefix) {
      var node = this.startNode(),
          update = this.type === _tokentype.types.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) this.checkLVal(node.argument);else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") this.raiseRecoverable(node.start, "Deleting local variable in strict mode");else sawUnary = true;
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors);
      if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node = this.startNodeAt(startPos, startLoc);
        node.operator = this.value;
        node.prefix = false;
        node.argument = expr;
        this.checkLVal(expr);
        this.next();
        expr = this.finishNode(node, "UpdateExpression");
      }
    }

    if (!sawUnary && this.eat(_tokentype.types.starstar)) return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false);else return expr;
  };

  // Parse call, dot, and `[]`-subscript expressions.

  pp.parseExprSubscripts = function (refDestructuringErrors) {
    var startPos = this.start,
        startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors);
    var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
    if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) return expr;
    return this.parseSubscripts(expr, startPos, startLoc);
  };

  pp.parseSubscripts = function (base, startPos, startLoc, noCalls) {
    for (;;) {
      if (this.eat(_tokentype.types.dot)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.object = base;
        node.property = this.parseIdent(true);
        node.computed = false;
        base = this.finishNode(node, "MemberExpression");
      } else if (this.eat(_tokentype.types.bracketL)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.object = base;
        node.property = this.parseExpression();
        node.computed = true;
        this.expect(_tokentype.types.bracketR);
        base = this.finishNode(node, "MemberExpression");
      } else if (!noCalls && this.eat(_tokentype.types.parenL)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.callee = base;
        node.arguments = this.parseExprList(_tokentype.types.parenR, false);
        base = this.finishNode(node, "CallExpression");
      } else if (this.type === _tokentype.types.backQuote) {
        var node = this.startNodeAt(startPos, startLoc);
        node.tag = base;
        node.quasi = this.parseTemplate();
        base = this.finishNode(node, "TaggedTemplateExpression");
      } else {
        return base;
      }
    }
  };

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  pp.parseExprAtom = function (refDestructuringErrors) {
    var node = undefined,
        canBeArrow = this.potentialArrowAt == this.start;
    switch (this.type) {
      case _tokentype.types._super:
        if (!this.inFunction) this.raise(this.start, "'super' outside of function or class");

      case _tokentype.types._this:
        var type = this.type === _tokentype.types._this ? "ThisExpression" : "Super";
        node = this.startNode();
        this.next();
        return this.finishNode(node, type);

      case _tokentype.types.name:
        var startPos = this.start,
            startLoc = this.startLoc;
        var id = this.parseIdent(this.type !== _tokentype.types.name);
        if (canBeArrow && !this.canInsertSemicolon() && this.eat(_tokentype.types.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id]);
        return id;

      case _tokentype.types.regexp:
        var value = this.value;
        node = this.parseLiteral(value.value);
        node.regex = { pattern: value.pattern, flags: value.flags };
        return node;

      case _tokentype.types.num:case _tokentype.types.string:
        return this.parseLiteral(this.value);

      case _tokentype.types._null:case _tokentype.types._true:case _tokentype.types._false:
        node = this.startNode();
        node.value = this.type === _tokentype.types._null ? null : this.type === _tokentype.types._true;
        node.raw = this.type.keyword;
        this.next();
        return this.finishNode(node, "Literal");

      case _tokentype.types.parenL:
        return this.parseParenAndDistinguishExpression(canBeArrow);

      case _tokentype.types.bracketL:
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(_tokentype.types.bracketR, true, true, refDestructuringErrors);
        return this.finishNode(node, "ArrayExpression");

      case _tokentype.types.braceL:
        return this.parseObj(false, refDestructuringErrors);

      case _tokentype.types._function:
        node = this.startNode();
        this.next();
        return this.parseFunction(node, false);

      case _tokentype.types._class:
        return this.parseClass(this.startNode(), false);

      case _tokentype.types._new:
        return this.parseNew();

      case _tokentype.types.backQuote:
        return this.parseTemplate();

      default:
        this.unexpected();
    }
  };

  pp.parseLiteral = function (value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    this.next();
    return this.finishNode(node, "Literal");
  };

  pp.parseParenExpression = function () {
    this.expect(_tokentype.types.parenL);
    var val = this.parseExpression();
    this.expect(_tokentype.types.parenR);
    return val;
  };

  pp.parseParenAndDistinguishExpression = function (canBeArrow) {
    var startPos = this.start,
        startLoc = this.startLoc,
        val = undefined;
    if (this.options.ecmaVersion >= 6) {
      this.next();

      var innerStartPos = this.start,
          innerStartLoc = this.startLoc;
      var exprList = [],
          first = true;
      var refDestructuringErrors = { shorthandAssign: 0, trailingComma: 0 },
          spreadStart = undefined,
          innerParenStart = undefined;
      while (this.type !== _tokentype.types.parenR) {
        first ? first = false : this.expect(_tokentype.types.comma);
        if (this.type === _tokentype.types.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRest()));
          break;
        } else {
          if (this.type === _tokentype.types.parenL && !innerParenStart) {
            innerParenStart = this.start;
          }
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.start,
          innerEndLoc = this.startLoc;
      this.expect(_tokentype.types.parenR);

      if (canBeArrow && !this.canInsertSemicolon() && this.eat(_tokentype.types.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, true);
        if (innerParenStart) this.unexpected(innerParenStart);
        return this.parseParenArrowList(startPos, startLoc, exprList);
      }

      if (!exprList.length) this.unexpected(this.lastTokStart);
      if (spreadStart) this.unexpected(spreadStart);
      this.checkExpressionErrors(refDestructuringErrors, true);

      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }

    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression");
    } else {
      return val;
    }
  };

  pp.parseParenItem = function (item) {
    return item;
  };

  pp.parseParenArrowList = function (startPos, startLoc, exprList) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
  };

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  var empty = [];

  pp.parseNew = function () {
    var node = this.startNode();
    var meta = this.parseIdent(true);
    if (this.options.ecmaVersion >= 6 && this.eat(_tokentype.types.dot)) {
      node.meta = meta;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target") this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target");
      if (!this.inFunction) this.raiseRecoverable(node.start, "new.target can only be used in functions");
      return this.finishNode(node, "MetaProperty");
    }
    var startPos = this.start,
        startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
    if (this.eat(_tokentype.types.parenL)) node.arguments = this.parseExprList(_tokentype.types.parenR, false);else node.arguments = empty;
    return this.finishNode(node, "NewExpression");
  };

  // Parse template expression.

  pp.parseTemplateElement = function () {
    var elem = this.startNode();
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
      cooked: this.value
    };
    this.next();
    elem.tail = this.type === _tokentype.types.backQuote;
    return this.finishNode(elem, "TemplateElement");
  };

  pp.parseTemplate = function () {
    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement();
    node.quasis = [curElt];
    while (!curElt.tail) {
      this.expect(_tokentype.types.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(_tokentype.types.braceR);
      node.quasis.push(curElt = this.parseTemplateElement());
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral");
  };

  // Parse an object literal or binding pattern.

  pp.parseObj = function (isPattern, refDestructuringErrors) {
    var node = this.startNode(),
        first = true,
        propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(_tokentype.types.braceR)) {
      if (!first) {
        this.expect(_tokentype.types.comma);
        if (this.afterTrailingComma(_tokentype.types.braceR)) break;
      } else first = false;

      var prop = this.startNode(),
          isGenerator = undefined,
          startPos = undefined,
          startLoc = undefined;
      if (this.options.ecmaVersion >= 6) {
        prop.method = false;
        prop.shorthand = false;
        if (isPattern || refDestructuringErrors) {
          startPos = this.start;
          startLoc = this.startLoc;
        }
        if (!isPattern) isGenerator = this.eat(_tokentype.types.star);
      }
      this.parsePropertyName(prop);
      this.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors);
      this.checkPropClash(prop, propHash);
      node.properties.push(this.finishNode(prop, "Property"));
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
  };

  pp.parsePropertyValue = function (prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
    if (this.eat(_tokentype.types.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === _tokentype.types.parenL) {
      if (isPattern) this.unexpected();
      prop.kind = "init";
      prop.method = true;
      prop.value = this.parseMethod(isGenerator);
    } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && this.type != _tokentype.types.comma && this.type != _tokentype.types.braceR) {
      if (isGenerator || isPattern) this.unexpected();
      prop.kind = prop.key.name;
      this.parsePropertyName(prop);
      prop.value = this.parseMethod(false);
      var paramCount = prop.kind === "get" ? 0 : 1;
      if (prop.value.params.length !== paramCount) {
        var start = prop.value.start;
        if (prop.kind === "get") this.raiseRecoverable(start, "getter should have no params");else this.raiseRecoverable(start, "setter should have exactly one param");
      }
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement") this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      prop.kind = "init";
      if (isPattern) {
        if (this.keywords.test(prop.key.name) || (this.strict ? this.reservedWordsStrictBind : this.reservedWords).test(prop.key.name) || this.inGenerator && prop.key.name == "yield") this.raiseRecoverable(prop.key.start, "Binding " + prop.key.name);
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
      } else if (this.type === _tokentype.types.eq && refDestructuringErrors) {
        if (!refDestructuringErrors.shorthandAssign) refDestructuringErrors.shorthandAssign = this.start;
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
      } else {
        prop.value = prop.key;
      }
      prop.shorthand = true;
    } else this.unexpected();
  };

  pp.parsePropertyName = function (prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(_tokentype.types.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(_tokentype.types.bracketR);
        return prop.key;
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === _tokentype.types.num || this.type === _tokentype.types.string ? this.parseExprAtom() : this.parseIdent(true);
  };

  // Initialize empty function node.

  pp.initFunction = function (node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) {
      node.generator = false;
      node.expression = false;
    }
  };

  // Parse object or class method.

  pp.parseMethod = function (isGenerator) {
    var node = this.startNode(),
        oldInGen = this.inGenerator;
    this.inGenerator = isGenerator;
    this.initFunction(node);
    this.expect(_tokentype.types.parenL);
    node.params = this.parseBindingList(_tokentype.types.parenR, false, false);
    if (this.options.ecmaVersion >= 6) node.generator = isGenerator;
    this.parseFunctionBody(node, false);
    this.inGenerator = oldInGen;
    return this.finishNode(node, "FunctionExpression");
  };

  // Parse arrow function expression with given parameters.

  pp.parseArrowExpression = function (node, params) {
    var oldInGen = this.inGenerator;
    this.inGenerator = false;
    this.initFunction(node);
    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true);
    this.inGenerator = oldInGen;
    return this.finishNode(node, "ArrowFunctionExpression");
  };

  // Parse function body and check parameters.

  pp.parseFunctionBody = function (node, isArrowFunction) {
    var isExpression = isArrowFunction && this.type !== _tokentype.types.braceL;

    if (isExpression) {
      node.body = this.parseMaybeAssign();
      node.expression = true;
    } else {
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldInFunc = this.inFunction,
          oldLabels = this.labels;
      this.inFunction = true;this.labels = [];
      node.body = this.parseBlock(true);
      node.expression = false;
      this.inFunction = oldInFunc;this.labels = oldLabels;
    }

    // If this is a strict mode function, verify that argument names
    // are not repeated, and it does not try to bind the words `eval`
    // or `arguments`.
    if (this.strict || !isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) {
      var oldStrict = this.strict;
      this.strict = true;
      if (node.id) this.checkLVal(node.id, true);
      this.checkParams(node);
      this.strict = oldStrict;
    } else if (isArrowFunction) {
      this.checkParams(node);
    }
  };

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp.checkParams = function (node) {
    var nameHash = {};
    for (var i = 0; i < node.params.length; i++) {
      this.checkLVal(node.params[i], true, nameHash);
    }
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp.parseExprList = function (close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [],
        first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(_tokentype.types.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) break;
      } else first = false;

      var elt = undefined;
      if (allowEmpty && this.type === _tokentype.types.comma) elt = null;else if (this.type === _tokentype.types.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (this.type === _tokentype.types.comma && refDestructuringErrors && !refDestructuringErrors.trailingComma) {
          refDestructuringErrors.trailingComma = this.lastTokStart;
        }
      } else elt = this.parseMaybeAssign(false, refDestructuringErrors);
      elts.push(elt);
    }
    return elts;
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp.parseIdent = function (liberal) {
    var node = this.startNode();
    if (liberal && this.options.allowReserved == "never") liberal = false;
    if (this.type === _tokentype.types.name) {
      if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) && (this.options.ecmaVersion >= 6 || this.input.slice(this.start, this.end).indexOf("\\") == -1)) this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved");
      if (!liberal && this.inGenerator && this.value === "yield") this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator");
      node.name = this.value;
    } else if (liberal && this.type.keyword) {
      node.name = this.type.keyword;
    } else {
      this.unexpected();
    }
    this.next();
    return this.finishNode(node, "Identifier");
  };

  // Parses yield expression inside generator.

  pp.parseYield = function () {
    var node = this.startNode();
    this.next();
    if (this.type == _tokentype.types.semi || this.canInsertSemicolon() || this.type != _tokentype.types.star && !this.type.startsExpr) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(_tokentype.types.star);
      node.argument = this.parseMaybeAssign();
    }
    return this.finishNode(node, "YieldExpression");
  };

  },{"./state":10,"./tokentype":14}],2:[function(_dereq_,module,exports){
  // Reserved word lists for various dialects of the language

  "use strict";

  exports.__esModule = true;
  exports.isIdentifierStart = isIdentifierStart;
  exports.isIdentifierChar = isIdentifierChar;
  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    7: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  exports.reservedWords = reservedWords;
  // And the keywords

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var keywords = {
    5: ecma5AndLessKeywords,
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  exports.keywords = keywords;
  // ## Character categories

  // Big ugly regular expressions that match characters in the
  // whitespace, identifier, and identifier-start categories. These
  // are only applied when a character is found to actually have a
  // code point above 128.
  // Generated by `bin/generate-identifier-regex.js`.

  var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
  var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣣ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿";

  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

  // These are a run-length and offset encoded representation of the
  // >0xffff code points that are a valid part of identifiers. The
  // offset starts at 0x10000, and each pair of numbers represents an
  // offset to the next range, and then a size of the range. They were
  // generated by bin/generate-identifier-regex.js
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 287, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 1288, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 3, 5761, 10591, 541];
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 168, 11, 6, 9, 7, 3, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 3617, 6, 792618, 239];

  // This has a complexity linear to the value of the code. The
  // assumption is that looking up astral identifier characters is
  // rare.
  function isInAstralSet(code, set) {
    var pos = 0x10000;
    for (var i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) return false;
      pos += set[i + 1];
      if (pos >= code) return true;
    }
  }

  // Test whether a given character code starts an identifier.

  function isIdentifierStart(code, astral) {
    if (code < 65) return code === 36;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
    if (astral === false) return false;
    return isInAstralSet(code, astralIdentifierStartCodes);
  }

  // Test whether a given character is part of an identifier.

  function isIdentifierChar(code, astral) {
    if (code < 48) return code === 36;
    if (code < 58) return true;
    if (code < 65) return false;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123) return true;
    if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
    if (astral === false) return false;
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
  }

  },{}],3:[function(_dereq_,module,exports){
  // Acorn is a tiny, fast JavaScript parser written in JavaScript.
  //
  // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
  // various contributors and released under an MIT license.
  //
  // Git repositories for Acorn are available at
  //
  //     http://marijnhaverbeke.nl/git/acorn
  //     https://github.com/ternjs/acorn.git
  //
  // Please use the [github bug tracker][ghbt] to report issues.
  //
  // [ghbt]: https://github.com/ternjs/acorn/issues
  //
  // This file defines the main parser interface. The library also comes
  // with a [error-tolerant parser][dammit] and an
  // [abstract syntax tree walker][walk], defined in other files.
  //
  // [dammit]: acorn_loose.js
  // [walk]: util/walk.js

  "use strict";

  exports.__esModule = true;
  exports.parse = parse;
  exports.parseExpressionAt = parseExpressionAt;
  exports.tokenizer = tokenizer;

  var _state = _dereq_("./state");

  _dereq_("./parseutil");

  _dereq_("./statement");

  _dereq_("./lval");

  _dereq_("./expression");

  _dereq_("./location");

  exports.Parser = _state.Parser;
  exports.plugins = _state.plugins;

  var _options = _dereq_("./options");

  exports.defaultOptions = _options.defaultOptions;

  var _locutil = _dereq_("./locutil");

  exports.Position = _locutil.Position;
  exports.SourceLocation = _locutil.SourceLocation;
  exports.getLineInfo = _locutil.getLineInfo;

  var _node = _dereq_("./node");

  exports.Node = _node.Node;

  var _tokentype = _dereq_("./tokentype");

  exports.TokenType = _tokentype.TokenType;
  exports.tokTypes = _tokentype.types;

  var _tokencontext = _dereq_("./tokencontext");

  exports.TokContext = _tokencontext.TokContext;
  exports.tokContexts = _tokencontext.types;

  var _identifier = _dereq_("./identifier");

  exports.isIdentifierChar = _identifier.isIdentifierChar;
  exports.isIdentifierStart = _identifier.isIdentifierStart;

  var _tokenize = _dereq_("./tokenize");

  exports.Token = _tokenize.Token;

  var _whitespace = _dereq_("./whitespace");

  exports.isNewLine = _whitespace.isNewLine;
  exports.lineBreak = _whitespace.lineBreak;
  exports.lineBreakG = _whitespace.lineBreakG;
  var version = "3.1.0";

  exports.version = version;
  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api].
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  function parse(input, options) {
    return new _state.Parser(options, input).parse();
  }

  // This function tries to parse a single expression at a given
  // offset in a string. Useful for parsing mixed-language formats
  // that embed JavaScript expressions.

  function parseExpressionAt(input, pos, options) {
    var p = new _state.Parser(options, input, pos);
    p.nextToken();
    return p.parseExpression();
  }

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenizer` export provides an interface to the tokenizer.

  function tokenizer(input, options) {
    return new _state.Parser(options, input);
  }

  },{"./expression":1,"./identifier":2,"./location":4,"./locutil":5,"./lval":6,"./node":7,"./options":8,"./parseutil":9,"./state":10,"./statement":11,"./tokencontext":12,"./tokenize":13,"./tokentype":14,"./whitespace":16}],4:[function(_dereq_,module,exports){
  "use strict";

  var _state = _dereq_("./state");

  var _locutil = _dereq_("./locutil");

  var pp = _state.Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp.raise = function (pos, message) {
    var loc = _locutil.getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos;err.loc = loc;err.raisedAt = this.pos;
    throw err;
  };

  pp.raiseRecoverable = pp.raise;

  pp.curPosition = function () {
    if (this.options.locations) {
      return new _locutil.Position(this.curLine, this.pos - this.lineStart);
    }
  };

  },{"./locutil":5,"./state":10}],5:[function(_dereq_,module,exports){
  "use strict";

  exports.__esModule = true;
  exports.getLineInfo = getLineInfo;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _whitespace = _dereq_("./whitespace");

  // These are used when `options.locations` is on, for the
  // `startLoc` and `endLoc` properties.

  var Position = (function () {
    function Position(line, col) {
      _classCallCheck(this, Position);

      this.line = line;
      this.column = col;
    }

    Position.prototype.offset = function offset(n) {
      return new Position(this.line, this.column + n);
    };

    return Position;
  })();

  exports.Position = Position;

  var SourceLocation = function SourceLocation(p, start, end) {
    _classCallCheck(this, SourceLocation);

    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) this.source = p.sourceFile;
  }

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  ;

  exports.SourceLocation = SourceLocation;

  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;;) {
      _whitespace.lineBreakG.lastIndex = cur;
      var match = _whitespace.lineBreakG.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else {
        return new Position(line, offset - cur);
      }
    }
  }

  },{"./whitespace":16}],6:[function(_dereq_,module,exports){
  "use strict";

  var _tokentype = _dereq_("./tokentype");

  var _state = _dereq_("./state");

  var _util = _dereq_("./util");

  var pp = _state.Parser.prototype;

  // Convert existing expression atom to assignable pattern
  // if possible.

  pp.toAssignable = function (node, isBinding) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
        case "Identifier":
        case "ObjectPattern":
        case "ArrayPattern":
          break;

        case "ObjectExpression":
          node.type = "ObjectPattern";
          for (var i = 0; i < node.properties.length; i++) {
            var prop = node.properties[i];
            if (prop.kind !== "init") this.raise(prop.key.start, "Object pattern can't contain getter or setter");
            this.toAssignable(prop.value, isBinding);
          }
          break;

        case "ArrayExpression":
          node.type = "ArrayPattern";
          this.toAssignableList(node.elements, isBinding);
          break;

        case "AssignmentExpression":
          if (node.operator === "=") {
            node.type = "AssignmentPattern";
            delete node.operator;
            // falls through to AssignmentPattern
          } else {
              this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
              break;
            }

        case "AssignmentPattern":
          if (node.right.type === "YieldExpression") this.raise(node.right.start, "Yield expression cannot be a default value");
          break;

        case "ParenthesizedExpression":
          node.expression = this.toAssignable(node.expression, isBinding);
          break;

        case "MemberExpression":
          if (!isBinding) break;

        default:
          this.raise(node.start, "Assigning to rvalue");
      }
    }
    return node;
  };

  // Convert list of expression atoms to binding list.

  pp.toAssignableList = function (exprList, isBinding) {
    var end = exprList.length;
    if (end) {
      var last = exprList[end - 1];
      if (last && last.type == "RestElement") {
        --end;
      } else if (last && last.type == "SpreadElement") {
        last.type = "RestElement";
        var arg = last.argument;
        this.toAssignable(arg, isBinding);
        if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern") this.unexpected(arg.start);
        --end;
      }

      if (isBinding && last.type === "RestElement" && last.argument.type !== "Identifier") this.unexpected(last.argument.start);
    }
    for (var i = 0; i < end; i++) {
      var elt = exprList[i];
      if (elt) this.toAssignable(elt, isBinding);
    }
    return exprList;
  };

  // Parses spread element.

  pp.parseSpread = function (refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(refDestructuringErrors);
    return this.finishNode(node, "SpreadElement");
  };

  pp.parseRest = function (allowNonIdent) {
    var node = this.startNode();
    this.next();

    // RestElement inside of a function parameter must be an identifier
    if (allowNonIdent) node.argument = this.type === _tokentype.types.name ? this.parseIdent() : this.unexpected();else node.argument = this.type === _tokentype.types.name || this.type === _tokentype.types.bracketL ? this.parseBindingAtom() : this.unexpected();

    return this.finishNode(node, "RestElement");
  };

  // Parses lvalue (assignable) atom.

  pp.parseBindingAtom = function () {
    if (this.options.ecmaVersion < 6) return this.parseIdent();
    switch (this.type) {
      case _tokentype.types.name:
        return this.parseIdent();

      case _tokentype.types.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(_tokentype.types.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern");

      case _tokentype.types.braceL:
        return this.parseObj(true);

      default:
        this.unexpected();
    }
  };

  pp.parseBindingList = function (close, allowEmpty, allowTrailingComma, allowNonIdent) {
    var elts = [],
        first = true;
    while (!this.eat(close)) {
      if (first) first = false;else this.expect(_tokentype.types.comma);
      if (allowEmpty && this.type === _tokentype.types.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      } else if (this.type === _tokentype.types.ellipsis) {
        var rest = this.parseRest(allowNonIdent);
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === _tokentype.types.comma) this.raise(this.start, "Comma is not permitted after the rest element");
        this.expect(close);
        break;
      } else {
        var elem = this.parseMaybeDefault(this.start, this.startLoc);
        this.parseBindingListItem(elem);
        elts.push(elem);
      }
    }
    return elts;
  };

  pp.parseBindingListItem = function (param) {
    return param;
  };

  // Parses assignment pattern around given atom if possible.

  pp.parseMaybeDefault = function (startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(_tokentype.types.eq)) return left;
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern");
  };

  // Verify that a node is an lval — something that can be assigned
  // to.

  pp.checkLVal = function (expr, isBinding, checkClashes) {
    switch (expr.type) {
      case "Identifier":
        if (this.strict && this.reservedWordsStrictBind.test(expr.name)) this.raiseRecoverable(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
        if (checkClashes) {
          if (_util.has(checkClashes, expr.name)) this.raiseRecoverable(expr.start, "Argument name clash");
          checkClashes[expr.name] = true;
        }
        break;

      case "MemberExpression":
        if (isBinding) this.raiseRecoverable(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
        break;

      case "ObjectPattern":
        for (var i = 0; i < expr.properties.length; i++) {
          this.checkLVal(expr.properties[i].value, isBinding, checkClashes);
        }break;

      case "ArrayPattern":
        for (var i = 0; i < expr.elements.length; i++) {
          var elem = expr.elements[i];
          if (elem) this.checkLVal(elem, isBinding, checkClashes);
        }
        break;

      case "AssignmentPattern":
        this.checkLVal(expr.left, isBinding, checkClashes);
        break;

      case "RestElement":
        this.checkLVal(expr.argument, isBinding, checkClashes);
        break;

      case "ParenthesizedExpression":
        this.checkLVal(expr.expression, isBinding, checkClashes);
        break;

      default:
        this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
    }
  };

  },{"./state":10,"./tokentype":14,"./util":15}],7:[function(_dereq_,module,exports){
  "use strict";

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _state = _dereq_("./state");

  var _locutil = _dereq_("./locutil");

  var Node = function Node(parser, pos, loc) {
    _classCallCheck(this, Node);

    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations) this.loc = new _locutil.SourceLocation(parser, loc);
    if (parser.options.directSourceFile) this.sourceFile = parser.options.directSourceFile;
    if (parser.options.ranges) this.range = [pos, 0];
  }

  // Start an AST node, attaching a start offset.

  ;

  exports.Node = Node;
  var pp = _state.Parser.prototype;

  pp.startNode = function () {
    return new Node(this, this.start, this.startLoc);
  };

  pp.startNodeAt = function (pos, loc) {
    return new Node(this, pos, loc);
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations) node.loc.end = loc;
    if (this.options.ranges) node.range[1] = pos;
    return node;
  }

  pp.finishNode = function (node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
  };

  // Finish node at given position

  pp.finishNodeAt = function (node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc);
  };

  },{"./locutil":5,"./state":10}],8:[function(_dereq_,module,exports){
  "use strict";

  exports.__esModule = true;
  exports.getOptions = getOptions;

  var _util = _dereq_("./util");

  var _locutil = _dereq_("./locutil");

  // A second optional argument can be given to further configure
  // the parser process. These options are recognized:

  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must
    // be either 3, or 5, or 6. This influences support for strict
    // mode, the set of reserved words, support for getters and
    // setters and other features. The default is 6.
    ecmaVersion: 6,
    // Source type ("script" or "module") for different semantics
    sourceType: "script",
    // `onInsertedSemicolon` can be a callback that will be called
    // when a semicolon is automatically inserted. It will be passed
    // th position of the comma as an offset, and if `locations` is
    // enabled, it is given the location as a `{line, column}` object
    // as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program.
    allowImportExportEverywhere: false,
    // When enabled, hashbang directive in the beginning of file
    // is allowed and treated as a line comment.
    allowHashBang: false,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false,
    plugins: {}
  };

  exports.defaultOptions = defaultOptions;
  // Interpret and default an options object

  function getOptions(opts) {
    var options = {};
    for (var opt in defaultOptions) {
      options[opt] = opts && _util.has(opts, opt) ? opts[opt] : defaultOptions[opt];
    }if (options.allowReserved == null) options.allowReserved = options.ecmaVersion < 5;

    if (_util.isArray(options.onToken)) {
      (function () {
        var tokens = options.onToken;
        options.onToken = function (token) {
          return tokens.push(token);
        };
      })();
    }
    if (_util.isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);

    return options;
  }

  function pushComment(options, array) {
    return function (block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? 'Block' : 'Line',
        value: text,
        start: start,
        end: end
      };
      if (options.locations) comment.loc = new _locutil.SourceLocation(this, startLoc, endLoc);
      if (options.ranges) comment.range = [start, end];
      array.push(comment);
    };
  }

  },{"./locutil":5,"./util":15}],9:[function(_dereq_,module,exports){
  "use strict";

  var _tokentype = _dereq_("./tokentype");

  var _state = _dereq_("./state");

  var _whitespace = _dereq_("./whitespace");

  var pp = _state.Parser.prototype;

  // ## Parser utilities

  // Test whether a statement node is the string literal `"use strict"`.

  pp.isUseStrict = function (stmt) {
    return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.raw.slice(1, -1) === "use strict";
  };

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  pp.eat = function (type) {
    if (this.type === type) {
      this.next();
      return true;
    } else {
      return false;
    }
  };

  // Tests whether parsed token is a contextual keyword.

  pp.isContextual = function (name) {
    return this.type === _tokentype.types.name && this.value === name;
  };

  // Consumes contextual keyword if possible.

  pp.eatContextual = function (name) {
    return this.value === name && this.eat(_tokentype.types.name);
  };

  // Asserts that following token is given contextual keyword.

  pp.expectContextual = function (name) {
    if (!this.eatContextual(name)) this.unexpected();
  };

  // Test whether a semicolon can be inserted at the current position.

  pp.canInsertSemicolon = function () {
    return this.type === _tokentype.types.eof || this.type === _tokentype.types.braceR || _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  };

  pp.insertSemicolon = function () {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
      return true;
    }
  };

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  pp.semicolon = function () {
    if (!this.eat(_tokentype.types.semi) && !this.insertSemicolon()) this.unexpected();
  };

  pp.afterTrailingComma = function (tokType) {
    if (this.type == tokType) {
      if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
      this.next();
      return true;
    }
  };

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  pp.expect = function (type) {
    this.eat(type) || this.unexpected();
  };

  // Raise an unexpected token error.

  pp.unexpected = function (pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };

  pp.checkPatternErrors = function (refDestructuringErrors, andThrow) {
    var pos = refDestructuringErrors && refDestructuringErrors.trailingComma;
    if (!andThrow) return !!pos;
    if (pos) this.raise(pos, "Comma is not permitted after the rest element");
  };

  pp.checkExpressionErrors = function (refDestructuringErrors, andThrow) {
    var pos = refDestructuringErrors && refDestructuringErrors.shorthandAssign;
    if (!andThrow) return !!pos;
    if (pos) this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns");
  };

  },{"./state":10,"./tokentype":14,"./whitespace":16}],10:[function(_dereq_,module,exports){
  "use strict";

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _identifier = _dereq_("./identifier");

  var _tokentype = _dereq_("./tokentype");

  var _whitespace = _dereq_("./whitespace");

  var _options = _dereq_("./options");

  // Registered plugins
  var plugins = {};

  exports.plugins = plugins;
  function keywordRegexp(words) {
    return new RegExp("^(" + words.replace(/ /g, "|") + ")$");
  }

  var Parser = (function () {
    function Parser(options, input, startPos) {
      _classCallCheck(this, Parser);

      this.options = options = _options.getOptions(options);
      this.sourceFile = options.sourceFile;
      this.keywords = keywordRegexp(_identifier.keywords[options.ecmaVersion >= 6 ? 6 : 5]);
      var reserved = options.allowReserved ? "" : _identifier.reservedWords[options.ecmaVersion] + (options.sourceType == "module" ? " await" : "");
      this.reservedWords = keywordRegexp(reserved);
      var reservedStrict = (reserved ? reserved + " " : "") + _identifier.reservedWords.strict;
      this.reservedWordsStrict = keywordRegexp(reservedStrict);
      this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + _identifier.reservedWords.strictBind);
      this.input = String(input);

      // Used to signal to callers of `readWord1` whether the word
      // contained any escape sequences. This is needed because words with
      // escape sequences must not be interpreted as keywords.
      this.containsEsc = false;

      // Load plugins
      this.loadPlugins(options.plugins);

      // Set up token state

      // The current position of the tokenizer in the input.
      if (startPos) {
        this.pos = startPos;
        this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos));
        this.curLine = this.input.slice(0, this.lineStart).split(_whitespace.lineBreak).length;
      } else {
        this.pos = this.lineStart = 0;
        this.curLine = 1;
      }

      // Properties of the current token:
      // Its type
      this.type = _tokentype.types.eof;
      // For tokens that include more information than their type, the value
      this.value = null;
      // Its start and end offset
      this.start = this.end = this.pos;
      // And, if locations are used, the {line, column} object
      // corresponding to those offsets
      this.startLoc = this.endLoc = this.curPosition();

      // Position information for the previous token
      this.lastTokEndLoc = this.lastTokStartLoc = null;
      this.lastTokStart = this.lastTokEnd = this.pos;

      // The context stack is used to superficially track syntactic
      // context to predict whether a regular expression is allowed in a
      // given position.
      this.context = this.initialContext();
      this.exprAllowed = true;

      // Figure out if it's a module code.
      this.strict = this.inModule = options.sourceType === "module";

      // Used to signify the start of a potential arrow function
      this.potentialArrowAt = -1;

      // Flags to track whether we are in a function, a generator.
      this.inFunction = this.inGenerator = false;
      // Labels in scope.
      this.labels = [];

      // If enabled, skip leading hashbang line.
      if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!') this.skipLineComment(2);
    }

    // DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them

    Parser.prototype.isKeyword = function isKeyword(word) {
      return this.keywords.test(word);
    };

    Parser.prototype.isReservedWord = function isReservedWord(word) {
      return this.reservedWords.test(word);
    };

    Parser.prototype.extend = function extend(name, f) {
      this[name] = f(this[name]);
    };

    Parser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
      for (var _name in pluginConfigs) {
        var plugin = plugins[_name];
        if (!plugin) throw new Error("Plugin '" + _name + "' not found");
        plugin(this, pluginConfigs[_name]);
      }
    };

    Parser.prototype.parse = function parse() {
      var node = this.options.program || this.startNode();
      this.nextToken();
      return this.parseTopLevel(node);
    };

    return Parser;
  })();

  exports.Parser = Parser;

  },{"./identifier":2,"./options":8,"./tokentype":14,"./whitespace":16}],11:[function(_dereq_,module,exports){
  "use strict";

  var _tokentype = _dereq_("./tokentype");

  var _state = _dereq_("./state");

  var _whitespace = _dereq_("./whitespace");

  var _identifier = _dereq_("./identifier");

  var pp = _state.Parser.prototype;

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  pp.parseTopLevel = function (node) {
    var first = true;
    if (!node.body) node.body = [];
    while (this.type !== _tokentype.types.eof) {
      var stmt = this.parseStatement(true, true);
      node.body.push(stmt);
      if (first) {
        if (this.isUseStrict(stmt)) this.setStrict(true);
        first = false;
      }
    }
    this.next();
    if (this.options.ecmaVersion >= 6) {
      node.sourceType = this.options.sourceType;
    }
    return this.finishNode(node, "Program");
  };

  var loopLabel = { kind: "loop" },
      switchLabel = { kind: "switch" };

  pp.isLet = function () {
    if (this.type !== _tokentype.types.name || this.options.ecmaVersion < 6 || this.value != "let") return false;
    _whitespace.skipWhiteSpace.lastIndex = this.pos;
    var skip = _whitespace.skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length,
        nextCh = this.input.charCodeAt(next);
    if (nextCh === 91 || nextCh == 123) return true; // '{' and '['
    if (_identifier.isIdentifierStart(nextCh, true)) {
      for (var pos = next + 1; _identifier.isIdentifierChar(this.input.charCodeAt(pos, true)); ++pos) {}
      var ident = this.input.slice(next, pos);
      if (!this.isKeyword(ident)) return true;
    }
    return false;
  };

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  // does not help.

  pp.parseStatement = function (declaration, topLevel) {
    var starttype = this.type,
        node = this.startNode(),
        kind = undefined;

    if (this.isLet()) {
      starttype = _tokentype.types._var;
      kind = "let";
    }

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
      case _tokentype.types._break:case _tokentype.types._continue:
        return this.parseBreakContinueStatement(node, starttype.keyword);
      case _tokentype.types._debugger:
        return this.parseDebuggerStatement(node);
      case _tokentype.types._do:
        return this.parseDoStatement(node);
      case _tokentype.types._for:
        return this.parseForStatement(node);
      case _tokentype.types._function:
        if (!declaration && this.options.ecmaVersion >= 6) this.unexpected();
        return this.parseFunctionStatement(node);
      case _tokentype.types._class:
        if (!declaration) this.unexpected();
        return this.parseClass(node, true);
      case _tokentype.types._if:
        return this.parseIfStatement(node);
      case _tokentype.types._return:
        return this.parseReturnStatement(node);
      case _tokentype.types._switch:
        return this.parseSwitchStatement(node);
      case _tokentype.types._throw:
        return this.parseThrowStatement(node);
      case _tokentype.types._try:
        return this.parseTryStatement(node);
      case _tokentype.types._const:case _tokentype.types._var:
        kind = kind || this.value;
        if (!declaration && kind != "var") this.unexpected();
        return this.parseVarStatement(node, kind);
      case _tokentype.types._while:
        return this.parseWhileStatement(node);
      case _tokentype.types._with:
        return this.parseWithStatement(node);
      case _tokentype.types.braceL:
        return this.parseBlock();
      case _tokentype.types.semi:
        return this.parseEmptyStatement(node);
      case _tokentype.types._export:
      case _tokentype.types._import:
        if (!this.options.allowImportExportEverywhere) {
          if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
          if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
        }
        return starttype === _tokentype.types._import ? this.parseImport(node) : this.parseExport(node);

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
      default:
        var maybeName = this.value,
            expr = this.parseExpression();
        if (starttype === _tokentype.types.name && expr.type === "Identifier" && this.eat(_tokentype.types.colon)) return this.parseLabeledStatement(node, maybeName, expr);else return this.parseExpressionStatement(node, expr);
    }
  };

  pp.parseBreakContinueStatement = function (node, keyword) {
    var isBreak = keyword == "break";
    this.next();
    if (this.eat(_tokentype.types.semi) || this.insertSemicolon()) node.label = null;else if (this.type !== _tokentype.types.name) this.unexpected();else {
      node.label = this.parseIdent();
      this.semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    for (var i = 0; i < this.labels.length; ++i) {
      var lab = this.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
        if (node.label && isBreak) break;
      }
    }
    if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
  };

  pp.parseDebuggerStatement = function (node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement");
  };

  pp.parseDoStatement = function (node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement(false);
    this.labels.pop();
    this.expect(_tokentype.types._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6) this.eat(_tokentype.types.semi);else this.semicolon();
    return this.finishNode(node, "DoWhileStatement");
  };

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  pp.parseForStatement = function (node) {
    this.next();
    this.labels.push(loopLabel);
    this.expect(_tokentype.types.parenL);
    if (this.type === _tokentype.types.semi) return this.parseFor(node, null);
    var isLet = this.isLet();
    if (this.type === _tokentype.types._var || this.type === _tokentype.types._const || isLet) {
      var _init = this.startNode(),
          kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(_init, true, kind);
      this.finishNode(_init, "VariableDeclaration");
      if ((this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1 && !(kind !== "var" && _init.declarations[0].init)) return this.parseForIn(node, _init);
      return this.parseFor(node, _init);
    }
    var refDestructuringErrors = { shorthandAssign: 0, trailingComma: 0 };
    var init = this.parseExpression(true, refDestructuringErrors);
    if (this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
      this.checkPatternErrors(refDestructuringErrors, true);
      this.toAssignable(init);
      this.checkLVal(init);
      return this.parseForIn(node, init);
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    return this.parseFor(node, init);
  };

  pp.parseFunctionStatement = function (node) {
    this.next();
    return this.parseFunction(node, true);
  };

  pp.parseIfStatement = function (node) {
    this.next();
    node.test = this.parseParenExpression();
    node.consequent = this.parseStatement(false);
    node.alternate = this.eat(_tokentype.types._else) ? this.parseStatement(false) : null;
    return this.finishNode(node, "IfStatement");
  };

  pp.parseReturnStatement = function (node) {
    if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
    this.next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (this.eat(_tokentype.types.semi) || this.insertSemicolon()) node.argument = null;else {
      node.argument = this.parseExpression();this.semicolon();
    }
    return this.finishNode(node, "ReturnStatement");
  };

  pp.parseSwitchStatement = function (node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(_tokentype.types.braceL);
    this.labels.push(switchLabel);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    for (var cur, sawDefault = false; this.type != _tokentype.types.braceR;) {
      if (this.type === _tokentype.types._case || this.type === _tokentype.types._default) {
        var isCase = this.type === _tokentype.types._case;
        if (cur) this.finishNode(cur, "SwitchCase");
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
          sawDefault = true;
          cur.test = null;
        }
        this.expect(_tokentype.types.colon);
      } else {
        if (!cur) this.unexpected();
        cur.consequent.push(this.parseStatement(true));
      }
    }
    if (cur) this.finishNode(cur, "SwitchCase");
    this.next(); // Closing brace
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement");
  };

  pp.parseThrowStatement = function (node) {
    this.next();
    if (_whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement");
  };

  // Reused empty array added for node fields that are always empty.

  var empty = [];

  pp.parseTryStatement = function (node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === _tokentype.types._catch) {
      var clause = this.startNode();
      this.next();
      this.expect(_tokentype.types.parenL);
      clause.param = this.parseBindingAtom();
      this.checkLVal(clause.param, true);
      this.expect(_tokentype.types.parenR);
      clause.body = this.parseBlock();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(_tokentype.types._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
    return this.finishNode(node, "TryStatement");
  };

  pp.parseVarStatement = function (node, kind) {
    this.next();
    this.parseVar(node, false, kind);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration");
  };

  pp.parseWhileStatement = function (node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement(false);
    this.labels.pop();
    return this.finishNode(node, "WhileStatement");
  };

  pp.parseWithStatement = function (node) {
    if (this.strict) this.raise(this.start, "'with' in strict mode");
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement(false);
    return this.finishNode(node, "WithStatement");
  };

  pp.parseEmptyStatement = function (node) {
    this.next();
    return this.finishNode(node, "EmptyStatement");
  };

  pp.parseLabeledStatement = function (node, maybeName, expr) {
    for (var i = 0; i < this.labels.length; ++i) {
      if (this.labels[i].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    }var kind = this.type.isLoop ? "loop" : this.type === _tokentype.types._switch ? "switch" : null;
    for (var i = this.labels.length - 1; i >= 0; i--) {
      var label = this.labels[i];
      if (label.statementStart == node.start) {
        label.statementStart = this.start;
        label.kind = kind;
      } else break;
    }
    this.labels.push({ name: maybeName, kind: kind, statementStart: this.start });
    node.body = this.parseStatement(true);
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement");
  };

  pp.parseExpressionStatement = function (node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement");
  };

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  pp.parseBlock = function (allowStrict) {
    var node = this.startNode(),
        first = true,
        oldStrict = undefined;
    node.body = [];
    this.expect(_tokentype.types.braceL);
    while (!this.eat(_tokentype.types.braceR)) {
      var stmt = this.parseStatement(true);
      node.body.push(stmt);
      if (first && allowStrict && this.isUseStrict(stmt)) {
        oldStrict = this.strict;
        this.setStrict(this.strict = true);
      }
      first = false;
    }
    if (oldStrict === false) this.setStrict(false);
    return this.finishNode(node, "BlockStatement");
  };

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  pp.parseFor = function (node, init) {
    node.init = init;
    this.expect(_tokentype.types.semi);
    node.test = this.type === _tokentype.types.semi ? null : this.parseExpression();
    this.expect(_tokentype.types.semi);
    node.update = this.type === _tokentype.types.parenR ? null : this.parseExpression();
    this.expect(_tokentype.types.parenR);
    node.body = this.parseStatement(false);
    this.labels.pop();
    return this.finishNode(node, "ForStatement");
  };

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  pp.parseForIn = function (node, init) {
    var type = this.type === _tokentype.types._in ? "ForInStatement" : "ForOfStatement";
    this.next();
    node.left = init;
    node.right = this.parseExpression();
    this.expect(_tokentype.types.parenR);
    node.body = this.parseStatement(false);
    this.labels.pop();
    return this.finishNode(node, type);
  };

  // Parse a list of variable declarations.

  pp.parseVar = function (node, isFor, kind) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = this.startNode();
      this.parseVarId(decl);
      if (this.eat(_tokentype.types.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (kind === "const" && !(this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
        this.unexpected();
      } else if (decl.id.type != "Identifier" && !(isFor && (this.type === _tokentype.types._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(_tokentype.types.comma)) break;
    }
    return node;
  };

  pp.parseVarId = function (decl) {
    decl.id = this.parseBindingAtom();
    this.checkLVal(decl.id, true);
  };

  // Parse a function declaration or literal (depending on the
  // `isStatement` parameter).

  pp.parseFunction = function (node, isStatement, allowExpressionBody) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 6) node.generator = this.eat(_tokentype.types.star);
    var oldInGen = this.inGenerator;
    this.inGenerator = node.generator;
    if (isStatement || this.type === _tokentype.types.name) node.id = this.parseIdent();
    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody);
    this.inGenerator = oldInGen;
    return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
  };

  pp.parseFunctionParams = function (node) {
    this.expect(_tokentype.types.parenL);
    node.params = this.parseBindingList(_tokentype.types.parenR, false, false, true);
  };

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  pp.parseClass = function (node, isStatement) {
    this.next();
    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(_tokentype.types.braceL);
    while (!this.eat(_tokentype.types.braceR)) {
      if (this.eat(_tokentype.types.semi)) continue;
      var method = this.startNode();
      var isGenerator = this.eat(_tokentype.types.star);
      var isMaybeStatic = this.type === _tokentype.types.name && this.value === "static";
      this.parsePropertyName(method);
      method["static"] = isMaybeStatic && this.type !== _tokentype.types.parenL;
      if (method["static"]) {
        if (isGenerator) this.unexpected();
        isGenerator = this.eat(_tokentype.types.star);
        this.parsePropertyName(method);
      }
      method.kind = "method";
      var isGetSet = false;
      if (!method.computed) {
        var key = method.key;

        if (!isGenerator && key.type === "Identifier" && this.type !== _tokentype.types.parenL && (key.name === "get" || key.name === "set")) {
          isGetSet = true;
          method.kind = key.name;
          key = this.parsePropertyName(method);
        }
        if (!method["static"] && (key.type === "Identifier" && key.name === "constructor" || key.type === "Literal" && key.value === "constructor")) {
          if (hadConstructor) this.raise(key.start, "Duplicate constructor in the same class");
          if (isGetSet) this.raise(key.start, "Constructor can't have get/set modifier");
          if (isGenerator) this.raise(key.start, "Constructor can't be a generator");
          method.kind = "constructor";
          hadConstructor = true;
        }
      }
      this.parseClassMethod(classBody, method, isGenerator);
      if (isGetSet) {
        var paramCount = method.kind === "get" ? 0 : 1;
        if (method.value.params.length !== paramCount) {
          var start = method.value.start;
          if (method.kind === "get") this.raiseRecoverable(start, "getter should have no params");else this.raiseRecoverable(start, "setter should have exactly one param");
        }
        if (method.kind === "set" && method.value.params[0].type === "RestElement") this.raise(method.value.params[0].start, "Setter cannot use rest params");
      }
    }
    node.body = this.finishNode(classBody, "ClassBody");
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
  };

  pp.parseClassMethod = function (classBody, method, isGenerator) {
    method.value = this.parseMethod(isGenerator);
    classBody.body.push(this.finishNode(method, "MethodDefinition"));
  };

  pp.parseClassId = function (node, isStatement) {
    node.id = this.type === _tokentype.types.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
  };

  pp.parseClassSuper = function (node) {
    node.superClass = this.eat(_tokentype.types._extends) ? this.parseExprSubscripts() : null;
  };

  // Parses module export declaration.

  pp.parseExport = function (node) {
    this.next();
    // export * from '...'
    if (this.eat(_tokentype.types.star)) {
      this.expectContextual("from");
      node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
      this.semicolon();
      return this.finishNode(node, "ExportAllDeclaration");
    }
    if (this.eat(_tokentype.types._default)) {
      // export default ...
      var parens = this.type == _tokentype.types.parenL;
      var expr = this.parseMaybeAssign();
      var needsSemi = true;
      if (!parens && (expr.type == "FunctionExpression" || expr.type == "ClassExpression")) {
        needsSemi = false;
        if (expr.id) {
          expr.type = expr.type == "FunctionExpression" ? "FunctionDeclaration" : "ClassDeclaration";
        }
      }
      node.declaration = expr;
      if (needsSemi) this.semicolon();
      return this.finishNode(node, "ExportDefaultDeclaration");
    }
    // export var|const|let|function|class ...
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseStatement(true);
      node.specifiers = [];
      node.source = null;
    } else {
      // export { x, y as z } [from '...']
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers();
      if (this.eatContextual("from")) {
        node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
      } else {
        // check for keywords used as local names
        for (var i = 0; i < node.specifiers.length; i++) {
          if (this.keywords.test(node.specifiers[i].local.name) || this.reservedWords.test(node.specifiers[i].local.name)) {
            this.unexpected(node.specifiers[i].local.start);
          }
        }

        node.source = null;
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration");
  };

  pp.shouldParseExportStatement = function () {
    return this.type.keyword || this.isLet();
  };

  // Parses a comma-separated list of module exports.

  pp.parseExportSpecifiers = function () {
    var nodes = [],
        first = true;
    // export { x, y as z } [from '...']
    this.expect(_tokentype.types.braceL);
    while (!this.eat(_tokentype.types.braceR)) {
      if (!first) {
        this.expect(_tokentype.types.comma);
        if (this.afterTrailingComma(_tokentype.types.braceR)) break;
      } else first = false;

      var node = this.startNode();
      node.local = this.parseIdent(this.type === _tokentype.types._default);
      node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
      nodes.push(this.finishNode(node, "ExportSpecifier"));
    }
    return nodes;
  };

  // Parses import declaration.

  pp.parseImport = function (node) {
    this.next();
    // import '...'
    if (this.type === _tokentype.types.string) {
      node.specifiers = empty;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration");
  };

  // Parses a comma-separated list of module imports.

  pp.parseImportSpecifiers = function () {
    var nodes = [],
        first = true;
    if (this.type === _tokentype.types.name) {
      // import defaultObj, { x, y as z } from '...'
      var node = this.startNode();
      node.local = this.parseIdent();
      this.checkLVal(node.local, true);
      nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
      if (!this.eat(_tokentype.types.comma)) return nodes;
    }
    if (this.type === _tokentype.types.star) {
      var node = this.startNode();
      this.next();
      this.expectContextual("as");
      node.local = this.parseIdent();
      this.checkLVal(node.local, true);
      nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"));
      return nodes;
    }
    this.expect(_tokentype.types.braceL);
    while (!this.eat(_tokentype.types.braceR)) {
      if (!first) {
        this.expect(_tokentype.types.comma);
        if (this.afterTrailingComma(_tokentype.types.braceR)) break;
      } else first = false;

      var node = this.startNode();
      node.imported = this.parseIdent(true);
      if (this.eatContextual("as")) {
        node.local = this.parseIdent();
      } else {
        node.local = node.imported;
        if (this.isKeyword(node.local.name)) this.unexpected(node.local.start);
        if (this.reservedWordsStrict.test(node.local.name)) this.raise(node.local.start, "The keyword '" + node.local.name + "' is reserved");
      }
      this.checkLVal(node.local, true);
      nodes.push(this.finishNode(node, "ImportSpecifier"));
    }
    return nodes;
  };

  },{"./identifier":2,"./state":10,"./tokentype":14,"./whitespace":16}],12:[function(_dereq_,module,exports){
  // The algorithm used to determine whether a regexp can appear at a
  // given point in the program is loosely based on sweet.js' approach.
  // See https://github.com/mozilla/sweet.js/wiki/design

  "use strict";

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _state = _dereq_("./state");

  var _tokentype = _dereq_("./tokentype");

  var _whitespace = _dereq_("./whitespace");

  var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
    _classCallCheck(this, TokContext);

    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
  };

  exports.TokContext = TokContext;
  var types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", true),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) {
      return p.readTmplToken();
    }),
    f_expr: new TokContext("function", true)
  };

  exports.types = types;
  var pp = _state.Parser.prototype;

  pp.initialContext = function () {
    return [types.b_stat];
  };

  pp.braceIsBlock = function (prevType) {
    if (prevType === _tokentype.types.colon) {
      var _parent = this.curContext();
      if (_parent === types.b_stat || _parent === types.b_expr) return !_parent.isExpr;
    }
    if (prevType === _tokentype.types._return) return _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    if (prevType === _tokentype.types._else || prevType === _tokentype.types.semi || prevType === _tokentype.types.eof || prevType === _tokentype.types.parenR) return true;
    if (prevType == _tokentype.types.braceL) return this.curContext() === types.b_stat;
    return !this.exprAllowed;
  };

  pp.updateContext = function (prevType) {
    var update = undefined,
        type = this.type;
    if (type.keyword && prevType == _tokentype.types.dot) this.exprAllowed = false;else if (update = type.updateContext) update.call(this, prevType);else this.exprAllowed = type.beforeExpr;
  };

  // Token-specific context update code

  _tokentype.types.parenR.updateContext = _tokentype.types.braceR.updateContext = function () {
    if (this.context.length == 1) {
      this.exprAllowed = true;
      return;
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext() === types.f_expr) {
      this.context.pop();
      this.exprAllowed = false;
    } else if (out === types.b_tmpl) {
      this.exprAllowed = true;
    } else {
      this.exprAllowed = !out.isExpr;
    }
  };

  _tokentype.types.braceL.updateContext = function (prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };

  _tokentype.types.dollarBraceL.updateContext = function () {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };

  _tokentype.types.parenL.updateContext = function (prevType) {
    var statementParens = prevType === _tokentype.types._if || prevType === _tokentype.types._for || prevType === _tokentype.types._with || prevType === _tokentype.types._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };

  _tokentype.types.incDec.updateContext = function () {
    // tokExprAllowed stays unchanged
  };

  _tokentype.types._function.updateContext = function (prevType) {
    if (prevType.beforeExpr && prevType !== _tokentype.types.semi && prevType !== _tokentype.types._else && (prevType !== _tokentype.types.colon || this.curContext() !== types.b_stat)) this.context.push(types.f_expr);
    this.exprAllowed = false;
  };

  _tokentype.types.backQuote.updateContext = function () {
    if (this.curContext() === types.q_tmpl) this.context.pop();else this.context.push(types.q_tmpl);
    this.exprAllowed = false;
  };

  },{"./state":10,"./tokentype":14,"./whitespace":16}],13:[function(_dereq_,module,exports){
  "use strict";

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _identifier = _dereq_("./identifier");

  var _tokentype = _dereq_("./tokentype");

  var _state = _dereq_("./state");

  var _locutil = _dereq_("./locutil");

  var _whitespace = _dereq_("./whitespace");

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    _classCallCheck(this, Token);

    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations) this.loc = new _locutil.SourceLocation(p, p.startLoc, p.endLoc);
    if (p.options.ranges) this.range = [p.start, p.end];
  }

  // ## Tokenizer

  ;

  exports.Token = Token;
  var pp = _state.Parser.prototype;

  // Are we running under Rhino?
  var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]";

  // Move to the next token

  pp.next = function () {
    if (this.options.onToken) this.options.onToken(new Token(this));

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp.getToken = function () {
    this.next();
    return new Token(this);
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined") pp[Symbol.iterator] = function () {
    var self = this;
    return { next: function next() {
        var token = self.getToken();
        return {
          done: token.type === _tokentype.types.eof,
          value: token
        };
      } };
  };

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  pp.setStrict = function (strict) {
    this.strict = strict;
    if (this.type !== _tokentype.types.num && this.type !== _tokentype.types.string) return;
    this.pos = this.start;
    if (this.options.locations) {
      while (this.pos < this.lineStart) {
        this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
        --this.curLine;
      }
    }
    this.nextToken();
  };

  pp.curContext = function () {
    return this.context[this.context.length - 1];
  };

  // Read a single token, updating the parser object's token-related
  // properties.

  pp.nextToken = function () {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) this.skipSpace();

    this.start = this.pos;
    if (this.options.locations) this.startLoc = this.curPosition();
    if (this.pos >= this.input.length) return this.finishToken(_tokentype.types.eof);

    if (curContext.override) return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());
  };

  pp.readToken = function (code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (_identifier.isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */) return this.readWord();

    return this.getTokenFromCode(code);
  };

  pp.fullCharCodeAtPos = function () {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 0xd7ff || code >= 0xe000) return code;
    var next = this.input.charCodeAt(this.pos + 1);
    return (code << 10) + next - 0x35fdc00;
  };

  pp.skipBlockComment = function () {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos,
        end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
    this.pos = end + 2;
    if (this.options.locations) {
      _whitespace.lineBreakG.lastIndex = start;
      var match = undefined;
      while ((match = _whitespace.lineBreakG.exec(this.input)) && match.index < this.pos) {
        ++this.curLine;
        this.lineStart = match.index + match[0].length;
      }
    }
    if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
  };

  pp.skipLineComment = function (startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
      ++this.pos;
      ch = this.input.charCodeAt(this.pos);
    }
    if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp.skipSpace = function () {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
        case 32:case 160:
          // ' '
          ++this.pos;
          break;
        case 13:
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos;
          }
        case 10:case 8232:case 8233:
          ++this.pos;
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          break;
        case 47:
          // '/'
          switch (this.input.charCodeAt(this.pos + 1)) {
            case 42:
              // '*'
              this.skipBlockComment();
              break;
            case 47:
              this.skipLineComment(2);
              break;
            default:
              break loop;
          }
          break;
        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && _whitespace.nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.pos;
          } else {
            break loop;
          }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp.finishToken = function (type, val) {
    this.end = this.pos;
    if (this.options.locations) this.endLoc = this.curPosition();
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp.readToken_dot = function () {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) return this.readNumber(true);
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
      // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(_tokentype.types.ellipsis);
    } else {
      ++this.pos;
      return this.finishToken(_tokentype.types.dot);
    }
  };

  pp.readToken_slash = function () {
    // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) {
      ++this.pos;return this.readRegexp();
    }
    if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
    return this.finishOp(_tokentype.types.slash, 1);
  };

  pp.readToken_mult_modulo_exp = function (code) {
    // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? _tokentype.types.star : _tokentype.types.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && next === 42) {
      ++size;
      tokentype = _tokentype.types.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) return this.finishOp(_tokentype.types.assign, size + 1);
    return this.finishOp(tokentype, size);
  };

  pp.readToken_pipe_amp = function (code) {
    // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) return this.finishOp(code === 124 ? _tokentype.types.logicalOR : _tokentype.types.logicalAND, 2);
    if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
    return this.finishOp(code === 124 ? _tokentype.types.bitwiseOR : _tokentype.types.bitwiseAND, 1);
  };

  pp.readToken_caret = function () {
    // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
    return this.finishOp(_tokentype.types.bitwiseXOR, 1);
  };

  pp.readToken_plus_min = function (code) {
    // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 && _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken();
      }
      return this.finishOp(_tokentype.types.incDec, 2);
    }
    if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
    return this.finishOp(_tokentype.types.plusMin, 1);
  };

  pp.readToken_lt_gt = function (code) {
    // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(_tokentype.types.assign, size + 1);
      return this.finishOp(_tokentype.types.bitShift, size);
    }
    if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 && this.input.charCodeAt(this.pos + 3) == 45) {
      if (this.inModule) this.unexpected();
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken();
    }
    if (next === 61) size = 2;
    return this.finishOp(_tokentype.types.relational, size);
  };

  pp.readToken_eq_excl = function (code) {
    // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) return this.finishOp(_tokentype.types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
      // '=>'
      this.pos += 2;
      return this.finishToken(_tokentype.types.arrow);
    }
    return this.finishOp(code === 61 ? _tokentype.types.eq : _tokentype.types.prefix, 1);
  };

  pp.getTokenFromCode = function (code) {
    switch (code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit or another two dots.
      case 46:
        // '.'
        return this.readToken_dot();

      // Punctuation tokens.
      case 40:
        ++this.pos;return this.finishToken(_tokentype.types.parenL);
      case 41:
        ++this.pos;return this.finishToken(_tokentype.types.parenR);
      case 59:
        ++this.pos;return this.finishToken(_tokentype.types.semi);
      case 44:
        ++this.pos;return this.finishToken(_tokentype.types.comma);
      case 91:
        ++this.pos;return this.finishToken(_tokentype.types.bracketL);
      case 93:
        ++this.pos;return this.finishToken(_tokentype.types.bracketR);
      case 123:
        ++this.pos;return this.finishToken(_tokentype.types.braceL);
      case 125:
        ++this.pos;return this.finishToken(_tokentype.types.braceR);
      case 58:
        ++this.pos;return this.finishToken(_tokentype.types.colon);
      case 63:
        ++this.pos;return this.finishToken(_tokentype.types.question);

      case 96:
        // '`'
        if (this.options.ecmaVersion < 6) break;
        ++this.pos;
        return this.finishToken(_tokentype.types.backQuote);

      case 48:
        // '0'
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 120 || next === 88) return this.readRadixNumber(16); // '0x', '0X' - hex number
        if (this.options.ecmaVersion >= 6) {
          if (next === 111 || next === 79) return this.readRadixNumber(8); // '0o', '0O' - octal number
          if (next === 98 || next === 66) return this.readRadixNumber(2); // '0b', '0B' - binary number
        }
      // Anything else beginning with a digit is an integer, octal
      // number, or float.
      case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
        // 1-9
        return this.readNumber(false);

      // Quotes produce strings.
      case 34:case 39:
        // '"', "'"
        return this.readString(code);

      // Operators are parsed inline in tiny state machines. '=' (61) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.

      case 47:
        // '/'
        return this.readToken_slash();

      case 37:case 42:
        // '%*'
        return this.readToken_mult_modulo_exp(code);

      case 124:case 38:
        // '|&'
        return this.readToken_pipe_amp(code);

      case 94:
        // '^'
        return this.readToken_caret();

      case 43:case 45:
        // '+-'
        return this.readToken_plus_min(code);

      case 60:case 62:
        // '<>'
        return this.readToken_lt_gt(code);

      case 61:case 33:
        // '=!'
        return this.readToken_eq_excl(code);

      case 126:
        // '~'
        return this.finishOp(_tokentype.types.prefix, 1);
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.finishOp = function (type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str);
  };

  // Parse a regular expression. Some context-awareness is necessary,
  // since a '/' inside a '[]' set does not end the expression.

  function tryCreateRegexp(src, flags, throwErrorAt, parser) {
    try {
      return new RegExp(src, flags);
    } catch (e) {
      if (throwErrorAt !== undefined) {
        if (e instanceof SyntaxError) parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message);
        throw e;
      }
    }
  }

  var regexpUnicodeSupport = !!tryCreateRegexp("￿", "u");

  pp.readRegexp = function () {
    var _this = this;

    var escaped = undefined,
        inClass = undefined,
        start = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
      var ch = this.input.charAt(this.pos);
      if (_whitespace.lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");
      if (!escaped) {
        if (ch === "[") inClass = true;else if (ch === "]" && inClass) inClass = false;else if (ch === "/" && !inClass) break;
        escaped = ch === "\\";
      } else escaped = false;
      ++this.pos;
    }
    var content = this.input.slice(start, this.pos);
    ++this.pos;
    // Need to use `readWord1` because '\uXXXX' sequences are allowed
    // here (don't ask).
    var mods = this.readWord1();
    var tmp = content;
    if (mods) {
      var validFlags = /^[gim]*$/;
      if (this.options.ecmaVersion >= 6) validFlags = /^[gimuy]*$/;
      if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag");
      if (mods.indexOf('u') >= 0 && !regexpUnicodeSupport) {
        // Replace each astral symbol and every Unicode escape sequence that
        // possibly represents an astral symbol or a paired surrogate with a
        // single ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        // Note: replacing with the ASCII symbol `x` might cause false
        // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
        // perfectly valid pattern that is equivalent to `[a-b]`, but it would
        // be replaced by `[x-b]` which throws an error.
        tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
          code = Number("0x" + code);
          if (code > 0x10FFFF) _this.raise(start + offset + 3, "Code point out of bounds");
          return "x";
        });
        tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
      }
    }
    // Detect invalid regular expressions.
    var value = null;
    // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
    // so don't do detection if we are running under Rhino
    if (!isRhino) {
      tryCreateRegexp(tmp, undefined, start, this);
      // Get a regular expression object for this pattern-flag pair, or `null` in
      // case the current environment doesn't support the flags it uses.
      value = tryCreateRegexp(content, mods);
    }
    return this.finishToken(_tokentype.types.regexp, { pattern: content, flags: mods, value: value });
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp.readInt = function (radix, len) {
    var start = this.pos,
        total = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      var code = this.input.charCodeAt(this.pos),
          val = undefined;
      if (code >= 97) val = code - 97 + 10; // a
      else if (code >= 65) val = code - 65 + 10; // A
        else if (code >= 48 && code <= 57) val = code - 48; // 0-9
          else val = Infinity;
      if (val >= radix) break;
      ++this.pos;
      total = total * radix + val;
    }
    if (this.pos === start || len != null && this.pos - start !== len) return null;

    return total;
  };

  pp.readRadixNumber = function (radix) {
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
    if (_identifier.isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
    return this.finishToken(_tokentype.types.num, val);
  };

  // Read an integer, octal integer, or floating-point number.

  pp.readNumber = function (startsWithDot) {
    var start = this.pos,
        isFloat = false,
        octal = this.input.charCodeAt(this.pos) === 48;
    if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
    var next = this.input.charCodeAt(this.pos);
    if (next === 46) {
      // '.'
      ++this.pos;
      this.readInt(10);
      isFloat = true;
      next = this.input.charCodeAt(this.pos);
    }
    if (next === 69 || next === 101) {
      // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) ++this.pos; // '+-'
      if (this.readInt(10) === null) this.raise(start, "Invalid number");
      isFloat = true;
    }
    if (_identifier.isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");

    var str = this.input.slice(start, this.pos),
        val = undefined;
    if (isFloat) val = parseFloat(str);else if (!octal || str.length === 1) val = parseInt(str, 10);else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number");else val = parseInt(str, 8);
    return this.finishToken(_tokentype.types.num, val);
  };

  // Read a string value, interpreting backslash-escapes.

  pp.readCodePoint = function () {
    var ch = this.input.charCodeAt(this.pos),
        code = undefined;

    if (ch === 123) {
      if (this.options.ecmaVersion < 6) this.unexpected();
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) this.raise(codePos, "Code point out of bounds");
    } else {
      code = this.readHexChar(4);
    }
    return code;
  };

  function codePointToString(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) return String.fromCharCode(code);
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00);
  }

  pp.readString = function (quote) {
    var out = "",
        chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) break;
      if (ch === 92) {
        // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else {
        if (_whitespace.isNewLine(ch)) this.raise(this.start, "Unterminated string constant");
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(_tokentype.types.string, out);
  };

  // Reads template string tokens.

  pp.readTmplToken = function () {
    var out = "",
        chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
        // '`', '${'
        if (this.pos === this.start && this.type === _tokentype.types.template) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(_tokentype.types.dollarBraceL);
          } else {
            ++this.pos;
            return this.finishToken(_tokentype.types.backQuote);
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(_tokentype.types.template, out);
      }
      if (ch === 92) {
        // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (_whitespace.isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
          case 10:
            out += "\n";
            break;
          default:
            out += String.fromCharCode(ch);
            break;
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };

  // Used to read escaped characters

  pp.readEscapedChar = function (inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
      case 110:
        return "\n"; // 'n' -> '\n'
      case 114:
        return "\r"; // 'r' -> '\r'
      case 120:
        return String.fromCharCode(this.readHexChar(2)); // 'x'
      case 117:
        return codePointToString(this.readCodePoint()); // 'u'
      case 116:
        return "\t"; // 't' -> '\t'
      case 98:
        return "\b"; // 'b' -> '\b'
      case 118:
        return "\u000b"; // 'v' -> '\u000b'
      case 102:
        return "\f"; // 'f' -> '\f'
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) ++this.pos; // '\r\n'
      case 10:
        // ' \n'
        if (this.options.locations) {
          this.lineStart = this.pos;++this.curLine;
        }
        return "";
      default:
        if (ch >= 48 && ch <= 55) {
          var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
          var octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          if (octalStr !== "0" && (this.strict || inTemplate)) {
            this.raise(this.pos - 2, "Octal literal in strict mode");
          }
          this.pos += octalStr.length - 1;
          return String.fromCharCode(octal);
        }
        return String.fromCharCode(ch);
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp.readHexChar = function (len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) this.raise(codePos, "Bad character escape sequence");
    return n;
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp.readWord1 = function () {
    this.containsEsc = false;
    var word = "",
        first = true,
        chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (_identifier.isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) {
        // "\"
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) != 117) // "u"
          this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX");
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? _identifier.isIdentifierStart : _identifier.isIdentifierChar)(esc, astral)) this.raise(escStart, "Invalid Unicode escape");
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break;
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos);
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp.readWord = function () {
    var word = this.readWord1();
    var type = _tokentype.types.name;
    if ((this.options.ecmaVersion >= 6 || !this.containsEsc) && this.keywords.test(word)) type = _tokentype.keywords[word];
    return this.finishToken(type, word);
  };

  },{"./identifier":2,"./locutil":5,"./state":10,"./tokentype":14,"./whitespace":16}],14:[function(_dereq_,module,exports){
  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // The `startsExpr` property is used to check if the token ends a
  // `yield` expression. It is set on all token types that either can
  // directly start an expression (like a quotation mark) or can
  // continue an expression (like the body of a string).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  "use strict";

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var TokenType = function TokenType(label) {
    var conf = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, TokenType);

    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  exports.TokenType = TokenType;

  function binop(name, prec) {
    return new TokenType(name, { beforeExpr: true, binop: prec });
  }
  var beforeExpr = { beforeExpr: true },
      startsExpr = { startsExpr: true };

  var types = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    eof: new TokenType("eof"),

    // Punctuation token types.
    bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
    assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
    incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
    prefix: new TokenType("prefix", { beforeExpr: true, prefix: true, startsExpr: true }),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=", 6),
    relational: binop("</>", 7),
    bitShift: binop("<</>>", 8),
    plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", { beforeExpr: true })
  };

  exports.types = types;
  // Map keyword names to token types.

  var keywords = {};

  exports.keywords = keywords;
  // Succinct definitions of keyword token types
  function kw(name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    options.keyword = name;
    keywords[name] = types["_" + name] = new TokenType(name, options);
  }

  kw("break");
  kw("case", beforeExpr);
  kw("catch");
  kw("continue");
  kw("debugger");
  kw("default", beforeExpr);
  kw("do", { isLoop: true, beforeExpr: true });
  kw("else", beforeExpr);
  kw("finally");
  kw("for", { isLoop: true });
  kw("function", startsExpr);
  kw("if");
  kw("return", beforeExpr);
  kw("switch");
  kw("throw", beforeExpr);
  kw("try");
  kw("var");
  kw("const");
  kw("while", { isLoop: true });
  kw("with");
  kw("new", { beforeExpr: true, startsExpr: true });
  kw("this", startsExpr);
  kw("super", startsExpr);
  kw("class");
  kw("extends", beforeExpr);
  kw("export");
  kw("import");
  kw("null", startsExpr);
  kw("true", startsExpr);
  kw("false", startsExpr);
  kw("in", { beforeExpr: true, binop: 7 });
  kw("instanceof", { beforeExpr: true, binop: 7 });
  kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true });
  kw("void", { beforeExpr: true, prefix: true, startsExpr: true });
  kw("delete", { beforeExpr: true, prefix: true, startsExpr: true });

  },{}],15:[function(_dereq_,module,exports){
  "use strict";

  exports.__esModule = true;
  exports.isArray = isArray;
  exports.has = has;

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  }

  // Checks if an object has a property.

  function has(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
  }

  },{}],16:[function(_dereq_,module,exports){
  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  "use strict";

  exports.__esModule = true;
  exports.isNewLine = isNewLine;
  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  exports.lineBreak = lineBreak;
  var lineBreakG = new RegExp(lineBreak.source, "g");

  exports.lineBreakG = lineBreakG;

  function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code == 0x2029;
  }

  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  exports.nonASCIIwhitespace = nonASCIIwhitespace;
  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
  exports.skipWhiteSpace = skipWhiteSpace;

  },{}]},{},[3])(3)
  });
  });

  var acorn$1 = (acorn && typeof acorn === 'object' && 'default' in acorn ? acorn['default'] : acorn);

  var xhtml = __commonjs(function (module) {
  module.exports = {
    quot: '\u0022',
    amp: '&',
    apos: '\u0027',
    lt: '<',
    gt: '>',
    nbsp: '\u00A0',
    iexcl: '\u00A1',
    cent: '\u00A2',
    pound: '\u00A3',
    curren: '\u00A4',
    yen: '\u00A5',
    brvbar: '\u00A6',
    sect: '\u00A7',
    uml: '\u00A8',
    copy: '\u00A9',
    ordf: '\u00AA',
    laquo: '\u00AB',
    not: '\u00AC',
    shy: '\u00AD',
    reg: '\u00AE',
    macr: '\u00AF',
    deg: '\u00B0',
    plusmn: '\u00B1',
    sup2: '\u00B2',
    sup3: '\u00B3',
    acute: '\u00B4',
    micro: '\u00B5',
    para: '\u00B6',
    middot: '\u00B7',
    cedil: '\u00B8',
    sup1: '\u00B9',
    ordm: '\u00BA',
    raquo: '\u00BB',
    frac14: '\u00BC',
    frac12: '\u00BD',
    frac34: '\u00BE',
    iquest: '\u00BF',
    Agrave: '\u00C0',
    Aacute: '\u00C1',
    Acirc: '\u00C2',
    Atilde: '\u00C3',
    Auml: '\u00C4',
    Aring: '\u00C5',
    AElig: '\u00C6',
    Ccedil: '\u00C7',
    Egrave: '\u00C8',
    Eacute: '\u00C9',
    Ecirc: '\u00CA',
    Euml: '\u00CB',
    Igrave: '\u00CC',
    Iacute: '\u00CD',
    Icirc: '\u00CE',
    Iuml: '\u00CF',
    ETH: '\u00D0',
    Ntilde: '\u00D1',
    Ograve: '\u00D2',
    Oacute: '\u00D3',
    Ocirc: '\u00D4',
    Otilde: '\u00D5',
    Ouml: '\u00D6',
    times: '\u00D7',
    Oslash: '\u00D8',
    Ugrave: '\u00D9',
    Uacute: '\u00DA',
    Ucirc: '\u00DB',
    Uuml: '\u00DC',
    Yacute: '\u00DD',
    THORN: '\u00DE',
    szlig: '\u00DF',
    agrave: '\u00E0',
    aacute: '\u00E1',
    acirc: '\u00E2',
    atilde: '\u00E3',
    auml: '\u00E4',
    aring: '\u00E5',
    aelig: '\u00E6',
    ccedil: '\u00E7',
    egrave: '\u00E8',
    eacute: '\u00E9',
    ecirc: '\u00EA',
    euml: '\u00EB',
    igrave: '\u00EC',
    iacute: '\u00ED',
    icirc: '\u00EE',
    iuml: '\u00EF',
    eth: '\u00F0',
    ntilde: '\u00F1',
    ograve: '\u00F2',
    oacute: '\u00F3',
    ocirc: '\u00F4',
    otilde: '\u00F5',
    ouml: '\u00F6',
    divide: '\u00F7',
    oslash: '\u00F8',
    ugrave: '\u00F9',
    uacute: '\u00FA',
    ucirc: '\u00FB',
    uuml: '\u00FC',
    yacute: '\u00FD',
    thorn: '\u00FE',
    yuml: '\u00FF',
    OElig: '\u0152',
    oelig: '\u0153',
    Scaron: '\u0160',
    scaron: '\u0161',
    Yuml: '\u0178',
    fnof: '\u0192',
    circ: '\u02C6',
    tilde: '\u02DC',
    Alpha: '\u0391',
    Beta: '\u0392',
    Gamma: '\u0393',
    Delta: '\u0394',
    Epsilon: '\u0395',
    Zeta: '\u0396',
    Eta: '\u0397',
    Theta: '\u0398',
    Iota: '\u0399',
    Kappa: '\u039A',
    Lambda: '\u039B',
    Mu: '\u039C',
    Nu: '\u039D',
    Xi: '\u039E',
    Omicron: '\u039F',
    Pi: '\u03A0',
    Rho: '\u03A1',
    Sigma: '\u03A3',
    Tau: '\u03A4',
    Upsilon: '\u03A5',
    Phi: '\u03A6',
    Chi: '\u03A7',
    Psi: '\u03A8',
    Omega: '\u03A9',
    alpha: '\u03B1',
    beta: '\u03B2',
    gamma: '\u03B3',
    delta: '\u03B4',
    epsilon: '\u03B5',
    zeta: '\u03B6',
    eta: '\u03B7',
    theta: '\u03B8',
    iota: '\u03B9',
    kappa: '\u03BA',
    lambda: '\u03BB',
    mu: '\u03BC',
    nu: '\u03BD',
    xi: '\u03BE',
    omicron: '\u03BF',
    pi: '\u03C0',
    rho: '\u03C1',
    sigmaf: '\u03C2',
    sigma: '\u03C3',
    tau: '\u03C4',
    upsilon: '\u03C5',
    phi: '\u03C6',
    chi: '\u03C7',
    psi: '\u03C8',
    omega: '\u03C9',
    thetasym: '\u03D1',
    upsih: '\u03D2',
    piv: '\u03D6',
    ensp: '\u2002',
    emsp: '\u2003',
    thinsp: '\u2009',
    zwnj: '\u200C',
    zwj: '\u200D',
    lrm: '\u200E',
    rlm: '\u200F',
    ndash: '\u2013',
    mdash: '\u2014',
    lsquo: '\u2018',
    rsquo: '\u2019',
    sbquo: '\u201A',
    ldquo: '\u201C',
    rdquo: '\u201D',
    bdquo: '\u201E',
    dagger: '\u2020',
    Dagger: '\u2021',
    bull: '\u2022',
    hellip: '\u2026',
    permil: '\u2030',
    prime: '\u2032',
    Prime: '\u2033',
    lsaquo: '\u2039',
    rsaquo: '\u203A',
    oline: '\u203E',
    frasl: '\u2044',
    euro: '\u20AC',
    image: '\u2111',
    weierp: '\u2118',
    real: '\u211C',
    trade: '\u2122',
    alefsym: '\u2135',
    larr: '\u2190',
    uarr: '\u2191',
    rarr: '\u2192',
    darr: '\u2193',
    harr: '\u2194',
    crarr: '\u21B5',
    lArr: '\u21D0',
    uArr: '\u21D1',
    rArr: '\u21D2',
    dArr: '\u21D3',
    hArr: '\u21D4',
    forall: '\u2200',
    part: '\u2202',
    exist: '\u2203',
    empty: '\u2205',
    nabla: '\u2207',
    isin: '\u2208',
    notin: '\u2209',
    ni: '\u220B',
    prod: '\u220F',
    sum: '\u2211',
    minus: '\u2212',
    lowast: '\u2217',
    radic: '\u221A',
    prop: '\u221D',
    infin: '\u221E',
    ang: '\u2220',
    and: '\u2227',
    or: '\u2228',
    cap: '\u2229',
    cup: '\u222A',
    'int': '\u222B',
    there4: '\u2234',
    sim: '\u223C',
    cong: '\u2245',
    asymp: '\u2248',
    ne: '\u2260',
    equiv: '\u2261',
    le: '\u2264',
    ge: '\u2265',
    sub: '\u2282',
    sup: '\u2283',
    nsub: '\u2284',
    sube: '\u2286',
    supe: '\u2287',
    oplus: '\u2295',
    otimes: '\u2297',
    perp: '\u22A5',
    sdot: '\u22C5',
    lceil: '\u2308',
    rceil: '\u2309',
    lfloor: '\u230A',
    rfloor: '\u230B',
    lang: '\u2329',
    rang: '\u232A',
    loz: '\u25CA',
    spades: '\u2660',
    clubs: '\u2663',
    hearts: '\u2665',
    diams: '\u2666'
  };
  });

  var require$$0 = (xhtml && typeof xhtml === 'object' && 'default' in xhtml ? xhtml['default'] : xhtml);

  var inject = __commonjs(function (module) {
  'use strict';

  var XHTMLEntities = require$$0;

  var hexNumber = /^[\da-fA-F]+$/;
  var decimalNumber = /^\d+$/;

  module.exports = function(acorn) {
    var tt = acorn.tokTypes;
    var tc = acorn.tokContexts;

    tc.j_oTag = new acorn.TokContext('<tag', false);
    tc.j_cTag = new acorn.TokContext('</tag', false);
    tc.j_expr = new acorn.TokContext('<tag>...</tag>', true, true);

    tt.jsxName = new acorn.TokenType('jsxName');
    tt.jsxText = new acorn.TokenType('jsxText', {beforeExpr: true});
    tt.jsxTagStart = new acorn.TokenType('jsxTagStart');
    tt.jsxTagEnd = new acorn.TokenType('jsxTagEnd');

    tt.jsxTagStart.updateContext = function() {
      this.context.push(tc.j_expr); // treat as beginning of JSX expression
      this.context.push(tc.j_oTag); // start opening tag context
      this.exprAllowed = false;
    };
    tt.jsxTagEnd.updateContext = function(prevType) {
      var out = this.context.pop();
      if (out === tc.j_oTag && prevType === tt.slash || out === tc.j_cTag) {
        this.context.pop();
        this.exprAllowed = this.curContext() === tc.j_expr;
      } else {
        this.exprAllowed = true;
      }
    };

    var pp = acorn.Parser.prototype;

    // Reads inline JSX contents token.

    pp.jsx_readToken = function() {
      var out = '', chunkStart = this.pos;
      for (;;) {
        if (this.pos >= this.input.length)
          this.raise(this.start, 'Unterminated JSX contents');
        var ch = this.input.charCodeAt(this.pos);

        switch (ch) {
        case 60: // '<'
        case 123: // '{'
          if (this.pos === this.start) {
            if (ch === 60 && this.exprAllowed) {
              ++this.pos;
              return this.finishToken(tt.jsxTagStart);
            }
            return this.getTokenFromCode(ch);
          }
          out += this.input.slice(chunkStart, this.pos);
          return this.finishToken(tt.jsxText, out);

        case 38: // '&'
          out += this.input.slice(chunkStart, this.pos);
          out += this.jsx_readEntity();
          chunkStart = this.pos;
          break;

        default:
          if (acorn.isNewLine(ch)) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.jsx_readNewLine(true);
            chunkStart = this.pos;
          } else {
            ++this.pos;
          }
        }
      }
    };

    pp.jsx_readNewLine = function(normalizeCRLF) {
      var ch = this.input.charCodeAt(this.pos);
      var out;
      ++this.pos;
      if (ch === 13 && this.input.charCodeAt(this.pos) === 10) {
        ++this.pos;
        out = normalizeCRLF ? '\n' : '\r\n';
      } else {
        out = String.fromCharCode(ch);
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }

      return out;
    };

    pp.jsx_readString = function(quote) {
      var out = '', chunkStart = ++this.pos;
      for (;;) {
        if (this.pos >= this.input.length)
          this.raise(this.start, 'Unterminated string constant');
        var ch = this.input.charCodeAt(this.pos);
        if (ch === quote) break;
        if (ch === 38) { // '&'
          out += this.input.slice(chunkStart, this.pos);
          out += this.jsx_readEntity();
          chunkStart = this.pos;
        } else if (acorn.isNewLine(ch)) {
          out += this.input.slice(chunkStart, this.pos);
          out += this.jsx_readNewLine(false);
          chunkStart = this.pos;
        } else {
          ++this.pos;
        }
      }
      out += this.input.slice(chunkStart, this.pos++);
      return this.finishToken(tt.string, out);
    };

    pp.jsx_readEntity = function() {
      var str = '', count = 0, entity;
      var ch = this.input[this.pos];
      if (ch !== '&')
        this.raise(this.pos, 'Entity must start with an ampersand');
      var startPos = ++this.pos;
      while (this.pos < this.input.length && count++ < 10) {
        ch = this.input[this.pos++];
        if (ch === ';') {
          if (str[0] === '#') {
            if (str[1] === 'x') {
              str = str.substr(2);
              if (hexNumber.test(str))
                entity = String.fromCharCode(parseInt(str, 16));
            } else {
              str = str.substr(1);
              if (decimalNumber.test(str))
                entity = String.fromCharCode(parseInt(str, 10));
            }
          } else {
            entity = XHTMLEntities[str];
          }
          break;
        }
        str += ch;
      }
      if (!entity) {
        this.pos = startPos;
        return '&';
      }
      return entity;
    };


    // Read a JSX identifier (valid tag or attribute name).
    //
    // Optimized version since JSX identifiers can't contain
    // escape characters and so can be read as single slice.
    // Also assumes that first character was already checked
    // by isIdentifierStart in readToken.

    pp.jsx_readWord = function() {
      var ch, start = this.pos;
      do {
        ch = this.input.charCodeAt(++this.pos);
      } while (acorn.isIdentifierChar(ch) || ch === 45); // '-'
      return this.finishToken(tt.jsxName, this.input.slice(start, this.pos));
    };

    // Transforms JSX element name to string.

    function getQualifiedJSXName(object) {
      if (object.type === 'JSXIdentifier')
        return object.name;

      if (object.type === 'JSXNamespacedName')
        return object.namespace.name + ':' + object.name.name;

      if (object.type === 'JSXMemberExpression')
        return getQualifiedJSXName(object.object) + '.' +
        getQualifiedJSXName(object.property);
    }

    // Parse next token as JSX identifier

    pp.jsx_parseIdentifier = function() {
      var node = this.startNode();
      if (this.type === tt.jsxName)
        node.name = this.value;
      else if (this.type.keyword)
        node.name = this.type.keyword;
      else
        this.unexpected();
      this.next();
      return this.finishNode(node, 'JSXIdentifier');
    };

    // Parse namespaced identifier.

    pp.jsx_parseNamespacedName = function() {
      var startPos = this.start, startLoc = this.startLoc;
      var name = this.jsx_parseIdentifier();
      if (!this.options.plugins.jsx.allowNamespaces || !this.eat(tt.colon)) return name;
      var node = this.startNodeAt(startPos, startLoc);
      node.namespace = name;
      node.name = this.jsx_parseIdentifier();
      return this.finishNode(node, 'JSXNamespacedName');
    };

    // Parses element name in any form - namespaced, member
    // or single identifier.

    pp.jsx_parseElementName = function() {
      var startPos = this.start, startLoc = this.startLoc;
      var node = this.jsx_parseNamespacedName();
      if (this.type === tt.dot && node.type === 'JSXNamespacedName' && !this.options.plugins.jsx.allowNamespacedObjects) {
        this.unexpected();
      }
      while (this.eat(tt.dot)) {
        var newNode = this.startNodeAt(startPos, startLoc);
        newNode.object = node;
        newNode.property = this.jsx_parseIdentifier();
        node = this.finishNode(newNode, 'JSXMemberExpression');
      }
      return node;
    };

    // Parses any type of JSX attribute value.

    pp.jsx_parseAttributeValue = function() {
      switch (this.type) {
      case tt.braceL:
        var node = this.jsx_parseExpressionContainer();
        if (node.expression.type === 'JSXEmptyExpression')
          this.raise(node.start, 'JSX attributes must only be assigned a non-empty expression');
        return node;

      case tt.jsxTagStart:
      case tt.string:
        return this.parseExprAtom();

      default:
        this.raise(this.start, 'JSX value should be either an expression or a quoted JSX text');
      }
    };

    // JSXEmptyExpression is unique type since it doesn't actually parse anything,
    // and so it should start at the end of last read token (left brace) and finish
    // at the beginning of the next one (right brace).

    pp.jsx_parseEmptyExpression = function() {
      var node = this.startNodeAt(this.lastTokEnd, this.lastTokEndLoc);
      return this.finishNodeAt(node, 'JSXEmptyExpression', this.start, this.startLoc);
    };

    // Parses JSX expression enclosed into curly brackets.


    pp.jsx_parseExpressionContainer = function() {
      var node = this.startNode();
      this.next();
      node.expression = this.type === tt.braceR
        ? this.jsx_parseEmptyExpression()
        : this.parseExpression();
      this.expect(tt.braceR);
      return this.finishNode(node, 'JSXExpressionContainer');
    };

    // Parses following JSX attribute name-value pair.

    pp.jsx_parseAttribute = function() {
      var node = this.startNode();
      if (this.eat(tt.braceL)) {
        this.expect(tt.ellipsis);
        node.argument = this.parseMaybeAssign();
        this.expect(tt.braceR);
        return this.finishNode(node, 'JSXSpreadAttribute');
      }
      node.name = this.jsx_parseNamespacedName();
      node.value = this.eat(tt.eq) ? this.jsx_parseAttributeValue() : null;
      return this.finishNode(node, 'JSXAttribute');
    };

    // Parses JSX opening tag starting after '<'.

    pp.jsx_parseOpeningElementAt = function(startPos, startLoc) {
      var node = this.startNodeAt(startPos, startLoc);
      node.attributes = [];
      node.name = this.jsx_parseElementName();
      while (this.type !== tt.slash && this.type !== tt.jsxTagEnd)
        node.attributes.push(this.jsx_parseAttribute());
      node.selfClosing = this.eat(tt.slash);
      this.expect(tt.jsxTagEnd);
      return this.finishNode(node, 'JSXOpeningElement');
    };

    // Parses JSX closing tag starting after '</'.

    pp.jsx_parseClosingElementAt = function(startPos, startLoc) {
      var node = this.startNodeAt(startPos, startLoc);
      node.name = this.jsx_parseElementName();
      this.expect(tt.jsxTagEnd);
      return this.finishNode(node, 'JSXClosingElement');
    };

    // Parses entire JSX element, including it's opening tag
    // (starting after '<'), attributes, contents and closing tag.

    pp.jsx_parseElementAt = function(startPos, startLoc) {
      var node = this.startNodeAt(startPos, startLoc);
      var children = [];
      var openingElement = this.jsx_parseOpeningElementAt(startPos, startLoc);
      var closingElement = null;

      if (!openingElement.selfClosing) {
        contents: for (;;) {
          switch (this.type) {
          case tt.jsxTagStart:
            startPos = this.start; startLoc = this.startLoc;
            this.next();
            if (this.eat(tt.slash)) {
              closingElement = this.jsx_parseClosingElementAt(startPos, startLoc);
              break contents;
            }
            children.push(this.jsx_parseElementAt(startPos, startLoc));
            break;

          case tt.jsxText:
            children.push(this.parseExprAtom());
            break;

          case tt.braceL:
            children.push(this.jsx_parseExpressionContainer());
            break;

          default:
            this.unexpected();
          }
        }
        if (getQualifiedJSXName(closingElement.name) !== getQualifiedJSXName(openingElement.name)) {
          this.raise(
            closingElement.start,
            'Expected corresponding JSX closing tag for <' + getQualifiedJSXName(openingElement.name) + '>');
        }
      }

      node.openingElement = openingElement;
      node.closingElement = closingElement;
      node.children = children;
      if (this.type === tt.relational && this.value === "<") {
        this.raise(this.start, "Adjacent JSX elements must be wrapped in an enclosing tag");
      }
      return this.finishNode(node, 'JSXElement');
    };

    // Parses entire JSX element from current position.

    pp.jsx_parseElement = function() {
      var startPos = this.start, startLoc = this.startLoc;
      this.next();
      return this.jsx_parseElementAt(startPos, startLoc);
    };

    acorn.plugins.jsx = function(instance, opts) {
      if (!opts) {
        return;
      }

      if (typeof opts !== 'object') {
        opts = {};
      }

      instance.options.plugins.jsx = {
        allowNamespaces: opts.allowNamespaces !== false,
        allowNamespacedObjects: !!opts.allowNamespacedObjects
      };

      instance.extend('parseExprAtom', function(inner) {
        return function(refShortHandDefaultPos) {
          if (this.type === tt.jsxText)
            return this.parseLiteral(this.value);
          else if (this.type === tt.jsxTagStart)
            return this.jsx_parseElement();
          else
            return inner.call(this, refShortHandDefaultPos);
        };
      });

      instance.extend('readToken', function(inner) {
        return function(code) {
          var context = this.curContext();

          if (context === tc.j_expr) return this.jsx_readToken();

          if (context === tc.j_oTag || context === tc.j_cTag) {
            if (acorn.isIdentifierStart(code)) return this.jsx_readWord();

            if (code == 62) {
              ++this.pos;
              return this.finishToken(tt.jsxTagEnd);
            }

            if ((code === 34 || code === 39) && context == tc.j_oTag)
              return this.jsx_readString(code);
          }

          if (code === 60 && this.exprAllowed) {
            ++this.pos;
            return this.finishToken(tt.jsxTagStart);
          }
          return inner.call(this, code);
        };
      });

      instance.extend('updateContext', function(inner) {
        return function(prevType) {
          if (this.type == tt.braceL) {
            var curContext = this.curContext();
            if (curContext == tc.j_oTag) this.context.push(tc.b_expr);
            else if (curContext == tc.j_expr) this.context.push(tc.b_tmpl);
            else inner.call(this, prevType);
            this.exprAllowed = true;
          } else if (this.type === tt.slash && prevType === tt.jsxTagStart) {
            this.context.length -= 2; // do not consider JSX expr -> JSX open tag -> ... anymore
            this.context.push(tc.j_cTag); // reconsider as closing tag context
            this.exprAllowed = false;
          } else {
            return inner.call(this, prevType);
          }
        };
      });
    };

    return acorn;
  };
  });

  var acornJsx = (inject && typeof inject === 'object' && 'default' in inject ? inject['default'] : inject);

  var inject$1 = __commonjs(function (module) {
  'use strict';

  module.exports = function(acorn) {
    var tt = acorn.tokTypes;
    var pp = acorn.Parser.prototype;

    // this is the same parseObj that acorn has with...
    function parseObj(isPattern, refDestructuringErrors) {
      var this$1 = this;

      var node = this.startNode(), first = true, propHash = {}
      node.properties = []
      this.next()
      while (!this$1.eat(tt.braceR)) {
        if (!first) {
          this$1.expect(tt.comma)
          if (this$1.afterTrailingComma(tt.braceR)) break
        } else first = false

        var prop = this$1.startNode(), isGenerator, startPos, startLoc
        if (this$1.options.ecmaVersion >= 6) {
          // ...the spread logic borrowed from babylon :)
          if (this$1.type === tt.ellipsis) {
            prop = this$1.parseSpread()
            prop.type = isPattern ? "RestProperty" : "SpreadProperty"
            node.properties.push(prop)
            continue
          }

          prop.method = false
          prop.shorthand = false
          if (isPattern || refDestructuringErrors) {
            startPos = this$1.start
            startLoc = this$1.startLoc
          }
          if (!isPattern)
            isGenerator = this$1.eat(tt.star)
        }
        this$1.parsePropertyName(prop)
        this$1.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors)
        this$1.checkPropClash(prop, propHash)
        node.properties.push(this$1.finishNode(prop, "Property"))
      }
      return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
    }

    acorn.plugins.objectSpread = function objectSpreadPlugin(instance) {
      pp.parseObj = parseObj;
    };

    return acorn;
  };
  });

  var acornObjectSpread = (inject$1 && typeof inject$1 === 'object' && 'default' in inject$1 ? inject$1['default'] : inject$1);

  var charToInteger = {};
  var integerToChar = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split( '' ).forEach( function ( char, i ) {
  	charToInteger[ char ] = i;
  	integerToChar[ i ] = char;
  });

  function encode ( value ) {
  	var result, i;

  	if ( typeof value === 'number' ) {
  		result = encodeInteger( value );
  	} else {
  		result = '';
  		for ( i = 0; i < value.length; i += 1 ) {
  			result += encodeInteger( value[i] );
  		}
  	}

  	return result;
  }

  function encodeInteger ( num ) {
  	var result = '', clamped;

  	if ( num < 0 ) {
  		num = ( -num << 1 ) | 1;
  	} else {
  		num <<= 1;
  	}

  	do {
  		clamped = num & 31;
  		num >>= 5;

  		if ( num > 0 ) {
  			clamped |= 32;
  		}

  		result += integerToChar[ clamped ];
  	} while ( num > 0 );

  	return result;
  }

  function Chunk ( start, end, content ) {
  	this.start = start;
  	this.end = end;
  	this.original = content;

  	this.intro = '';
  	this.outro = '';

  	this.content = content;
  	this.storeName = false;
  	this.edited = false;

  	// we make these non-enumerable, for sanity while debugging
  	Object.defineProperties( this, {
  		previous: { writable: true, value: null },
  		next: { writable: true, value: null }
  	});
  }

  Chunk.prototype = {
  	append: function append ( content ) {
  		this.outro += content;
  	},

  	clone: function clone () {
  		var chunk = new Chunk( this.start, this.end, this.original );

  		chunk.intro = this.intro;
  		chunk.outro = this.outro;
  		chunk.content = this.content;
  		chunk.storeName = this.storeName;
  		chunk.edited = this.edited;

  		return chunk;
  	},

  	contains: function contains ( index ) {
  		return this.start < index && index < this.end;
  	},

  	eachNext: function eachNext ( fn ) {
  		var chunk = this;
  		while ( chunk ) {
  			fn( chunk );
  			chunk = chunk.next;
  		}
  	},

  	eachPrevious: function eachPrevious ( fn ) {
  		var chunk = this;
  		while ( chunk ) {
  			fn( chunk );
  			chunk = chunk.previous;
  		}
  	},

  	edit: function edit ( content, storeName ) {
  		this.content = content;
  		this.storeName = storeName;

  		this.edited = true;

  		return this;
  	},

  	prepend: function prepend ( content ) {
  		this.intro = content + this.intro;
  	},

  	split: function split ( index ) {
  		var sliceIndex = index - this.start;

  		var originalBefore = this.original.slice( 0, sliceIndex );
  		var originalAfter = this.original.slice( sliceIndex );

  		this.original = originalBefore;

  		var newChunk = new Chunk( index, this.end, originalAfter );
  		newChunk.outro = this.outro;
  		this.outro = '';

  		this.end = index;

  		if ( this.edited ) {
  			// TODO is this block necessary?...
  			newChunk.edit( '', false );
  			this.content = '';
  		} else {
  			this.content = originalBefore;
  		}

  		newChunk.next = this.next;
  		if ( newChunk.next ) newChunk.next.previous = newChunk;
  		newChunk.previous = this;
  		this.next = newChunk;

  		return newChunk;
  	},

  	toString: function toString () {
  		return this.intro + this.content + this.outro;
  	},

  	trimEnd: function trimEnd ( rx ) {
  		this.outro = this.outro.replace( rx, '' );
  		if ( this.outro.length ) return true;

  		var trimmed = this.content.replace( rx, '' );

  		if ( trimmed.length ) {
  			if ( trimmed !== this.content ) {
  				this.split( this.start + trimmed.length ).edit( '', false );
  			}

  			return true;
  		} else {
  			this.edit( '', false );

  			this.intro = this.intro.replace( rx, '' );
  			if ( this.intro.length ) return true;
  		}
  	},

  	trimStart: function trimStart ( rx ) {
  		this.intro = this.intro.replace( rx, '' );
  		if ( this.intro.length ) return true;

  		var trimmed = this.content.replace( rx, '' );

  		if ( trimmed.length ) {
  			if ( trimmed !== this.content ) {
  				this.split( this.end - trimmed.length );
  				this.edit( '', false );
  			}

  			return true;
  		} else {
  			this.edit( '', false );

  			this.outro = this.outro.replace( rx, '' );
  			if ( this.outro.length ) return true;
  		}
  	}
  };

  var _btoa;

  if ( typeof window !== 'undefined' && typeof window.btoa === 'function' ) {
  	_btoa = window.btoa;
  } else if ( typeof Buffer === 'function' ) {
  	_btoa = function ( str ) { return new Buffer( str ).toString( 'base64' ); };
  } else {
  	_btoa = function () {
  		throw new Error( 'Unsupported environment: `window.btoa` or `Buffer` should be supported.' );
  	};
  }

  var btoa = _btoa;

  function SourceMap ( properties ) {
  	this.version = 3;

  	this.file           = properties.file;
  	this.sources        = properties.sources;
  	this.sourcesContent = properties.sourcesContent;
  	this.names          = properties.names;
  	this.mappings       = properties.mappings;
  }

  SourceMap.prototype = {
  	toString: function toString () {
  		return JSON.stringify( this );
  	},

  	toUrl: function toUrl () {
  		return 'data:application/json;charset=utf-8;base64,' + btoa( this.toString() );
  	}
  };

  function guessIndent ( code ) {
  	var lines = code.split( '\n' );

  	var tabbed = lines.filter( function ( line ) { return /^\t+/.test( line ); } );
  	var spaced = lines.filter( function ( line ) { return /^ {2,}/.test( line ); } );

  	if ( tabbed.length === 0 && spaced.length === 0 ) {
  		return null;
  	}

  	// More lines tabbed than spaced? Assume tabs, and
  	// default to tabs in the case of a tie (or nothing
  	// to go on)
  	if ( tabbed.length >= spaced.length ) {
  		return '\t';
  	}

  	// Otherwise, we need to guess the multiple
  	var min = spaced.reduce( function ( previous, current ) {
  		var numSpaces = /^ +/.exec( current )[0].length;
  		return Math.min( numSpaces, previous );
  	}, Infinity );

  	return new Array( min + 1 ).join( ' ' );
  }

  function getLocator ( source ) {
  	var originalLines = source.split( '\n' );

  	var start = 0;
  	var lineRanges = originalLines.map( function ( line, i ) {
  		var end = start + line.length + 1;
  		var range = { start: start, end: end, line: i };

  		start = end;
  		return range;
  	});

  	var i = 0;

  	function rangeContains ( range, index ) {
  		return range.start <= index && index < range.end;
  	}

  	function getLocation ( range, index ) {
  		return { line: range.line, column: index - range.start };
  	}

  	return function locate ( index ) {
  		var range = lineRanges[i];

  		var d = index >= range.end ? 1 : -1;

  		while ( range ) {
  			if ( rangeContains( range, index ) ) return getLocation( range, index );

  			i += d;
  			range = lineRanges[i];
  		}
  	};
  }

  function encodeMappings ( original, intro, chunk, hires, sourcemapLocations, sourceIndex, offsets, names ) {
  	var rawLines = [];

  	var generatedCodeLine = intro.split( '\n' ).length - 1;
  	var rawSegments = rawLines[ generatedCodeLine ] = [];

  	var generatedCodeColumn = 0;

  	var locate = getLocator( original );

  	function addEdit ( content, original, loc, nameIndex, i ) {
  		if ( i || content.length ) {
  			rawSegments.push({
  				generatedCodeLine: generatedCodeLine,
  				generatedCodeColumn: generatedCodeColumn,
  				sourceCodeLine: loc.line,
  				sourceCodeColumn: loc.column,
  				sourceCodeName: nameIndex,
  				sourceIndex: sourceIndex
  			});
  		}

  		var lines = content.split( '\n' );
  		var lastLine = lines.pop();

  		if ( lines.length ) {
  			generatedCodeLine += lines.length;
  			rawLines[ generatedCodeLine ] = rawSegments = [];
  			generatedCodeColumn = lastLine.length;
  		} else {
  			generatedCodeColumn += lastLine.length;
  		}

  		lines = original.split( '\n' );
  		lastLine = lines.pop();

  		if ( lines.length ) {
  			loc.line += lines.length;
  			loc.column = lastLine.length;
  		} else {
  			loc.column += lastLine.length;
  		}
  	}

  	function addUneditedChunk ( chunk, loc ) {
  		var originalCharIndex = chunk.start;
  		var first = true;

  		while ( originalCharIndex < chunk.end ) {
  			if ( hires || first || sourcemapLocations[ originalCharIndex ] ) {
  				rawSegments.push({
  					generatedCodeLine: generatedCodeLine,
  					generatedCodeColumn: generatedCodeColumn,
  					sourceCodeLine: loc.line,
  					sourceCodeColumn: loc.column,
  					sourceCodeName: -1,
  					sourceIndex: sourceIndex
  				});
  			}

  			if ( original[ originalCharIndex ] === '\n' ) {
  				loc.line += 1;
  				loc.column = 0;
  				generatedCodeLine += 1;
  				rawLines[ generatedCodeLine ] = rawSegments = [];
  				generatedCodeColumn = 0;
  			} else {
  				loc.column += 1;
  				generatedCodeColumn += 1;
  			}

  			originalCharIndex += 1;
  			first = false;
  		}
  	}

  	while ( chunk ) {
  		var loc = locate( chunk.start );

  		if ( chunk.intro.length ) {
  			addEdit( chunk.intro, '', loc, -1, !!chunk.previous );
  		}

  		if ( chunk.edited ) {
  			addEdit( chunk.content, chunk.original, loc, chunk.storeName ? names.indexOf( chunk.original ) : -1, !!chunk.previous );
  		} else {
  			addUneditedChunk( chunk, loc );
  		}

  		if ( chunk.outro.length ) {
  			addEdit( chunk.outro, '', loc, -1, !!chunk.previous );
  		}

  		var nextChunk = chunk.next;
  		chunk = nextChunk;
  	}

  	offsets.sourceIndex = offsets.sourceIndex || 0;
  	offsets.sourceCodeLine = offsets.sourceCodeLine || 0;
  	offsets.sourceCodeColumn = offsets.sourceCodeColumn || 0;
  	offsets.sourceCodeName = offsets.sourceCodeName || 0;

  	var encoded = rawLines.map( function ( segments ) {
  		var generatedCodeColumn = 0;

  		return segments.map( function ( segment ) {
  			var arr = [
  				segment.generatedCodeColumn - generatedCodeColumn,
  				segment.sourceIndex - offsets.sourceIndex,
  				segment.sourceCodeLine - offsets.sourceCodeLine,
  				segment.sourceCodeColumn - offsets.sourceCodeColumn
  			];

  			generatedCodeColumn = segment.generatedCodeColumn;
  			offsets.sourceIndex = segment.sourceIndex;
  			offsets.sourceCodeLine = segment.sourceCodeLine;
  			offsets.sourceCodeColumn = segment.sourceCodeColumn;

  			if ( ~segment.sourceCodeName ) {
  				arr.push( segment.sourceCodeName - offsets.sourceCodeName );
  				offsets.sourceCodeName = segment.sourceCodeName;
  			}

  			return encode( arr );
  		}).join( ',' );
  	}).join( ';' );

  	return encoded;
  }

  function getRelativePath ( from, to ) {
  	var fromParts = from.split( /[\/\\]/ );
  	var toParts = to.split( /[\/\\]/ );

  	fromParts.pop(); // get dirname

  	while ( fromParts[0] === toParts[0] ) {
  		fromParts.shift();
  		toParts.shift();
  	}

  	if ( fromParts.length ) {
  		var i = fromParts.length;
  		while ( i-- ) fromParts[i] = '..';
  	}

  	return fromParts.concat( toParts ).join( '/' );
  }

  var toString = Object.prototype.toString;

  function isObject ( thing ) {
  	return toString.call( thing ) === '[object Object]';
  }

  function MagicString ( string, options ) {
  	if ( options === void 0 ) options = {};

  	var chunk = new Chunk( 0, string.length, string );

  	Object.defineProperties( this, {
  		original:              { writable: true, value: string },
  		outro:                 { writable: true, value: '' },
  		intro:                 { writable: true, value: '' },
  		firstChunk:            { writable: true, value: chunk },
  		lastChunk:             { writable: true, value: chunk },
  		lastSearchedChunk:     { writable: true, value: chunk },
  		byStart:               { writable: true, value: {} },
  		byEnd:                 { writable: true, value: {} },
  		filename:              { writable: true, value: options.filename },
  		indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
  		sourcemapLocations:    { writable: true, value: {} },
  		storedNames:           { writable: true, value: {} },
  		indentStr:             { writable: true, value: guessIndent( string ) }
  	});

  	if ( false ) {}

  	this.byStart[ 0 ] = chunk;
  	this.byEnd[ string.length ] = chunk;
  }

  MagicString.prototype = {
  	addSourcemapLocation: function addSourcemapLocation ( char ) {
  		this.sourcemapLocations[ char ] = true;
  	},

  	append: function append ( content ) {
  		if ( typeof content !== 'string' ) throw new TypeError( 'outro content must be a string' );

  		this.outro += content;
  		return this;
  	},

  	clone: function clone () {
  		var cloned = new MagicString( this.original, { filename: this.filename });

  		var originalChunk = this.firstChunk;
  		var clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();

  		while ( originalChunk ) {
  			cloned.byStart[ clonedChunk.start ] = clonedChunk;
  			cloned.byEnd[ clonedChunk.end ] = clonedChunk;

  			var nextOriginalChunk = originalChunk.next;
  			var nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

  			if ( nextClonedChunk ) {
  				clonedChunk.next = nextClonedChunk;
  				nextClonedChunk.previous = clonedChunk;

  				clonedChunk = nextClonedChunk;
  			}

  			originalChunk = nextOriginalChunk;
  		}

  		cloned.lastChunk = clonedChunk;

  		if ( this.indentExclusionRanges ) {
  			cloned.indentExclusionRanges = typeof this.indentExclusionRanges[0] === 'number' ?
  				[ this.indentExclusionRanges[0], this.indentExclusionRanges[1] ] :
  				this.indentExclusionRanges.map( function ( range ) { return [ range.start, range.end ]; } );
  		}

  		Object.keys( this.sourcemapLocations ).forEach( function ( loc ) {
  			cloned.sourcemapLocations[ loc ] = true;
  		});

  		return cloned;
  	},

  	generateMap: function generateMap ( options ) {
  		options = options || {};

  		var names = Object.keys( this.storedNames );

  		if ( false ) {}
  		var map = new SourceMap({
  			file: ( options.file ? options.file.split( /[\/\\]/ ).pop() : null ),
  			sources: [ options.source ? getRelativePath( options.file || '', options.source ) : null ],
  			sourcesContent: options.includeContent ? [ this.original ] : [ null ],
  			names: names,
  			mappings: this.getMappings( options.hires, 0, {}, names )
  		});
  		if ( false ) {}

  		return map;
  	},

  	getIndentString: function getIndentString () {
  		return this.indentStr === null ? '\t' : this.indentStr;
  	},

  	getMappings: function getMappings ( hires, sourceIndex, offsets, names ) {
  		return encodeMappings( this.original, this.intro, this.firstChunk, hires, this.sourcemapLocations, sourceIndex, offsets, names );
  	},

  	indent: function indent ( indentStr, options ) {
  		var this$1 = this;

  		var pattern = /^[^\r\n]/gm;

  		if ( isObject( indentStr ) ) {
  			options = indentStr;
  			indentStr = undefined;
  		}

  		indentStr = indentStr !== undefined ? indentStr : ( this.indentStr || '\t' );

  		if ( indentStr === '' ) return this; // noop

  		options = options || {};

  		// Process exclusion ranges
  		var isExcluded = {};

  		if ( options.exclude ) {
  			var exclusions = typeof options.exclude[0] === 'number' ? [ options.exclude ] : options.exclude;
  			exclusions.forEach( function ( exclusion ) {
  				for ( var i = exclusion[0]; i < exclusion[1]; i += 1 ) {
  					isExcluded[i] = true;
  				}
  			});
  		}

  		var shouldIndentNextCharacter = options.indentStart !== false;
  		var replacer = function ( match ) {
  			if ( shouldIndentNextCharacter ) return ("" + indentStr + match);
  			shouldIndentNextCharacter = true;
  			return match;
  		};

  		this.intro = this.intro.replace( pattern, replacer );

  		var charIndex = 0;

  		var chunk = this.firstChunk;

  		while ( chunk ) {
  			var end = chunk.end;

  			if ( chunk.edited ) {
  				if ( !isExcluded[ charIndex ] ) {
  					chunk.content = chunk.content.replace( pattern, replacer );

  					if ( chunk.content.length ) {
  						shouldIndentNextCharacter = chunk.content[ chunk.content.length - 1 ] === '\n';
  					}
  				}
  			} else {
  				charIndex = chunk.start;

  				while ( charIndex < end ) {
  					if ( !isExcluded[ charIndex ] ) {
  						var char = this$1.original[ charIndex ];

  						if ( char === '\n' ) {
  							shouldIndentNextCharacter = true;
  						} else if ( char !== '\r' && shouldIndentNextCharacter ) {
  							shouldIndentNextCharacter = false;

  							if ( charIndex === chunk.start ) {
  								chunk.prepend( indentStr );
  							} else {
  								var rhs = chunk.split( charIndex );
  								rhs.prepend( indentStr );

  								this$1.byStart[ charIndex ] = rhs;
  								this$1.byEnd[ charIndex ] = chunk;

  								chunk = rhs;
  							}
  						}
  					}

  					charIndex += 1;
  				}
  			}

  			charIndex = chunk.end;
  			chunk = chunk.next;
  		}

  		this.outro = this.outro.replace( pattern, replacer );

  		return this;
  	},

  	insert: function insert () {
  		throw new Error( 'magicString.insert(...) is deprecated. Use insertRight(...) or insertLeft(...)' );
  	},

  	insertLeft: function insertLeft ( index, content ) {
  		if ( typeof content !== 'string' ) throw new TypeError( 'inserted content must be a string' );

  		if ( false ) {}

  		this._split( index );

  		var chunk = this.byEnd[ index ];

  		if ( chunk ) {
  			chunk.append( content );
  		} else {
  			this.intro += content;
  		}

  		if ( false ) {}
  		return this;
  	},

  	insertRight: function insertRight ( index, content ) {
  		if ( typeof content !== 'string' ) throw new TypeError( 'inserted content must be a string' );

  		if ( false ) {}

  		this._split( index );

  		var chunk = this.byStart[ index ];

  		if ( chunk ) {
  			chunk.prepend( content );
  		} else {
  			this.outro += content;
  		}

  		if ( false ) {}
  		return this;
  	},

  	move: function move ( start, end, index ) {
  		if ( index >= start && index <= end ) throw new Error( 'Cannot move a selection inside itself' );

  		if ( false ) {}

  		this._split( start );
  		this._split( end );
  		this._split( index );

  		var first = this.byStart[ start ];
  		var last = this.byEnd[ end ];

  		var oldLeft = first.previous;
  		var oldRight = last.next;

  		var newRight = this.byStart[ index ];
  		if ( !newRight && last === this.lastChunk ) return this;
  		var newLeft = newRight ? newRight.previous : this.lastChunk;

  		if ( oldLeft ) oldLeft.next = oldRight;
  		if ( oldRight ) oldRight.previous = oldLeft;

  		if ( newLeft ) newLeft.next = first;
  		if ( newRight ) newRight.previous = last;

  		if ( !first.previous ) this.firstChunk = last.next;
  		if ( !last.next ) {
  			this.lastChunk = first.previous;
  			this.lastChunk.next = null;
  		}

  		first.previous = newLeft;
  		last.next = newRight;

  		if ( !newLeft ) this.firstChunk = first;
  		if ( !newRight ) this.lastChunk = last;

  		if ( false ) {}
  		return this;
  	},

  	overwrite: function overwrite ( start, end, content, storeName ) {
  		var this$1 = this;

  		if ( typeof content !== 'string' ) throw new TypeError( 'replacement content must be a string' );

  		while ( start < 0 ) start += this$1.original.length;
  		while ( end < 0 ) end += this$1.original.length;

  		if ( end > this.original.length ) throw new Error( 'end is out of bounds' );
  		if ( start === end ) throw new Error( 'Cannot overwrite a zero-length range – use insertLeft or insertRight instead' );

  		if ( false ) {}

  		this._split( start );
  		this._split( end );

  		if ( storeName ) {
  			var original = this.original.slice( start, end );
  			this.storedNames[ original ] = true;
  		}

  		var first = this.byStart[ start ];
  		var last = this.byEnd[ end ];

  		if ( first ) {
  			first.edit( content, storeName );

  			if ( first !== last ) {
  				first.outro = '';

  				var chunk = first.next;
  				while ( chunk !== last ) {
  					chunk.edit( '', false );
  					chunk.intro = chunk.outro = '';
  					chunk = chunk.next;
  				}

  				chunk.edit( '', false );
  				chunk.intro = '';
  			}
  		}

  		else {
  			// must be inserting at the end
  			var newChunk = new Chunk( start, end, '' ).edit( content, storeName );

  			// TODO last chunk in the array may not be the last chunk, if it's moved...
  			last.next = newChunk;
  			newChunk.previous = last;
  		}

  		if ( false ) {}
  		return this;
  	},

  	prepend: function prepend ( content ) {
  		if ( typeof content !== 'string' ) throw new TypeError( 'outro content must be a string' );

  		this.intro = content + this.intro;
  		return this;
  	},

  	remove: function remove ( start, end ) {
  		var this$1 = this;

  		while ( start < 0 ) start += this$1.original.length;
  		while ( end < 0 ) end += this$1.original.length;

  		if ( start === end ) return this;

  		if ( start < 0 || end > this.original.length ) throw new Error( 'Character is out of bounds' );
  		if ( start > end ) throw new Error( 'end must be greater than start' );

  		return this.overwrite( start, end, '', false );
  	},

  	slice: function slice ( start, end ) {
  		var this$1 = this;
  		if ( start === void 0 ) start = 0;
  		if ( end === void 0 ) end = this.original.length;

  		while ( start < 0 ) start += this$1.original.length;
  		while ( end < 0 ) end += this$1.original.length;

  		var result = '';

  		// find start chunk
  		var chunk = this.firstChunk;
  		while ( chunk && ( chunk.start > start || chunk.end <= start ) ) {

  			// found end chunk before start
  			if ( chunk.start < end && chunk.end >= end ) {
  				return result;
  			}

  			chunk = chunk.next;
  		}

  		if ( chunk && chunk.edited && chunk.start !== start ) throw new Error(("Cannot use replaced character " + start + " as slice start anchor."));

  		var startChunk = chunk;
  		while ( chunk ) {
  			if ( chunk.intro && ( startChunk !== chunk || chunk.start === start ) ) {
  				result += chunk.intro;
  			}

  			var containsEnd = chunk.start < end && chunk.end >= end;
  			if ( containsEnd && chunk.edited && chunk.end !== end ) throw new Error(("Cannot use replaced character " + end + " as slice end anchor."));

  			var sliceStart = startChunk === chunk ? start - chunk.start : 0;
  			var sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;

  			result += chunk.content.slice( sliceStart, sliceEnd );

  			if ( chunk.outro && ( !containsEnd || chunk.end === end ) ) {
  				result += chunk.outro;
  			}

  			if ( containsEnd ) {
  				break;
  			}

  			chunk = chunk.next;
  		}

  		return result;
  	},

  	// TODO deprecate this? not really very useful
  	snip: function snip ( start, end ) {
  		var clone = this.clone();
  		clone.remove( 0, start );
  		clone.remove( end, clone.original.length );

  		return clone;
  	},

  	_split: function _split ( index ) {
  		var this$1 = this;

  		if ( this.byStart[ index ] || this.byEnd[ index ] ) return;

  		if ( false ) {}

  		var chunk = this.lastSearchedChunk;
  		var searchForward = index > chunk.end;

  		while ( true ) {
  			if ( chunk.contains( index ) ) return this$1._splitChunk( chunk, index );

  			chunk = searchForward ?
  				this$1.byStart[ chunk.end ] :
  				this$1.byEnd[ chunk.start ];
  		}
  	},

  	_splitChunk: function _splitChunk ( chunk, index ) {
  		if ( chunk.edited && chunk.content.length ) { // zero-length edited chunks are a special case (overlapping replacements)
  			var loc = getLocator( this.original )( index );
  			throw new Error( ("Cannot split a chunk that has already been edited (" + (loc.line) + ":" + (loc.column) + " – \"" + (chunk.original) + "\")") );
  		}

  		var newChunk = chunk.split( index );

  		this.byEnd[ index ] = chunk;
  		this.byStart[ index ] = newChunk;
  		this.byEnd[ newChunk.end ] = newChunk;

  		if ( chunk === this.lastChunk ) this.lastChunk = newChunk;

  		this.lastSearchedChunk = chunk;
  		if ( false ) {}
  		return true;
  	},

  	toString: function toString () {
  		var str = this.intro;

  		var chunk = this.firstChunk;
  		while ( chunk ) {
  			str += chunk.toString();
  			chunk = chunk.next;
  		}

  		return str + this.outro;
  	},

  	trimLines: function trimLines () {
  		return this.trim('[\\r\\n]');
  	},

  	trim: function trim ( charType ) {
  		return this.trimStart( charType ).trimEnd( charType );
  	},

  	trimEnd: function trimEnd ( charType ) {
  		var this$1 = this;

  		var rx = new RegExp( ( charType || '\\s' ) + '+$' );

  		this.outro = this.outro.replace( rx, '' );
  		if ( this.outro.length ) return this;

  		var chunk = this.lastChunk;

  		do {
  			var end = chunk.end;
  			var aborted = chunk.trimEnd( rx );

  			// if chunk was trimmed, we have a new lastChunk
  			if ( chunk.end !== end ) {
  				this$1.lastChunk = chunk.next;

  				this$1.byEnd[ chunk.end ] = chunk;
  				this$1.byStart[ chunk.next.start ] = chunk.next;
  			}

  			if ( aborted ) return this$1;
  			chunk = chunk.previous;
  		} while ( chunk );

  		return this;
  	},

  	trimStart: function trimStart ( charType ) {
  		var this$1 = this;

  		var rx = new RegExp( '^' + ( charType || '\\s' ) + '+' );

  		this.intro = this.intro.replace( rx, '' );
  		if ( this.intro.length ) return this;

  		var chunk = this.firstChunk;

  		do {
  			var end = chunk.end;
  			var aborted = chunk.trimStart( rx );

  			if ( chunk.end !== end ) {
  				// special case...
  				if ( chunk === this$1.lastChunk ) this$1.lastChunk = chunk.next;

  				this$1.byEnd[ chunk.end ] = chunk;
  				this$1.byStart[ chunk.next.start ] = chunk.next;
  			}

  			if ( aborted ) return this$1;
  			chunk = chunk.next;
  		} while ( chunk );

  		return this;
  	}
  };

  var hasOwnProp = Object.prototype.hasOwnProperty;

  function Bundle ( options ) {
  	if ( options === void 0 ) options = {};

  	this.intro = options.intro || '';
  	this.separator = options.separator !== undefined ? options.separator : '\n';

  	this.sources = [];

  	this.uniqueSources = [];
  	this.uniqueSourceIndexByFilename = {};
  }

  Bundle.prototype = {
  	addSource: function addSource ( source ) {
  		if ( source instanceof MagicString ) {
  			return this.addSource({
  				content: source,
  				filename: source.filename,
  				separator: this.separator
  			});
  		}

  		if ( !isObject( source ) || !source.content ) {
  			throw new Error( 'bundle.addSource() takes an object with a `content` property, which should be an instance of MagicString, and an optional `filename`' );
  		}

  		[ 'filename', 'indentExclusionRanges', 'separator' ].forEach( function ( option ) {
  			if ( !hasOwnProp.call( source, option ) ) source[ option ] = source.content[ option ];
  		});

  		if ( source.separator === undefined ) { // TODO there's a bunch of this sort of thing, needs cleaning up
  			source.separator = this.separator;
  		}

  		if ( source.filename ) {
  			if ( !hasOwnProp.call( this.uniqueSourceIndexByFilename, source.filename ) ) {
  				this.uniqueSourceIndexByFilename[ source.filename ] = this.uniqueSources.length;
  				this.uniqueSources.push({ filename: source.filename, content: source.content.original });
  			} else {
  				var uniqueSource = this.uniqueSources[ this.uniqueSourceIndexByFilename[ source.filename ] ];
  				if ( source.content.original !== uniqueSource.content ) {
  					throw new Error( ("Illegal source: same filename (" + (source.filename) + "), different contents") );
  				}
  			}
  		}

  		this.sources.push( source );
  		return this;
  	},

  	append: function append ( str, options ) {
  		this.addSource({
  			content: new MagicString( str ),
  			separator: ( options && options.separator ) || ''
  		});

  		return this;
  	},

  	clone: function clone () {
  		var bundle = new Bundle({
  			intro: this.intro,
  			separator: this.separator
  		});

  		this.sources.forEach( function ( source ) {
  			bundle.addSource({
  				filename: source.filename,
  				content: source.content.clone(),
  				separator: source.separator
  			});
  		});

  		return bundle;
  	},

  	generateMap: function generateMap ( options ) {
  		var this$1 = this;

  		var offsets = {};

  		var names = [];
  		this.sources.forEach( function ( source ) {
  			Object.keys( source.content.storedNames ).forEach( function ( name ) {
  				if ( !~names.indexOf( name ) ) names.push( name );
  			});
  		});

  		var encoded = (
  			getSemis( this.intro ) +
  			this.sources.map( function ( source, i ) {
  				var prefix = ( i > 0 ) ? ( getSemis( source.separator ) || ',' ) : '';
  				var mappings;

  				// we don't bother encoding sources without a filename
  				if ( !source.filename ) {
  					mappings = getSemis( source.content.toString() );
  				} else {
  					var sourceIndex = this$1.uniqueSourceIndexByFilename[ source.filename ];
  					mappings = source.content.getMappings( options.hires, sourceIndex, offsets, names );
  				}

  				return prefix + mappings;
  			}).join( '' )
  		);

  		return new SourceMap({
  			file: ( options.file ? options.file.split( /[\/\\]/ ).pop() : null ),
  			sources: this.uniqueSources.map( function ( source ) {
  				return options.file ? getRelativePath( options.file, source.filename ) : source.filename;
  			}),
  			sourcesContent: this.uniqueSources.map( function ( source ) {
  				return options.includeContent ? source.content : null;
  			}),
  			names: names,
  			mappings: encoded
  		});
  	},

  	getIndentString: function getIndentString () {
  		var indentStringCounts = {};

  		this.sources.forEach( function ( source ) {
  			var indentStr = source.content.indentStr;

  			if ( indentStr === null ) return;

  			if ( !indentStringCounts[ indentStr ] ) indentStringCounts[ indentStr ] = 0;
  			indentStringCounts[ indentStr ] += 1;
  		});

  		return ( Object.keys( indentStringCounts ).sort( function ( a, b ) {
  			return indentStringCounts[a] - indentStringCounts[b];
  		})[0] ) || '\t';
  	},

  	indent: function indent ( indentStr ) {
  		var this$1 = this;

  		if ( !arguments.length ) {
  			indentStr = this.getIndentString();
  		}

  		if ( indentStr === '' ) return this; // noop

  		var trailingNewline = !this.intro || this.intro.slice( -1 ) === '\n';

  		this.sources.forEach( function ( source, i ) {
  			var separator = source.separator !== undefined ? source.separator : this$1.separator;
  			var indentStart = trailingNewline || ( i > 0 && /\r?\n$/.test( separator ) );

  			source.content.indent( indentStr, {
  				exclude: source.indentExclusionRanges,
  				indentStart: indentStart//: trailingNewline || /\r?\n$/.test( separator )  //true///\r?\n/.test( separator )
  			});

  			// TODO this is a very slow way to determine this
  			trailingNewline = source.content.toString().slice( 0, -1 ) === '\n';
  		});

  		if ( this.intro ) {
  			this.intro = indentStr + this.intro.replace( /^[^\n]/gm, function ( match, index ) {
  				return index > 0 ? indentStr + match : match;
  			});
  		}

  		return this;
  	},

  	prepend: function prepend ( str ) {
  		this.intro = str + this.intro;
  		return this;
  	},

  	toString: function toString () {
  		var this$1 = this;

  		var body = this.sources.map( function ( source, i ) {
  			var separator = source.separator !== undefined ? source.separator : this$1.separator;
  			var str = ( i > 0 ? separator : '' ) + source.content.toString();

  			return str;
  		}).join( '' );

  		return this.intro + body;
  	},

  	trimLines: function trimLines () {
  		return this.trim('[\\r\\n]');
  	},

  	trim: function trim ( charType ) {
  		return this.trimStart( charType ).trimEnd( charType );
  	},

  	trimStart: function trimStart ( charType ) {
  		var this$1 = this;

  		var rx = new RegExp( '^' + ( charType || '\\s' ) + '+' );
  		this.intro = this.intro.replace( rx, '' );

  		if ( !this.intro ) {
  			var source;
  			var i = 0;

  			do {
  				source = this$1.sources[i];

  				if ( !source ) {
  					break;
  				}

  				source.content.trimStart( charType );
  				i += 1;
  			} while ( source.content.toString() === '' ); // TODO faster way to determine non-empty source?
  		}

  		return this;
  	},

  	trimEnd: function trimEnd ( charType ) {
  		var this$1 = this;

  		var rx = new RegExp( ( charType || '\\s' ) + '+$' );

  		var source;
  		var i = this.sources.length - 1;

  		do {
  			source = this$1.sources[i];

  			if ( !source ) {
  				this$1.intro = this$1.intro.replace( rx, '' );
  				break;
  			}

  			source.content.trimEnd( charType );
  			i -= 1;
  		} while ( source.content.toString() === '' ); // TODO faster way to determine non-empty source?

  		return this;
  	}
  };

  function getSemis ( str ) {
  	return new Array( str.split( '\n' ).length ).join( ';' );
  }

  MagicString.Bundle = Bundle;

  var keys = {
  	Program: [ 'body' ],
  	Literal: []
  };

  // used for debugging, without the noise created by
  // circular references
  function toJSON ( node ) {
  	var obj = {};

  	Object.keys( node ).forEach( function ( key ) {
  		if ( key === 'parent' || key === 'program' || key === 'keys' || key === '__wrapped' ) return;

  		if ( Array.isArray( node[ key ] ) ) {
  			obj[ key ] = node[ key ].map( toJSON );
  		} else if ( node[ key ] && node[ key ].toJSON ) {
  			obj[ key ] = node[ key ].toJSON();
  		} else {
  			obj[ key ] = node[ key ];
  		}
  	});

  	return obj;
  }

  var Node = function Node ( raw, parent ) {
  	raw.parent = parent;
  	raw.program = parent.program || parent;
  	raw.depth = parent.depth + 1;
  	raw.keys = keys[ raw.type ];
  	raw.indentation = undefined;

  	for ( var i = 0, list = keys[ raw.type ]; i < list.length; i += 1 ) {
  		var key = list[i];

  			wrap( raw[ key ], raw );
  	}

  	raw.program.magicString.addSourcemapLocation( raw.start );
  	raw.program.magicString.addSourcemapLocation( raw.end );
  };

  Node.prototype.ancestor = function ancestor ( level ) {
  	var node = this;
  	while ( level-- ) {
  		node = node.parent;
  		if ( !node ) return null;
  	}

  	return node;
  };

  Node.prototype.contains = function contains ( node ) {
  		var this$1 = this;

  	while ( node ) {
  		if ( node === this$1 ) return true;
  		node = node.parent;
  	}

  	return false;
  };

  Node.prototype.findLexicalBoundary = function findLexicalBoundary () {
  	return this.parent.findLexicalBoundary();
  };

  Node.prototype.findNearest = function findNearest ( type ) {
  	if ( typeof type === 'string' ) type = new RegExp( ("^" + type + "$") );
  	if ( type.test( this.type ) ) return this;
  	return this.parent.findNearest( type );
  };

  Node.prototype.findScope = function findScope ( functionScope ) {
  	return this.parent.findScope( functionScope );
  };

  Node.prototype.getIndentation = function getIndentation () {
  	return this.parent.getIndentation();
  };

  Node.prototype.initialise = function initialise ( transforms ) {
  	for ( var i = 0, list = this.keys; i < list.length; i += 1 ) {
  		var key = list[i];

  			var value = this[ key ];

  		if ( Array.isArray( value ) ) {
  			value.forEach( function ( node ) { return node && node.initialise( transforms ); } );
  		} else if ( value && typeof value === 'object' ) {
  			value.initialise( transforms );
  		}
  	}
  };

  Node.prototype.toJSON = function toJSON$1 () {
  	return toJSON( this );
  };

  Node.prototype.toString = function toString () {
  	return this.program.magicString.original.slice( this.start, this.end );
  };

  Node.prototype.transpile = function transpile ( code, transforms ) {
  	for ( var i = 0, list = this.keys; i < list.length; i += 1 ) {
  		var key = list[i];

  			var value = this[ key ];

  		if ( Array.isArray( value ) ) {
  			value.forEach( function ( node ) { return node && node.transpile( code, transforms ); } );
  		} else if ( value && typeof value === 'object' ) {
  			value.transpile( code, transforms );
  		}
  	}
  };

  function isArguments ( node ) {
  	return node.type === 'Identifier' && node.name === 'arguments';
  }

  function spread ( code, elements, start, argumentsArrayAlias ) {
  	var i = elements.length;
  	var firstSpreadIndex = -1;

  	while ( i-- ) {
  		var element$1 = elements[i];
  		if ( element$1 && element$1.type === 'SpreadElement' ) {
  			if ( isArguments( element$1.argument ) ) {
  				code.overwrite( element$1.argument.start, element$1.argument.end, argumentsArrayAlias );
  			}

  			firstSpreadIndex = i;
  		}
  	}

  	if ( firstSpreadIndex === -1 ) return false; // false indicates no spread elements

  	var element = elements[ firstSpreadIndex ];
  	var previousElement = elements[ firstSpreadIndex - 1 ];

  	if ( !previousElement ) {
  		code.remove( start, element.start );
  		code.overwrite( element.end, elements[1].start, '.concat( ' );
  	} else {
  		code.overwrite( previousElement.end, element.start, ' ].concat( ' );
  	}

  	for ( i = firstSpreadIndex; i < elements.length; i += 1 ) {
  		element = elements[i];

  		if ( element ) {
  			if ( element.type === 'SpreadElement' ) {
  				code.remove( element.start, element.argument.start );
  			} else {
  				code.insertRight( element.start, '[' );
  				code.insertLeft( element.end, ']' );
  			}
  		}
  	}

  	return true; // true indicates some spread elements
  }

  var ArrayExpression = (function (Node) {
  	function ArrayExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ArrayExpression.__proto__ = Node;
  	ArrayExpression.prototype = Object.create( Node && Node.prototype );
  	ArrayExpression.prototype.constructor = ArrayExpression;

  	ArrayExpression.prototype.initialise = function initialise ( transforms ) {
  		var this$1 = this;

  		if ( transforms.spreadRest && this.elements.length ) {
  			var lexicalBoundary = this.findLexicalBoundary();

  			var i = this.elements.length;
  			while ( i-- ) {
  				var element = this$1.elements[i];
  				if ( element && element.type === 'SpreadElement' && isArguments( element.argument ) ) {
  					this$1.argumentsArrayAlias = lexicalBoundary.getArgumentsArrayAlias();
  				}
  			}
  		}

  		Node.prototype.initialise.call( this, transforms );
  	};

  	ArrayExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.spreadRest ) {
  			if ( this.elements.length === 1 ) {
  				var element = this.elements[0];

  				if ( element && element.type === 'SpreadElement' ) {
  					// special case – [ ...arguments ]
  					if ( isArguments( element.argument ) ) {
  						code.overwrite( this.start, this.end, ("[].concat( " + (this.argumentsArrayAlias) + " )") ); // TODO if this is the only use of argsArray, don't bother concating
  					} else {
  						code.overwrite( this.start, element.argument.start, '[].concat( ' );
  						code.overwrite( element.end, this.end, ' )' );
  					}
  				}
  			}

  			else {
  				var hasSpreadElements = spread( code, this.elements, this.start, this.argumentsArrayAlias );

  				if ( hasSpreadElements ) {
  					code.overwrite( this.end - 1, this.end, ')' );
  				}
  			}
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return ArrayExpression;
  }(Node));

  var ArrowFunctionExpression = (function (Node) {
  	function ArrowFunctionExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ArrowFunctionExpression.__proto__ = Node;
  	ArrowFunctionExpression.prototype = Object.create( Node && Node.prototype );
  	ArrowFunctionExpression.prototype.constructor = ArrowFunctionExpression;

  	ArrowFunctionExpression.prototype.initialise = function initialise ( transforms ) {
  		this.body.createScope();
  		Node.prototype.initialise.call( this, transforms );
  	};

  	ArrowFunctionExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.arrow ) {
  			// remove arrow
  			var charIndex = this.body.start;
  			while ( code.original[ charIndex ] !== '=' ) {
  				charIndex -= 1;
  			}
  			code.remove( charIndex, this.body.start );

  			// wrap naked parameter
  			if ( this.params.length === 1 && this.start === this.params[0].start ) {
  				code.insertRight( this.params[0].start, '(' );
  				code.insertLeft( this.params[0].end, ')' );
  			}

  			// add function
  			code.insertRight( this.start, 'function ' );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return ArrowFunctionExpression;
  }(Node));

  function locate ( source, index ) {
  	var lines = source.split( '\n' );
  	var len = lines.length;

  	var lineStart = 0;
  	var i;

  	for ( i = 0; i < len; i += 1 ) {
  		var line = lines[i];
  		var lineEnd =  lineStart + line.length + 1; // +1 for newline

  		if ( lineEnd > index ) {
  			return { line: i + 1, column: index - lineStart, char: i };
  		}

  		lineStart = lineEnd;
  	}

  	throw new Error( 'Could not determine location of character' );
  }

  function pad ( num, len ) {
  	var result = String( num );
  	return result + repeat( ' ', len - result.length );
  }

  function repeat ( str, times ) {
  	var result = '';
  	while ( times-- ) result += str;
  	return result;
  }

  function getSnippet ( source, loc, length ) {
  	if ( length === void 0 ) length = 1;

  	var first = Math.max( loc.line - 5, 0 );
  	var last = loc.line;

  	var numDigits = String( last ).length;

  	var lines = source.split( '\n' ).slice( first, last );

  	var lastLine = lines[ lines.length - 1 ];
  	var offset = lastLine.slice( 0, loc.column ).replace( /\t/g, '  ' ).length;

  	var snippet = lines
  		.map( function ( line, i ) { return ((pad( i + first + 1, numDigits )) + " : " + (line.replace( /\t/g, '  '))); } )
  		.join( '\n' );

  	snippet += '\n' + repeat( ' ', numDigits + 3 + offset ) + repeat( '^', length );

  	return snippet;
  }

  var CompileError = (function (Error) {
  	function CompileError ( node, message ) {
  		Error.call(this);

  		var source = node.program.magicString.original;
  		var loc = locate( source, node.start );

  		this.name = 'CompileError';
  		this.message = message + " (" + (loc.line) + ":" + (loc.column) + ")";

  		this.stack = new Error().stack.replace( new RegExp( (".+new " + (this.name) + ".+\\n"), 'm' ), '' );

  		this.loc = loc;
  		this.snippet = getSnippet( source, loc, node.end - node.start );
  	}

  	if ( Error ) CompileError.__proto__ = Error;
  	CompileError.prototype = Object.create( Error && Error.prototype );
  	CompileError.prototype.constructor = CompileError;

  	CompileError.prototype.toString = function toString () {
  		return ((this.name) + ": " + (this.message) + "\n" + (this.snippet));
  	};

  	return CompileError;
  }(Error));

  var AssignmentExpression = (function (Node) {
  	function AssignmentExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) AssignmentExpression.__proto__ = Node;
  	AssignmentExpression.prototype = Object.create( Node && Node.prototype );
  	AssignmentExpression.prototype.constructor = AssignmentExpression;

  	AssignmentExpression.prototype.initialise = function initialise ( transforms ) {
  		if ( this.left.type === 'Identifier' ) {
  			var declaration = this.findScope( false ).findDeclaration( this.left.name );
  			if ( declaration && declaration.kind === 'const' ) {
  				throw new CompileError( this.left, ((this.left.name) + " is read-only") );
  			}

  			// special case – https://gitlab.com/Rich-Harris/buble/issues/11
  			var statement = declaration && declaration.node.ancestor( 3 );
  			if ( statement && statement.type === 'ForStatement' && statement.body.contains( this ) ) {
  				statement.reassigned[ this.left.name ] = true;
  			}
  		}

  		if ( /Pattern/.test( this.left.type ) ) {
  			throw new CompileError( this.left, 'Destructuring assignments are not currently supported. Coming soon!' );
  		}

  		Node.prototype.initialise.call( this, transforms );
  	};

  	AssignmentExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.operator === '**=' && transforms.exponentiation ) {
  			var scope = this.findScope( false );
  			var getAlias = function ( name ) {
  				var declaration = scope.findDeclaration( name );
  				return declaration ? declaration.name : name;
  			};

  			// first, the easy part – `**=` -> `=`
  			var charIndex = this.left.end;
  			while ( code.original[ charIndex ] !== '*' ) charIndex += 1;
  			code.remove( charIndex, charIndex + 2 );

  			// how we do the next part depends on a number of factors – whether
  			// this is a top-level statement, and whether we're updating a
  			// simple or complex reference
  			var base;

  			var left = this.left;
  			while ( left.type === 'ParenthesizedExpression' ) left = left.expression;

  			if ( left.type === 'Identifier' ) {
  				base = getAlias( left.name );
  			} else if ( left.type === 'MemberExpression' ) {
  				var object;
  				var needsObjectVar = false;
  				var property;
  				var needsPropertyVar = false;

  				var statement = this.findNearest( /(?:Statement|Declaration)$/ );
  				var i0 = statement.getIndentation();

  				if ( left.property.type === 'Identifier' ) {
  					property = left.computed ? getAlias( left.property.name ) : left.property.name;
  				} else {
  					property = scope.createIdentifier( 'property' );
  					needsPropertyVar = true;
  				}

  				if ( left.object.type === 'Identifier' ) {
  					object = getAlias( left.object.name );
  				} else {
  					object = scope.createIdentifier( 'object' );
  					needsObjectVar = true;
  				}

  				if ( left.start === statement.start ) {
  					if ( needsObjectVar && needsPropertyVar ) {
  						code.insertRight( statement.start, ("var " + object + " = ") );
  						code.overwrite( left.object.end, left.property.start, (";\n" + i0 + "var " + property + " = ") );
  						code.overwrite( left.property.end, left.end, (";\n" + i0 + object + "[" + property + "]") );
  					}

  					else if ( needsObjectVar ) {
  						code.insertRight( statement.start, ("var " + object + " = ") );
  						code.insertLeft( left.object.end, (";\n" + i0) );
  						code.insertLeft( left.object.end, object );
  					}

  					else if ( needsPropertyVar ) {
  						code.insertRight( left.property.start, ("var " + property + " = ") );
  						code.insertLeft( left.property.end, (";\n" + i0) );
  						code.move( left.property.start, left.property.end, this.start );

  						code.insertLeft( left.object.end, ("[" + property + "]") );
  						code.remove( left.object.end, left.property.start );
  						code.remove( left.property.end, left.end );
  					}
  				}

  				else {
  					var declarators = [];
  					if ( needsObjectVar ) declarators.push( object );
  					if ( needsPropertyVar ) declarators.push( property );
  					code.insertRight( statement.start, ("var " + (declarators.join( ', ' )) + ";\n" + i0) );

  					if ( needsObjectVar && needsPropertyVar ) {
  						code.insertRight( left.start, ("( " + object + " = ") );
  						code.overwrite( left.object.end, left.property.start, (", " + property + " = ") );
  						code.overwrite( left.property.end, left.end, (", " + object + "[" + property + "]") );
  					}

  					else if ( needsObjectVar ) {
  						code.insertRight( left.start, ("( " + object + " = ") );
  						code.insertLeft( left.object.end, (", " + object) );
  					}

  					else if ( needsPropertyVar ) {
  						code.insertRight( left.property.start, ("( " + property + " = ") );
  						code.insertLeft( left.property.end, ", " );
  						code.move( left.property.start, left.property.end, left.start );

  						code.overwrite( left.object.end, left.property.start, ("[" + property + "]") );
  						code.remove( left.property.end, left.end );
  					}

  					code.insertLeft( this.end, " )" );
  				}

  				base = object + ( left.computed || needsPropertyVar ? ("[" + property + "]") : ("." + property) );
  			}

  			code.insertRight( this.right.start, ("Math.pow( " + base + ", ") );
  			code.insertLeft( this.right.end, " )" );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return AssignmentExpression;
  }(Node));

  var BinaryExpression = (function (Node) {
  	function BinaryExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) BinaryExpression.__proto__ = Node;
  	BinaryExpression.prototype = Object.create( Node && Node.prototype );
  	BinaryExpression.prototype.constructor = BinaryExpression;

  	BinaryExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.operator === '**' && transforms.exponentiation ) {
  			code.insertRight( this.start, "Math.pow( " );
  			code.overwrite( this.left.end, this.right.start, ", " );
  			code.insertLeft( this.end, " )" );
  		}
  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return BinaryExpression;
  }(Node));

  var BreakStatement = (function (Node) {
  	function BreakStatement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) BreakStatement.__proto__ = Node;
  	BreakStatement.prototype = Object.create( Node && Node.prototype );
  	BreakStatement.prototype.constructor = BreakStatement;

  	BreakStatement.prototype.initialise = function initialise ( transforms ) {
  		var loop = this.findNearest( /(?:For(?:In)?|While)Statement/ );
  		var switchCase = this.findNearest( 'SwitchCase' );

  		if ( loop && ( !switchCase || loop.depth > switchCase.depth ) ) {
  			loop.canBreak = true;
  			this.loop = loop;
  		}
  	};

  	BreakStatement.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.loop && this.loop.shouldRewriteAsFunction ) {
  			if ( this.label ) throw new CompileError( this, 'Labels are not currently supported in a loop with locally-scoped variables' );
  			code.overwrite( this.start, this.start + 5, "return 'break'" );
  		}
  	};

  	return BreakStatement;
  }(Node));

  var CallExpression = (function (Node) {
  	function CallExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) CallExpression.__proto__ = Node;
  	CallExpression.prototype = Object.create( Node && Node.prototype );
  	CallExpression.prototype.constructor = CallExpression;

  	CallExpression.prototype.initialise = function initialise ( transforms ) {
  		var this$1 = this;

  		if ( transforms.spreadRest && this.arguments.length > 1 ) {
  			var lexicalBoundary = this.findLexicalBoundary();

  			var i = this.arguments.length;
  			while ( i-- ) {
  				var arg = this$1.arguments[i];
  				if ( arg.type === 'SpreadElement' && isArguments( arg.argument ) ) {
  					this$1.argumentsArrayAlias = lexicalBoundary.getArgumentsArrayAlias();
  				}
  			}
  		}

  		Node.prototype.initialise.call( this, transforms );
  	};

  	CallExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.spreadRest && this.arguments.length ) {
  			var hasSpreadElements = false;
  			var context;

  			var firstArgument = this.arguments[0];

  			if ( this.arguments.length === 1 ) {
  				if ( firstArgument.type === 'SpreadElement' ) {
  					code.remove( firstArgument.start, firstArgument.argument.start );
  					hasSpreadElements = true;
  				}
  			} else {
  				hasSpreadElements = spread( code, this.arguments, firstArgument.start, this.argumentsArrayAlias );
  			}

  			if ( hasSpreadElements ) {
  				if ( this.callee.type === 'MemberExpression' ) {
  					if ( this.callee.object.type === 'Identifier' ) {
  						context = this.callee.object.name;
  					} else {
  						var statement = this.callee.object;
  						var i0 = statement.getIndentation();
  						context = this.findScope( true ).createIdentifier( 'ref' );
  						code.insertRight( statement.start, ("var " + context + " = ") );
  						code.insertLeft( statement.end, (";\n" + i0 + context) );
  					}
  				} else {
  					context = 'void 0';
  				}

  				code.insertLeft( this.callee.end, '.apply' );

  				// we need to handle `super()` different, because `SuperClass.call.apply`
  				// isn't very helpful
  				var isSuper = this.callee.type === 'Super';

  				if ( isSuper ) {
  					this.callee.noCall = true; // bit hacky...

  					if ( this.arguments.length > 1 ) {
  						if ( firstArgument.type !== 'SpreadElement' ) {
  							code.insertRight( firstArgument.start, "[ " );
  						}

  						code.insertLeft( this.arguments[ this.arguments.length - 1 ].end, ' )' );
  					}
  				}

  				else if ( this.arguments.length === 1 ) {
  					code.insertRight( firstArgument.start, (context + ", ") );
  				} else {
  					if ( firstArgument.type === 'SpreadElement' ) {
  						code.insertRight( firstArgument.start, (context + ", ") );
  					} else {
  						code.insertRight( firstArgument.start, (context + ", [ ") );
  					}

  					code.insertLeft( this.arguments[ this.arguments.length - 1 ].end, ' )' );
  				}
  			}
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return CallExpression;
  }(Node));

  function findIndex ( array, fn ) {
  	for ( var i = 0; i < array.length; i += 1 ) {
  		if ( fn( array[i], i ) ) return i;
  	}

  	return -1;
  }

  var reserved = Object.create( null );
  'do if in for let new try var case else enum eval null this true void with await break catch class const false super throw while yield delete export import public return static switch typeof default extends finally package private continue debugger function arguments interface protected implements instanceof'.split( ' ' )
  	.forEach( function ( word ) { return reserved[ word ] = true; } );

  // TODO this code is pretty wild, tidy it up
  var ClassBody = (function (Node) {
  	function ClassBody () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ClassBody.__proto__ = Node;
  	ClassBody.prototype = Object.create( Node && Node.prototype );
  	ClassBody.prototype.constructor = ClassBody;

  	ClassBody.prototype.transpile = function transpile ( code, transforms, inFunctionExpression, superName ) {
  		var this$1 = this;

  		if ( transforms.classes ) {
  			var name = this.parent.name;

  			var indentStr = code.getIndentString();
  			var i0 = this.getIndentation() + ( inFunctionExpression ? indentStr : '' );
  			var i1 = i0 + indentStr;

  			var constructorIndex = findIndex( this.body, function ( node ) { return node.kind === 'constructor'; } );
  			var constructor = this.body[ constructorIndex ];

  			var introBlock = '';
  			var outroBlock = '';

  			if ( this.body.length ) {
  				code.remove( this.start, this.body[0].start );
  				code.remove( this.body[ this.body.length - 1 ].end, this.end );
  			} else {
  				code.remove( this.start, this.end );
  			}

  			if ( constructor ) {
  				constructor.value.body.isConstructorBody = true;

  				var previousMethod = this.body[ constructorIndex - 1 ];
  				var nextMethod = this.body[ constructorIndex + 1 ];

  				// ensure constructor is first
  				if ( constructorIndex > 0 ) {
  					code.remove( previousMethod.end, constructor.start );
  					code.move( constructor.start, nextMethod ? nextMethod.start : this.end - 1, this.body[0].start );
  				}

  				if ( !inFunctionExpression ) code.insertLeft( constructor.end, ';' );
  			}

  			if ( this.parent.superClass ) {
  				var inheritanceBlock = "if ( " + superName + " ) " + name + ".__proto__ = " + superName + ";\n" + i0 + name + ".prototype = Object.create( " + superName + " && " + superName + ".prototype );\n" + i0 + name + ".prototype.constructor = " + name + ";";

  				if ( constructor ) {
  					introBlock += "\n\n" + i0 + inheritanceBlock;
  				} else {
  					var fn = "function " + name + " () {" + ( superName ?
  						("\n" + i1 + superName + ".apply(this, arguments);\n" + i0 + "}") :
  						"}" ) + ( inFunctionExpression ? '' : ';' ) + ( this.body.length ? ("\n\n" + i0) : '' );

  					inheritanceBlock = fn + inheritanceBlock;
  					introBlock += inheritanceBlock + "\n\n" + i0;
  				}
  			} else if ( !constructor ) {
  				var fn$1 = "function " + name + " () {}";
  				if ( this.parent.type === 'ClassDeclaration' ) fn$1 += ';';
  				if ( this.body.length ) fn$1 += "\n\n" + i0;

  				introBlock += fn$1;
  			}

  			var scope = this.findScope( false );

  			var prototypeGettersAndSetters = [];
  			var staticGettersAndSetters = [];
  			var prototypeAccessors;
  			var staticAccessors;

  			this.body.forEach( function ( method, i ) {
  				if ( method.kind === 'constructor' ) {
  					code.overwrite( method.key.start, method.key.end, ("function " + name) );
  					return;
  				}

  				if ( method.static ) code.remove( method.start, method.start + 7 );

  				var isAccessor = method.kind !== 'method';
  				var lhs;

  				var methodName = method.key.name;
  				if ( scope.contains( methodName ) || reserved[ methodName ] ) methodName = scope.createIdentifier( methodName );

  				if ( isAccessor ) {
  					if ( method.computed ) {
  						throw new Error( 'Computed accessor properties are not currently supported' );
  					}

  					code.remove( method.start, method.key.start );

  					if ( method.static ) {
  						if ( !~staticGettersAndSetters.indexOf( method.key.name ) ) staticGettersAndSetters.push( method.key.name );
  						if ( !staticAccessors ) staticAccessors = scope.createIdentifier( 'staticAccessors' );

  						lhs = "" + staticAccessors;
  					} else {
  						if ( !~prototypeGettersAndSetters.indexOf( method.key.name ) ) prototypeGettersAndSetters.push( method.key.name );
  						if ( !prototypeAccessors ) prototypeAccessors = scope.createIdentifier( 'prototypeAccessors' );

  						lhs = "" + prototypeAccessors;
  					}
  				} else {
  					lhs = method.static ?
  						("" + name) :
  						(name + ".prototype");
  				}

  				if ( !method.computed ) lhs += '.';

  				var insertNewlines = ( constructorIndex > 0 && i === constructorIndex + 1 ) ||
  				                       ( i === 0 && constructorIndex === this$1.body.length - 1 );

  				if ( insertNewlines ) lhs = "\n\n" + i0 + lhs;

  				var c = method.key.end;
  				if ( method.computed ) {
  					while ( code.original[c] !== ']' ) c += 1;
  					c += 1;
  				}

  				code.insertRight( method.start, lhs );

  				var rhs = ( isAccessor ? ("." + (method.kind)) : '' ) + " = function" + ( method.value.generator ? '* ' : ' ' ) + ( method.computed || isAccessor ? '' : (methodName + " ") );
  				code.remove( c, method.value.start );
  				code.insertRight( method.value.start, rhs );
  				code.insertLeft( method.end, ';' );

  				if ( method.value.generator ) code.remove( method.start, method.key.start );
  			});

  			if ( prototypeGettersAndSetters.length || staticGettersAndSetters.length ) {
  				var intro = [];
  				var outro = [];

  				if ( prototypeGettersAndSetters.length ) {
  					intro.push( ("var " + prototypeAccessors + " = { " + (prototypeGettersAndSetters.map( function ( name ) { return (name + ": {}"); } ).join( ',' )) + " };") );
  					outro.push( ("Object.defineProperties( " + name + ".prototype, " + prototypeAccessors + " );") );
  				}

  				if ( staticGettersAndSetters.length ) {
  					intro.push( ("var " + staticAccessors + " = { " + (staticGettersAndSetters.map( function ( name ) { return (name + ": {}"); } ).join( ',' )) + " };") );
  					outro.push( ("Object.defineProperties( " + name + ", " + staticAccessors + " );") );
  				}

  				if ( constructor ) introBlock += "\n\n" + i0;
  				introBlock += intro.join( ("\n" + i0) );
  				if ( !constructor ) introBlock += "\n\n" + i0;

  				outroBlock += "\n\n" + i0 + outro.join( ("\n" + i0) );
  			}

  			if ( constructor ) {
  				code.insertLeft( constructor.end, introBlock );
  			} else {
  				code.insertRight( this.start, introBlock );
  			}

  			code.insertLeft( this.end, outroBlock );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return ClassBody;
  }(Node));

  // TODO this function is slightly flawed – it works on the original string,
  // not its current edited state.
  // That's not a problem for the way that it's currently used, but it could
  // be in future...
  function deindent ( node, code ) {
  	var start = node.start;
  	var end = node.end;

  	var indentStr = code.getIndentString();
  	var pattern = new RegExp( indentStr + '\\S', 'g' );

  	if ( code.original.slice( start - indentStr.length, start ) === indentStr ) {
  		code.remove( start - indentStr.length, start );
  	}

  	var slice = code.original.slice( start, end );
  	var match;
  	while ( match = pattern.exec( slice ) ) {
  		if ( !node.program.indentExclusions[ match.index ] ) code.remove( start + match.index, start + match.index + indentStr.length );
  	}
  }

  var ClassDeclaration = (function (Node) {
  	function ClassDeclaration () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ClassDeclaration.__proto__ = Node;
  	ClassDeclaration.prototype = Object.create( Node && Node.prototype );
  	ClassDeclaration.prototype.constructor = ClassDeclaration;

  	ClassDeclaration.prototype.initialise = function initialise ( transforms ) {
  		this.name = this.id.name;
  		this.findScope( true ).addDeclaration( this.id, 'class' );

  		Node.prototype.initialise.call( this, transforms );
  	};

  	ClassDeclaration.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.classes ) {
  			if ( !this.superClass ) deindent( this.body, code );

  			var superName = this.superClass && ( this.superClass.name || 'superclass' );

  			var i0 = this.getIndentation();
  			var i1 = i0 + code.getIndentString();

  			// if this is an export default statement, we have to move the export to
  			// after the declaration, because `export default var Foo = ...` is illegal
  			var syntheticDefaultExport = this.parent.type === 'ExportDefaultDeclaration' ?
  				("\n\n" + i0 + "export default " + (this.id.name) + ";") :
  				'';

  			if ( syntheticDefaultExport ) code.remove( this.parent.start, this.start );

  			code.overwrite( this.start, this.id.start, 'var ' );

  			if ( this.superClass ) {
  				if ( this.superClass.end === this.body.start ) {
  					code.remove( this.id.end, this.superClass.start );
  					code.insertLeft( this.id.end, (" = (function (" + superName + ") {\n" + i1) );
  				} else {
  					code.overwrite( this.id.end, this.superClass.start, ' = ' );
  					code.overwrite( this.superClass.end, this.body.start, ("(function (" + superName + ") {\n" + i1) );
  				}
  			} else {
  				if ( this.id.end === this.body.start ) {
  					code.insertLeft( this.id.end, ' = ' );
  				} else {
  					code.overwrite( this.id.end, this.body.start, ' = ' );
  				}
  			}

  			this.body.transpile( code, transforms, !!this.superClass, superName );

  			if ( this.superClass ) {
  				code.insertLeft( this.end, ("\n\n" + i1 + "return " + (this.name) + ";\n" + i0 + "}(") );
  				code.move( this.superClass.start, this.superClass.end, this.end );
  				code.insertRight( this.end, ("));" + syntheticDefaultExport) );
  			} else if ( syntheticDefaultExport ) {
  				code.insertRight( this.end, syntheticDefaultExport );
  			}
  		}

  		else {
  			this.body.transpile( code, transforms, false, null );
  		}
  	};

  	return ClassDeclaration;
  }(Node));

  var ClassExpression = (function (Node) {
  	function ClassExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ClassExpression.__proto__ = Node;
  	ClassExpression.prototype = Object.create( Node && Node.prototype );
  	ClassExpression.prototype.constructor = ClassExpression;

  	ClassExpression.prototype.initialise = function initialise ( transforms ) {
  		this.name = this.id ? this.id.name :
  		            this.parent.type === 'VariableDeclarator' ? this.parent.id.name :
  		            this.parent.type === 'AssignmentExpression' ? this.parent.left.name :
  		            this.findScope( true ).createIdentifier( 'anonymous' );

  		Node.prototype.initialise.call( this, transforms );
  	};

  	ClassExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.classes ) {
  			var superName = this.superClass && ( this.superClass.name || 'superclass' );

  			var i0 = this.getIndentation();
  			var i1 = i0 + code.getIndentString();

  			if ( this.superClass ) {
  				code.remove( this.start, this.superClass.start );
  				code.remove( this.superClass.end, this.body.start );
  				code.insertLeft( this.start, ("(function (" + superName + ") {\n" + i1) );
  			} else {
  				code.overwrite( this.start, this.body.start, ("(function () {\n" + i1) );
  			}

  			this.body.transpile( code, transforms, true, superName );

  			var outro = "\n\n" + i1 + "return " + (this.name) + ";\n" + i0 + "}(";

  			if ( this.superClass ) {
  				code.insertLeft( this.end, outro );
  				code.move( this.superClass.start, this.superClass.end, this.end );
  				code.insertRight( this.end, '))' );
  			} else {
  				code.insertLeft( this.end, ("\n\n" + i1 + "return " + (this.name) + ";\n" + i0 + "}())") );
  			}
  		}

  		else {
  			this.body.transpile( code, transforms, false );
  		}
  	};

  	return ClassExpression;
  }(Node));

  var ContinueStatement = (function (Node) {
  	function ContinueStatement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ContinueStatement.__proto__ = Node;
  	ContinueStatement.prototype = Object.create( Node && Node.prototype );
  	ContinueStatement.prototype.constructor = ContinueStatement;

  	ContinueStatement.prototype.transpile = function transpile ( code, transforms ) {
  		var loop = this.findNearest( /(?:For(?:In|Of)?|While)Statement/ );
  		if ( loop.shouldRewriteAsFunction ) {
  			if ( this.label ) throw new CompileError( this, 'Labels are not currently supported in a loop with locally-scoped variables' );
  			code.overwrite( this.start, this.start + 8, 'return' );
  		}
  	};

  	return ContinueStatement;
  }(Node));

  var ExportDefaultDeclaration = (function (Node) {
  	function ExportDefaultDeclaration () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ExportDefaultDeclaration.__proto__ = Node;
  	ExportDefaultDeclaration.prototype = Object.create( Node && Node.prototype );
  	ExportDefaultDeclaration.prototype.constructor = ExportDefaultDeclaration;

  	ExportDefaultDeclaration.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.moduleExport ) throw new CompileError( this, 'export is not supported' );
  		Node.prototype.initialise.call( this, transforms );
  	};

  	return ExportDefaultDeclaration;
  }(Node));

  var ExportNamedDeclaration = (function (Node) {
  	function ExportNamedDeclaration () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ExportNamedDeclaration.__proto__ = Node;
  	ExportNamedDeclaration.prototype = Object.create( Node && Node.prototype );
  	ExportNamedDeclaration.prototype.constructor = ExportNamedDeclaration;

  	ExportNamedDeclaration.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.moduleExport ) throw new CompileError( this, 'export is not supported' );
  		Node.prototype.initialise.call( this, transforms );
  	};

  	return ExportNamedDeclaration;
  }(Node));

  function extractNames ( node ) {
  	var names = [];
  	extractors[ node.type ]( names, node );
  	return names;
  }

  var extractors = {
  	Identifier: function Identifier ( names, node ) {
  		names.push( node );
  	},

  	ObjectPattern: function ObjectPattern ( names, node ) {
  		for ( var i = 0, list = node.properties; i < list.length; i += 1 ) {
  			var prop = list[i];

  			extractors[ prop.value.type ]( names, prop.value );
  		}
  	},

  	ArrayPattern: function ArrayPattern ( names, node ) {
  		for ( var i = 0, list = node.elements; i < list.length; i += 1 )  {
  			var element = list[i];

  			if ( element ) extractors[ element.type ]( names, element );
  		}
  	},

  	RestElement: function RestElement ( names, node ) {
  		extractors[ node.argument.type ]( names, node.argument );
  	},

  	AssignmentPattern: function AssignmentPattern ( names, node ) {
  		extractors[ node.left.type ]( names, node.left );
  	}
  };

  var LoopStatement = (function (Node) {
  	function LoopStatement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) LoopStatement.__proto__ = Node;
  	LoopStatement.prototype = Object.create( Node && Node.prototype );
  	LoopStatement.prototype.constructor = LoopStatement;

  	LoopStatement.prototype.findScope = function findScope ( functionScope ) {
  		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
  	};

  	LoopStatement.prototype.initialise = function initialise ( transforms ) {
  		var this$1 = this;

  		this.body.createScope();
  		this.createdScope = true;

  		// this is populated as and when reassignments occur
  		this.reassigned = Object.create( null );
  		this.aliases = Object.create( null );

  		Node.prototype.initialise.call( this, transforms );

  		if ( transforms.letConst ) {
  			// see if any block-scoped declarations are referenced
  			// inside function expressions
  			var names = Object.keys( this.body.scope.declarations );

  			var i = names.length;
  			while ( i-- ) {
  				var name = names[i];
  				var declaration = this$1.body.scope.declarations[ name ];

  				var j = declaration.instances.length;
  				while ( j-- ) {
  					var instance = declaration.instances[j];
  					var nearestFunctionExpression = instance.findNearest( /Function/ );

  					if ( nearestFunctionExpression && nearestFunctionExpression.depth > this$1.depth ) {
  						this$1.shouldRewriteAsFunction = true;
  						break;
  					}
  				}

  				if ( this$1.shouldRewriteAsFunction ) break;
  			}
  		}
  	};

  	LoopStatement.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.shouldRewriteAsFunction ) {
  			var i0 = this.getIndentation();
  			var i1 = i0 + code.getIndentString();

  			var argString = this.args ? (" " + (this.args.join( ', ' )) + " ") : '';
  			var paramString = this.params ? (" " + (this.params.join( ', ' )) + " ") : '';

  			var functionScope = this.findScope( true );
  			var loop = functionScope.createIdentifier( 'loop' );

  			var before = "var " + loop + " = function (" + paramString + ") " + ( this.body.synthetic ? ("{\n" + i0 + (code.getIndentString())) : '' );
  			var after = ( this.body.synthetic ? ("\n" + i0 + "}") : '' ) + ";\n\n" + i0;

  			code.insertRight( this.body.start, before );
  			code.insertLeft( this.body.end, after );
  			code.move( this.start, this.body.start, this.body.end );

  			if ( this.canBreak || this.canReturn ) {
  				var returned = functionScope.createIdentifier( 'returned' );

  				var insert = "{\n" + i1 + "var " + returned + " = " + loop + "(" + argString + ");\n";
  				if ( this.canBreak ) insert += "\n" + i1 + "if ( " + returned + " === 'break' ) break;";
  				if ( this.canReturn ) insert += "\n" + i1 + "if ( " + returned + " ) return returned.v;";
  				insert += "\n" + i0 + "}";

  				code.insertRight( this.body.end, insert );
  			} else {
  				var callExpression = loop + "(" + argString + ");";

  				if ( this.type === 'DoWhileStatement' ) {
  					code.overwrite( this.start, this.body.start, ("do {\n" + i1 + callExpression + "\n" + i0 + "}") );
  				} else {
  					code.insertRight( this.body.end, callExpression );
  				}
  			}
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return LoopStatement;
  }(Node));

  var ForStatement = (function (LoopStatement) {
  	function ForStatement () {
  		LoopStatement.apply(this, arguments);
  	}

  	if ( LoopStatement ) ForStatement.__proto__ = LoopStatement;
  	ForStatement.prototype = Object.create( LoopStatement && LoopStatement.prototype );
  	ForStatement.prototype.constructor = ForStatement;

  	ForStatement.prototype.findScope = function findScope ( functionScope ) {
  		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
  	};

  	ForStatement.prototype.transpile = function transpile ( code, transforms ) {
  		var this$1 = this;

  		var i1 = this.getIndentation() + code.getIndentString();

  		if ( this.shouldRewriteAsFunction ) {
  			// which variables are declared in the init statement?
  			var names = this.init.type === 'VariableDeclaration' ?
  				[].concat.apply( [], this.init.declarations.map( function ( declarator ) { return extractNames( declarator.id ); } ) ) :
  				[];

  			var aliases = this.aliases;

  			this.args = names.map( function ( name ) { return name in this$1.aliases ? this$1.aliases[ name ].outer : name; } );
  			this.params = names.map( function ( name ) { return name in this$1.aliases ? this$1.aliases[ name ].inner : name; } );

  			var updates = Object.keys( this.reassigned )
  				.map( function ( name ) { return ((aliases[ name ].outer) + " = " + (aliases[ name ].inner) + ";"); } );

  			if ( updates.length ) {
  				if ( this.body.synthetic ) {
  					code.insertLeft( this.body.body[0].end, ("; " + (updates.join(" "))) );
  				} else {
  					var lastStatement = this.body.body[ this.body.body.length - 1 ];
  					code.insertLeft( lastStatement.end, ("\n\n" + i1 + (updates.join(("\n" + i1)))) );
  				}
  			}
  		}

  		LoopStatement.prototype.transpile.call( this, code, transforms );
  	};

  	return ForStatement;
  }(LoopStatement));

  var ForInStatement = (function (LoopStatement) {
  	function ForInStatement () {
  		LoopStatement.apply(this, arguments);
  	}

  	if ( LoopStatement ) ForInStatement.__proto__ = LoopStatement;
  	ForInStatement.prototype = Object.create( LoopStatement && LoopStatement.prototype );
  	ForInStatement.prototype.constructor = ForInStatement;

  	ForInStatement.prototype.findScope = function findScope ( functionScope ) {
  		return functionScope || !this.createdScope ? this.parent.findScope( functionScope ) : this.body.scope;
  	};

  	ForInStatement.prototype.transpile = function transpile ( code, transforms ) {
  		var this$1 = this;

  		if ( this.shouldRewriteAsFunction ) {
  			// which variables are declared in the init statement?
  			var names = this.left.type === 'VariableDeclaration' ?
  				[].concat.apply( [], this.left.declarations.map( function ( declarator ) { return extractNames( declarator.id ); } ) ) :
  				[];

  			this.args = names.map( function ( name ) { return name in this$1.aliases ? this$1.aliases[ name ].outer : name; } );
  			this.params = names.map( function ( name ) { return name in this$1.aliases ? this$1.aliases[ name ].inner : name; } );
  		}

  		LoopStatement.prototype.transpile.call( this, code, transforms );
  	};

  	return ForInStatement;
  }(LoopStatement));

  var ForOfStatement = (function (LoopStatement) {
  	function ForOfStatement () {
  		LoopStatement.apply(this, arguments);
  	}

  	if ( LoopStatement ) ForOfStatement.__proto__ = LoopStatement;
  	ForOfStatement.prototype = Object.create( LoopStatement && LoopStatement.prototype );
  	ForOfStatement.prototype.constructor = ForOfStatement;

  	ForOfStatement.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.forOf && !transforms.dangerousForOf ) throw new CompileError( this, 'for...of statements are not supported. Use `transforms: { forOf: false }` to skip transformation and disable this error, or `transforms: { dangerousForOf: true }` if you know what you\'re doing' );
  		LoopStatement.prototype.initialise.call( this, transforms );
  	};

  	ForOfStatement.prototype.transpile = function transpile ( code, transforms ) {
  		if ( !transforms.dangerousForOf ) {
  			LoopStatement.prototype.transpile.call( this, code, transforms );
  			return;
  		}

  		// edge case (#80)
  		if ( !this.body.body[0] ) {
  			if ( this.left.type === 'VariableDeclaration' && this.left.kind === 'var' ) {
  				code.remove( this.start, this.left.start );
  				code.insertLeft( this.left.end, ';' );
  				code.remove( this.left.end, this.end );
  			} else {
  				code.remove( this.start, this.end );
  			}

  			return;
  		}

  		var scope = this.findScope( true );
  		var i0 = this.getIndentation();
  		var i1 = i0 + code.getIndentString();

  		var key = scope.createIdentifier( 'i' );
  		var list = scope.createIdentifier( 'list' );

  		if ( this.body.synthetic ) {
  			code.insertRight( this.left.start, ("{\n" + i1) );
  			code.insertLeft( this.body.body[0].end, ("\n" + i0 + "}") );
  		}

  		var bodyStart = this.body.body[0].start;

  		code.remove( this.left.end, this.right.start );
  		code.move( this.left.start, this.left.end, bodyStart );
  		code.insertLeft( this.left.end, (" = " + list + "[" + key + "];\n\n" + i1) );

  		code.insertRight( this.right.start, ("var " + key + " = 0, " + list + " = ") );
  		code.insertLeft( this.right.end, ("; " + key + " < " + list + ".length; " + key + " += 1") );

  		LoopStatement.prototype.transpile.call( this, code, transforms );
  	};

  	return ForOfStatement;
  }(LoopStatement));

  var FunctionDeclaration = (function (Node) {
  	function FunctionDeclaration () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) FunctionDeclaration.__proto__ = Node;
  	FunctionDeclaration.prototype = Object.create( Node && Node.prototype );
  	FunctionDeclaration.prototype.constructor = FunctionDeclaration;

  	FunctionDeclaration.prototype.initialise = function initialise ( transforms ) {
  		if ( this.generator && transforms.generator ) {
  			throw new CompileError( this, 'Generators are not supported' );
  		}

  		this.body.createScope();

  		this.findScope( true ).addDeclaration( this.id, 'function' );
  		Node.prototype.initialise.call( this, transforms );
  	};

  	return FunctionDeclaration;
  }(Node));

  var FunctionExpression = (function (Node) {
  	function FunctionExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) FunctionExpression.__proto__ = Node;
  	FunctionExpression.prototype = Object.create( Node && Node.prototype );
  	FunctionExpression.prototype.constructor = FunctionExpression;

  	FunctionExpression.prototype.initialise = function initialise ( transforms ) {
  		if ( this.generator && transforms.generator ) {
  			throw new CompileError( this, 'Generators are not supported' );
  		}

  		this.body.createScope();

  		if ( this.id ) {
  			// function expression IDs belong to the child scope...
  			this.body.scope.addDeclaration( this.id, 'function' );
  		}

  		Node.prototype.initialise.call( this, transforms );
  	};

  	return FunctionExpression;
  }(Node));

  function isReference ( node, parent ) {
  	if ( node.type === 'MemberExpression' ) {
  		return !node.computed && isReference( node.object, node );
  	}

  	if ( node.type === 'Identifier' ) {
  		// the only time we could have an identifier node without a parent is
  		// if it's the entire body of a function without a block statement –
  		// i.e. an arrow function expression like `a => a`
  		if ( !parent ) return true;

  		if ( /(Function|Class)Expression/.test( parent.type ) ) return false;

  		if ( parent.type === 'VariableDeclarator' ) return node === parent.init;

  		// TODO is this right?
  		if ( parent.type === 'MemberExpression' || parent.type === 'MethodDefinition' ) {
  			return parent.computed || node === parent.object;
  		}

  		if ( parent.type === 'ArrayPattern' ) return false;

  		// disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
  		if ( parent.type === 'Property' ) {
  			if ( parent.parent.type === 'ObjectPattern' ) return false;
  			return parent.computed || node === parent.value;
  		}

  		// disregard the `bar` in `class Foo { bar () {...} }`
  		if ( parent.type === 'MethodDefinition' ) return false;

  		// disregard the `bar` in `export { foo as bar }`
  		if ( parent.type === 'ExportSpecifier' && node !== parent.local ) return false;

  		return true;
  	}
  }

  var Identifier = (function (Node) {
  	function Identifier () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) Identifier.__proto__ = Node;
  	Identifier.prototype = Object.create( Node && Node.prototype );
  	Identifier.prototype.constructor = Identifier;

  	Identifier.prototype.findScope = function findScope ( functionScope ) {
  		if ( this.parent.params && ~this.parent.params.indexOf( this ) ) {
  			return this.parent.body.scope;
  		}

  		if ( this.parent.type === 'FunctionExpression' && this === this.parent.id ) {
  			return this.parent.body.scope;
  		}

  		return this.parent.findScope( functionScope	);
  	};

  	Identifier.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.arrow && isReference( this, this.parent ) ) {
  			if ( this.name === 'arguments' && !this.findScope( false ).contains( this.name ) ) {
  				var lexicalBoundary = this.findLexicalBoundary();
  				var arrowFunction = this.findNearest( 'ArrowFunctionExpression' );
  				var loop = this.findNearest( /(?:For(?:In|Of)?|While)Statement/ );

  				if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
  					this.alias = lexicalBoundary.getArgumentsAlias();
  				}

  				if ( loop && loop.body.contains( this ) && loop.depth > lexicalBoundary.depth ) {
  					this.alias = lexicalBoundary.getArgumentsAlias();
  				}
  			}

  			this.findScope( false ).addReference( this );
  		}
  	};

  	Identifier.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.alias ) {
  			code.overwrite( this.start, this.end, this.alias, true );
  		}
  	};

  	return Identifier;
  }(Node));

  var ImportDeclaration = (function (Node) {
  	function ImportDeclaration () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ImportDeclaration.__proto__ = Node;
  	ImportDeclaration.prototype = Object.create( Node && Node.prototype );
  	ImportDeclaration.prototype.constructor = ImportDeclaration;

  	ImportDeclaration.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.moduleImport ) throw new CompileError( this, 'import is not supported' );
  		Node.prototype.initialise.call( this, transforms );
  	};

  	return ImportDeclaration;
  }(Node));

  var ImportDefaultSpecifier = (function (Node) {
  	function ImportDefaultSpecifier () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ImportDefaultSpecifier.__proto__ = Node;
  	ImportDefaultSpecifier.prototype = Object.create( Node && Node.prototype );
  	ImportDefaultSpecifier.prototype.constructor = ImportDefaultSpecifier;

  	ImportDefaultSpecifier.prototype.initialise = function initialise ( transforms ) {
  		this.findScope( true ).addDeclaration( this.local, 'import' );
  		Node.prototype.initialise.call( this, transforms );
  	};

  	return ImportDefaultSpecifier;
  }(Node));

  var ImportSpecifier = (function (Node) {
  	function ImportSpecifier () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ImportSpecifier.__proto__ = Node;
  	ImportSpecifier.prototype = Object.create( Node && Node.prototype );
  	ImportSpecifier.prototype.constructor = ImportSpecifier;

  	ImportSpecifier.prototype.initialise = function initialise ( transforms ) {
  		this.findScope( true ).addDeclaration( this.local, 'import' );
  		Node.prototype.initialise.call( this, transforms );
  	};

  	return ImportSpecifier;
  }(Node));

  var IS_DATA_ATTRIBUTE = /-/;

  var JSXAttribute = (function (Node) {
  	function JSXAttribute () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) JSXAttribute.__proto__ = Node;
  	JSXAttribute.prototype = Object.create( Node && Node.prototype );
  	JSXAttribute.prototype.constructor = JSXAttribute;

  	JSXAttribute.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.value ) {
  			code.overwrite( this.name.end, this.value.start, ': ' );
  		} else {
  			// tag without value
  			code.overwrite( this.name.start, this.name.end, ((this.name.name) + ": true"))
  		}

  		if ( IS_DATA_ATTRIBUTE.test( this.name.name ) ) {
  			code.overwrite( this.name.start, this.name.end, ("'" + (this.name.name) + "'") );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return JSXAttribute;
  }(Node));

  function containsNewLine ( node ) {
  	return node.type === 'Literal' && !/\S/.test( node.value ) && /\n/.test( node.value );
  }

  var JSXClosingElement = (function (Node) {
  	function JSXClosingElement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) JSXClosingElement.__proto__ = Node;
  	JSXClosingElement.prototype = Object.create( Node && Node.prototype );
  	JSXClosingElement.prototype.constructor = JSXClosingElement;

  	JSXClosingElement.prototype.transpile = function transpile ( code, transforms ) {
  		var spaceBeforeParen = true;

  		var lastChild = this.parent.children[ this.parent.children.length - 1 ];

  		// omit space before closing paren if
  		//   a) this is on a separate line, or
  		//   b) there are no children but there are attributes
  		if ( ( lastChild && containsNewLine( lastChild ) ) || ( this.parent.openingElement.attributes.length ) ) {
  			spaceBeforeParen = false;
  		}

  		code.overwrite( this.start, this.end, spaceBeforeParen ? ' )' : ')' );
  	};

  	return JSXClosingElement;
  }(Node));

  function normalise ( str, removeTrailingWhitespace ) {
  	if ( removeTrailingWhitespace && /\n/.test( str ) ) {
  		str = str.replace( /\s+$/, '' );
  	}

  	str = str
  		.replace( /^\n\r?\s+/, '' )       // remove leading newline + space
  		.replace( /\s*\n\r?\s*/gm, ' ' ); // replace newlines with spaces

  	// TODO prefer single quotes?
  	return JSON.stringify( str );
  }

  var JSXElement = (function (Node) {
  	function JSXElement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) JSXElement.__proto__ = Node;
  	JSXElement.prototype = Object.create( Node && Node.prototype );
  	JSXElement.prototype.constructor = JSXElement;

  	JSXElement.prototype.transpile = function transpile ( code, transforms ) {
  		Node.prototype.transpile.call( this, code, transforms );

  		var children = this.children.filter( function ( child ) {
  			if ( child.type !== 'Literal' ) return true;

  			// remove whitespace-only literals, unless on a single line
  			return /\S/.test( child.value ) || !/\n/.test( child.value );
  		});

  		if ( children.length ) {
  			var c = this.openingElement.end;

  			var i;
  			for ( i = 0; i < children.length; i += 1 ) {
  				var child = children[i];

  				var tail = code.original[ c ] === '\n' && child.type !== 'Literal' ? '' : ' ';
  				code.insertLeft( c, ("," + tail) );

  				if ( child.type === 'Literal' ) {
  					var str = normalise( child.value, i === children.length - 1 );
  					code.overwrite( child.start, child.end, str );
  				}

  				c = child.end;
  			}
  		}
  	};

  	return JSXElement;
  }(Node));

  var JSXExpressionContainer = (function (Node) {
  	function JSXExpressionContainer () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) JSXExpressionContainer.__proto__ = Node;
  	JSXExpressionContainer.prototype = Object.create( Node && Node.prototype );
  	JSXExpressionContainer.prototype.constructor = JSXExpressionContainer;

  	JSXExpressionContainer.prototype.transpile = function transpile ( code, transforms ) {
  		code.remove( this.start, this.expression.start );
  		code.remove( this.expression.end, this.end );

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return JSXExpressionContainer;
  }(Node));

  var JSXOpeningElement = (function (Node) {
  	function JSXOpeningElement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) JSXOpeningElement.__proto__ = Node;
  	JSXOpeningElement.prototype = Object.create( Node && Node.prototype );
  	JSXOpeningElement.prototype.constructor = JSXOpeningElement;

  	JSXOpeningElement.prototype.transpile = function transpile ( code, transforms ) {
  		var this$1 = this;

  		code.overwrite( this.start, this.name.start, ((this.program.jsx) + "( ") );

  		var html = this.name.type === 'JSXIdentifier' && this.name.name[0] === this.name.name[0].toLowerCase();
  		if ( html ) code.insertRight( this.name.start, "'" );

  		var len = this.attributes.length;
  		var c = this.name.end;

  		if ( len ) {
  			var i;

  			var hasSpread = false;
  			for ( i = 0; i < len; i += 1 ) {
  				if ( this$1.attributes[i].type === 'JSXSpreadAttribute' ) {
  					hasSpread = true;
  					break;
  				}
  			}

  			c = this.attributes[0].end;

  			for ( i = 0; i < len; i += 1 ) {
  				var attr = this$1.attributes[i];

  				if ( i > 0 ) {
  					code.overwrite( c, attr.start, ', ' );
  				}

  				if ( hasSpread && attr.type !== 'JSXSpreadAttribute' ) {
  					var lastAttr = this$1.attributes[ i - 1 ];
  					var nextAttr = this$1.attributes[ i + 1 ];

  					if ( !lastAttr || lastAttr.type === 'JSXSpreadAttribute' ) {
  						code.insertRight( attr.start, '{ ' );
  					}

  					if ( !nextAttr || nextAttr.type === 'JSXSpreadAttribute' ) {
  						code.insertLeft( attr.end, ' }' );
  					}
  				}

  				c = attr.end;
  			}

  			var after;
  			var before;
  			if ( hasSpread ) {
  				if ( len === 1 ) {
  					before = html ? "'," : ',';
  				} else {
  					before = html ? ("', " + (this.program.objectAssign) + "({},") : (", " + (this.program.objectAssign) + "({},");
  					after = ')';
  				}
  			} else {
  				before = html ? "', {" : ', {';
  				after = ' }';
  			}

  			code.insertRight( this.name.end, before );

  			if ( after ) {
  				code.insertLeft( this.attributes[ len - 1 ].end, after );
  			}
  		} else {
  			code.insertLeft( this.name.end, html ? "', null" : ", null" );
  			c = this.name.end;
  		}

  		Node.prototype.transpile.call( this, code, transforms );

  		if ( this.selfClosing ) {
  			code.overwrite( c, this.end, this.attributes.length ? ")" : " )" );
  		} else {
  			code.remove( c, this.end );
  		}
  	};

  	return JSXOpeningElement;
  }(Node));

  var JSXSpreadAttribute = (function (Node) {
  	function JSXSpreadAttribute () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) JSXSpreadAttribute.__proto__ = Node;
  	JSXSpreadAttribute.prototype = Object.create( Node && Node.prototype );
  	JSXSpreadAttribute.prototype.constructor = JSXSpreadAttribute;

  	JSXSpreadAttribute.prototype.transpile = function transpile ( code, transforms ) {
  		code.remove( this.start, this.argument.start );
  		code.remove( this.argument.end, this.end );

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return JSXSpreadAttribute;
  }(Node));

  var regenerate = __commonjs(function (module, exports, global) {
  /*! https://mths.be/regenerate v1.3.1 by @mathias | MIT license */
  ;(function(root) {

  	// Detect free variables `exports`.
  	var freeExports = typeof exports == 'object' && exports;

  	// Detect free variable `module`.
  	var freeModule = typeof module == 'object' && module &&
  		module.exports == freeExports && module;

  	// Detect free variable `global`, from Node.js/io.js or Browserified code,
  	// and use it as `root`.
  	var freeGlobal = typeof global == 'object' && global;
  	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
  		root = freeGlobal;
  	}

  	/*--------------------------------------------------------------------------*/

  	var ERRORS = {
  		'rangeOrder': 'A range\u2019s `stop` value must be greater than or equal ' +
  			'to the `start` value.',
  		'codePointRange': 'Invalid code point value. Code points range from ' +
  			'U+000000 to U+10FFFF.'
  	};

  	// https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs
  	var HIGH_SURROGATE_MIN = 0xD800;
  	var HIGH_SURROGATE_MAX = 0xDBFF;
  	var LOW_SURROGATE_MIN = 0xDC00;
  	var LOW_SURROGATE_MAX = 0xDFFF;

  	// In Regenerate output, `\0` is never preceded by `\` because we sort by
  	// code point value, so let’s keep this regular expression simple.
  	var regexNull = /\\x00([^0123456789]|$)/g;

  	var object = {};
  	var hasOwnProperty = object.hasOwnProperty;
  	var extend = function(destination, source) {
  		var key;
  		for (key in source) {
  			if (hasOwnProperty.call(source, key)) {
  				destination[key] = source[key];
  			}
  		}
  		return destination;
  	};

  	var forEach = function(array, callback) {
  		var index = -1;
  		var length = array.length;
  		while (++index < length) {
  			callback(array[index], index);
  		}
  	};

  	var toString = object.toString;
  	var isArray = function(value) {
  		return toString.call(value) == '[object Array]';
  	};
  	var isNumber = function(value) {
  		return typeof value == 'number' ||
  			toString.call(value) == '[object Number]';
  	};

  	// This assumes that `number` is a positive integer that `toString()`s nicely
  	// (which is the case for all code point values).
  	var zeroes = '0000';
  	var pad = function(number, totalCharacters) {
  		var string = String(number);
  		return string.length < totalCharacters
  			? (zeroes + string).slice(-totalCharacters)
  			: string;
  	};

  	var hex = function(number) {
  		return Number(number).toString(16).toUpperCase();
  	};

  	var slice = [].slice;

  	/*--------------------------------------------------------------------------*/

  	var dataFromCodePoints = function(codePoints) {
  		var index = -1;
  		var length = codePoints.length;
  		var max = length - 1;
  		var result = [];
  		var isStart = true;
  		var tmp;
  		var previous = 0;
  		while (++index < length) {
  			tmp = codePoints[index];
  			if (isStart) {
  				result.push(tmp);
  				previous = tmp;
  				isStart = false;
  			} else {
  				if (tmp == previous + 1) {
  					if (index != max) {
  						previous = tmp;
  						continue;
  					} else {
  						isStart = true;
  						result.push(tmp + 1);
  					}
  				} else {
  					// End the previous range and start a new one.
  					result.push(previous + 1, tmp);
  					previous = tmp;
  				}
  			}
  		}
  		if (!isStart) {
  			result.push(tmp + 1);
  		}
  		return result;
  	};

  	var dataRemove = function(data, codePoint) {
  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		var length = data.length;
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1];
  			if (codePoint >= start && codePoint < end) {
  				// Modify this pair.
  				if (codePoint == start) {
  					if (end == start + 1) {
  						// Just remove `start` and `end`.
  						data.splice(index, 2);
  						return data;
  					} else {
  						// Just replace `start` with a new value.
  						data[index] = codePoint + 1;
  						return data;
  					}
  				} else if (codePoint == end - 1) {
  					// Just replace `end` with a new value.
  					data[index + 1] = codePoint;
  					return data;
  				} else {
  					// Replace `[start, end]` with `[startA, endA, startB, endB]`.
  					data.splice(index, 2, start, codePoint, codePoint + 1, end);
  					return data;
  				}
  			}
  			index += 2;
  		}
  		return data;
  	};

  	var dataRemoveRange = function(data, rangeStart, rangeEnd) {
  		if (rangeEnd < rangeStart) {
  			throw Error(ERRORS.rangeOrder);
  		}
  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		while (index < data.length) {
  			start = data[index];
  			end = data[index + 1] - 1; // Note: the `- 1` makes `end` inclusive.

  			// Exit as soon as no more matching pairs can be found.
  			if (start > rangeEnd) {
  				return data;
  			}

  			// Check if this range pair is equal to, or forms a subset of, the range
  			// to be removed.
  			// E.g. we have `[0, 11, 40, 51]` and want to remove 0-10 → `[40, 51]`.
  			// E.g. we have `[40, 51]` and want to remove 0-100 → `[]`.
  			if (rangeStart <= start && rangeEnd >= end) {
  				// Remove this pair.
  				data.splice(index, 2);
  				continue;
  			}

  			// Check if both `rangeStart` and `rangeEnd` are within the bounds of
  			// this pair.
  			// E.g. we have `[0, 11]` and want to remove 4-6 → `[0, 4, 7, 11]`.
  			if (rangeStart >= start && rangeEnd < end) {
  				if (rangeStart == start) {
  					// Replace `[start, end]` with `[startB, endB]`.
  					data[index] = rangeEnd + 1;
  					data[index + 1] = end + 1;
  					return data;
  				}
  				// Replace `[start, end]` with `[startA, endA, startB, endB]`.
  				data.splice(index, 2, start, rangeStart, rangeEnd + 1, end + 1);
  				return data;
  			}

  			// Check if only `rangeStart` is within the bounds of this pair.
  			// E.g. we have `[0, 11]` and want to remove 4-20 → `[0, 4]`.
  			if (rangeStart >= start && rangeStart <= end) {
  				// Replace `end` with `rangeStart`.
  				data[index + 1] = rangeStart;
  				// Note: we cannot `return` just yet, in case any following pairs still
  				// contain matching code points.
  				// E.g. we have `[0, 11, 14, 31]` and want to remove 4-20
  				// → `[0, 4, 21, 31]`.
  			}

  			// Check if only `rangeEnd` is within the bounds of this pair.
  			// E.g. we have `[14, 31]` and want to remove 4-20 → `[21, 31]`.
  			else if (rangeEnd >= start && rangeEnd <= end) {
  				// Just replace `start`.
  				data[index] = rangeEnd + 1;
  				return data;
  			}

  			index += 2;
  		}
  		return data;
  	};

  	 var dataAdd = function(data, codePoint) {
  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		var lastIndex = null;
  		var length = data.length;
  		if (codePoint < 0x0 || codePoint > 0x10FFFF) {
  			throw RangeError(ERRORS.codePointRange);
  		}
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1];

  			// Check if the code point is already in the set.
  			if (codePoint >= start && codePoint < end) {
  				return data;
  			}

  			if (codePoint == start - 1) {
  				// Just replace `start` with a new value.
  				data[index] = codePoint;
  				return data;
  			}

  			// At this point, if `start` is `greater` than `codePoint`, insert a new
  			// `[start, end]` pair before the current pair, or after the current pair
  			// if there is a known `lastIndex`.
  			if (start > codePoint) {
  				data.splice(
  					lastIndex != null ? lastIndex + 2 : 0,
  					0,
  					codePoint,
  					codePoint + 1
  				);
  				return data;
  			}

  			if (codePoint == end) {
  				// Check if adding this code point causes two separate ranges to become
  				// a single range, e.g. `dataAdd([0, 4, 5, 10], 4)` → `[0, 10]`.
  				if (codePoint + 1 == data[index + 2]) {
  					data.splice(index, 4, start, data[index + 3]);
  					return data;
  				}
  				// Else, just replace `end` with a new value.
  				data[index + 1] = codePoint + 1;
  				return data;
  			}
  			lastIndex = index;
  			index += 2;
  		}
  		// The loop has finished; add the new pair to the end of the data set.
  		data.push(codePoint, codePoint + 1);
  		return data;
  	};

  	var dataAddData = function(dataA, dataB) {
  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		var data = dataA.slice();
  		var length = dataB.length;
  		while (index < length) {
  			start = dataB[index];
  			end = dataB[index + 1] - 1;
  			if (start == end) {
  				data = dataAdd(data, start);
  			} else {
  				data = dataAddRange(data, start, end);
  			}
  			index += 2;
  		}
  		return data;
  	};

  	var dataRemoveData = function(dataA, dataB) {
  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		var data = dataA.slice();
  		var length = dataB.length;
  		while (index < length) {
  			start = dataB[index];
  			end = dataB[index + 1] - 1;
  			if (start == end) {
  				data = dataRemove(data, start);
  			} else {
  				data = dataRemoveRange(data, start, end);
  			}
  			index += 2;
  		}
  		return data;
  	};

  	var dataAddRange = function(data, rangeStart, rangeEnd) {
  		if (rangeEnd < rangeStart) {
  			throw Error(ERRORS.rangeOrder);
  		}
  		if (
  			rangeStart < 0x0 || rangeStart > 0x10FFFF ||
  			rangeEnd < 0x0 || rangeEnd > 0x10FFFF
  		) {
  			throw RangeError(ERRORS.codePointRange);
  		}
  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		var added = false;
  		var length = data.length;
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1];

  			if (added) {
  				// The range has already been added to the set; at this point, we just
  				// need to get rid of the following ranges in case they overlap.

  				// Check if this range can be combined with the previous range.
  				if (start == rangeEnd + 1) {
  					data.splice(index - 1, 2);
  					return data;
  				}

  				// Exit as soon as no more possibly overlapping pairs can be found.
  				if (start > rangeEnd) {
  					return data;
  				}

  				// E.g. `[0, 11, 12, 16]` and we’ve added 5-15, so we now have
  				// `[0, 16, 12, 16]`. Remove the `12,16` part, as it lies within the
  				// `0,16` range that was previously added.
  				if (start >= rangeStart && start <= rangeEnd) {
  					// `start` lies within the range that was previously added.

  					if (end > rangeStart && end - 1 <= rangeEnd) {
  						// `end` lies within the range that was previously added as well,
  						// so remove this pair.
  						data.splice(index, 2);
  						index -= 2;
  						// Note: we cannot `return` just yet, as there may still be other
  						// overlapping pairs.
  					} else {
  						// `start` lies within the range that was previously added, but
  						// `end` doesn’t. E.g. `[0, 11, 12, 31]` and we’ve added 5-15, so
  						// now we have `[0, 16, 12, 31]`. This must be written as `[0, 31]`.
  						// Remove the previously added `end` and the current `start`.
  						data.splice(index - 1, 2);
  						index -= 2;
  					}

  					// Note: we cannot return yet.
  				}

  			}

  			else if (start == rangeEnd + 1) {
  				data[index] = rangeStart;
  				return data;
  			}

  			// Check if a new pair must be inserted *before* the current one.
  			else if (start > rangeEnd) {
  				data.splice(index, 0, rangeStart, rangeEnd + 1);
  				return data;
  			}

  			else if (rangeStart >= start && rangeStart < end && rangeEnd + 1 <= end) {
  				// The new range lies entirely within an existing range pair. No action
  				// needed.
  				return data;
  			}

  			else if (
  				// E.g. `[0, 11]` and you add 5-15 → `[0, 16]`.
  				(rangeStart >= start && rangeStart < end) ||
  				// E.g. `[0, 3]` and you add 3-6 → `[0, 7]`.
  				end == rangeStart
  			) {
  				// Replace `end` with the new value.
  				data[index + 1] = rangeEnd + 1;
  				// Make sure the next range pair doesn’t overlap, e.g. `[0, 11, 12, 14]`
  				// and you add 5-15 → `[0, 16]`, i.e. remove the `12,14` part.
  				added = true;
  				// Note: we cannot `return` just yet.
  			}

  			else if (rangeStart <= start && rangeEnd + 1 >= end) {
  				// The new range is a superset of the old range.
  				data[index] = rangeStart;
  				data[index + 1] = rangeEnd + 1;
  				added = true;
  			}

  			index += 2;
  		}
  		// The loop has finished without doing anything; add the new pair to the end
  		// of the data set.
  		if (!added) {
  			data.push(rangeStart, rangeEnd + 1);
  		}
  		return data;
  	};

  	var dataContains = function(data, codePoint) {
  		var index = 0;
  		var length = data.length;
  		// Exit early if `codePoint` is not within `data`’s overall range.
  		var start = data[index];
  		var end = data[length - 1];
  		if (length >= 2) {
  			if (codePoint < start || codePoint > end) {
  				return false;
  			}
  		}
  		// Iterate over the data per `(start, end)` pair.
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1];
  			if (codePoint >= start && codePoint < end) {
  				return true;
  			}
  			index += 2;
  		}
  		return false;
  	};

  	var dataIntersection = function(data, codePoints) {
  		var index = 0;
  		var length = codePoints.length;
  		var codePoint;
  		var result = [];
  		while (index < length) {
  			codePoint = codePoints[index];
  			if (dataContains(data, codePoint)) {
  				result.push(codePoint);
  			}
  			++index;
  		}
  		return dataFromCodePoints(result);
  	};

  	var dataIsEmpty = function(data) {
  		return !data.length;
  	};

  	var dataIsSingleton = function(data) {
  		// Check if the set only represents a single code point.
  		return data.length == 2 && data[0] + 1 == data[1];
  	};

  	var dataToArray = function(data) {
  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		var result = [];
  		var length = data.length;
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1];
  			while (start < end) {
  				result.push(start);
  				++start;
  			}
  			index += 2;
  		}
  		return result;
  	};

  	/*--------------------------------------------------------------------------*/

  	// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
  	var floor = Math.floor;
  	var highSurrogate = function(codePoint) {
  		return parseInt(
  			floor((codePoint - 0x10000) / 0x400) + HIGH_SURROGATE_MIN,
  			10
  		);
  	};

  	var lowSurrogate = function(codePoint) {
  		return parseInt(
  			(codePoint - 0x10000) % 0x400 + LOW_SURROGATE_MIN,
  			10
  		);
  	};

  	var stringFromCharCode = String.fromCharCode;
  	var codePointToString = function(codePoint) {
  		var string;
  		// https://mathiasbynens.be/notes/javascript-escapes#single
  		// Note: the `\b` escape sequence for U+0008 BACKSPACE in strings has a
  		// different meaning in regular expressions (word boundary), so it cannot
  		// be used here.
  		if (codePoint == 0x09) {
  			string = '\\t';
  		}
  		// Note: IE < 9 treats `'\v'` as `'v'`, so avoid using it.
  		// else if (codePoint == 0x0B) {
  		// 	string = '\\v';
  		// }
  		else if (codePoint == 0x0A) {
  			string = '\\n';
  		}
  		else if (codePoint == 0x0C) {
  			string = '\\f';
  		}
  		else if (codePoint == 0x0D) {
  			string = '\\r';
  		}
  		else if (codePoint == 0x5C) {
  			string = '\\\\';
  		}
  		else if (
  			codePoint == 0x24 ||
  			(codePoint >= 0x28 && codePoint <= 0x2B) ||
  			codePoint == 0x2D || codePoint == 0x2E || codePoint == 0x3F ||
  			(codePoint >= 0x5B && codePoint <= 0x5E) ||
  			(codePoint >= 0x7B && codePoint <= 0x7D)
  		) {
  			// The code point maps to an unsafe printable ASCII character;
  			// backslash-escape it. Here’s the list of those symbols:
  			//
  			//     $()*+-.?[\]^{|}
  			//
  			// See #7 for more info.
  			string = '\\' + stringFromCharCode(codePoint);
  		}
  		else if (codePoint >= 0x20 && codePoint <= 0x7E) {
  			// The code point maps to one of these printable ASCII symbols
  			// (including the space character):
  			//
  			//      !"#%&',/0123456789:;<=>@ABCDEFGHIJKLMNO
  			//     PQRSTUVWXYZ_`abcdefghijklmnopqrstuvwxyz~
  			//
  			// These can safely be used directly.
  			string = stringFromCharCode(codePoint);
  		}
  		else if (codePoint <= 0xFF) {
  			// https://mathiasbynens.be/notes/javascript-escapes#hexadecimal
  			string = '\\x' + pad(hex(codePoint), 2);
  		}
  		else { // `codePoint <= 0xFFFF` holds true.
  			// https://mathiasbynens.be/notes/javascript-escapes#unicode
  			string = '\\u' + pad(hex(codePoint), 4);
  		}

  		// There’s no need to account for astral symbols / surrogate pairs here,
  		// since `codePointToString` is private and only used for BMP code points.
  		// But if that’s what you need, just add an `else` block with this code:
  		//
  		//     string = '\\u' + pad(hex(highSurrogate(codePoint)), 4)
  		//     	+ '\\u' + pad(hex(lowSurrogate(codePoint)), 4);

  		return string;
  	};

  	var codePointToStringUnicode = function(codePoint) {
  		if (codePoint <= 0xFFFF) {
  			return codePointToString(codePoint);
  		}
  		return '\\u{' + codePoint.toString(16).toUpperCase() + '}';
  	};

  	var symbolToCodePoint = function(symbol) {
  		var length = symbol.length;
  		var first = symbol.charCodeAt(0);
  		var second;
  		if (
  			first >= HIGH_SURROGATE_MIN && first <= HIGH_SURROGATE_MAX &&
  			length > 1 // There is a next code unit.
  		) {
  			// `first` is a high surrogate, and there is a next character. Assume
  			// it’s a low surrogate (else it’s invalid usage of Regenerate anyway).
  			second = symbol.charCodeAt(1);
  			// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
  			return (first - HIGH_SURROGATE_MIN) * 0x400 +
  				second - LOW_SURROGATE_MIN + 0x10000;
  		}
  		return first;
  	};

  	var createBMPCharacterClasses = function(data) {
  		// Iterate over the data per `(start, end)` pair.
  		var result = '';
  		var index = 0;
  		var start;
  		var end;
  		var length = data.length;
  		if (dataIsSingleton(data)) {
  			return codePointToString(data[0]);
  		}
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1] - 1; // Note: the `- 1` makes `end` inclusive.
  			if (start == end) {
  				result += codePointToString(start);
  			} else if (start + 1 == end) {
  				result += codePointToString(start) + codePointToString(end);
  			} else {
  				result += codePointToString(start) + '-' + codePointToString(end);
  			}
  			index += 2;
  		}
  		return '[' + result + ']';
  	};

  	var createUnicodeCharacterClasses = function(data) {
  		// Iterate over the data per `(start, end)` pair.
  		var result = '';
  		var index = 0;
  		var start;
  		var end;
  		var length = data.length;
  		if (dataIsSingleton(data)) {
  			return codePointToStringUnicode(data[0]);
  		}
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1] - 1; // Note: the `- 1` makes `end` inclusive.
  			if (start == end) {
  				result += codePointToStringUnicode(start);
  			} else if (start + 1 == end) {
  				result += codePointToStringUnicode(start) + codePointToStringUnicode(end);
  			} else {
  				result += codePointToStringUnicode(start) + '-' + codePointToStringUnicode(end);
  			}
  			index += 2;
  		}
  		return '[' + result + ']';
  	};

  	var splitAtBMP = function(data) {
  		// Iterate over the data per `(start, end)` pair.
  		var loneHighSurrogates = [];
  		var loneLowSurrogates = [];
  		var bmp = [];
  		var astral = [];
  		var index = 0;
  		var start;
  		var end;
  		var length = data.length;
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1] - 1; // Note: the `- 1` makes `end` inclusive.

  			if (start < HIGH_SURROGATE_MIN) {

  				// The range starts and ends before the high surrogate range.
  				// E.g. (0, 0x10).
  				if (end < HIGH_SURROGATE_MIN) {
  					bmp.push(start, end + 1);
  				}

  				// The range starts before the high surrogate range and ends within it.
  				// E.g. (0, 0xD855).
  				if (end >= HIGH_SURROGATE_MIN && end <= HIGH_SURROGATE_MAX) {
  					bmp.push(start, HIGH_SURROGATE_MIN);
  					loneHighSurrogates.push(HIGH_SURROGATE_MIN, end + 1);
  				}

  				// The range starts before the high surrogate range and ends in the low
  				// surrogate range. E.g. (0, 0xDCFF).
  				if (end >= LOW_SURROGATE_MIN && end <= LOW_SURROGATE_MAX) {
  					bmp.push(start, HIGH_SURROGATE_MIN);
  					loneHighSurrogates.push(HIGH_SURROGATE_MIN, HIGH_SURROGATE_MAX + 1);
  					loneLowSurrogates.push(LOW_SURROGATE_MIN, end + 1);
  				}

  				// The range starts before the high surrogate range and ends after the
  				// low surrogate range. E.g. (0, 0x10FFFF).
  				if (end > LOW_SURROGATE_MAX) {
  					bmp.push(start, HIGH_SURROGATE_MIN);
  					loneHighSurrogates.push(HIGH_SURROGATE_MIN, HIGH_SURROGATE_MAX + 1);
  					loneLowSurrogates.push(LOW_SURROGATE_MIN, LOW_SURROGATE_MAX + 1);
  					if (end <= 0xFFFF) {
  						bmp.push(LOW_SURROGATE_MAX + 1, end + 1);
  					} else {
  						bmp.push(LOW_SURROGATE_MAX + 1, 0xFFFF + 1);
  						astral.push(0xFFFF + 1, end + 1);
  					}
  				}

  			} else if (start >= HIGH_SURROGATE_MIN && start <= HIGH_SURROGATE_MAX) {

  				// The range starts and ends in the high surrogate range.
  				// E.g. (0xD855, 0xD866).
  				if (end >= HIGH_SURROGATE_MIN && end <= HIGH_SURROGATE_MAX) {
  					loneHighSurrogates.push(start, end + 1);
  				}

  				// The range starts in the high surrogate range and ends in the low
  				// surrogate range. E.g. (0xD855, 0xDCFF).
  				if (end >= LOW_SURROGATE_MIN && end <= LOW_SURROGATE_MAX) {
  					loneHighSurrogates.push(start, HIGH_SURROGATE_MAX + 1);
  					loneLowSurrogates.push(LOW_SURROGATE_MIN, end + 1);
  				}

  				// The range starts in the high surrogate range and ends after the low
  				// surrogate range. E.g. (0xD855, 0x10FFFF).
  				if (end > LOW_SURROGATE_MAX) {
  					loneHighSurrogates.push(start, HIGH_SURROGATE_MAX + 1);
  					loneLowSurrogates.push(LOW_SURROGATE_MIN, LOW_SURROGATE_MAX + 1);
  					if (end <= 0xFFFF) {
  						bmp.push(LOW_SURROGATE_MAX + 1, end + 1);
  					} else {
  						bmp.push(LOW_SURROGATE_MAX + 1, 0xFFFF + 1);
  						astral.push(0xFFFF + 1, end + 1);
  					}
  				}

  			} else if (start >= LOW_SURROGATE_MIN && start <= LOW_SURROGATE_MAX) {

  				// The range starts and ends in the low surrogate range.
  				// E.g. (0xDCFF, 0xDDFF).
  				if (end >= LOW_SURROGATE_MIN && end <= LOW_SURROGATE_MAX) {
  					loneLowSurrogates.push(start, end + 1);
  				}

  				// The range starts in the low surrogate range and ends after the low
  				// surrogate range. E.g. (0xDCFF, 0x10FFFF).
  				if (end > LOW_SURROGATE_MAX) {
  					loneLowSurrogates.push(start, LOW_SURROGATE_MAX + 1);
  					if (end <= 0xFFFF) {
  						bmp.push(LOW_SURROGATE_MAX + 1, end + 1);
  					} else {
  						bmp.push(LOW_SURROGATE_MAX + 1, 0xFFFF + 1);
  						astral.push(0xFFFF + 1, end + 1);
  					}
  				}

  			} else if (start > LOW_SURROGATE_MAX && start <= 0xFFFF) {

  				// The range starts and ends after the low surrogate range.
  				// E.g. (0xFFAA, 0x10FFFF).
  				if (end <= 0xFFFF) {
  					bmp.push(start, end + 1);
  				} else {
  					bmp.push(start, 0xFFFF + 1);
  					astral.push(0xFFFF + 1, end + 1);
  				}

  			} else {

  				// The range starts and ends in the astral range.
  				astral.push(start, end + 1);

  			}

  			index += 2;
  		}
  		return {
  			'loneHighSurrogates': loneHighSurrogates,
  			'loneLowSurrogates': loneLowSurrogates,
  			'bmp': bmp,
  			'astral': astral
  		};
  	};

  	var optimizeSurrogateMappings = function(surrogateMappings) {
  		var result = [];
  		var tmpLow = [];
  		var addLow = false;
  		var mapping;
  		var nextMapping;
  		var highSurrogates;
  		var lowSurrogates;
  		var nextHighSurrogates;
  		var nextLowSurrogates;
  		var index = -1;
  		var length = surrogateMappings.length;
  		while (++index < length) {
  			mapping = surrogateMappings[index];
  			nextMapping = surrogateMappings[index + 1];
  			if (!nextMapping) {
  				result.push(mapping);
  				continue;
  			}
  			highSurrogates = mapping[0];
  			lowSurrogates = mapping[1];
  			nextHighSurrogates = nextMapping[0];
  			nextLowSurrogates = nextMapping[1];

  			// Check for identical high surrogate ranges.
  			tmpLow = lowSurrogates;
  			while (
  				nextHighSurrogates &&
  				highSurrogates[0] == nextHighSurrogates[0] &&
  				highSurrogates[1] == nextHighSurrogates[1]
  			) {
  				// Merge with the next item.
  				if (dataIsSingleton(nextLowSurrogates)) {
  					tmpLow = dataAdd(tmpLow, nextLowSurrogates[0]);
  				} else {
  					tmpLow = dataAddRange(
  						tmpLow,
  						nextLowSurrogates[0],
  						nextLowSurrogates[1] - 1
  					);
  				}
  				++index;
  				mapping = surrogateMappings[index];
  				highSurrogates = mapping[0];
  				lowSurrogates = mapping[1];
  				nextMapping = surrogateMappings[index + 1];
  				nextHighSurrogates = nextMapping && nextMapping[0];
  				nextLowSurrogates = nextMapping && nextMapping[1];
  				addLow = true;
  			}
  			result.push([
  				highSurrogates,
  				addLow ? tmpLow : lowSurrogates
  			]);
  			addLow = false;
  		}
  		return optimizeByLowSurrogates(result);
  	};

  	var optimizeByLowSurrogates = function(surrogateMappings) {
  		if (surrogateMappings.length == 1) {
  			return surrogateMappings;
  		}
  		var index = -1;
  		var innerIndex = -1;
  		while (++index < surrogateMappings.length) {
  			var mapping = surrogateMappings[index];
  			var lowSurrogates = mapping[1];
  			var lowSurrogateStart = lowSurrogates[0];
  			var lowSurrogateEnd = lowSurrogates[1];
  			innerIndex = index; // Note: the loop starts at the next index.
  			while (++innerIndex < surrogateMappings.length) {
  				var otherMapping = surrogateMappings[innerIndex];
  				var otherLowSurrogates = otherMapping[1];
  				var otherLowSurrogateStart = otherLowSurrogates[0];
  				var otherLowSurrogateEnd = otherLowSurrogates[1];
  				if (
  					lowSurrogateStart == otherLowSurrogateStart &&
  					lowSurrogateEnd == otherLowSurrogateEnd
  				) {
  					// Add the code points in the other item to this one.
  					if (dataIsSingleton(otherMapping[0])) {
  						mapping[0] = dataAdd(mapping[0], otherMapping[0][0]);
  					} else {
  						mapping[0] = dataAddRange(
  							mapping[0],
  							otherMapping[0][0],
  							otherMapping[0][1] - 1
  						);
  					}
  					// Remove the other, now redundant, item.
  					surrogateMappings.splice(innerIndex, 1);
  					--innerIndex;
  				}
  			}
  		}
  		return surrogateMappings;
  	};

  	var surrogateSet = function(data) {
  		// Exit early if `data` is an empty set.
  		if (!data.length) {
  			return [];
  		}

  		// Iterate over the data per `(start, end)` pair.
  		var index = 0;
  		var start;
  		var end;
  		var startHigh;
  		var startLow;
  		var prevStartHigh = 0;
  		var prevEndHigh = 0;
  		var tmpLow = [];
  		var endHigh;
  		var endLow;
  		var surrogateMappings = [];
  		var length = data.length;
  		var dataHigh = [];
  		while (index < length) {
  			start = data[index];
  			end = data[index + 1] - 1;

  			startHigh = highSurrogate(start);
  			startLow = lowSurrogate(start);
  			endHigh = highSurrogate(end);
  			endLow = lowSurrogate(end);

  			var startsWithLowestLowSurrogate = startLow == LOW_SURROGATE_MIN;
  			var endsWithHighestLowSurrogate = endLow == LOW_SURROGATE_MAX;
  			var complete = false;

  			// Append the previous high-surrogate-to-low-surrogate mappings.
  			// Step 1: `(startHigh, startLow)` to `(startHigh, LOW_SURROGATE_MAX)`.
  			if (
  				startHigh == endHigh ||
  				startsWithLowestLowSurrogate && endsWithHighestLowSurrogate
  			) {
  				surrogateMappings.push([
  					[startHigh, endHigh + 1],
  					[startLow, endLow + 1]
  				]);
  				complete = true;
  			} else {
  				surrogateMappings.push([
  					[startHigh, startHigh + 1],
  					[startLow, LOW_SURROGATE_MAX + 1]
  				]);
  			}

  			// Step 2: `(startHigh + 1, LOW_SURROGATE_MIN)` to
  			// `(endHigh - 1, LOW_SURROGATE_MAX)`.
  			if (!complete && startHigh + 1 < endHigh) {
  				if (endsWithHighestLowSurrogate) {
  					// Combine step 2 and step 3.
  					surrogateMappings.push([
  						[startHigh + 1, endHigh + 1],
  						[LOW_SURROGATE_MIN, endLow + 1]
  					]);
  					complete = true;
  				} else {
  					surrogateMappings.push([
  						[startHigh + 1, endHigh],
  						[LOW_SURROGATE_MIN, LOW_SURROGATE_MAX + 1]
  					]);
  				}
  			}

  			// Step 3. `(endHigh, LOW_SURROGATE_MIN)` to `(endHigh, endLow)`.
  			if (!complete) {
  				surrogateMappings.push([
  					[endHigh, endHigh + 1],
  					[LOW_SURROGATE_MIN, endLow + 1]
  				]);
  			}

  			prevStartHigh = startHigh;
  			prevEndHigh = endHigh;

  			index += 2;
  		}

  		// The format of `surrogateMappings` is as follows:
  		//
  		//     [ surrogateMapping1, surrogateMapping2 ]
  		//
  		// i.e.:
  		//
  		//     [
  		//       [ highSurrogates1, lowSurrogates1 ],
  		//       [ highSurrogates2, lowSurrogates2 ]
  		//     ]
  		return optimizeSurrogateMappings(surrogateMappings);
  	};

  	var createSurrogateCharacterClasses = function(surrogateMappings) {
  		var result = [];
  		forEach(surrogateMappings, function(surrogateMapping) {
  			var highSurrogates = surrogateMapping[0];
  			var lowSurrogates = surrogateMapping[1];
  			result.push(
  				createBMPCharacterClasses(highSurrogates) +
  				createBMPCharacterClasses(lowSurrogates)
  			);
  		});
  		return result.join('|');
  	};

  	var createCharacterClassesFromData = function(data, bmpOnly, hasUnicodeFlag) {
  		if (hasUnicodeFlag) {
  			return createUnicodeCharacterClasses(data);
  		}
  		var result = [];

  		var parts = splitAtBMP(data);
  		var loneHighSurrogates = parts.loneHighSurrogates;
  		var loneLowSurrogates = parts.loneLowSurrogates;
  		var bmp = parts.bmp;
  		var astral = parts.astral;
  		var hasAstral = !dataIsEmpty(parts.astral);
  		var hasLoneHighSurrogates = !dataIsEmpty(loneHighSurrogates);
  		var hasLoneLowSurrogates = !dataIsEmpty(loneLowSurrogates);

  		var surrogateMappings = surrogateSet(astral);

  		if (bmpOnly) {
  			bmp = dataAddData(bmp, loneHighSurrogates);
  			hasLoneHighSurrogates = false;
  			bmp = dataAddData(bmp, loneLowSurrogates);
  			hasLoneLowSurrogates = false;
  		}

  		if (!dataIsEmpty(bmp)) {
  			// The data set contains BMP code points that are not high surrogates
  			// needed for astral code points in the set.
  			result.push(createBMPCharacterClasses(bmp));
  		}
  		if (surrogateMappings.length) {
  			// The data set contains astral code points; append character classes
  			// based on their surrogate pairs.
  			result.push(createSurrogateCharacterClasses(surrogateMappings));
  		}
  		// https://gist.github.com/mathiasbynens/bbe7f870208abcfec860
  		if (hasLoneHighSurrogates) {
  			result.push(
  				createBMPCharacterClasses(loneHighSurrogates) +
  				// Make sure the high surrogates aren’t part of a surrogate pair.
  				'(?![\\uDC00-\\uDFFF])'
  			);
  		}
  		if (hasLoneLowSurrogates) {
  			result.push(
  				// It is not possible to accurately assert the low surrogates aren’t
  				// part of a surrogate pair, since JavaScript regular expressions do
  				// not support lookbehind.
  				'(?:[^\\uD800-\\uDBFF]|^)' +
  				createBMPCharacterClasses(loneLowSurrogates)
  			);
  		}
  		return result.join('|');
  	};

  	/*--------------------------------------------------------------------------*/

  	// `regenerate` can be used as a constructor (and new methods can be added to
  	// its prototype) but also as a regular function, the latter of which is the
  	// documented and most common usage. For that reason, it’s not capitalized.
  	var regenerate = function(value) {
  		if (arguments.length > 1) {
  			value = slice.call(arguments);
  		}
  		if (this instanceof regenerate) {
  			this.data = [];
  			return value ? this.add(value) : this;
  		}
  		return (new regenerate).add(value);
  	};

  	regenerate.version = '1.3.1';

  	var proto = regenerate.prototype;
  	extend(proto, {
  		'add': function(value) {
  			var $this = this;
  			if (value == null) {
  				return $this;
  			}
  			if (value instanceof regenerate) {
  				// Allow passing other Regenerate instances.
  				$this.data = dataAddData($this.data, value.data);
  				return $this;
  			}
  			if (arguments.length > 1) {
  				value = slice.call(arguments);
  			}
  			if (isArray(value)) {
  				forEach(value, function(item) {
  					$this.add(item);
  				});
  				return $this;
  			}
  			$this.data = dataAdd(
  				$this.data,
  				isNumber(value) ? value : symbolToCodePoint(value)
  			);
  			return $this;
  		},
  		'remove': function(value) {
  			var $this = this;
  			if (value == null) {
  				return $this;
  			}
  			if (value instanceof regenerate) {
  				// Allow passing other Regenerate instances.
  				$this.data = dataRemoveData($this.data, value.data);
  				return $this;
  			}
  			if (arguments.length > 1) {
  				value = slice.call(arguments);
  			}
  			if (isArray(value)) {
  				forEach(value, function(item) {
  					$this.remove(item);
  				});
  				return $this;
  			}
  			$this.data = dataRemove(
  				$this.data,
  				isNumber(value) ? value : symbolToCodePoint(value)
  			);
  			return $this;
  		},
  		'addRange': function(start, end) {
  			var $this = this;
  			$this.data = dataAddRange($this.data,
  				isNumber(start) ? start : symbolToCodePoint(start),
  				isNumber(end) ? end : symbolToCodePoint(end)
  			);
  			return $this;
  		},
  		'removeRange': function(start, end) {
  			var $this = this;
  			var startCodePoint = isNumber(start) ? start : symbolToCodePoint(start);
  			var endCodePoint = isNumber(end) ? end : symbolToCodePoint(end);
  			$this.data = dataRemoveRange(
  				$this.data,
  				startCodePoint,
  				endCodePoint
  			);
  			return $this;
  		},
  		'intersection': function(argument) {
  			var $this = this;
  			// Allow passing other Regenerate instances.
  			// TODO: Optimize this by writing and using `dataIntersectionData()`.
  			var array = argument instanceof regenerate ?
  				dataToArray(argument.data) :
  				argument;
  			$this.data = dataIntersection($this.data, array);
  			return $this;
  		},
  		'contains': function(codePoint) {
  			return dataContains(
  				this.data,
  				isNumber(codePoint) ? codePoint : symbolToCodePoint(codePoint)
  			);
  		},
  		'clone': function() {
  			var set = new regenerate;
  			set.data = this.data.slice(0);
  			return set;
  		},
  		'toString': function(options) {
  			var result = createCharacterClassesFromData(
  				this.data,
  				options ? options.bmpOnly : false,
  				options ? options.hasUnicodeFlag : false
  			);
  			if (!result) {
  				// For an empty set, return something that can be inserted `/here/` to
  				// form a valid regular expression. Avoid `(?:)` since that matches the
  				// empty string.
  				return '[]';
  			}
  			// Use `\0` instead of `\x00` where possible.
  			return result.replace(regexNull, '\\0$1');
  		},
  		'toRegExp': function(flags) {
  			var pattern = this.toString(
  				flags && flags.indexOf('u') != -1 ?
  					{ 'hasUnicodeFlag': true } :
  					null
  			);
  			return RegExp(pattern, flags || '');
  		},
  		'valueOf': function() { // Note: `valueOf` is aliased as `toArray`.
  			return dataToArray(this.data);
  		}
  	});

  	proto.toArray = proto.valueOf;

  	// Some AMD build optimizers, like r.js, check for specific condition patterns
  	// like the following:
  	if (
  		typeof define == 'function' &&
  		typeof define.amd == 'object' &&
  		define.amd
  	) {
  		define(function() {
  			return regenerate;
  		});
  	}	else if (freeExports && !freeExports.nodeType) {
  		if (freeModule) { // in Node.js, io.js, or RingoJS v0.8.0+
  			freeModule.exports = regenerate;
  		} else { // in Narwhal or RingoJS v0.7.0-
  			freeExports.regenerate = regenerate;
  		}
  	} else { // in Rhino or a web browser
  		root.regenerate = regenerate;
  	}

  }(__commonjs_global));
  });

  var require$$0$2 = (regenerate && typeof regenerate === 'object' && 'default' in regenerate ? regenerate['default'] : regenerate);

  var characterClassEscapeSets = __commonjs(function (module, exports) {
  // Generated using `npm run build`. Do not edit.
  'use strict';

  var regenerate = require$$0$2;

  exports.REGULAR = new Map([
  	['d', regenerate()
  		.addRange(0x30, 0x39)],
  	['D', regenerate()
  		.addRange(0x0, 0x2F)
  		.addRange(0x3A, 0xFFFF)],
  	['s', regenerate(0x20, 0xA0, 0x1680, 0x202F, 0x205F, 0x3000, 0xFEFF)
  		.addRange(0x9, 0xD)
  		.addRange(0x2000, 0x200A)
  		.addRange(0x2028, 0x2029)],
  	['S', regenerate()
  		.addRange(0x0, 0x8)
  		.addRange(0xE, 0x1F)
  		.addRange(0x21, 0x9F)
  		.addRange(0xA1, 0x167F)
  		.addRange(0x1681, 0x1FFF)
  		.addRange(0x200B, 0x2027)
  		.addRange(0x202A, 0x202E)
  		.addRange(0x2030, 0x205E)
  		.addRange(0x2060, 0x2FFF)
  		.addRange(0x3001, 0xFEFE)
  		.addRange(0xFF00, 0xFFFF)],
  	['w', regenerate(0x5F)
  		.addRange(0x30, 0x39)
  		.addRange(0x41, 0x5A)
  		.addRange(0x61, 0x7A)],
  	['W', regenerate(0x60)
  		.addRange(0x0, 0x2F)
  		.addRange(0x3A, 0x40)
  		.addRange(0x5B, 0x5E)
  		.addRange(0x7B, 0xFFFF)]
  ]);

  exports.UNICODE = new Map([
  	['d', regenerate()
  		.addRange(0x30, 0x39)],
  	['D', regenerate()
  		.addRange(0x0, 0x2F)
  		.addRange(0x3A, 0x10FFFF)],
  	['s', regenerate(0x20, 0xA0, 0x1680, 0x202F, 0x205F, 0x3000, 0xFEFF)
  		.addRange(0x9, 0xD)
  		.addRange(0x2000, 0x200A)
  		.addRange(0x2028, 0x2029)],
  	['S', regenerate()
  		.addRange(0x0, 0x8)
  		.addRange(0xE, 0x1F)
  		.addRange(0x21, 0x9F)
  		.addRange(0xA1, 0x167F)
  		.addRange(0x1681, 0x1FFF)
  		.addRange(0x200B, 0x2027)
  		.addRange(0x202A, 0x202E)
  		.addRange(0x2030, 0x205E)
  		.addRange(0x2060, 0x2FFF)
  		.addRange(0x3001, 0xFEFE)
  		.addRange(0xFF00, 0x10FFFF)],
  	['w', regenerate(0x5F)
  		.addRange(0x30, 0x39)
  		.addRange(0x41, 0x5A)
  		.addRange(0x61, 0x7A)],
  	['W', regenerate(0x60)
  		.addRange(0x0, 0x2F)
  		.addRange(0x3A, 0x40)
  		.addRange(0x5B, 0x5E)
  		.addRange(0x7B, 0x10FFFF)]
  ]);

  exports.UNICODE_IGNORE_CASE = new Map([
  	['d', regenerate()
  		.addRange(0x30, 0x39)],
  	['D', regenerate()
  		.addRange(0x0, 0x2F)
  		.addRange(0x3A, 0x10FFFF)],
  	['s', regenerate(0x20, 0xA0, 0x1680, 0x202F, 0x205F, 0x3000, 0xFEFF)
  		.addRange(0x9, 0xD)
  		.addRange(0x2000, 0x200A)
  		.addRange(0x2028, 0x2029)],
  	['S', regenerate()
  		.addRange(0x0, 0x8)
  		.addRange(0xE, 0x1F)
  		.addRange(0x21, 0x9F)
  		.addRange(0xA1, 0x167F)
  		.addRange(0x1681, 0x1FFF)
  		.addRange(0x200B, 0x2027)
  		.addRange(0x202A, 0x202E)
  		.addRange(0x2030, 0x205E)
  		.addRange(0x2060, 0x2FFF)
  		.addRange(0x3001, 0xFEFE)
  		.addRange(0xFF00, 0x10FFFF)],
  	['w', regenerate(0x5F, 0x17F, 0x212A)
  		.addRange(0x30, 0x39)
  		.addRange(0x41, 0x5A)
  		.addRange(0x61, 0x7A)],
  	['W', regenerate(0x4B, 0x53, 0x60)
  		.addRange(0x0, 0x2F)
  		.addRange(0x3A, 0x40)
  		.addRange(0x5B, 0x5E)
  		.addRange(0x7B, 0x10FFFF)]
  ]);
  });

  var require$$0$1 = (characterClassEscapeSets && typeof characterClassEscapeSets === 'object' && 'default' in characterClassEscapeSets ? characterClassEscapeSets['default'] : characterClassEscapeSets);

  var iuMappings = __commonjs(function (module) {
  module.exports = new Map([
  	[0x4B, 0x212A],
  	[0x53, 0x17F],
  	[0x6B, 0x212A],
  	[0x73, 0x17F],
  	[0xB5, 0x39C],
  	[0xC5, 0x212B],
  	[0xDF, 0x1E9E],
  	[0xE5, 0x212B],
  	[0x17F, 0x53],
  	[0x1C4, 0x1C5],
  	[0x1C5, 0x1C4],
  	[0x1C7, 0x1C8],
  	[0x1C8, 0x1C7],
  	[0x1CA, 0x1CB],
  	[0x1CB, 0x1CA],
  	[0x1F1, 0x1F2],
  	[0x1F2, 0x1F1],
  	[0x29D, 0xA7B2],
  	[0x345, 0x1FBE],
  	[0x392, 0x3D0],
  	[0x395, 0x3F5],
  	[0x398, 0x3F4],
  	[0x399, 0x1FBE],
  	[0x39A, 0x3F0],
  	[0x39C, 0xB5],
  	[0x3A0, 0x3D6],
  	[0x3A1, 0x3F1],
  	[0x3A3, 0x3C2],
  	[0x3A6, 0x3D5],
  	[0x3A9, 0x2126],
  	[0x3B8, 0x3F4],
  	[0x3C2, 0x3A3],
  	[0x3C9, 0x2126],
  	[0x3D0, 0x392],
  	[0x3D1, 0x3F4],
  	[0x3D5, 0x3A6],
  	[0x3D6, 0x3A0],
  	[0x3F0, 0x39A],
  	[0x3F1, 0x3A1],
  	[0x3F4, [
  		0x398,
  		0x3D1,
  		0x3B8
  	]],
  	[0x3F5, 0x395],
  	[0x13A0, 0xAB70],
  	[0x13A1, 0xAB71],
  	[0x13A2, 0xAB72],
  	[0x13A3, 0xAB73],
  	[0x13A4, 0xAB74],
  	[0x13A5, 0xAB75],
  	[0x13A6, 0xAB76],
  	[0x13A7, 0xAB77],
  	[0x13A8, 0xAB78],
  	[0x13A9, 0xAB79],
  	[0x13AA, 0xAB7A],
  	[0x13AB, 0xAB7B],
  	[0x13AC, 0xAB7C],
  	[0x13AD, 0xAB7D],
  	[0x13AE, 0xAB7E],
  	[0x13AF, 0xAB7F],
  	[0x13B0, 0xAB80],
  	[0x13B1, 0xAB81],
  	[0x13B2, 0xAB82],
  	[0x13B3, 0xAB83],
  	[0x13B4, 0xAB84],
  	[0x13B5, 0xAB85],
  	[0x13B6, 0xAB86],
  	[0x13B7, 0xAB87],
  	[0x13B8, 0xAB88],
  	[0x13B9, 0xAB89],
  	[0x13BA, 0xAB8A],
  	[0x13BB, 0xAB8B],
  	[0x13BC, 0xAB8C],
  	[0x13BD, 0xAB8D],
  	[0x13BE, 0xAB8E],
  	[0x13BF, 0xAB8F],
  	[0x13C0, 0xAB90],
  	[0x13C1, 0xAB91],
  	[0x13C2, 0xAB92],
  	[0x13C3, 0xAB93],
  	[0x13C4, 0xAB94],
  	[0x13C5, 0xAB95],
  	[0x13C6, 0xAB96],
  	[0x13C7, 0xAB97],
  	[0x13C8, 0xAB98],
  	[0x13C9, 0xAB99],
  	[0x13CA, 0xAB9A],
  	[0x13CB, 0xAB9B],
  	[0x13CC, 0xAB9C],
  	[0x13CD, 0xAB9D],
  	[0x13CE, 0xAB9E],
  	[0x13CF, 0xAB9F],
  	[0x13D0, 0xABA0],
  	[0x13D1, 0xABA1],
  	[0x13D2, 0xABA2],
  	[0x13D3, 0xABA3],
  	[0x13D4, 0xABA4],
  	[0x13D5, 0xABA5],
  	[0x13D6, 0xABA6],
  	[0x13D7, 0xABA7],
  	[0x13D8, 0xABA8],
  	[0x13D9, 0xABA9],
  	[0x13DA, 0xABAA],
  	[0x13DB, 0xABAB],
  	[0x13DC, 0xABAC],
  	[0x13DD, 0xABAD],
  	[0x13DE, 0xABAE],
  	[0x13DF, 0xABAF],
  	[0x13E0, 0xABB0],
  	[0x13E1, 0xABB1],
  	[0x13E2, 0xABB2],
  	[0x13E3, 0xABB3],
  	[0x13E4, 0xABB4],
  	[0x13E5, 0xABB5],
  	[0x13E6, 0xABB6],
  	[0x13E7, 0xABB7],
  	[0x13E8, 0xABB8],
  	[0x13E9, 0xABB9],
  	[0x13EA, 0xABBA],
  	[0x13EB, 0xABBB],
  	[0x13EC, 0xABBC],
  	[0x13ED, 0xABBD],
  	[0x13EE, 0xABBE],
  	[0x13EF, 0xABBF],
  	[0x13F0, 0x13F8],
  	[0x13F1, 0x13F9],
  	[0x13F2, 0x13FA],
  	[0x13F3, 0x13FB],
  	[0x13F4, 0x13FC],
  	[0x13F5, 0x13FD],
  	[0x13F8, 0x13F0],
  	[0x13F9, 0x13F1],
  	[0x13FA, 0x13F2],
  	[0x13FB, 0x13F3],
  	[0x13FC, 0x13F4],
  	[0x13FD, 0x13F5],
  	[0x1E60, 0x1E9B],
  	[0x1E9B, 0x1E60],
  	[0x1E9E, 0xDF],
  	[0x1F80, 0x1F88],
  	[0x1F81, 0x1F89],
  	[0x1F82, 0x1F8A],
  	[0x1F83, 0x1F8B],
  	[0x1F84, 0x1F8C],
  	[0x1F85, 0x1F8D],
  	[0x1F86, 0x1F8E],
  	[0x1F87, 0x1F8F],
  	[0x1F88, 0x1F80],
  	[0x1F89, 0x1F81],
  	[0x1F8A, 0x1F82],
  	[0x1F8B, 0x1F83],
  	[0x1F8C, 0x1F84],
  	[0x1F8D, 0x1F85],
  	[0x1F8E, 0x1F86],
  	[0x1F8F, 0x1F87],
  	[0x1F90, 0x1F98],
  	[0x1F91, 0x1F99],
  	[0x1F92, 0x1F9A],
  	[0x1F93, 0x1F9B],
  	[0x1F94, 0x1F9C],
  	[0x1F95, 0x1F9D],
  	[0x1F96, 0x1F9E],
  	[0x1F97, 0x1F9F],
  	[0x1F98, 0x1F90],
  	[0x1F99, 0x1F91],
  	[0x1F9A, 0x1F92],
  	[0x1F9B, 0x1F93],
  	[0x1F9C, 0x1F94],
  	[0x1F9D, 0x1F95],
  	[0x1F9E, 0x1F96],
  	[0x1F9F, 0x1F97],
  	[0x1FA0, 0x1FA8],
  	[0x1FA1, 0x1FA9],
  	[0x1FA2, 0x1FAA],
  	[0x1FA3, 0x1FAB],
  	[0x1FA4, 0x1FAC],
  	[0x1FA5, 0x1FAD],
  	[0x1FA6, 0x1FAE],
  	[0x1FA7, 0x1FAF],
  	[0x1FA8, 0x1FA0],
  	[0x1FA9, 0x1FA1],
  	[0x1FAA, 0x1FA2],
  	[0x1FAB, 0x1FA3],
  	[0x1FAC, 0x1FA4],
  	[0x1FAD, 0x1FA5],
  	[0x1FAE, 0x1FA6],
  	[0x1FAF, 0x1FA7],
  	[0x1FB3, 0x1FBC],
  	[0x1FBC, 0x1FB3],
  	[0x1FBE, [
  		0x345,
  		0x399
  	]],
  	[0x1FC3, 0x1FCC],
  	[0x1FCC, 0x1FC3],
  	[0x1FF3, 0x1FFC],
  	[0x1FFC, 0x1FF3],
  	[0x2126, [
  		0x3A9,
  		0x3C9
  	]],
  	[0x212A, 0x4B],
  	[0x212B, [
  		0xC5,
  		0xE5
  	]],
  	[0xA7B2, 0x29D],
  	[0xA7B3, 0xAB53],
  	[0xA7B4, 0xA7B5],
  	[0xA7B5, 0xA7B4],
  	[0xA7B6, 0xA7B7],
  	[0xA7B7, 0xA7B6],
  	[0xAB53, 0xA7B3],
  	[0xAB70, 0x13A0],
  	[0xAB71, 0x13A1],
  	[0xAB72, 0x13A2],
  	[0xAB73, 0x13A3],
  	[0xAB74, 0x13A4],
  	[0xAB75, 0x13A5],
  	[0xAB76, 0x13A6],
  	[0xAB77, 0x13A7],
  	[0xAB78, 0x13A8],
  	[0xAB79, 0x13A9],
  	[0xAB7A, 0x13AA],
  	[0xAB7B, 0x13AB],
  	[0xAB7C, 0x13AC],
  	[0xAB7D, 0x13AD],
  	[0xAB7E, 0x13AE],
  	[0xAB7F, 0x13AF],
  	[0xAB80, 0x13B0],
  	[0xAB81, 0x13B1],
  	[0xAB82, 0x13B2],
  	[0xAB83, 0x13B3],
  	[0xAB84, 0x13B4],
  	[0xAB85, 0x13B5],
  	[0xAB86, 0x13B6],
  	[0xAB87, 0x13B7],
  	[0xAB88, 0x13B8],
  	[0xAB89, 0x13B9],
  	[0xAB8A, 0x13BA],
  	[0xAB8B, 0x13BB],
  	[0xAB8C, 0x13BC],
  	[0xAB8D, 0x13BD],
  	[0xAB8E, 0x13BE],
  	[0xAB8F, 0x13BF],
  	[0xAB90, 0x13C0],
  	[0xAB91, 0x13C1],
  	[0xAB92, 0x13C2],
  	[0xAB93, 0x13C3],
  	[0xAB94, 0x13C4],
  	[0xAB95, 0x13C5],
  	[0xAB96, 0x13C6],
  	[0xAB97, 0x13C7],
  	[0xAB98, 0x13C8],
  	[0xAB99, 0x13C9],
  	[0xAB9A, 0x13CA],
  	[0xAB9B, 0x13CB],
  	[0xAB9C, 0x13CC],
  	[0xAB9D, 0x13CD],
  	[0xAB9E, 0x13CE],
  	[0xAB9F, 0x13CF],
  	[0xABA0, 0x13D0],
  	[0xABA1, 0x13D1],
  	[0xABA2, 0x13D2],
  	[0xABA3, 0x13D3],
  	[0xABA4, 0x13D4],
  	[0xABA5, 0x13D5],
  	[0xABA6, 0x13D6],
  	[0xABA7, 0x13D7],
  	[0xABA8, 0x13D8],
  	[0xABA9, 0x13D9],
  	[0xABAA, 0x13DA],
  	[0xABAB, 0x13DB],
  	[0xABAC, 0x13DC],
  	[0xABAD, 0x13DD],
  	[0xABAE, 0x13DE],
  	[0xABAF, 0x13DF],
  	[0xABB0, 0x13E0],
  	[0xABB1, 0x13E1],
  	[0xABB2, 0x13E2],
  	[0xABB3, 0x13E3],
  	[0xABB4, 0x13E4],
  	[0xABB5, 0x13E5],
  	[0xABB6, 0x13E6],
  	[0xABB7, 0x13E7],
  	[0xABB8, 0x13E8],
  	[0xABB9, 0x13E9],
  	[0xABBA, 0x13EA],
  	[0xABBB, 0x13EB],
  	[0xABBC, 0x13EC],
  	[0xABBD, 0x13ED],
  	[0xABBE, 0x13EE],
  	[0xABBF, 0x13EF],
  	[0x10400, 0x10428],
  	[0x10401, 0x10429],
  	[0x10402, 0x1042A],
  	[0x10403, 0x1042B],
  	[0x10404, 0x1042C],
  	[0x10405, 0x1042D],
  	[0x10406, 0x1042E],
  	[0x10407, 0x1042F],
  	[0x10408, 0x10430],
  	[0x10409, 0x10431],
  	[0x1040A, 0x10432],
  	[0x1040B, 0x10433],
  	[0x1040C, 0x10434],
  	[0x1040D, 0x10435],
  	[0x1040E, 0x10436],
  	[0x1040F, 0x10437],
  	[0x10410, 0x10438],
  	[0x10411, 0x10439],
  	[0x10412, 0x1043A],
  	[0x10413, 0x1043B],
  	[0x10414, 0x1043C],
  	[0x10415, 0x1043D],
  	[0x10416, 0x1043E],
  	[0x10417, 0x1043F],
  	[0x10418, 0x10440],
  	[0x10419, 0x10441],
  	[0x1041A, 0x10442],
  	[0x1041B, 0x10443],
  	[0x1041C, 0x10444],
  	[0x1041D, 0x10445],
  	[0x1041E, 0x10446],
  	[0x1041F, 0x10447],
  	[0x10420, 0x10448],
  	[0x10421, 0x10449],
  	[0x10422, 0x1044A],
  	[0x10423, 0x1044B],
  	[0x10424, 0x1044C],
  	[0x10425, 0x1044D],
  	[0x10426, 0x1044E],
  	[0x10427, 0x1044F],
  	[0x10428, 0x10400],
  	[0x10429, 0x10401],
  	[0x1042A, 0x10402],
  	[0x1042B, 0x10403],
  	[0x1042C, 0x10404],
  	[0x1042D, 0x10405],
  	[0x1042E, 0x10406],
  	[0x1042F, 0x10407],
  	[0x10430, 0x10408],
  	[0x10431, 0x10409],
  	[0x10432, 0x1040A],
  	[0x10433, 0x1040B],
  	[0x10434, 0x1040C],
  	[0x10435, 0x1040D],
  	[0x10436, 0x1040E],
  	[0x10437, 0x1040F],
  	[0x10438, 0x10410],
  	[0x10439, 0x10411],
  	[0x1043A, 0x10412],
  	[0x1043B, 0x10413],
  	[0x1043C, 0x10414],
  	[0x1043D, 0x10415],
  	[0x1043E, 0x10416],
  	[0x1043F, 0x10417],
  	[0x10440, 0x10418],
  	[0x10441, 0x10419],
  	[0x10442, 0x1041A],
  	[0x10443, 0x1041B],
  	[0x10444, 0x1041C],
  	[0x10445, 0x1041D],
  	[0x10446, 0x1041E],
  	[0x10447, 0x1041F],
  	[0x10448, 0x10420],
  	[0x10449, 0x10421],
  	[0x1044A, 0x10422],
  	[0x1044B, 0x10423],
  	[0x1044C, 0x10424],
  	[0x1044D, 0x10425],
  	[0x1044E, 0x10426],
  	[0x1044F, 0x10427],
  	[0x10C80, 0x10CC0],
  	[0x10C81, 0x10CC1],
  	[0x10C82, 0x10CC2],
  	[0x10C83, 0x10CC3],
  	[0x10C84, 0x10CC4],
  	[0x10C85, 0x10CC5],
  	[0x10C86, 0x10CC6],
  	[0x10C87, 0x10CC7],
  	[0x10C88, 0x10CC8],
  	[0x10C89, 0x10CC9],
  	[0x10C8A, 0x10CCA],
  	[0x10C8B, 0x10CCB],
  	[0x10C8C, 0x10CCC],
  	[0x10C8D, 0x10CCD],
  	[0x10C8E, 0x10CCE],
  	[0x10C8F, 0x10CCF],
  	[0x10C90, 0x10CD0],
  	[0x10C91, 0x10CD1],
  	[0x10C92, 0x10CD2],
  	[0x10C93, 0x10CD3],
  	[0x10C94, 0x10CD4],
  	[0x10C95, 0x10CD5],
  	[0x10C96, 0x10CD6],
  	[0x10C97, 0x10CD7],
  	[0x10C98, 0x10CD8],
  	[0x10C99, 0x10CD9],
  	[0x10C9A, 0x10CDA],
  	[0x10C9B, 0x10CDB],
  	[0x10C9C, 0x10CDC],
  	[0x10C9D, 0x10CDD],
  	[0x10C9E, 0x10CDE],
  	[0x10C9F, 0x10CDF],
  	[0x10CA0, 0x10CE0],
  	[0x10CA1, 0x10CE1],
  	[0x10CA2, 0x10CE2],
  	[0x10CA3, 0x10CE3],
  	[0x10CA4, 0x10CE4],
  	[0x10CA5, 0x10CE5],
  	[0x10CA6, 0x10CE6],
  	[0x10CA7, 0x10CE7],
  	[0x10CA8, 0x10CE8],
  	[0x10CA9, 0x10CE9],
  	[0x10CAA, 0x10CEA],
  	[0x10CAB, 0x10CEB],
  	[0x10CAC, 0x10CEC],
  	[0x10CAD, 0x10CED],
  	[0x10CAE, 0x10CEE],
  	[0x10CAF, 0x10CEF],
  	[0x10CB0, 0x10CF0],
  	[0x10CB1, 0x10CF1],
  	[0x10CB2, 0x10CF2],
  	[0x10CC0, 0x10C80],
  	[0x10CC1, 0x10C81],
  	[0x10CC2, 0x10C82],
  	[0x10CC3, 0x10C83],
  	[0x10CC4, 0x10C84],
  	[0x10CC5, 0x10C85],
  	[0x10CC6, 0x10C86],
  	[0x10CC7, 0x10C87],
  	[0x10CC8, 0x10C88],
  	[0x10CC9, 0x10C89],
  	[0x10CCA, 0x10C8A],
  	[0x10CCB, 0x10C8B],
  	[0x10CCC, 0x10C8C],
  	[0x10CCD, 0x10C8D],
  	[0x10CCE, 0x10C8E],
  	[0x10CCF, 0x10C8F],
  	[0x10CD0, 0x10C90],
  	[0x10CD1, 0x10C91],
  	[0x10CD2, 0x10C92],
  	[0x10CD3, 0x10C93],
  	[0x10CD4, 0x10C94],
  	[0x10CD5, 0x10C95],
  	[0x10CD6, 0x10C96],
  	[0x10CD7, 0x10C97],
  	[0x10CD8, 0x10C98],
  	[0x10CD9, 0x10C99],
  	[0x10CDA, 0x10C9A],
  	[0x10CDB, 0x10C9B],
  	[0x10CDC, 0x10C9C],
  	[0x10CDD, 0x10C9D],
  	[0x10CDE, 0x10C9E],
  	[0x10CDF, 0x10C9F],
  	[0x10CE0, 0x10CA0],
  	[0x10CE1, 0x10CA1],
  	[0x10CE2, 0x10CA2],
  	[0x10CE3, 0x10CA3],
  	[0x10CE4, 0x10CA4],
  	[0x10CE5, 0x10CA5],
  	[0x10CE6, 0x10CA6],
  	[0x10CE7, 0x10CA7],
  	[0x10CE8, 0x10CA8],
  	[0x10CE9, 0x10CA9],
  	[0x10CEA, 0x10CAA],
  	[0x10CEB, 0x10CAB],
  	[0x10CEC, 0x10CAC],
  	[0x10CED, 0x10CAD],
  	[0x10CEE, 0x10CAE],
  	[0x10CEF, 0x10CAF],
  	[0x10CF0, 0x10CB0],
  	[0x10CF1, 0x10CB1],
  	[0x10CF2, 0x10CB2],
  	[0x118A0, 0x118C0],
  	[0x118A1, 0x118C1],
  	[0x118A2, 0x118C2],
  	[0x118A3, 0x118C3],
  	[0x118A4, 0x118C4],
  	[0x118A5, 0x118C5],
  	[0x118A6, 0x118C6],
  	[0x118A7, 0x118C7],
  	[0x118A8, 0x118C8],
  	[0x118A9, 0x118C9],
  	[0x118AA, 0x118CA],
  	[0x118AB, 0x118CB],
  	[0x118AC, 0x118CC],
  	[0x118AD, 0x118CD],
  	[0x118AE, 0x118CE],
  	[0x118AF, 0x118CF],
  	[0x118B0, 0x118D0],
  	[0x118B1, 0x118D1],
  	[0x118B2, 0x118D2],
  	[0x118B3, 0x118D3],
  	[0x118B4, 0x118D4],
  	[0x118B5, 0x118D5],
  	[0x118B6, 0x118D6],
  	[0x118B7, 0x118D7],
  	[0x118B8, 0x118D8],
  	[0x118B9, 0x118D9],
  	[0x118BA, 0x118DA],
  	[0x118BB, 0x118DB],
  	[0x118BC, 0x118DC],
  	[0x118BD, 0x118DD],
  	[0x118BE, 0x118DE],
  	[0x118BF, 0x118DF],
  	[0x118C0, 0x118A0],
  	[0x118C1, 0x118A1],
  	[0x118C2, 0x118A2],
  	[0x118C3, 0x118A3],
  	[0x118C4, 0x118A4],
  	[0x118C5, 0x118A5],
  	[0x118C6, 0x118A6],
  	[0x118C7, 0x118A7],
  	[0x118C8, 0x118A8],
  	[0x118C9, 0x118A9],
  	[0x118CA, 0x118AA],
  	[0x118CB, 0x118AB],
  	[0x118CC, 0x118AC],
  	[0x118CD, 0x118AD],
  	[0x118CE, 0x118AE],
  	[0x118CF, 0x118AF],
  	[0x118D0, 0x118B0],
  	[0x118D1, 0x118B1],
  	[0x118D2, 0x118B2],
  	[0x118D3, 0x118B3],
  	[0x118D4, 0x118B4],
  	[0x118D5, 0x118B5],
  	[0x118D6, 0x118B6],
  	[0x118D7, 0x118B7],
  	[0x118D8, 0x118B8],
  	[0x118D9, 0x118B9],
  	[0x118DA, 0x118BA],
  	[0x118DB, 0x118BB],
  	[0x118DC, 0x118BC],
  	[0x118DD, 0x118BD],
  	[0x118DE, 0x118BE],
  	[0x118DF, 0x118BF]
  ]);
  });

  var require$$1 = (iuMappings && typeof iuMappings === 'object' && 'default' in iuMappings ? iuMappings['default'] : iuMappings);

  var index = __commonjs(function (module) {
  module.exports = [
  	'Bidi_Class',
  	'Bidi_Paired_Bracket_Type',
  	'Binary_Property',
  	'Block',
  	'General_Category',
  	'Script',
  	'Script_Extensions'
  ];
  });

  var require$$2 = (index && typeof index === 'object' && 'default' in index ? index['default'] : index);

  var mappings = __commonjs(function (module) {
  module.exports = {
  	'aliasToProperty': new Map([
  		['cjkaccountingnumeric', 'kAccountingNumeric'],
  		['kaccountingnumeric', 'kAccountingNumeric'],
  		['cjkothernumeric', 'kOtherNumeric'],
  		['kothernumeric', 'kOtherNumeric'],
  		['cjkprimarynumeric', 'kPrimaryNumeric'],
  		['kprimarynumeric', 'kPrimaryNumeric'],
  		['nv', 'Numeric_Value'],
  		['numericvalue', 'Numeric_Value'],
  		['cf', 'Case_Folding'],
  		['casefolding', 'Case_Folding'],
  		['cjkcompatibilityvariant', 'kCompatibilityVariant'],
  		['kcompatibilityvariant', 'kCompatibilityVariant'],
  		['dm', 'Decomposition_Mapping'],
  		['decompositionmapping', 'Decomposition_Mapping'],
  		['fcnfkc', 'FC_NFKC_Closure'],
  		['fcnfkcclosure', 'FC_NFKC_Closure'],
  		['lc', 'Lowercase_Mapping'],
  		['lowercasemapping', 'Lowercase_Mapping'],
  		['nfkccf', 'NFKC_Casefold'],
  		['nfkccasefold', 'NFKC_Casefold'],
  		['scf', 'Simple_Case_Folding'],
  		['simplecasefolding', 'Simple_Case_Folding'],
  		['sfc', 'Simple_Case_Folding'],
  		['slc', 'Simple_Lowercase_Mapping'],
  		['simplelowercasemapping', 'Simple_Lowercase_Mapping'],
  		['stc', 'Simple_Titlecase_Mapping'],
  		['simpletitlecasemapping', 'Simple_Titlecase_Mapping'],
  		['suc', 'Simple_Uppercase_Mapping'],
  		['simpleuppercasemapping', 'Simple_Uppercase_Mapping'],
  		['tc', 'Titlecase_Mapping'],
  		['titlecasemapping', 'Titlecase_Mapping'],
  		['uc', 'Uppercase_Mapping'],
  		['uppercasemapping', 'Uppercase_Mapping'],
  		['bmg', 'Bidi_Mirroring_Glyph'],
  		['bidimirroringglyph', 'Bidi_Mirroring_Glyph'],
  		['bpb', 'Bidi_Paired_Bracket'],
  		['bidipairedbracket', 'Bidi_Paired_Bracket'],
  		['cjkiicore', 'kIICore'],
  		['kiicore', 'kIICore'],
  		['cjkirggsource', 'kIRG_GSource'],
  		['kirggsource', 'kIRG_GSource'],
  		['cjkirghsource', 'kIRG_HSource'],
  		['kirghsource', 'kIRG_HSource'],
  		['cjkirgjsource', 'kIRG_JSource'],
  		['kirgjsource', 'kIRG_JSource'],
  		['cjkirgkpsource', 'kIRG_KPSource'],
  		['kirgkpsource', 'kIRG_KPSource'],
  		['cjkirgksource', 'kIRG_KSource'],
  		['kirgksource', 'kIRG_KSource'],
  		['cjkirgmsource', 'kIRG_MSource'],
  		['kirgmsource', 'kIRG_MSource'],
  		['cjkirgtsource', 'kIRG_TSource'],
  		['kirgtsource', 'kIRG_TSource'],
  		['cjkirgusource', 'kIRG_USource'],
  		['kirgusource', 'kIRG_USource'],
  		['cjkirgvsource', 'kIRG_VSource'],
  		['kirgvsource', 'kIRG_VSource'],
  		['cjkrsunicode', 'kRSUnicode'],
  		['krsunicode', 'kRSUnicode'],
  		['unicoderadicalstroke', 'kRSUnicode'],
  		['urs', 'kRSUnicode'],
  		['isc', 'ISO_Comment'],
  		['isocomment', 'ISO_Comment'],
  		['jsn', 'Jamo_Short_Name'],
  		['jamoshortname', 'Jamo_Short_Name'],
  		['na', 'Name'],
  		['name', 'Name'],
  		['na1', 'Unicode_1_Name'],
  		['unicode1name', 'Unicode_1_Name'],
  		['namealias', 'Name_Alias'],
  		['scx', 'Script_Extensions'],
  		['scriptextensions', 'Script_Extensions'],
  		['age', 'Age'],
  		['blk', 'Block'],
  		['block', 'Block'],
  		['sc', 'Script'],
  		['script', 'Script'],
  		['bc', 'Bidi_Class'],
  		['bidiclass', 'Bidi_Class'],
  		['bpt', 'Bidi_Paired_Bracket_Type'],
  		['bidipairedbrackettype', 'Bidi_Paired_Bracket_Type'],
  		['ccc', 'Canonical_Combining_Class'],
  		['canonicalcombiningclass', 'Canonical_Combining_Class'],
  		['dt', 'Decomposition_Type'],
  		['decompositiontype', 'Decomposition_Type'],
  		['ea', 'East_Asian_Width'],
  		['eastasianwidth', 'East_Asian_Width'],
  		['gc', 'General_Category'],
  		['generalcategory', 'General_Category'],
  		['gcb', 'Grapheme_Cluster_Break'],
  		['graphemeclusterbreak', 'Grapheme_Cluster_Break'],
  		['hst', 'Hangul_Syllable_Type'],
  		['hangulsyllabletype', 'Hangul_Syllable_Type'],
  		['inpc', 'Indic_Positional_Category'],
  		['indicpositionalcategory', 'Indic_Positional_Category'],
  		['insc', 'Indic_Syllabic_Category'],
  		['indicsyllabiccategory', 'Indic_Syllabic_Category'],
  		['jg', 'Joining_Group'],
  		['joininggroup', 'Joining_Group'],
  		['jt', 'Joining_Type'],
  		['joiningtype', 'Joining_Type'],
  		['lb', 'Line_Break'],
  		['linebreak', 'Line_Break'],
  		['nfcqc', 'NFC_Quick_Check'],
  		['nfcquickcheck', 'NFC_Quick_Check'],
  		['nfdqc', 'NFD_Quick_Check'],
  		['nfdquickcheck', 'NFD_Quick_Check'],
  		['nfkcqc', 'NFKC_Quick_Check'],
  		['nfkcquickcheck', 'NFKC_Quick_Check'],
  		['nfkdqc', 'NFKD_Quick_Check'],
  		['nfkdquickcheck', 'NFKD_Quick_Check'],
  		['nt', 'Numeric_Type'],
  		['numerictype', 'Numeric_Type'],
  		['sb', 'Sentence_Break'],
  		['sentencebreak', 'Sentence_Break'],
  		['wb', 'Word_Break'],
  		['wordbreak', 'Word_Break'],
  		['ahex', 'ASCII_Hex_Digit'],
  		['asciihexdigit', 'ASCII_Hex_Digit'],
  		['alpha', 'Alphabetic'],
  		['alphabetic', 'Alphabetic'],
  		['bidic', 'Bidi_Control'],
  		['bidicontrol', 'Bidi_Control'],
  		['bidim', 'Bidi_Mirrored'],
  		['bidimirrored', 'Bidi_Mirrored'],
  		['cased', 'Cased'],
  		['ce', 'Composition_Exclusion'],
  		['compositionexclusion', 'Composition_Exclusion'],
  		['ci', 'Case_Ignorable'],
  		['caseignorable', 'Case_Ignorable'],
  		['compex', 'Full_Composition_Exclusion'],
  		['fullcompositionexclusion', 'Full_Composition_Exclusion'],
  		['cwcf', 'Changes_When_Casefolded'],
  		['changeswhencasefolded', 'Changes_When_Casefolded'],
  		['cwcm', 'Changes_When_Casemapped'],
  		['changeswhencasemapped', 'Changes_When_Casemapped'],
  		['cwkcf', 'Changes_When_NFKC_Casefolded'],
  		['changeswhennfkccasefolded', 'Changes_When_NFKC_Casefolded'],
  		['cwl', 'Changes_When_Lowercased'],
  		['changeswhenlowercased', 'Changes_When_Lowercased'],
  		['cwt', 'Changes_When_Titlecased'],
  		['changeswhentitlecased', 'Changes_When_Titlecased'],
  		['cwu', 'Changes_When_Uppercased'],
  		['changeswhenuppercased', 'Changes_When_Uppercased'],
  		['dash', 'Dash'],
  		['dep', 'Deprecated'],
  		['deprecated', 'Deprecated'],
  		['di', 'Default_Ignorable_Code_Point'],
  		['defaultignorablecodepoint', 'Default_Ignorable_Code_Point'],
  		['dia', 'Diacritic'],
  		['diacritic', 'Diacritic'],
  		['ext', 'Extender'],
  		['extender', 'Extender'],
  		['grbase', 'Grapheme_Base'],
  		['graphemebase', 'Grapheme_Base'],
  		['grext', 'Grapheme_Extend'],
  		['graphemeextend', 'Grapheme_Extend'],
  		['grlink', 'Grapheme_Link'],
  		['graphemelink', 'Grapheme_Link'],
  		['hex', 'Hex_Digit'],
  		['hexdigit', 'Hex_Digit'],
  		['hyphen', 'Hyphen'],
  		['idc', 'ID_Continue'],
  		['idcontinue', 'ID_Continue'],
  		['ideo', 'Ideographic'],
  		['ideographic', 'Ideographic'],
  		['ids', 'ID_Start'],
  		['idstart', 'ID_Start'],
  		['idsb', 'IDS_Binary_Operator'],
  		['idsbinaryoperator', 'IDS_Binary_Operator'],
  		['idst', 'IDS_Trinary_Operator'],
  		['idstrinaryoperator', 'IDS_Trinary_Operator'],
  		['joinc', 'Join_Control'],
  		['joincontrol', 'Join_Control'],
  		['loe', 'Logical_Order_Exception'],
  		['logicalorderexception', 'Logical_Order_Exception'],
  		['lower', 'Lowercase'],
  		['lowercase', 'Lowercase'],
  		['math', 'Math'],
  		['nchar', 'Noncharacter_Code_Point'],
  		['noncharactercodepoint', 'Noncharacter_Code_Point'],
  		['oalpha', 'Other_Alphabetic'],
  		['otheralphabetic', 'Other_Alphabetic'],
  		['odi', 'Other_Default_Ignorable_Code_Point'],
  		['otherdefaultignorablecodepoint', 'Other_Default_Ignorable_Code_Point'],
  		['ogrext', 'Other_Grapheme_Extend'],
  		['othergraphemeextend', 'Other_Grapheme_Extend'],
  		['oidc', 'Other_ID_Continue'],
  		['otheridcontinue', 'Other_ID_Continue'],
  		['oids', 'Other_ID_Start'],
  		['otheridstart', 'Other_ID_Start'],
  		['olower', 'Other_Lowercase'],
  		['otherlowercase', 'Other_Lowercase'],
  		['omath', 'Other_Math'],
  		['othermath', 'Other_Math'],
  		['oupper', 'Other_Uppercase'],
  		['otheruppercase', 'Other_Uppercase'],
  		['patsyn', 'Pattern_Syntax'],
  		['patternsyntax', 'Pattern_Syntax'],
  		['patws', 'Pattern_White_Space'],
  		['patternwhitespace', 'Pattern_White_Space'],
  		['pcm', 'Prepended_Concatenation_Mark'],
  		['prependedconcatenationmark', 'Prepended_Concatenation_Mark'],
  		['qmark', 'Quotation_Mark'],
  		['quotationmark', 'Quotation_Mark'],
  		['radical', 'Radical'],
  		['sd', 'Soft_Dotted'],
  		['softdotted', 'Soft_Dotted'],
  		['sterm', 'Sentence_Terminal'],
  		['sentenceterminal', 'Sentence_Terminal'],
  		['term', 'Terminal_Punctuation'],
  		['terminalpunctuation', 'Terminal_Punctuation'],
  		['uideo', 'Unified_Ideograph'],
  		['unifiedideograph', 'Unified_Ideograph'],
  		['upper', 'Uppercase'],
  		['uppercase', 'Uppercase'],
  		['vs', 'Variation_Selector'],
  		['variationselector', 'Variation_Selector'],
  		['wspace', 'White_Space'],
  		['whitespace', 'White_Space'],
  		['space', 'White_Space'],
  		['xidc', 'XID_Continue'],
  		['xidcontinue', 'XID_Continue'],
  		['xids', 'XID_Start'],
  		['xidstart', 'XID_Start'],
  		['xonfc', 'Expands_On_NFC'],
  		['expandsonnfc', 'Expands_On_NFC'],
  		['xonfd', 'Expands_On_NFD'],
  		['expandsonnfd', 'Expands_On_NFD'],
  		['xonfkc', 'Expands_On_NFKC'],
  		['expandsonnfkc', 'Expands_On_NFKC'],
  		['xonfkd', 'Expands_On_NFKD'],
  		['expandsonnfkd', 'Expands_On_NFKD'],
  		['ascii', 'ASCII'],
  		['any', 'Any'],
  		['assigned', 'Assigned']
  	]),
  	'propertyToValueAliases': new Map([
  		['Jamo_Short_Name', new Map([
  			['a', 'A'],
  			['ae', 'AE'],
  			['b', 'B'],
  			['bb', 'BB'],
  			['bs', 'BS'],
  			['c', 'C'],
  			['d', 'D'],
  			['dd', 'DD'],
  			['e', 'E'],
  			['eo', 'EO'],
  			['eu', 'EU'],
  			['g', 'G'],
  			['gg', 'GG'],
  			['gs', 'GS'],
  			['h', 'H'],
  			['i', 'I'],
  			['j', 'J'],
  			['jj', 'JJ'],
  			['k', 'K'],
  			['l', 'L'],
  			['lb', 'LB'],
  			['lg', 'LG'],
  			['lh', 'LH'],
  			['lm', 'LM'],
  			['lp', 'LP'],
  			['ls', 'LS'],
  			['lt', 'LT'],
  			['m', 'M'],
  			['n', 'N'],
  			['ng', 'NG'],
  			['nh', 'NH'],
  			['nj', 'NJ'],
  			['o', 'O'],
  			['oe', 'OE'],
  			['p', 'P'],
  			['r', 'R'],
  			['s', 'S'],
  			['ss', 'SS'],
  			['t', 'T'],
  			['u', 'U'],
  			['wa', 'WA'],
  			['wae', 'WAE'],
  			['we', 'WE'],
  			['weo', 'WEO'],
  			['wi', 'WI'],
  			['ya', 'YA'],
  			['yae', 'YAE'],
  			['ye', 'YE'],
  			['yeo', 'YEO'],
  			['yi', 'YI'],
  			['yo', 'YO'],
  			['yu', 'YU']
  		])],
  		['Age', new Map([
  			['1.1', 'V1_1'],
  			['v11', 'V1_1'],
  			['2.0', 'V2_0'],
  			['v20', 'V2_0'],
  			['2.1', 'V2_1'],
  			['v21', 'V2_1'],
  			['3.0', 'V3_0'],
  			['v30', 'V3_0'],
  			['3.1', 'V3_1'],
  			['v31', 'V3_1'],
  			['3.2', 'V3_2'],
  			['v32', 'V3_2'],
  			['4.0', 'V4_0'],
  			['v40', 'V4_0'],
  			['4.1', 'V4_1'],
  			['v41', 'V4_1'],
  			['5.0', 'V5_0'],
  			['v50', 'V5_0'],
  			['5.1', 'V5_1'],
  			['v51', 'V5_1'],
  			['5.2', 'V5_2'],
  			['v52', 'V5_2'],
  			['6.0', 'V6_0'],
  			['v60', 'V6_0'],
  			['6.1', 'V6_1'],
  			['v61', 'V6_1'],
  			['6.2', 'V6_2'],
  			['v62', 'V6_2'],
  			['6.3', 'V6_3'],
  			['v63', 'V6_3'],
  			['7.0', 'V7_0'],
  			['v70', 'V7_0'],
  			['8.0', 'V8_0'],
  			['v80', 'V8_0'],
  			['9.0', 'V9_0'],
  			['v90', 'V9_0'],
  			['na', 'Unassigned'],
  			['unassigned', 'Unassigned']
  		])],
  		['Block', new Map([
  			['adlam', 'Adlam'],
  			['aegeannumbers', 'Aegean_Numbers'],
  			['ahom', 'Ahom'],
  			['alchemical', 'Alchemical_Symbols'],
  			['alchemicalsymbols', 'Alchemical_Symbols'],
  			['alphabeticpf', 'Alphabetic_Presentation_Forms'],
  			['alphabeticpresentationforms', 'Alphabetic_Presentation_Forms'],
  			['anatolianhieroglyphs', 'Anatolian_Hieroglyphs'],
  			['ancientgreekmusic', 'Ancient_Greek_Musical_Notation'],
  			['ancientgreekmusicalnotation', 'Ancient_Greek_Musical_Notation'],
  			['ancientgreeknumbers', 'Ancient_Greek_Numbers'],
  			['ancientsymbols', 'Ancient_Symbols'],
  			['arabic', 'Arabic'],
  			['arabicexta', 'Arabic_Extended_A'],
  			['arabicextendeda', 'Arabic_Extended_A'],
  			['arabicmath', 'Arabic_Mathematical_Alphabetic_Symbols'],
  			['arabicmathematicalalphabeticsymbols', 'Arabic_Mathematical_Alphabetic_Symbols'],
  			['arabicpfa', 'Arabic_Presentation_Forms_A'],
  			['arabicpresentationformsa', 'Arabic_Presentation_Forms_A'],
  			['arabicpfb', 'Arabic_Presentation_Forms_B'],
  			['arabicpresentationformsb', 'Arabic_Presentation_Forms_B'],
  			['arabicsup', 'Arabic_Supplement'],
  			['arabicsupplement', 'Arabic_Supplement'],
  			['armenian', 'Armenian'],
  			['arrows', 'Arrows'],
  			['ascii', 'Basic_Latin'],
  			['basiclatin', 'Basic_Latin'],
  			['avestan', 'Avestan'],
  			['balinese', 'Balinese'],
  			['bamum', 'Bamum'],
  			['bamumsup', 'Bamum_Supplement'],
  			['bamumsupplement', 'Bamum_Supplement'],
  			['bassavah', 'Bassa_Vah'],
  			['batak', 'Batak'],
  			['bengali', 'Bengali'],
  			['bhaiksuki', 'Bhaiksuki'],
  			['blockelements', 'Block_Elements'],
  			['bopomofo', 'Bopomofo'],
  			['bopomofoext', 'Bopomofo_Extended'],
  			['bopomofoextended', 'Bopomofo_Extended'],
  			['boxdrawing', 'Box_Drawing'],
  			['brahmi', 'Brahmi'],
  			['braille', 'Braille_Patterns'],
  			['braillepatterns', 'Braille_Patterns'],
  			['buginese', 'Buginese'],
  			['buhid', 'Buhid'],
  			['byzantinemusic', 'Byzantine_Musical_Symbols'],
  			['byzantinemusicalsymbols', 'Byzantine_Musical_Symbols'],
  			['carian', 'Carian'],
  			['caucasianalbanian', 'Caucasian_Albanian'],
  			['chakma', 'Chakma'],
  			['cham', 'Cham'],
  			['cherokee', 'Cherokee'],
  			['cherokeesup', 'Cherokee_Supplement'],
  			['cherokeesupplement', 'Cherokee_Supplement'],
  			['cjk', 'CJK_Unified_Ideographs'],
  			['cjkunifiedideographs', 'CJK_Unified_Ideographs'],
  			['cjkcompat', 'CJK_Compatibility'],
  			['cjkcompatibility', 'CJK_Compatibility'],
  			['cjkcompatforms', 'CJK_Compatibility_Forms'],
  			['cjkcompatibilityforms', 'CJK_Compatibility_Forms'],
  			['cjkcompatideographs', 'CJK_Compatibility_Ideographs'],
  			['cjkcompatibilityideographs', 'CJK_Compatibility_Ideographs'],
  			['cjkcompatideographssup', 'CJK_Compatibility_Ideographs_Supplement'],
  			['cjkcompatibilityideographssupplement', 'CJK_Compatibility_Ideographs_Supplement'],
  			['cjkexta', 'CJK_Unified_Ideographs_Extension_A'],
  			['cjkunifiedideographsextensiona', 'CJK_Unified_Ideographs_Extension_A'],
  			['cjkextb', 'CJK_Unified_Ideographs_Extension_B'],
  			['cjkunifiedideographsextensionb', 'CJK_Unified_Ideographs_Extension_B'],
  			['cjkextc', 'CJK_Unified_Ideographs_Extension_C'],
  			['cjkunifiedideographsextensionc', 'CJK_Unified_Ideographs_Extension_C'],
  			['cjkextd', 'CJK_Unified_Ideographs_Extension_D'],
  			['cjkunifiedideographsextensiond', 'CJK_Unified_Ideographs_Extension_D'],
  			['cjkexte', 'CJK_Unified_Ideographs_Extension_E'],
  			['cjkunifiedideographsextensione', 'CJK_Unified_Ideographs_Extension_E'],
  			['cjkradicalssup', 'CJK_Radicals_Supplement'],
  			['cjkradicalssupplement', 'CJK_Radicals_Supplement'],
  			['cjkstrokes', 'CJK_Strokes'],
  			['cjksymbols', 'CJK_Symbols_And_Punctuation'],
  			['cjksymbolsandpunctuation', 'CJK_Symbols_And_Punctuation'],
  			['compatjamo', 'Hangul_Compatibility_Jamo'],
  			['hangulcompatibilityjamo', 'Hangul_Compatibility_Jamo'],
  			['controlpictures', 'Control_Pictures'],
  			['coptic', 'Coptic'],
  			['copticepactnumbers', 'Coptic_Epact_Numbers'],
  			['countingrod', 'Counting_Rod_Numerals'],
  			['countingrodnumerals', 'Counting_Rod_Numerals'],
  			['cuneiform', 'Cuneiform'],
  			['cuneiformnumbers', 'Cuneiform_Numbers_And_Punctuation'],
  			['cuneiformnumbersandpunctuation', 'Cuneiform_Numbers_And_Punctuation'],
  			['currencysymbols', 'Currency_Symbols'],
  			['cypriotsyllabary', 'Cypriot_Syllabary'],
  			['cyrillic', 'Cyrillic'],
  			['cyrillicexta', 'Cyrillic_Extended_A'],
  			['cyrillicextendeda', 'Cyrillic_Extended_A'],
  			['cyrillicextb', 'Cyrillic_Extended_B'],
  			['cyrillicextendedb', 'Cyrillic_Extended_B'],
  			['cyrillicextc', 'Cyrillic_Extended_C'],
  			['cyrillicextendedc', 'Cyrillic_Extended_C'],
  			['cyrillicsup', 'Cyrillic_Supplement'],
  			['cyrillicsupplement', 'Cyrillic_Supplement'],
  			['cyrillicsupplementary', 'Cyrillic_Supplement'],
  			['deseret', 'Deseret'],
  			['devanagari', 'Devanagari'],
  			['devanagariext', 'Devanagari_Extended'],
  			['devanagariextended', 'Devanagari_Extended'],
  			['diacriticals', 'Combining_Diacritical_Marks'],
  			['combiningdiacriticalmarks', 'Combining_Diacritical_Marks'],
  			['diacriticalsext', 'Combining_Diacritical_Marks_Extended'],
  			['combiningdiacriticalmarksextended', 'Combining_Diacritical_Marks_Extended'],
  			['diacriticalsforsymbols', 'Combining_Diacritical_Marks_For_Symbols'],
  			['combiningdiacriticalmarksforsymbols', 'Combining_Diacritical_Marks_For_Symbols'],
  			['combiningmarksforsymbols', 'Combining_Diacritical_Marks_For_Symbols'],
  			['diacriticalssup', 'Combining_Diacritical_Marks_Supplement'],
  			['combiningdiacriticalmarkssupplement', 'Combining_Diacritical_Marks_Supplement'],
  			['dingbats', 'Dingbats'],
  			['domino', 'Domino_Tiles'],
  			['dominotiles', 'Domino_Tiles'],
  			['duployan', 'Duployan'],
  			['earlydynasticcuneiform', 'Early_Dynastic_Cuneiform'],
  			['egyptianhieroglyphs', 'Egyptian_Hieroglyphs'],
  			['elbasan', 'Elbasan'],
  			['emoticons', 'Emoticons'],
  			['enclosedalphanum', 'Enclosed_Alphanumerics'],
  			['enclosedalphanumerics', 'Enclosed_Alphanumerics'],
  			['enclosedalphanumsup', 'Enclosed_Alphanumeric_Supplement'],
  			['enclosedalphanumericsupplement', 'Enclosed_Alphanumeric_Supplement'],
  			['enclosedcjk', 'Enclosed_CJK_Letters_And_Months'],
  			['enclosedcjklettersandmonths', 'Enclosed_CJK_Letters_And_Months'],
  			['enclosedideographicsup', 'Enclosed_Ideographic_Supplement'],
  			['enclosedideographicsupplement', 'Enclosed_Ideographic_Supplement'],
  			['ethiopic', 'Ethiopic'],
  			['ethiopicext', 'Ethiopic_Extended'],
  			['ethiopicextended', 'Ethiopic_Extended'],
  			['ethiopicexta', 'Ethiopic_Extended_A'],
  			['ethiopicextendeda', 'Ethiopic_Extended_A'],
  			['ethiopicsup', 'Ethiopic_Supplement'],
  			['ethiopicsupplement', 'Ethiopic_Supplement'],
  			['geometricshapes', 'Geometric_Shapes'],
  			['geometricshapesext', 'Geometric_Shapes_Extended'],
  			['geometricshapesextended', 'Geometric_Shapes_Extended'],
  			['georgian', 'Georgian'],
  			['georgiansup', 'Georgian_Supplement'],
  			['georgiansupplement', 'Georgian_Supplement'],
  			['glagolitic', 'Glagolitic'],
  			['glagoliticsup', 'Glagolitic_Supplement'],
  			['glagoliticsupplement', 'Glagolitic_Supplement'],
  			['gothic', 'Gothic'],
  			['grantha', 'Grantha'],
  			['greek', 'Greek_And_Coptic'],
  			['greekandcoptic', 'Greek_And_Coptic'],
  			['greekext', 'Greek_Extended'],
  			['greekextended', 'Greek_Extended'],
  			['gujarati', 'Gujarati'],
  			['gurmukhi', 'Gurmukhi'],
  			['halfandfullforms', 'Halfwidth_And_Fullwidth_Forms'],
  			['halfwidthandfullwidthforms', 'Halfwidth_And_Fullwidth_Forms'],
  			['halfmarks', 'Combining_Half_Marks'],
  			['combininghalfmarks', 'Combining_Half_Marks'],
  			['hangul', 'Hangul_Syllables'],
  			['hangulsyllables', 'Hangul_Syllables'],
  			['hanunoo', 'Hanunoo'],
  			['hatran', 'Hatran'],
  			['hebrew', 'Hebrew'],
  			['highpusurrogates', 'High_Private_Use_Surrogates'],
  			['highprivateusesurrogates', 'High_Private_Use_Surrogates'],
  			['highsurrogates', 'High_Surrogates'],
  			['hiragana', 'Hiragana'],
  			['idc', 'Ideographic_Description_Characters'],
  			['ideographicdescriptioncharacters', 'Ideographic_Description_Characters'],
  			['ideographicsymbols', 'Ideographic_Symbols_And_Punctuation'],
  			['ideographicsymbolsandpunctuation', 'Ideographic_Symbols_And_Punctuation'],
  			['imperialaramaic', 'Imperial_Aramaic'],
  			['indicnumberforms', 'Common_Indic_Number_Forms'],
  			['commonindicnumberforms', 'Common_Indic_Number_Forms'],
  			['inscriptionalpahlavi', 'Inscriptional_Pahlavi'],
  			['inscriptionalparthian', 'Inscriptional_Parthian'],
  			['ipaext', 'IPA_Extensions'],
  			['ipaextensions', 'IPA_Extensions'],
  			['jamo', 'Hangul_Jamo'],
  			['hanguljamo', 'Hangul_Jamo'],
  			['jamoexta', 'Hangul_Jamo_Extended_A'],
  			['hanguljamoextendeda', 'Hangul_Jamo_Extended_A'],
  			['jamoextb', 'Hangul_Jamo_Extended_B'],
  			['hanguljamoextendedb', 'Hangul_Jamo_Extended_B'],
  			['javanese', 'Javanese'],
  			['kaithi', 'Kaithi'],
  			['kanasup', 'Kana_Supplement'],
  			['kanasupplement', 'Kana_Supplement'],
  			['kanbun', 'Kanbun'],
  			['kangxi', 'Kangxi_Radicals'],
  			['kangxiradicals', 'Kangxi_Radicals'],
  			['kannada', 'Kannada'],
  			['katakana', 'Katakana'],
  			['katakanaext', 'Katakana_Phonetic_Extensions'],
  			['katakanaphoneticextensions', 'Katakana_Phonetic_Extensions'],
  			['kayahli', 'Kayah_Li'],
  			['kharoshthi', 'Kharoshthi'],
  			['khmer', 'Khmer'],
  			['khmersymbols', 'Khmer_Symbols'],
  			['khojki', 'Khojki'],
  			['khudawadi', 'Khudawadi'],
  			['lao', 'Lao'],
  			['latin1sup', 'Latin_1_Supplement'],
  			['latin1supplement', 'Latin_1_Supplement'],
  			['latin1', 'Latin_1_Supplement'],
  			['latinexta', 'Latin_Extended_A'],
  			['latinextendeda', 'Latin_Extended_A'],
  			['latinextadditional', 'Latin_Extended_Additional'],
  			['latinextendedadditional', 'Latin_Extended_Additional'],
  			['latinextb', 'Latin_Extended_B'],
  			['latinextendedb', 'Latin_Extended_B'],
  			['latinextc', 'Latin_Extended_C'],
  			['latinextendedc', 'Latin_Extended_C'],
  			['latinextd', 'Latin_Extended_D'],
  			['latinextendedd', 'Latin_Extended_D'],
  			['latinexte', 'Latin_Extended_E'],
  			['latinextendede', 'Latin_Extended_E'],
  			['lepcha', 'Lepcha'],
  			['letterlikesymbols', 'Letterlike_Symbols'],
  			['limbu', 'Limbu'],
  			['lineara', 'Linear_A'],
  			['linearbideograms', 'Linear_B_Ideograms'],
  			['linearbsyllabary', 'Linear_B_Syllabary'],
  			['lisu', 'Lisu'],
  			['lowsurrogates', 'Low_Surrogates'],
  			['lycian', 'Lycian'],
  			['lydian', 'Lydian'],
  			['mahajani', 'Mahajani'],
  			['mahjong', 'Mahjong_Tiles'],
  			['mahjongtiles', 'Mahjong_Tiles'],
  			['malayalam', 'Malayalam'],
  			['mandaic', 'Mandaic'],
  			['manichaean', 'Manichaean'],
  			['marchen', 'Marchen'],
  			['mathalphanum', 'Mathematical_Alphanumeric_Symbols'],
  			['mathematicalalphanumericsymbols', 'Mathematical_Alphanumeric_Symbols'],
  			['mathoperators', 'Mathematical_Operators'],
  			['mathematicaloperators', 'Mathematical_Operators'],
  			['meeteimayek', 'Meetei_Mayek'],
  			['meeteimayekext', 'Meetei_Mayek_Extensions'],
  			['meeteimayekextensions', 'Meetei_Mayek_Extensions'],
  			['mendekikakui', 'Mende_Kikakui'],
  			['meroiticcursive', 'Meroitic_Cursive'],
  			['meroitichieroglyphs', 'Meroitic_Hieroglyphs'],
  			['miao', 'Miao'],
  			['miscarrows', 'Miscellaneous_Symbols_And_Arrows'],
  			['miscellaneoussymbolsandarrows', 'Miscellaneous_Symbols_And_Arrows'],
  			['miscmathsymbolsa', 'Miscellaneous_Mathematical_Symbols_A'],
  			['miscellaneousmathematicalsymbolsa', 'Miscellaneous_Mathematical_Symbols_A'],
  			['miscmathsymbolsb', 'Miscellaneous_Mathematical_Symbols_B'],
  			['miscellaneousmathematicalsymbolsb', 'Miscellaneous_Mathematical_Symbols_B'],
  			['miscpictographs', 'Miscellaneous_Symbols_And_Pictographs'],
  			['miscellaneoussymbolsandpictographs', 'Miscellaneous_Symbols_And_Pictographs'],
  			['miscsymbols', 'Miscellaneous_Symbols'],
  			['miscellaneoussymbols', 'Miscellaneous_Symbols'],
  			['misctechnical', 'Miscellaneous_Technical'],
  			['miscellaneoustechnical', 'Miscellaneous_Technical'],
  			['modi', 'Modi'],
  			['modifierletters', 'Spacing_Modifier_Letters'],
  			['spacingmodifierletters', 'Spacing_Modifier_Letters'],
  			['modifiertoneletters', 'Modifier_Tone_Letters'],
  			['mongolian', 'Mongolian'],
  			['mongoliansup', 'Mongolian_Supplement'],
  			['mongoliansupplement', 'Mongolian_Supplement'],
  			['mro', 'Mro'],
  			['multani', 'Multani'],
  			['music', 'Musical_Symbols'],
  			['musicalsymbols', 'Musical_Symbols'],
  			['myanmar', 'Myanmar'],
  			['myanmarexta', 'Myanmar_Extended_A'],
  			['myanmarextendeda', 'Myanmar_Extended_A'],
  			['myanmarextb', 'Myanmar_Extended_B'],
  			['myanmarextendedb', 'Myanmar_Extended_B'],
  			['nabataean', 'Nabataean'],
  			['nb', 'No_Block'],
  			['noblock', 'No_Block'],
  			['newtailue', 'New_Tai_Lue'],
  			['newa', 'Newa'],
  			['nko', 'NKo'],
  			['numberforms', 'Number_Forms'],
  			['ocr', 'Optical_Character_Recognition'],
  			['opticalcharacterrecognition', 'Optical_Character_Recognition'],
  			['ogham', 'Ogham'],
  			['olchiki', 'Ol_Chiki'],
  			['oldhungarian', 'Old_Hungarian'],
  			['olditalic', 'Old_Italic'],
  			['oldnortharabian', 'Old_North_Arabian'],
  			['oldpermic', 'Old_Permic'],
  			['oldpersian', 'Old_Persian'],
  			['oldsoutharabian', 'Old_South_Arabian'],
  			['oldturkic', 'Old_Turkic'],
  			['oriya', 'Oriya'],
  			['ornamentaldingbats', 'Ornamental_Dingbats'],
  			['osage', 'Osage'],
  			['osmanya', 'Osmanya'],
  			['pahawhhmong', 'Pahawh_Hmong'],
  			['palmyrene', 'Palmyrene'],
  			['paucinhau', 'Pau_Cin_Hau'],
  			['phagspa', 'Phags_Pa'],
  			['phaistos', 'Phaistos_Disc'],
  			['phaistosdisc', 'Phaistos_Disc'],
  			['phoenician', 'Phoenician'],
  			['phoneticext', 'Phonetic_Extensions'],
  			['phoneticextensions', 'Phonetic_Extensions'],
  			['phoneticextsup', 'Phonetic_Extensions_Supplement'],
  			['phoneticextensionssupplement', 'Phonetic_Extensions_Supplement'],
  			['playingcards', 'Playing_Cards'],
  			['psalterpahlavi', 'Psalter_Pahlavi'],
  			['pua', 'Private_Use_Area'],
  			['privateusearea', 'Private_Use_Area'],
  			['privateuse', 'Private_Use_Area'],
  			['punctuation', 'General_Punctuation'],
  			['generalpunctuation', 'General_Punctuation'],
  			['rejang', 'Rejang'],
  			['rumi', 'Rumi_Numeral_Symbols'],
  			['ruminumeralsymbols', 'Rumi_Numeral_Symbols'],
  			['runic', 'Runic'],
  			['samaritan', 'Samaritan'],
  			['saurashtra', 'Saurashtra'],
  			['sharada', 'Sharada'],
  			['shavian', 'Shavian'],
  			['shorthandformatcontrols', 'Shorthand_Format_Controls'],
  			['siddham', 'Siddham'],
  			['sinhala', 'Sinhala'],
  			['sinhalaarchaicnumbers', 'Sinhala_Archaic_Numbers'],
  			['smallforms', 'Small_Form_Variants'],
  			['smallformvariants', 'Small_Form_Variants'],
  			['sorasompeng', 'Sora_Sompeng'],
  			['specials', 'Specials'],
  			['sundanese', 'Sundanese'],
  			['sundanesesup', 'Sundanese_Supplement'],
  			['sundanesesupplement', 'Sundanese_Supplement'],
  			['suparrowsa', 'Supplemental_Arrows_A'],
  			['supplementalarrowsa', 'Supplemental_Arrows_A'],
  			['suparrowsb', 'Supplemental_Arrows_B'],
  			['supplementalarrowsb', 'Supplemental_Arrows_B'],
  			['suparrowsc', 'Supplemental_Arrows_C'],
  			['supplementalarrowsc', 'Supplemental_Arrows_C'],
  			['supmathoperators', 'Supplemental_Mathematical_Operators'],
  			['supplementalmathematicaloperators', 'Supplemental_Mathematical_Operators'],
  			['suppuaa', 'Supplementary_Private_Use_Area_A'],
  			['supplementaryprivateuseareaa', 'Supplementary_Private_Use_Area_A'],
  			['suppuab', 'Supplementary_Private_Use_Area_B'],
  			['supplementaryprivateuseareab', 'Supplementary_Private_Use_Area_B'],
  			['suppunctuation', 'Supplemental_Punctuation'],
  			['supplementalpunctuation', 'Supplemental_Punctuation'],
  			['supsymbolsandpictographs', 'Supplemental_Symbols_And_Pictographs'],
  			['supplementalsymbolsandpictographs', 'Supplemental_Symbols_And_Pictographs'],
  			['superandsub', 'Superscripts_And_Subscripts'],
  			['superscriptsandsubscripts', 'Superscripts_And_Subscripts'],
  			['suttonsignwriting', 'Sutton_SignWriting'],
  			['sylotinagri', 'Syloti_Nagri'],
  			['syriac', 'Syriac'],
  			['tagalog', 'Tagalog'],
  			['tagbanwa', 'Tagbanwa'],
  			['tags', 'Tags'],
  			['taile', 'Tai_Le'],
  			['taitham', 'Tai_Tham'],
  			['taiviet', 'Tai_Viet'],
  			['taixuanjing', 'Tai_Xuan_Jing_Symbols'],
  			['taixuanjingsymbols', 'Tai_Xuan_Jing_Symbols'],
  			['takri', 'Takri'],
  			['tamil', 'Tamil'],
  			['tangut', 'Tangut'],
  			['tangutcomponents', 'Tangut_Components'],
  			['telugu', 'Telugu'],
  			['thaana', 'Thaana'],
  			['thai', 'Thai'],
  			['tibetan', 'Tibetan'],
  			['tifinagh', 'Tifinagh'],
  			['tirhuta', 'Tirhuta'],
  			['transportandmap', 'Transport_And_Map_Symbols'],
  			['transportandmapsymbols', 'Transport_And_Map_Symbols'],
  			['ucas', 'Unified_Canadian_Aboriginal_Syllabics'],
  			['unifiedcanadianaboriginalsyllabics', 'Unified_Canadian_Aboriginal_Syllabics'],
  			['canadiansyllabics', 'Unified_Canadian_Aboriginal_Syllabics'],
  			['ucasext', 'Unified_Canadian_Aboriginal_Syllabics_Extended'],
  			['unifiedcanadianaboriginalsyllabicsextended', 'Unified_Canadian_Aboriginal_Syllabics_Extended'],
  			['ugaritic', 'Ugaritic'],
  			['vai', 'Vai'],
  			['vedicext', 'Vedic_Extensions'],
  			['vedicextensions', 'Vedic_Extensions'],
  			['verticalforms', 'Vertical_Forms'],
  			['vs', 'Variation_Selectors'],
  			['variationselectors', 'Variation_Selectors'],
  			['vssup', 'Variation_Selectors_Supplement'],
  			['variationselectorssupplement', 'Variation_Selectors_Supplement'],
  			['warangciti', 'Warang_Citi'],
  			['yiradicals', 'Yi_Radicals'],
  			['yisyllables', 'Yi_Syllables'],
  			['yijing', 'Yijing_Hexagram_Symbols'],
  			['yijinghexagramsymbols', 'Yijing_Hexagram_Symbols']
  		])],
  		['Script', new Map([
  			['adlm', 'Adlam'],
  			['adlam', 'Adlam'],
  			['aghb', 'Caucasian_Albanian'],
  			['caucasianalbanian', 'Caucasian_Albanian'],
  			['ahom', 'Ahom'],
  			['arab', 'Arabic'],
  			['arabic', 'Arabic'],
  			['armi', 'Imperial_Aramaic'],
  			['imperialaramaic', 'Imperial_Aramaic'],
  			['armn', 'Armenian'],
  			['armenian', 'Armenian'],
  			['avst', 'Avestan'],
  			['avestan', 'Avestan'],
  			['bali', 'Balinese'],
  			['balinese', 'Balinese'],
  			['bamu', 'Bamum'],
  			['bamum', 'Bamum'],
  			['bass', 'Bassa_Vah'],
  			['bassavah', 'Bassa_Vah'],
  			['batk', 'Batak'],
  			['batak', 'Batak'],
  			['beng', 'Bengali'],
  			['bengali', 'Bengali'],
  			['bhks', 'Bhaiksuki'],
  			['bhaiksuki', 'Bhaiksuki'],
  			['bopo', 'Bopomofo'],
  			['bopomofo', 'Bopomofo'],
  			['brah', 'Brahmi'],
  			['brahmi', 'Brahmi'],
  			['brai', 'Braille'],
  			['braille', 'Braille'],
  			['bugi', 'Buginese'],
  			['buginese', 'Buginese'],
  			['buhd', 'Buhid'],
  			['buhid', 'Buhid'],
  			['cakm', 'Chakma'],
  			['chakma', 'Chakma'],
  			['cans', 'Canadian_Aboriginal'],
  			['canadianaboriginal', 'Canadian_Aboriginal'],
  			['cari', 'Carian'],
  			['carian', 'Carian'],
  			['cham', 'Cham'],
  			['cher', 'Cherokee'],
  			['cherokee', 'Cherokee'],
  			['copt', 'Coptic'],
  			['coptic', 'Coptic'],
  			['qaac', 'Coptic'],
  			['cprt', 'Cypriot'],
  			['cypriot', 'Cypriot'],
  			['cyrl', 'Cyrillic'],
  			['cyrillic', 'Cyrillic'],
  			['deva', 'Devanagari'],
  			['devanagari', 'Devanagari'],
  			['dsrt', 'Deseret'],
  			['deseret', 'Deseret'],
  			['dupl', 'Duployan'],
  			['duployan', 'Duployan'],
  			['egyp', 'Egyptian_Hieroglyphs'],
  			['egyptianhieroglyphs', 'Egyptian_Hieroglyphs'],
  			['elba', 'Elbasan'],
  			['elbasan', 'Elbasan'],
  			['ethi', 'Ethiopic'],
  			['ethiopic', 'Ethiopic'],
  			['geor', 'Georgian'],
  			['georgian', 'Georgian'],
  			['glag', 'Glagolitic'],
  			['glagolitic', 'Glagolitic'],
  			['goth', 'Gothic'],
  			['gothic', 'Gothic'],
  			['gran', 'Grantha'],
  			['grantha', 'Grantha'],
  			['grek', 'Greek'],
  			['greek', 'Greek'],
  			['gujr', 'Gujarati'],
  			['gujarati', 'Gujarati'],
  			['guru', 'Gurmukhi'],
  			['gurmukhi', 'Gurmukhi'],
  			['hang', 'Hangul'],
  			['hangul', 'Hangul'],
  			['hani', 'Han'],
  			['han', 'Han'],
  			['hano', 'Hanunoo'],
  			['hanunoo', 'Hanunoo'],
  			['hatr', 'Hatran'],
  			['hatran', 'Hatran'],
  			['hebr', 'Hebrew'],
  			['hebrew', 'Hebrew'],
  			['hira', 'Hiragana'],
  			['hiragana', 'Hiragana'],
  			['hluw', 'Anatolian_Hieroglyphs'],
  			['anatolianhieroglyphs', 'Anatolian_Hieroglyphs'],
  			['hmng', 'Pahawh_Hmong'],
  			['pahawhhmong', 'Pahawh_Hmong'],
  			['hrkt', 'Katakana_Or_Hiragana'],
  			['katakanaorhiragana', 'Katakana_Or_Hiragana'],
  			['hung', 'Old_Hungarian'],
  			['oldhungarian', 'Old_Hungarian'],
  			['ital', 'Old_Italic'],
  			['olditalic', 'Old_Italic'],
  			['java', 'Javanese'],
  			['javanese', 'Javanese'],
  			['kali', 'Kayah_Li'],
  			['kayahli', 'Kayah_Li'],
  			['kana', 'Katakana'],
  			['katakana', 'Katakana'],
  			['khar', 'Kharoshthi'],
  			['kharoshthi', 'Kharoshthi'],
  			['khmr', 'Khmer'],
  			['khmer', 'Khmer'],
  			['khoj', 'Khojki'],
  			['khojki', 'Khojki'],
  			['knda', 'Kannada'],
  			['kannada', 'Kannada'],
  			['kthi', 'Kaithi'],
  			['kaithi', 'Kaithi'],
  			['lana', 'Tai_Tham'],
  			['taitham', 'Tai_Tham'],
  			['laoo', 'Lao'],
  			['lao', 'Lao'],
  			['latn', 'Latin'],
  			['latin', 'Latin'],
  			['lepc', 'Lepcha'],
  			['lepcha', 'Lepcha'],
  			['limb', 'Limbu'],
  			['limbu', 'Limbu'],
  			['lina', 'Linear_A'],
  			['lineara', 'Linear_A'],
  			['linb', 'Linear_B'],
  			['linearb', 'Linear_B'],
  			['lisu', 'Lisu'],
  			['lyci', 'Lycian'],
  			['lycian', 'Lycian'],
  			['lydi', 'Lydian'],
  			['lydian', 'Lydian'],
  			['mahj', 'Mahajani'],
  			['mahajani', 'Mahajani'],
  			['mand', 'Mandaic'],
  			['mandaic', 'Mandaic'],
  			['mani', 'Manichaean'],
  			['manichaean', 'Manichaean'],
  			['marc', 'Marchen'],
  			['marchen', 'Marchen'],
  			['mend', 'Mende_Kikakui'],
  			['mendekikakui', 'Mende_Kikakui'],
  			['merc', 'Meroitic_Cursive'],
  			['meroiticcursive', 'Meroitic_Cursive'],
  			['mero', 'Meroitic_Hieroglyphs'],
  			['meroitichieroglyphs', 'Meroitic_Hieroglyphs'],
  			['mlym', 'Malayalam'],
  			['malayalam', 'Malayalam'],
  			['modi', 'Modi'],
  			['mong', 'Mongolian'],
  			['mongolian', 'Mongolian'],
  			['mroo', 'Mro'],
  			['mro', 'Mro'],
  			['mtei', 'Meetei_Mayek'],
  			['meeteimayek', 'Meetei_Mayek'],
  			['mult', 'Multani'],
  			['multani', 'Multani'],
  			['mymr', 'Myanmar'],
  			['myanmar', 'Myanmar'],
  			['narb', 'Old_North_Arabian'],
  			['oldnortharabian', 'Old_North_Arabian'],
  			['nbat', 'Nabataean'],
  			['nabataean', 'Nabataean'],
  			['newa', 'Newa'],
  			['nkoo', 'Nko'],
  			['nko', 'Nko'],
  			['ogam', 'Ogham'],
  			['ogham', 'Ogham'],
  			['olck', 'Ol_Chiki'],
  			['olchiki', 'Ol_Chiki'],
  			['orkh', 'Old_Turkic'],
  			['oldturkic', 'Old_Turkic'],
  			['orya', 'Oriya'],
  			['oriya', 'Oriya'],
  			['osge', 'Osage'],
  			['osage', 'Osage'],
  			['osma', 'Osmanya'],
  			['osmanya', 'Osmanya'],
  			['palm', 'Palmyrene'],
  			['palmyrene', 'Palmyrene'],
  			['pauc', 'Pau_Cin_Hau'],
  			['paucinhau', 'Pau_Cin_Hau'],
  			['perm', 'Old_Permic'],
  			['oldpermic', 'Old_Permic'],
  			['phag', 'Phags_Pa'],
  			['phagspa', 'Phags_Pa'],
  			['phli', 'Inscriptional_Pahlavi'],
  			['inscriptionalpahlavi', 'Inscriptional_Pahlavi'],
  			['phlp', 'Psalter_Pahlavi'],
  			['psalterpahlavi', 'Psalter_Pahlavi'],
  			['phnx', 'Phoenician'],
  			['phoenician', 'Phoenician'],
  			['plrd', 'Miao'],
  			['miao', 'Miao'],
  			['prti', 'Inscriptional_Parthian'],
  			['inscriptionalparthian', 'Inscriptional_Parthian'],
  			['rjng', 'Rejang'],
  			['rejang', 'Rejang'],
  			['runr', 'Runic'],
  			['runic', 'Runic'],
  			['samr', 'Samaritan'],
  			['samaritan', 'Samaritan'],
  			['sarb', 'Old_South_Arabian'],
  			['oldsoutharabian', 'Old_South_Arabian'],
  			['saur', 'Saurashtra'],
  			['saurashtra', 'Saurashtra'],
  			['sgnw', 'SignWriting'],
  			['signwriting', 'SignWriting'],
  			['shaw', 'Shavian'],
  			['shavian', 'Shavian'],
  			['shrd', 'Sharada'],
  			['sharada', 'Sharada'],
  			['sidd', 'Siddham'],
  			['siddham', 'Siddham'],
  			['sind', 'Khudawadi'],
  			['khudawadi', 'Khudawadi'],
  			['sinh', 'Sinhala'],
  			['sinhala', 'Sinhala'],
  			['sora', 'Sora_Sompeng'],
  			['sorasompeng', 'Sora_Sompeng'],
  			['sund', 'Sundanese'],
  			['sundanese', 'Sundanese'],
  			['sylo', 'Syloti_Nagri'],
  			['sylotinagri', 'Syloti_Nagri'],
  			['syrc', 'Syriac'],
  			['syriac', 'Syriac'],
  			['tagb', 'Tagbanwa'],
  			['tagbanwa', 'Tagbanwa'],
  			['takr', 'Takri'],
  			['takri', 'Takri'],
  			['tale', 'Tai_Le'],
  			['taile', 'Tai_Le'],
  			['talu', 'New_Tai_Lue'],
  			['newtailue', 'New_Tai_Lue'],
  			['taml', 'Tamil'],
  			['tamil', 'Tamil'],
  			['tang', 'Tangut'],
  			['tangut', 'Tangut'],
  			['tavt', 'Tai_Viet'],
  			['taiviet', 'Tai_Viet'],
  			['telu', 'Telugu'],
  			['telugu', 'Telugu'],
  			['tfng', 'Tifinagh'],
  			['tifinagh', 'Tifinagh'],
  			['tglg', 'Tagalog'],
  			['tagalog', 'Tagalog'],
  			['thaa', 'Thaana'],
  			['thaana', 'Thaana'],
  			['thai', 'Thai'],
  			['tibt', 'Tibetan'],
  			['tibetan', 'Tibetan'],
  			['tirh', 'Tirhuta'],
  			['tirhuta', 'Tirhuta'],
  			['ugar', 'Ugaritic'],
  			['ugaritic', 'Ugaritic'],
  			['vaii', 'Vai'],
  			['vai', 'Vai'],
  			['wara', 'Warang_Citi'],
  			['warangciti', 'Warang_Citi'],
  			['xpeo', 'Old_Persian'],
  			['oldpersian', 'Old_Persian'],
  			['xsux', 'Cuneiform'],
  			['cuneiform', 'Cuneiform'],
  			['yiii', 'Yi'],
  			['yi', 'Yi'],
  			['zinh', 'Inherited'],
  			['inherited', 'Inherited'],
  			['qaai', 'Inherited'],
  			['zyyy', 'Common'],
  			['common', 'Common'],
  			['zzzz', 'Unknown'],
  			['unknown', 'Unknown']
  		])],
  		['Bidi_Class', new Map([
  			['al', 'Arabic_Letter'],
  			['arabicletter', 'Arabic_Letter'],
  			['an', 'Arabic_Number'],
  			['arabicnumber', 'Arabic_Number'],
  			['b', 'Paragraph_Separator'],
  			['paragraphseparator', 'Paragraph_Separator'],
  			['bn', 'Boundary_Neutral'],
  			['boundaryneutral', 'Boundary_Neutral'],
  			['cs', 'Common_Separator'],
  			['commonseparator', 'Common_Separator'],
  			['en', 'European_Number'],
  			['europeannumber', 'European_Number'],
  			['es', 'European_Separator'],
  			['europeanseparator', 'European_Separator'],
  			['et', 'European_Terminator'],
  			['europeanterminator', 'European_Terminator'],
  			['fsi', 'First_Strong_Isolate'],
  			['firststrongisolate', 'First_Strong_Isolate'],
  			['l', 'Left_To_Right'],
  			['lefttoright', 'Left_To_Right'],
  			['lre', 'Left_To_Right_Embedding'],
  			['lefttorightembedding', 'Left_To_Right_Embedding'],
  			['lri', 'Left_To_Right_Isolate'],
  			['lefttorightisolate', 'Left_To_Right_Isolate'],
  			['lro', 'Left_To_Right_Override'],
  			['lefttorightoverride', 'Left_To_Right_Override'],
  			['nsm', 'Nonspacing_Mark'],
  			['nonspacingmark', 'Nonspacing_Mark'],
  			['on', 'Other_Neutral'],
  			['otherneutral', 'Other_Neutral'],
  			['pdf', 'Pop_Directional_Format'],
  			['popdirectionalformat', 'Pop_Directional_Format'],
  			['pdi', 'Pop_Directional_Isolate'],
  			['popdirectionalisolate', 'Pop_Directional_Isolate'],
  			['r', 'Right_To_Left'],
  			['righttoleft', 'Right_To_Left'],
  			['rle', 'Right_To_Left_Embedding'],
  			['righttoleftembedding', 'Right_To_Left_Embedding'],
  			['rli', 'Right_To_Left_Isolate'],
  			['righttoleftisolate', 'Right_To_Left_Isolate'],
  			['rlo', 'Right_To_Left_Override'],
  			['righttoleftoverride', 'Right_To_Left_Override'],
  			['s', 'Segment_Separator'],
  			['segmentseparator', 'Segment_Separator'],
  			['ws', 'White_Space'],
  			['whitespace', 'White_Space']
  		])],
  		['Bidi_Paired_Bracket_Type', new Map([
  			['c', 'Close'],
  			['close', 'Close'],
  			['n', 'None'],
  			['none', 'None'],
  			['o', 'Open'],
  			['open', 'Open']
  		])],
  		['Canonical_Combining_Class', new Map([
  			['nr', 'Not_Reordered'],
  			['notreordered', 'Not_Reordered'],
  			['ov', 'Overlay'],
  			['overlay', 'Overlay'],
  			['nk', 'Nukta'],
  			['nukta', 'Nukta'],
  			['kv', 'Kana_Voicing'],
  			['kanavoicing', 'Kana_Voicing'],
  			['vr', 'Virama'],
  			['virama', 'Virama'],
  			['ccc10', 'CCC10'],
  			['ccc11', 'CCC11'],
  			['ccc12', 'CCC12'],
  			['ccc13', 'CCC13'],
  			['ccc14', 'CCC14'],
  			['ccc15', 'CCC15'],
  			['ccc16', 'CCC16'],
  			['ccc17', 'CCC17'],
  			['ccc18', 'CCC18'],
  			['ccc19', 'CCC19'],
  			['ccc20', 'CCC20'],
  			['ccc21', 'CCC21'],
  			['ccc22', 'CCC22'],
  			['ccc23', 'CCC23'],
  			['ccc24', 'CCC24'],
  			['ccc25', 'CCC25'],
  			['ccc26', 'CCC26'],
  			['ccc27', 'CCC27'],
  			['ccc28', 'CCC28'],
  			['ccc29', 'CCC29'],
  			['ccc30', 'CCC30'],
  			['ccc31', 'CCC31'],
  			['ccc32', 'CCC32'],
  			['ccc33', 'CCC33'],
  			['ccc34', 'CCC34'],
  			['ccc35', 'CCC35'],
  			['ccc36', 'CCC36'],
  			['ccc84', 'CCC84'],
  			['ccc91', 'CCC91'],
  			['ccc103', 'CCC103'],
  			['ccc107', 'CCC107'],
  			['ccc118', 'CCC118'],
  			['ccc122', 'CCC122'],
  			['ccc129', 'CCC129'],
  			['ccc130', 'CCC130'],
  			['ccc132', 'CCC132'],
  			['ccc133', 'CCC133'],
  			['atbl', 'Attached_Below_Left'],
  			['attachedbelowleft', 'Attached_Below_Left'],
  			['atb', 'Attached_Below'],
  			['attachedbelow', 'Attached_Below'],
  			['ata', 'Attached_Above'],
  			['attachedabove', 'Attached_Above'],
  			['atar', 'Attached_Above_Right'],
  			['attachedaboveright', 'Attached_Above_Right'],
  			['bl', 'Below_Left'],
  			['belowleft', 'Below_Left'],
  			['b', 'Below'],
  			['below', 'Below'],
  			['br', 'Below_Right'],
  			['belowright', 'Below_Right'],
  			['l', 'Left'],
  			['left', 'Left'],
  			['r', 'Right'],
  			['right', 'Right'],
  			['al', 'Above_Left'],
  			['aboveleft', 'Above_Left'],
  			['a', 'Above'],
  			['above', 'Above'],
  			['ar', 'Above_Right'],
  			['aboveright', 'Above_Right'],
  			['db', 'Double_Below'],
  			['doublebelow', 'Double_Below'],
  			['da', 'Double_Above'],
  			['doubleabove', 'Double_Above'],
  			['is', 'Iota_Subscript'],
  			['iotasubscript', 'Iota_Subscript']
  		])],
  		['Decomposition_Type', new Map([
  			['can', 'Canonical'],
  			['canonical', 'Canonical'],
  			['com', 'Compat'],
  			['compat', 'Compat'],
  			['enc', 'Circle'],
  			['circle', 'Circle'],
  			['fin', 'Final'],
  			['final', 'Final'],
  			['font', 'Font'],
  			['fra', 'Fraction'],
  			['fraction', 'Fraction'],
  			['init', 'Initial'],
  			['initial', 'Initial'],
  			['iso', 'Isolated'],
  			['isolated', 'Isolated'],
  			['med', 'Medial'],
  			['medial', 'Medial'],
  			['nar', 'Narrow'],
  			['narrow', 'Narrow'],
  			['nb', 'Nobreak'],
  			['nobreak', 'Nobreak'],
  			['none', 'None'],
  			['sml', 'Small'],
  			['small', 'Small'],
  			['sqr', 'Square'],
  			['square', 'Square'],
  			['sub', 'Sub'],
  			['sup', 'Super'],
  			['super', 'Super'],
  			['vert', 'Vertical'],
  			['vertical', 'Vertical'],
  			['wide', 'Wide']
  		])],
  		['East_Asian_Width', new Map([
  			['a', 'Ambiguous'],
  			['ambiguous', 'Ambiguous'],
  			['f', 'Fullwidth'],
  			['fullwidth', 'Fullwidth'],
  			['h', 'Halfwidth'],
  			['halfwidth', 'Halfwidth'],
  			['n', 'Neutral'],
  			['neutral', 'Neutral'],
  			['na', 'Narrow'],
  			['narrow', 'Narrow'],
  			['w', 'Wide'],
  			['wide', 'Wide']
  		])],
  		['General_Category', new Map([
  			['c', 'Other'],
  			['other', 'Other'],
  			['cc', 'Control'],
  			['control', 'Control'],
  			['cntrl', 'Control'],
  			['cf', 'Format'],
  			['format', 'Format'],
  			['cn', 'Unassigned'],
  			['unassigned', 'Unassigned'],
  			['co', 'Private_Use'],
  			['privateuse', 'Private_Use'],
  			['cs', 'Surrogate'],
  			['surrogate', 'Surrogate'],
  			['l', 'Letter'],
  			['letter', 'Letter'],
  			['lc', 'Cased_Letter'],
  			['casedletter', 'Cased_Letter'],
  			['ll', 'Lowercase_Letter'],
  			['lowercaseletter', 'Lowercase_Letter'],
  			['lm', 'Modifier_Letter'],
  			['modifierletter', 'Modifier_Letter'],
  			['lo', 'Other_Letter'],
  			['otherletter', 'Other_Letter'],
  			['lt', 'Titlecase_Letter'],
  			['titlecaseletter', 'Titlecase_Letter'],
  			['lu', 'Uppercase_Letter'],
  			['uppercaseletter', 'Uppercase_Letter'],
  			['m', 'Mark'],
  			['mark', 'Mark'],
  			['combiningmark', 'Mark'],
  			['mc', 'Spacing_Mark'],
  			['spacingmark', 'Spacing_Mark'],
  			['me', 'Enclosing_Mark'],
  			['enclosingmark', 'Enclosing_Mark'],
  			['mn', 'Nonspacing_Mark'],
  			['nonspacingmark', 'Nonspacing_Mark'],
  			['n', 'Number'],
  			['number', 'Number'],
  			['nd', 'Decimal_Number'],
  			['decimalnumber', 'Decimal_Number'],
  			['digit', 'Decimal_Number'],
  			['nl', 'Letter_Number'],
  			['letternumber', 'Letter_Number'],
  			['no', 'Other_Number'],
  			['othernumber', 'Other_Number'],
  			['p', 'Punctuation'],
  			['punctuation', 'Punctuation'],
  			['punct', 'Punctuation'],
  			['pc', 'Connector_Punctuation'],
  			['connectorpunctuation', 'Connector_Punctuation'],
  			['pd', 'Dash_Punctuation'],
  			['dashpunctuation', 'Dash_Punctuation'],
  			['pe', 'Close_Punctuation'],
  			['closepunctuation', 'Close_Punctuation'],
  			['pf', 'Final_Punctuation'],
  			['finalpunctuation', 'Final_Punctuation'],
  			['pi', 'Initial_Punctuation'],
  			['initialpunctuation', 'Initial_Punctuation'],
  			['po', 'Other_Punctuation'],
  			['otherpunctuation', 'Other_Punctuation'],
  			['ps', 'Open_Punctuation'],
  			['openpunctuation', 'Open_Punctuation'],
  			['s', 'Symbol'],
  			['symbol', 'Symbol'],
  			['sc', 'Currency_Symbol'],
  			['currencysymbol', 'Currency_Symbol'],
  			['sk', 'Modifier_Symbol'],
  			['modifiersymbol', 'Modifier_Symbol'],
  			['sm', 'Math_Symbol'],
  			['mathsymbol', 'Math_Symbol'],
  			['so', 'Other_Symbol'],
  			['othersymbol', 'Other_Symbol'],
  			['z', 'Separator'],
  			['separator', 'Separator'],
  			['zl', 'Line_Separator'],
  			['lineseparator', 'Line_Separator'],
  			['zp', 'Paragraph_Separator'],
  			['paragraphseparator', 'Paragraph_Separator'],
  			['zs', 'Space_Separator'],
  			['spaceseparator', 'Space_Separator']
  		])],
  		['Grapheme_Cluster_Break', new Map([
  			['cn', 'Control'],
  			['control', 'Control'],
  			['cr', 'CR'],
  			['eb', 'E_Base'],
  			['ebase', 'E_Base'],
  			['ebg', 'E_Base_GAZ'],
  			['ebasegaz', 'E_Base_GAZ'],
  			['em', 'E_Modifier'],
  			['emodifier', 'E_Modifier'],
  			['ex', 'Extend'],
  			['extend', 'Extend'],
  			['gaz', 'Glue_After_Zwj'],
  			['glueafterzwj', 'Glue_After_Zwj'],
  			['l', 'L'],
  			['lf', 'LF'],
  			['lv', 'LV'],
  			['lvt', 'LVT'],
  			['pp', 'Prepend'],
  			['prepend', 'Prepend'],
  			['ri', 'Regional_Indicator'],
  			['regionalindicator', 'Regional_Indicator'],
  			['sm', 'SpacingMark'],
  			['spacingmark', 'SpacingMark'],
  			['t', 'T'],
  			['v', 'V'],
  			['xx', 'Other'],
  			['other', 'Other'],
  			['zwj', 'ZWJ']
  		])],
  		['Hangul_Syllable_Type', new Map([
  			['l', 'Leading_Jamo'],
  			['leadingjamo', 'Leading_Jamo'],
  			['lv', 'LV_Syllable'],
  			['lvsyllable', 'LV_Syllable'],
  			['lvt', 'LVT_Syllable'],
  			['lvtsyllable', 'LVT_Syllable'],
  			['na', 'Not_Applicable'],
  			['notapplicable', 'Not_Applicable'],
  			['t', 'Trailing_Jamo'],
  			['trailingjamo', 'Trailing_Jamo'],
  			['v', 'Vowel_Jamo'],
  			['voweljamo', 'Vowel_Jamo']
  		])],
  		['Indic_Positional_Category', new Map([
  			['bottom', 'Bottom'],
  			['bottomandright', 'Bottom_And_Right'],
  			['left', 'Left'],
  			['leftandright', 'Left_And_Right'],
  			['na', 'NA'],
  			['overstruck', 'Overstruck'],
  			['right', 'Right'],
  			['top', 'Top'],
  			['topandbottom', 'Top_And_Bottom'],
  			['topandbottomandright', 'Top_And_Bottom_And_Right'],
  			['topandleft', 'Top_And_Left'],
  			['topandleftandright', 'Top_And_Left_And_Right'],
  			['topandright', 'Top_And_Right'],
  			['visualorderleft', 'Visual_Order_Left']
  		])],
  		['Indic_Syllabic_Category', new Map([
  			['avagraha', 'Avagraha'],
  			['bindu', 'Bindu'],
  			['brahmijoiningnumber', 'Brahmi_Joining_Number'],
  			['cantillationmark', 'Cantillation_Mark'],
  			['consonant', 'Consonant'],
  			['consonantdead', 'Consonant_Dead'],
  			['consonantfinal', 'Consonant_Final'],
  			['consonantheadletter', 'Consonant_Head_Letter'],
  			['consonantkiller', 'Consonant_Killer'],
  			['consonantmedial', 'Consonant_Medial'],
  			['consonantplaceholder', 'Consonant_Placeholder'],
  			['consonantprecedingrepha', 'Consonant_Preceding_Repha'],
  			['consonantprefixed', 'Consonant_Prefixed'],
  			['consonantsubjoined', 'Consonant_Subjoined'],
  			['consonantsucceedingrepha', 'Consonant_Succeeding_Repha'],
  			['consonantwithstacker', 'Consonant_With_Stacker'],
  			['geminationmark', 'Gemination_Mark'],
  			['invisiblestacker', 'Invisible_Stacker'],
  			['joiner', 'Joiner'],
  			['modifyingletter', 'Modifying_Letter'],
  			['nonjoiner', 'Non_Joiner'],
  			['nukta', 'Nukta'],
  			['number', 'Number'],
  			['numberjoiner', 'Number_Joiner'],
  			['other', 'Other'],
  			['purekiller', 'Pure_Killer'],
  			['registershifter', 'Register_Shifter'],
  			['syllablemodifier', 'Syllable_Modifier'],
  			['toneletter', 'Tone_Letter'],
  			['tonemark', 'Tone_Mark'],
  			['virama', 'Virama'],
  			['visarga', 'Visarga'],
  			['vowel', 'Vowel'],
  			['voweldependent', 'Vowel_Dependent'],
  			['vowelindependent', 'Vowel_Independent']
  		])],
  		['Joining_Group', new Map([
  			['africanfeh', 'African_Feh'],
  			['africannoon', 'African_Noon'],
  			['africanqaf', 'African_Qaf'],
  			['ain', 'Ain'],
  			['alaph', 'Alaph'],
  			['alef', 'Alef'],
  			['beh', 'Beh'],
  			['beth', 'Beth'],
  			['burushaskiyehbarree', 'Burushaski_Yeh_Barree'],
  			['dal', 'Dal'],
  			['dalathrish', 'Dalath_Rish'],
  			['e', 'E'],
  			['farsiyeh', 'Farsi_Yeh'],
  			['fe', 'Fe'],
  			['feh', 'Feh'],
  			['finalsemkath', 'Final_Semkath'],
  			['gaf', 'Gaf'],
  			['gamal', 'Gamal'],
  			['hah', 'Hah'],
  			['he', 'He'],
  			['heh', 'Heh'],
  			['hehgoal', 'Heh_Goal'],
  			['heth', 'Heth'],
  			['kaf', 'Kaf'],
  			['kaph', 'Kaph'],
  			['khaph', 'Khaph'],
  			['knottedheh', 'Knotted_Heh'],
  			['lam', 'Lam'],
  			['lamadh', 'Lamadh'],
  			['manichaeanaleph', 'Manichaean_Aleph'],
  			['manichaeanayin', 'Manichaean_Ayin'],
  			['manichaeanbeth', 'Manichaean_Beth'],
  			['manichaeandaleth', 'Manichaean_Daleth'],
  			['manichaeandhamedh', 'Manichaean_Dhamedh'],
  			['manichaeanfive', 'Manichaean_Five'],
  			['manichaeangimel', 'Manichaean_Gimel'],
  			['manichaeanheth', 'Manichaean_Heth'],
  			['manichaeanhundred', 'Manichaean_Hundred'],
  			['manichaeankaph', 'Manichaean_Kaph'],
  			['manichaeanlamedh', 'Manichaean_Lamedh'],
  			['manichaeanmem', 'Manichaean_Mem'],
  			['manichaeannun', 'Manichaean_Nun'],
  			['manichaeanone', 'Manichaean_One'],
  			['manichaeanpe', 'Manichaean_Pe'],
  			['manichaeanqoph', 'Manichaean_Qoph'],
  			['manichaeanresh', 'Manichaean_Resh'],
  			['manichaeansadhe', 'Manichaean_Sadhe'],
  			['manichaeansamekh', 'Manichaean_Samekh'],
  			['manichaeantaw', 'Manichaean_Taw'],
  			['manichaeanten', 'Manichaean_Ten'],
  			['manichaeanteth', 'Manichaean_Teth'],
  			['manichaeanthamedh', 'Manichaean_Thamedh'],
  			['manichaeantwenty', 'Manichaean_Twenty'],
  			['manichaeanwaw', 'Manichaean_Waw'],
  			['manichaeanyodh', 'Manichaean_Yodh'],
  			['manichaeanzayin', 'Manichaean_Zayin'],
  			['meem', 'Meem'],
  			['mim', 'Mim'],
  			['nojoininggroup', 'No_Joining_Group'],
  			['noon', 'Noon'],
  			['nun', 'Nun'],
  			['nya', 'Nya'],
  			['pe', 'Pe'],
  			['qaf', 'Qaf'],
  			['qaph', 'Qaph'],
  			['reh', 'Reh'],
  			['reversedpe', 'Reversed_Pe'],
  			['rohingyayeh', 'Rohingya_Yeh'],
  			['sad', 'Sad'],
  			['sadhe', 'Sadhe'],
  			['seen', 'Seen'],
  			['semkath', 'Semkath'],
  			['shin', 'Shin'],
  			['straightwaw', 'Straight_Waw'],
  			['swashkaf', 'Swash_Kaf'],
  			['syriacwaw', 'Syriac_Waw'],
  			['tah', 'Tah'],
  			['taw', 'Taw'],
  			['tehmarbuta', 'Teh_Marbuta'],
  			['tehmarbutagoal', 'Hamza_On_Heh_Goal'],
  			['hamzaonhehgoal', 'Hamza_On_Heh_Goal'],
  			['teth', 'Teth'],
  			['waw', 'Waw'],
  			['yeh', 'Yeh'],
  			['yehbarree', 'Yeh_Barree'],
  			['yehwithtail', 'Yeh_With_Tail'],
  			['yudh', 'Yudh'],
  			['yudhhe', 'Yudh_He'],
  			['zain', 'Zain'],
  			['zhain', 'Zhain']
  		])],
  		['Joining_Type', new Map([
  			['c', 'Join_Causing'],
  			['joincausing', 'Join_Causing'],
  			['d', 'Dual_Joining'],
  			['dualjoining', 'Dual_Joining'],
  			['l', 'Left_Joining'],
  			['leftjoining', 'Left_Joining'],
  			['r', 'Right_Joining'],
  			['rightjoining', 'Right_Joining'],
  			['t', 'Transparent'],
  			['transparent', 'Transparent'],
  			['u', 'Non_Joining'],
  			['nonjoining', 'Non_Joining']
  		])],
  		['Line_Break', new Map([
  			['ai', 'Ambiguous'],
  			['ambiguous', 'Ambiguous'],
  			['al', 'Alphabetic'],
  			['alphabetic', 'Alphabetic'],
  			['b2', 'Break_Both'],
  			['breakboth', 'Break_Both'],
  			['ba', 'Break_After'],
  			['breakafter', 'Break_After'],
  			['bb', 'Break_Before'],
  			['breakbefore', 'Break_Before'],
  			['bk', 'Mandatory_Break'],
  			['mandatorybreak', 'Mandatory_Break'],
  			['cb', 'Contingent_Break'],
  			['contingentbreak', 'Contingent_Break'],
  			['cj', 'Conditional_Japanese_Starter'],
  			['conditionaljapanesestarter', 'Conditional_Japanese_Starter'],
  			['cl', 'Close_Punctuation'],
  			['closepunctuation', 'Close_Punctuation'],
  			['cm', 'Combining_Mark'],
  			['combiningmark', 'Combining_Mark'],
  			['cp', 'Close_Parenthesis'],
  			['closeparenthesis', 'Close_Parenthesis'],
  			['cr', 'Carriage_Return'],
  			['carriagereturn', 'Carriage_Return'],
  			['eb', 'E_Base'],
  			['ebase', 'E_Base'],
  			['em', 'E_Modifier'],
  			['emodifier', 'E_Modifier'],
  			['ex', 'Exclamation'],
  			['exclamation', 'Exclamation'],
  			['gl', 'Glue'],
  			['glue', 'Glue'],
  			['h2', 'H2'],
  			['h3', 'H3'],
  			['hl', 'Hebrew_Letter'],
  			['hebrewletter', 'Hebrew_Letter'],
  			['hy', 'Hyphen'],
  			['hyphen', 'Hyphen'],
  			['id', 'Ideographic'],
  			['ideographic', 'Ideographic'],
  			['in', 'Inseparable'],
  			['inseparable', 'Inseparable'],
  			['inseperable', 'Inseparable'],
  			['is', 'Infix_Numeric'],
  			['infixnumeric', 'Infix_Numeric'],
  			['jl', 'JL'],
  			['jt', 'JT'],
  			['jv', 'JV'],
  			['lf', 'Line_Feed'],
  			['linefeed', 'Line_Feed'],
  			['nl', 'Next_Line'],
  			['nextline', 'Next_Line'],
  			['ns', 'Nonstarter'],
  			['nonstarter', 'Nonstarter'],
  			['nu', 'Numeric'],
  			['numeric', 'Numeric'],
  			['op', 'Open_Punctuation'],
  			['openpunctuation', 'Open_Punctuation'],
  			['po', 'Postfix_Numeric'],
  			['postfixnumeric', 'Postfix_Numeric'],
  			['pr', 'Prefix_Numeric'],
  			['prefixnumeric', 'Prefix_Numeric'],
  			['qu', 'Quotation'],
  			['quotation', 'Quotation'],
  			['ri', 'Regional_Indicator'],
  			['regionalindicator', 'Regional_Indicator'],
  			['sa', 'Complex_Context'],
  			['complexcontext', 'Complex_Context'],
  			['sg', 'Surrogate'],
  			['surrogate', 'Surrogate'],
  			['sp', 'Space'],
  			['space', 'Space'],
  			['sy', 'Break_Symbols'],
  			['breaksymbols', 'Break_Symbols'],
  			['wj', 'Word_Joiner'],
  			['wordjoiner', 'Word_Joiner'],
  			['xx', 'Unknown'],
  			['unknown', 'Unknown'],
  			['zw', 'ZWSpace'],
  			['zwspace', 'ZWSpace'],
  			['zwj', 'ZWJ']
  		])],
  		['NFC_Quick_Check', new Map([
  			['m', 'Maybe'],
  			['maybe', 'Maybe'],
  			['n', 'No'],
  			['no', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes']
  		])],
  		['NFD_Quick_Check', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes']
  		])],
  		['NFKC_Quick_Check', new Map([
  			['m', 'Maybe'],
  			['maybe', 'Maybe'],
  			['n', 'No'],
  			['no', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes']
  		])],
  		['NFKD_Quick_Check', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes']
  		])],
  		['Numeric_Type', new Map([
  			['de', 'Decimal'],
  			['decimal', 'Decimal'],
  			['di', 'Digit'],
  			['digit', 'Digit'],
  			['none', 'None'],
  			['nu', 'Numeric'],
  			['numeric', 'Numeric']
  		])],
  		['Sentence_Break', new Map([
  			['at', 'ATerm'],
  			['aterm', 'ATerm'],
  			['cl', 'Close'],
  			['close', 'Close'],
  			['cr', 'CR'],
  			['ex', 'Extend'],
  			['extend', 'Extend'],
  			['fo', 'Format'],
  			['format', 'Format'],
  			['le', 'OLetter'],
  			['oletter', 'OLetter'],
  			['lf', 'LF'],
  			['lo', 'Lower'],
  			['lower', 'Lower'],
  			['nu', 'Numeric'],
  			['numeric', 'Numeric'],
  			['sc', 'SContinue'],
  			['scontinue', 'SContinue'],
  			['se', 'Sep'],
  			['sep', 'Sep'],
  			['sp', 'Sp'],
  			['st', 'STerm'],
  			['sterm', 'STerm'],
  			['up', 'Upper'],
  			['upper', 'Upper'],
  			['xx', 'Other'],
  			['other', 'Other']
  		])],
  		['Word_Break', new Map([
  			['cr', 'CR'],
  			['dq', 'Double_Quote'],
  			['doublequote', 'Double_Quote'],
  			['eb', 'E_Base'],
  			['ebase', 'E_Base'],
  			['ebg', 'E_Base_GAZ'],
  			['ebasegaz', 'E_Base_GAZ'],
  			['em', 'E_Modifier'],
  			['emodifier', 'E_Modifier'],
  			['ex', 'ExtendNumLet'],
  			['extendnumlet', 'ExtendNumLet'],
  			['extend', 'Extend'],
  			['fo', 'Format'],
  			['format', 'Format'],
  			['gaz', 'Glue_After_Zwj'],
  			['glueafterzwj', 'Glue_After_Zwj'],
  			['hl', 'Hebrew_Letter'],
  			['hebrewletter', 'Hebrew_Letter'],
  			['ka', 'Katakana'],
  			['katakana', 'Katakana'],
  			['le', 'ALetter'],
  			['aletter', 'ALetter'],
  			['lf', 'LF'],
  			['mb', 'MidNumLet'],
  			['midnumlet', 'MidNumLet'],
  			['ml', 'MidLetter'],
  			['midletter', 'MidLetter'],
  			['mn', 'MidNum'],
  			['midnum', 'MidNum'],
  			['nl', 'Newline'],
  			['newline', 'Newline'],
  			['nu', 'Numeric'],
  			['numeric', 'Numeric'],
  			['ri', 'Regional_Indicator'],
  			['regionalindicator', 'Regional_Indicator'],
  			['sq', 'Single_Quote'],
  			['singlequote', 'Single_Quote'],
  			['xx', 'Other'],
  			['other', 'Other'],
  			['zwj', 'ZWJ']
  		])],
  		['ASCII_Hex_Digit', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Alphabetic', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Bidi_Control', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Bidi_Mirrored', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Cased', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Composition_Exclusion', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Case_Ignorable', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Full_Composition_Exclusion', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Changes_When_Casefolded', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Changes_When_Casemapped', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Changes_When_NFKC_Casefolded', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Changes_When_Lowercased', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Changes_When_Titlecased', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Changes_When_Uppercased', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Dash', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Deprecated', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Default_Ignorable_Code_Point', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Diacritic', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Extender', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Grapheme_Base', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Grapheme_Extend', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Grapheme_Link', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Hex_Digit', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Hyphen', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['ID_Continue', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Ideographic', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['ID_Start', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['IDS_Binary_Operator', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['IDS_Trinary_Operator', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Join_Control', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Logical_Order_Exception', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Lowercase', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Math', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Noncharacter_Code_Point', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_Alphabetic', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_Default_Ignorable_Code_Point', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_Grapheme_Extend', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_ID_Continue', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_ID_Start', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_Lowercase', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_Math', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Other_Uppercase', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Pattern_Syntax', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Pattern_White_Space', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Prepended_Concatenation_Mark', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Quotation_Mark', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Radical', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Soft_Dotted', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Sentence_Terminal', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Terminal_Punctuation', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Unified_Ideograph', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Uppercase', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Variation_Selector', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['White_Space', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['XID_Continue', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['XID_Start', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Expands_On_NFC', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Expands_On_NFD', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Expands_On_NFKC', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])],
  		['Expands_On_NFKD', new Map([
  			['n', 'No'],
  			['no', 'No'],
  			['f', 'No'],
  			['false', 'No'],
  			['y', 'Yes'],
  			['yes', 'Yes'],
  			['t', 'Yes'],
  			['true', 'Yes']
  		])]
  	])
  };
  });

  var require$$0$3 = (mappings && typeof mappings === 'object' && 'default' in mappings ? mappings['default'] : mappings);

  var index$1 = __commonjs(function (module) {
  'use strict';

  var mappings = require$$0$3;
  var aliasToProperty = mappings.aliasToProperty;
  var propertyToValueAliases = mappings.propertyToValueAliases;

  var normalize = function(string) {
  	var normalized = string
  		// Remove case distinctions.
  		.toLowerCase()
  		// Remove whitespace.
  		.replace(/\s/g, '')
  		// Remove `-` and `_`.
  		.replace(/[-_]/g, '');
  	return normalized;
  };

  var matchLoosely = function(property, value) {
  	var normalizedProperty = normalize(property);
  	var canonicalProperty = aliasToProperty.get(normalizedProperty);
  	if (!canonicalProperty) {
  		throw new Error(("Unknown property: " + property));
  	}
  	var aliasToValue = propertyToValueAliases.get(
  		canonicalProperty == 'Script_Extensions' ? 'Script' : canonicalProperty
  	);
  	var result = {
  		'property': canonicalProperty
  	};
  	if (value) {
  		var normalizedValue = normalize(value);
  		var canonicalValue = aliasToValue.get(normalizedValue);
  		if (canonicalValue) {
  			result.value = canonicalValue;
  		}
  	}
  	return result;
  };

  module.exports = matchLoosely;
  });

  var require$$3 = (index$1 && typeof index$1 === 'object' && 'default' in index$1 ? index$1['default'] : index$1);

  var parser = __commonjs(function (module) {
  // regjsparser
  //
  // ==================================================================
  //
  // See ECMA-262 Standard: 15.10.1
  //
  // NOTE: The ECMA-262 standard uses the term "Assertion" for /^/. Here the
  //   term "Anchor" is used.
  //
  // Pattern ::
  //      Disjunction
  //
  // Disjunction ::
  //      Alternative
  //      Alternative | Disjunction
  //
  // Alternative ::
  //      [empty]
  //      Alternative Term
  //
  // Term ::
  //      Anchor
  //      Atom
  //      Atom Quantifier
  //
  // Anchor ::
  //      ^
  //      $
  //      \ b
  //      \ B
  //      ( ? = Disjunction )
  //      ( ? ! Disjunction )
  //
  // Quantifier ::
  //      QuantifierPrefix
  //      QuantifierPrefix ?
  //
  // QuantifierPrefix ::
  //      *
  //      +
  //      ?
  //      { DecimalDigits }
  //      { DecimalDigits , }
  //      { DecimalDigits , DecimalDigits }
  //
  // Atom ::
  //      PatternCharacter
  //      .
  //      \ AtomEscape
  //      CharacterClass
  //      ( Disjunction )
  //      ( ? : Disjunction )
  //
  // PatternCharacter ::
  //      SourceCharacter but not any of: ^ $ \ . * + ? ( ) [ ] { } |
  //
  // AtomEscape ::
  //      DecimalEscape
  //      CharacterEscape
  //      CharacterClassEscape
  //
  // CharacterEscape[U] ::
  //      ControlEscape
  //      c ControlLetter
  //      HexEscapeSequence
  //      RegExpUnicodeEscapeSequence[?U] (ES6)
  //      IdentityEscape[?U]
  //
  // ControlEscape ::
  //      one of f n r t v
  // ControlLetter ::
  //      one of
  //          a b c d e f g h i j k l m n o p q r s t u v w x y z
  //          A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
  //
  // IdentityEscape ::
  //      SourceCharacter but not IdentifierPart
  //      <ZWJ>
  //      <ZWNJ>
  //
  // DecimalEscape ::
  //      DecimalIntegerLiteral [lookahead ∉ DecimalDigit]
  //
  // CharacterClassEscape ::
  //      one of d D s S w W
  //
  // CharacterClass ::
  //      [ [lookahead ∉ {^}] ClassRanges ]
  //      [ ^ ClassRanges ]
  //
  // ClassRanges ::
  //      [empty]
  //      NonemptyClassRanges
  //
  // NonemptyClassRanges ::
  //      ClassAtom
  //      ClassAtom NonemptyClassRangesNoDash
  //      ClassAtom - ClassAtom ClassRanges
  //
  // NonemptyClassRangesNoDash ::
  //      ClassAtom
  //      ClassAtomNoDash NonemptyClassRangesNoDash
  //      ClassAtomNoDash - ClassAtom ClassRanges
  //
  // ClassAtom ::
  //      -
  //      ClassAtomNoDash
  //
  // ClassAtomNoDash ::
  //      SourceCharacter but not one of \ or ] or -
  //      \ ClassEscape
  //
  // ClassEscape ::
  //      DecimalEscape
  //      b
  //      CharacterEscape
  //      CharacterClassEscape

  (function() {

    function parse(str, flags, features) {
      if (!features) {
        features = {};
      }
      function addRaw(node) {
        node.raw = str.substring(node.range[0], node.range[1]);
        return node;
      }

      function updateRawStart(node, start) {
        node.range[0] = start;
        return addRaw(node);
      }

      function createAnchor(kind, rawLength) {
        return addRaw({
          type: 'anchor',
          kind: kind,
          range: [
            pos - rawLength,
            pos
          ]
        });
      }

      function createValue(kind, codePoint, from, to) {
        return addRaw({
          type: 'value',
          kind: kind,
          codePoint: codePoint,
          range: [from, to]
        });
      }

      function createEscaped(kind, codePoint, value, fromOffset) {
        fromOffset = fromOffset || 0;
        return createValue(kind, codePoint, pos - (value.length + fromOffset), pos);
      }

      function createCharacter(matches) {
        var _char = matches[0];
        var first = _char.charCodeAt(0);
        if (hasUnicodeFlag) {
          var second;
          if (_char.length === 1 && first >= 0xD800 && first <= 0xDBFF) {
            second = lookahead().charCodeAt(0);
            if (second >= 0xDC00 && second <= 0xDFFF) {
              // Unicode surrogate pair
              pos++;
              return createValue(
                  'symbol',
                  (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000,
                  pos - 2, pos);
            }
          }
        }
        return createValue('symbol', first, pos - 1, pos);
      }

      function createDisjunction(alternatives, from, to) {
        return addRaw({
          type: 'disjunction',
          body: alternatives,
          range: [
            from,
            to
          ]
        });
      }

      function createDot() {
        return addRaw({
          type: 'dot',
          range: [
            pos - 1,
            pos
          ]
        });
      }

      function createCharacterClassEscape(value) {
        return addRaw({
          type: 'characterClassEscape',
          value: value,
          range: [
            pos - 2,
            pos
          ]
        });
      }

      function createReference(matchIndex) {
        return addRaw({
          type: 'reference',
          matchIndex: parseInt(matchIndex, 10),
          range: [
            pos - 1 - matchIndex.length,
            pos
          ]
        });
      }

      function createGroup(behavior, disjunction, from, to) {
        return addRaw({
          type: 'group',
          behavior: behavior,
          body: disjunction,
          range: [
            from,
            to
          ]
        });
      }

      function createQuantifier(min, max, from, to) {
        if (to == null) {
          from = pos - 1;
          to = pos;
        }

        return addRaw({
          type: 'quantifier',
          min: min,
          max: max,
          greedy: true,
          body: null, // set later on
          range: [
            from,
            to
          ]
        });
      }

      function createAlternative(terms, from, to) {
        return addRaw({
          type: 'alternative',
          body: terms,
          range: [
            from,
            to
          ]
        });
      }

      function createCharacterClass(classRanges, negative, from, to) {
        return addRaw({
          type: 'characterClass',
          body: classRanges,
          negative: negative,
          range: [
            from,
            to
          ]
        });
      }

      function createClassRange(min, max, from, to) {
        // See 15.10.2.15:
        if (min.codePoint > max.codePoint) {
          bail('invalid range in character class', min.raw + '-' + max.raw, from, to);
        }

        return addRaw({
          type: 'characterClassRange',
          min: min,
          max: max,
          range: [
            from,
            to
          ]
        });
      }

      function flattenBody(body) {
        if (body.type === 'alternative') {
          return body.body;
        } else {
          return [body];
        }
      }

      function isEmpty(obj) {
        return obj.type === 'empty';
      }

      function incr(amount) {
        amount = (amount || 1);
        var res = str.substring(pos, pos + amount);
        pos += (amount || 1);
        return res;
      }

      function skip(value) {
        if (!match(value)) {
          bail('character', value);
        }
      }

      function match(value) {
        if (str.indexOf(value, pos) === pos) {
          return incr(value.length);
        }
      }

      function lookahead() {
        return str[pos];
      }

      function current(value) {
        return str.indexOf(value, pos) === pos;
      }

      function next(value) {
        return str[pos + 1] === value;
      }

      function matchReg(regExp) {
        var subStr = str.substring(pos);
        var res = subStr.match(regExp);
        if (res) {
          res.range = [];
          res.range[0] = pos;
          incr(res[0].length);
          res.range[1] = pos;
        }
        return res;
      }

      function parseDisjunction() {
        // Disjunction ::
        //      Alternative
        //      Alternative | Disjunction
        var res = [], from = pos;
        res.push(parseAlternative());

        while (match('|')) {
          res.push(parseAlternative());
        }

        if (res.length === 1) {
          return res[0];
        }

        return createDisjunction(res, from, pos);
      }

      function parseAlternative() {
        var res = [], from = pos;
        var term;

        // Alternative ::
        //      [empty]
        //      Alternative Term
        while (term = parseTerm()) {
          res.push(term);
        }

        if (res.length === 1) {
          return res[0];
        }

        return createAlternative(res, from, pos);
      }

      function parseTerm() {
        // Term ::
        //      Anchor
        //      Atom
        //      Atom Quantifier

        if (pos >= str.length || current('|') || current(')')) {
          return null; /* Means: The term is empty */
        }

        var anchor = parseAnchor();

        if (anchor) {
          return anchor;
        }

        var atom = parseAtom();
        if (!atom) {
          bail('Expected atom');
        }
        var quantifier = parseQuantifier() || false;
        if (quantifier) {
          quantifier.body = flattenBody(atom);
          // The quantifier contains the atom. Therefore, the beginning of the
          // quantifier range is given by the beginning of the atom.
          updateRawStart(quantifier, atom.range[0]);
          return quantifier;
        }
        return atom;
      }

      function parseGroup(matchA, typeA, matchB, typeB) {
        var type = null, from = pos;

        if (match(matchA)) {
          type = typeA;
        } else if (match(matchB)) {
          type = typeB;
        } else {
          return false;
        }

        var body = parseDisjunction();
        if (!body) {
          bail('Expected disjunction');
        }
        skip(')');
        var group = createGroup(type, flattenBody(body), from, pos);

        if (type == 'normal') {
          // Keep track of the number of closed groups. This is required for
          // parseDecimalEscape(). In case the string is parsed a second time the
          // value already holds the total count and no incrementation is required.
          if (firstIteration) {
            closedCaptureCounter++;
          }
        }
        return group;
      }

      function parseAnchor() {
        // Anchor ::
        //      ^
        //      $
        //      \ b
        //      \ B
        //      ( ? = Disjunction )
        //      ( ? ! Disjunction )
        var res, from = pos;

        if (match('^')) {
          return createAnchor('start', 1 /* rawLength */);
        } else if (match('$')) {
          return createAnchor('end', 1 /* rawLength */);
        } else if (match('\\b')) {
          return createAnchor('boundary', 2 /* rawLength */);
        } else if (match('\\B')) {
          return createAnchor('not-boundary', 2 /* rawLength */);
        } else {
          return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
        }
      }

      function parseQuantifier() {
        // Quantifier ::
        //      QuantifierPrefix
        //      QuantifierPrefix ?
        //
        // QuantifierPrefix ::
        //      *
        //      +
        //      ?
        //      { DecimalDigits }
        //      { DecimalDigits , }
        //      { DecimalDigits , DecimalDigits }

        var res, from = pos;
        var quantifier;
        var min, max;

        if (match('*')) {
          quantifier = createQuantifier(0);
        }
        else if (match('+')) {
          quantifier = createQuantifier(1);
        }
        else if (match('?')) {
          quantifier = createQuantifier(0, 1);
        }
        else if (res = matchReg(/^\{([0-9]+)\}/)) {
          min = parseInt(res[1], 10);
          quantifier = createQuantifier(min, min, res.range[0], res.range[1]);
        }
        else if (res = matchReg(/^\{([0-9]+),\}/)) {
          min = parseInt(res[1], 10);
          quantifier = createQuantifier(min, undefined, res.range[0], res.range[1]);
        }
        else if (res = matchReg(/^\{([0-9]+),([0-9]+)\}/)) {
          min = parseInt(res[1], 10);
          max = parseInt(res[2], 10);
          if (min > max) {
            bail('numbers out of order in {} quantifier', '', from, pos);
          }
          quantifier = createQuantifier(min, max, res.range[0], res.range[1]);
        }

        if (quantifier) {
          if (match('?')) {
            quantifier.greedy = false;
            quantifier.range[1] += 1;
          }
        }

        return quantifier;
      }

      function parseAtom() {
        // Atom ::
        //      PatternCharacter
        //      .
        //      \ AtomEscape
        //      CharacterClass
        //      ( Disjunction )
        //      ( ? : Disjunction )

        var res;

        // jviereck: allow ']', '}' here as well to be compatible with browser's
        //   implementations: ']'.match(/]/);
        // if (res = matchReg(/^[^^$\\.*+?()[\]{}|]/)) {
        if (res = matchReg(/^[^^$\\.*+?(){[|]/)) {
          //      PatternCharacter
          return createCharacter(res);
        }
        else if (match('.')) {
          //      .
          return createDot();
        }
        else if (match('\\')) {
          //      \ AtomEscape
          res = parseAtomEscape();
          if (!res) {
            bail('atomEscape');
          }
          return res;
        }
        else if (res = parseCharacterClass()) {
          return res;
        }
        else {
          //      ( Disjunction )
          //      ( ? : Disjunction )
          return parseGroup('(?:', 'ignore', '(', 'normal');
        }
      }

      function parseUnicodeSurrogatePairEscape(firstEscape) {
        if (hasUnicodeFlag) {
          var first, second;
          if (firstEscape.kind == 'unicodeEscape' &&
            (first = firstEscape.codePoint) >= 0xD800 && first <= 0xDBFF &&
            current('\\') && next('u') ) {
            var prevPos = pos;
            pos++;
            var secondEscape = parseClassEscape();
            if (secondEscape.kind == 'unicodeEscape' &&
              (second = secondEscape.codePoint) >= 0xDC00 && second <= 0xDFFF) {
              // Unicode surrogate pair
              firstEscape.range[1] = secondEscape.range[1];
              firstEscape.codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
              firstEscape.type = 'value';
              firstEscape.kind = 'unicodeCodePointEscape';
              addRaw(firstEscape);
            }
            else {
              pos = prevPos;
            }
          }
        }
        return firstEscape;
      }

      function parseClassEscape() {
        return parseAtomEscape(true);
      }

      function parseAtomEscape(insideCharacterClass) {
        // AtomEscape ::
        //      DecimalEscape
        //      CharacterEscape
        //      CharacterClassEscape

        var res, from = pos;

        res = parseDecimalEscape();
        if (res) {
          return res;
        }

        // For ClassEscape
        if (insideCharacterClass) {
          if (match('b')) {
            // 15.10.2.19
            // The production ClassEscape :: b evaluates by returning the
            // CharSet containing the one character <BS> (Unicode value 0008).
            return createEscaped('singleEscape', 0x0008, '\\b');
          } else if (match('B')) {
            bail('\\B not possible inside of CharacterClass', '', from);
          }
        }

        res = parseCharacterEscape();

        return res;
      }


      function parseDecimalEscape() {
        // DecimalEscape ::
        //      DecimalIntegerLiteral [lookahead ∉ DecimalDigit]
        //      CharacterClassEscape :: one of d D s S w W

        var res, match;

        if (res = matchReg(/^(?!0)\d+/)) {
          match = res[0];
          var refIdx = parseInt(res[0], 10);
          if (refIdx <= closedCaptureCounter) {
            // If the number is smaller than the normal-groups found so
            // far, then it is a reference...
            return createReference(res[0]);
          } else {
            // ... otherwise it needs to be interpreted as a octal (if the
            // number is in an octal format). If it is NOT octal format,
            // then the slash is ignored and the number is matched later
            // as normal characters.

            // Recall the negative decision to decide if the input must be parsed
            // a second time with the total normal-groups.
            backrefDenied.push(refIdx);

            // Reset the position again, as maybe only parts of the previous
            // matched numbers are actual octal numbers. E.g. in '019' only
            // the '01' should be matched.
            incr(-res[0].length);
            if (res = matchReg(/^[0-7]{1,3}/)) {
              return createEscaped('octal', parseInt(res[0], 8), res[0], 1);
            } else {
              // If we end up here, we have a case like /\91/. Then the
              // first slash is to be ignored and the 9 & 1 to be treated
              // like ordinary characters. Create a character for the
              // first number only here - other number-characters
              // (if available) will be matched later.
              res = createCharacter(matchReg(/^[89]/));
              return updateRawStart(res, res.range[0] - 1);
            }
          }
        }
        // Only allow octal numbers in the following. All matched numbers start
        // with a zero (if the do not, the previous if-branch is executed).
        // If the number is not octal format and starts with zero (e.g. `091`)
        // then only the zeros `0` is treated here and the `91` are ordinary
        // characters.
        // Example:
        //   /\091/.exec('\091')[0].length === 3
        else if (res = matchReg(/^[0-7]{1,3}/)) {
          match = res[0];
          if (/^0{1,3}$/.test(match)) {
            // If they are all zeros, then only take the first one.
            return createEscaped('null', 0x0000, '0', match.length + 1);
          } else {
            return createEscaped('octal', parseInt(match, 8), match, 1);
          }
        } else if (res = matchReg(/^[dDsSwW]/)) {
          return createCharacterClassEscape(res[0]);
        }
        return false;
      }

      function parseCharacterEscape() {
        // CharacterEscape ::
        //      ControlEscape
        //      c ControlLetter
        //      HexEscapeSequence
        //      UnicodeEscapeSequence
        //      IdentityEscape

        var res;
        if (res = matchReg(/^[fnrtv]/)) {
          // ControlEscape
          var codePoint = 0;
          switch (res[0]) {
            case 't': codePoint = 0x009; break;
            case 'n': codePoint = 0x00A; break;
            case 'v': codePoint = 0x00B; break;
            case 'f': codePoint = 0x00C; break;
            case 'r': codePoint = 0x00D; break;
          }
          return createEscaped('singleEscape', codePoint, '\\' + res[0]);
        } else if (res = matchReg(/^c([a-zA-Z])/)) {
          // c ControlLetter
          return createEscaped('controlLetter', res[1].charCodeAt(0) % 32, res[1], 2);
        } else if (res = matchReg(/^x([0-9a-fA-F]{2})/)) {
          // HexEscapeSequence
          return createEscaped('hexadecimalEscape', parseInt(res[1], 16), res[1], 2);
        } else if (res = matchReg(/^u([0-9a-fA-F]{4})/)) {
          // UnicodeEscapeSequence
          return parseUnicodeSurrogatePairEscape(
            createEscaped('unicodeEscape', parseInt(res[1], 16), res[1], 2)
          );
        } else if (hasUnicodeFlag && (res = matchReg(/^u\{([0-9a-fA-F]+)\}/))) {
          // RegExpUnicodeEscapeSequence (ES6 Unicode code point escape)
          return createEscaped('unicodeCodePointEscape', parseInt(res[1], 16), res[1], 4);
        } else if (features.unicodePropertyEscape && hasUnicodeFlag && (res = matchReg(/^([pP])\{([^\}]+)\}/))) {
          // https://github.com/jviereck/regjsparser/issues/77
          return addRaw({
            type: 'unicodePropertyEscape',
            negative: res[1] === 'P',
            value: res[2],
            range: [res.range[0] - 1, res.range[1]],
            raw: res[0]
          });
        } else {
          // IdentityEscape
          return parseIdentityEscape();
        }
      }

      // Taken from the Esprima parser.
      function isIdentifierPart(ch) {
        // Generated by `tools/generate-identifier-regex.js`.
        var NonAsciiIdentifierPart = new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]');

        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
          (ch >= 65 && ch <= 90) ||         // A..Z
          (ch >= 97 && ch <= 122) ||        // a..z
          (ch >= 48 && ch <= 57) ||         // 0..9
          (ch === 92) ||                    // \ (backslash)
          ((ch >= 0x80) && NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
      }

      function parseIdentityEscape() {
        // IdentityEscape ::
        //      SourceCharacter but not IdentifierPart
        //      <ZWJ>
        //      <ZWNJ>

        var ZWJ = '\u200C';
        var ZWNJ = '\u200D';

        var tmp;

        if (!isIdentifierPart(lookahead())) {
          tmp = incr();
          return createEscaped('identifier', tmp.charCodeAt(0), tmp, 1);
        }

        if (match(ZWJ)) {
          // <ZWJ>
          return createEscaped('identifier', 0x200C, ZWJ);
        } else if (match(ZWNJ)) {
          // <ZWNJ>
          return createEscaped('identifier', 0x200D, ZWNJ);
        }

        return null;
      }

      function parseCharacterClass() {
        // CharacterClass ::
        //      [ [lookahead ∉ {^}] ClassRanges ]
        //      [ ^ ClassRanges ]

        var res, from = pos;
        if (res = matchReg(/^\[\^/)) {
          res = parseClassRanges();
          skip(']');
          return createCharacterClass(res, true, from, pos);
        } else if (match('[')) {
          res = parseClassRanges();
          skip(']');
          return createCharacterClass(res, false, from, pos);
        }

        return null;
      }

      function parseClassRanges() {
        // ClassRanges ::
        //      [empty]
        //      NonemptyClassRanges

        var res;
        if (current(']')) {
          // Empty array means nothing insinde of the ClassRange.
          return [];
        } else {
          res = parseNonemptyClassRanges();
          if (!res) {
            bail('nonEmptyClassRanges');
          }
          return res;
        }
      }

      function parseHelperClassRanges(atom) {
        var from, to, res;
        if (current('-') && !next(']')) {
          // ClassAtom - ClassAtom ClassRanges
          skip('-');

          res = parseClassAtom();
          if (!res) {
            bail('classAtom');
          }
          to = pos;
          var classRanges = parseClassRanges();
          if (!classRanges) {
            bail('classRanges');
          }
          from = atom.range[0];
          if (classRanges.type === 'empty') {
            return [createClassRange(atom, res, from, to)];
          }
          return [createClassRange(atom, res, from, to)].concat(classRanges);
        }

        res = parseNonemptyClassRangesNoDash();
        if (!res) {
          bail('nonEmptyClassRangesNoDash');
        }

        return [atom].concat(res);
      }

      function parseNonemptyClassRanges() {
        // NonemptyClassRanges ::
        //      ClassAtom
        //      ClassAtom NonemptyClassRangesNoDash
        //      ClassAtom - ClassAtom ClassRanges

        var atom = parseClassAtom();
        if (!atom) {
          bail('classAtom');
        }

        if (current(']')) {
          // ClassAtom
          return [atom];
        }

        // ClassAtom NonemptyClassRangesNoDash
        // ClassAtom - ClassAtom ClassRanges
        return parseHelperClassRanges(atom);
      }

      function parseNonemptyClassRangesNoDash() {
        // NonemptyClassRangesNoDash ::
        //      ClassAtom
        //      ClassAtomNoDash NonemptyClassRangesNoDash
        //      ClassAtomNoDash - ClassAtom ClassRanges

        var res = parseClassAtom();
        if (!res) {
          bail('classAtom');
        }
        if (current(']')) {
          //      ClassAtom
          return res;
        }

        // ClassAtomNoDash NonemptyClassRangesNoDash
        // ClassAtomNoDash - ClassAtom ClassRanges
        return parseHelperClassRanges(res);
      }

      function parseClassAtom() {
        // ClassAtom ::
        //      -
        //      ClassAtomNoDash
        if (match('-')) {
          return createCharacter('-');
        } else {
          return parseClassAtomNoDash();
        }
      }

      function parseClassAtomNoDash() {
        // ClassAtomNoDash ::
        //      SourceCharacter but not one of \ or ] or -
        //      \ ClassEscape

        var res;
        if (res = matchReg(/^[^\\\]-]/)) {
          return createCharacter(res[0]);
        } else if (match('\\')) {
          res = parseClassEscape();
          if (!res) {
            bail('classEscape');
          }

          return parseUnicodeSurrogatePairEscape(res);
        }
      }

      function bail(message, details, from, to) {
        from = from == null ? pos : from;
        to = to == null ? from : to;

        var contextStart = Math.max(0, from - 10);
        var contextEnd = Math.min(to + 10, str.length);

        // Output a bit of context and a line pointing to where our error is.
        //
        // We are assuming that there are no actual newlines in the content as this is a regular expression.
        var context = '    ' + str.substring(contextStart, contextEnd);
        var pointer = '    ' + new Array(from - contextStart + 1).join(' ') + '^';

        throw SyntaxError(message + ' at position ' + from + (details ? ': ' + details : '') + '\n' + context + '\n' + pointer);
      }

      var backrefDenied = [];
      var closedCaptureCounter = 0;
      var firstIteration = true;
      var hasUnicodeFlag = (flags || "").indexOf("u") !== -1;
      var pos = 0;

      // Convert the input to a string and treat the empty string special.
      str = String(str);
      if (str === '') {
        str = '(?:)';
      }

      var result = parseDisjunction();

      if (result.range[1] !== str.length) {
        bail('Could not parse entire input - got stuck', '', result.range[1]);
      }

      // The spec requires to interpret the `\2` in `/\2()()/` as backreference.
      // As the parser collects the number of capture groups as the string is
      // parsed it is impossible to make these decisions at the point when the
      // `\2` is handled. In case the local decision turns out to be wrong after
      // the parsing has finished, the input string is parsed a second time with
      // the total number of capture groups set.
      //
      // SEE: https://github.com/jviereck/regjsparser/issues/70
      for (var i = 0; i < backrefDenied.length; i++) {
        if (backrefDenied[i] <= closedCaptureCounter) {
          // Parse the input a second time.
          pos = 0;
          firstIteration = false;
          return parseDisjunction();
        }
      }

      return result;
    }

    var regjsparser = {
      parse: parse
    };

    if (typeof module !== 'undefined' && module.exports) {
      module.exports = regjsparser;
    } else {
      window.regjsparser = regjsparser;
    }

  }());
  });

  var require$$5 = (parser && typeof parser === 'object' && 'default' in parser ? parser['default'] : parser);

  var regjsgen = __commonjs(function (module, exports, global) {
  /*!
   * regjsgen 0.3.0
   * Copyright 2014-2016 Benjamin Tan <https://demoneaux.github.io/>
   * Available under MIT license <https://github.com/demoneaux/regjsgen/blob/master/LICENSE>
   */
  ;(function() {
    'use strict';

    // Used to determine if values are of the language type `Object`.
    var objectTypes = {
      'function': true,
      'object': true
    };

    // Used as a reference to the global object.
    var root = (objectTypes[typeof window] && window) || this;

    // Detect free variable `exports`.
    var freeExports = objectTypes[typeof exports] && exports;

    // Detect free variable `module`.
    var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

    // Detect free variable `global` from Node.js or Browserified code and use it as `root`.
    var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
      root = freeGlobal;
    }

    // Used to check objects for own properties.
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    /*--------------------------------------------------------------------------*/

    // Generates strings based on the given code points.
    // Based on https://mths.be/fromcodepoint v0.2.0 by @mathias.
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    function fromCodePoint() {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return '';
      }
      var result = '';
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (
          !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
          codePoint < 0 || // not a valid Unicode code point
          codePoint > 0x10FFFF || // not a valid Unicode code point
          floor(codePoint) != codePoint // not an integer
        ) {
          throw RangeError('Invalid code point: ' + codePoint);
        }
        if (codePoint <= 0xFFFF) {
          // BMP code point
          codeUnits.push(codePoint);
        } else {
          // Astral code point; split in surrogate halves
          // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = (codePoint % 0x400) + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    // Ensures that nodes have the correct types.
    var assertTypeRegexMap = {};
    function assertType(type, expected) {
      if (expected.indexOf('|') == -1) {
        if (type == expected) {
          return;
        }

        throw Error('Invalid node type: ' + type + '; expected type: ' + expected);
      }

      expected = hasOwnProperty.call(assertTypeRegexMap, expected)
        ? assertTypeRegexMap[expected]
        : (assertTypeRegexMap[expected] = RegExp('^(?:' + expected + ')$'));

      if (expected.test(type)) {
        return;
      }

      throw Error('Invalid node type: ' + type + '; expected types: ' + expected);
    }

    /*--------------------------------------------------------------------------*/

    // Generates a regular expression string based on an AST.
    function generate(node) {
      var type = node.type;

      if (hasOwnProperty.call(generators, type)) {
        return generators[type](node);
      }

      throw Error('Invalid node type: ' + type);
    }

    /*--------------------------------------------------------------------------*/

    function generateAlternative(node) {
      assertType(node.type, 'alternative');

      var terms = node.body,
          i = -1,
          length = terms.length,
          result = '';

      while (++i < length) {
        result += generateTerm(terms[i]);
      }

      return result;
    }

    function generateAnchor(node) {
      assertType(node.type, 'anchor');

      switch (node.kind) {
        case 'start':
          return '^';
        case 'end':
          return '$';
        case 'boundary':
          return '\\b';
        case 'not-boundary':
          return '\\B';
        default:
          throw Error('Invalid assertion');
      }
    }

    function generateAtom(node) {
      assertType(node.type, 'anchor|characterClass|characterClassEscape|dot|group|reference|value');

      return generate(node);
    }

    function generateCharacterClass(node) {
      assertType(node.type, 'characterClass');

      var classRanges = node.body,
          i = -1,
          length = classRanges.length,
          result = '';

      if (node.negative) {
        result += '^';
      }

      while (++i < length) {
        result += generateClassAtom(classRanges[i]);
      }

      return '[' + result + ']';
    }

    function generateCharacterClassEscape(node) {
      assertType(node.type, 'characterClassEscape');

      return '\\' + node.value;
    }

    function generateUnicodePropertyEscape(node) {
      assertType(node.type, 'unicodePropertyEscape');

      return '\\' + (node.negative ? 'P' : 'p') + '{' + node.value + '}';
    }

    function generateCharacterClassRange(node) {
      assertType(node.type, 'characterClassRange');

      var min = node.min,
          max = node.max;

      if (min.type == 'characterClassRange' || max.type == 'characterClassRange') {
        throw Error('Invalid character class range');
      }

      return generateClassAtom(min) + '-' + generateClassAtom(max);
    }

    function generateClassAtom(node) {
      assertType(node.type, 'anchor|characterClassEscape|characterClassRange|dot|value');

      return generate(node);
    }

    function generateDisjunction(node) {
      assertType(node.type, 'disjunction');

      var body = node.body,
          i = -1,
          length = body.length,
          result = '';

      while (++i < length) {
        if (i != 0) {
          result += '|';
        }
        result += generate(body[i]);
      }

      return result;
    }

    function generateDot(node) {
      assertType(node.type, 'dot');

      return '.';
    }

    function generateGroup(node) {
      assertType(node.type, 'group');

      var result = '';

      switch (node.behavior) {
        case 'normal':
          break;
        case 'ignore':
          result += '?:';
          break;
        case 'lookahead':
          result += '?=';
          break;
        case 'negativeLookahead':
          result += '?!';
          break;
        default:
          throw Error('Invalid behaviour: ' + node.behaviour);
      }

      var body = node.body,
          i = -1,
          length = body.length;

      while (++i < length) {
        result += generate(body[i]);
      }

      return '(' + result + ')';
    }

    function generateQuantifier(node) {
      assertType(node.type, 'quantifier');

      var quantifier = '',
          min = node.min,
          max = node.max;

      if (max == null) {
        if (min == 0) {
          quantifier = '*';
        } else if (min == 1) {
          quantifier = '+';
        } else {
          quantifier = '{' + min + ',}';
        }
      } else if (min == max) {
        quantifier = '{' + min + '}';
      } else if (min == 0 && max == 1) {
        quantifier = '?';
      } else {
        quantifier = '{' + min + ',' + max + '}';
      }

      if (!node.greedy) {
        quantifier += '?';
      }

      return generateAtom(node.body[0]) + quantifier;
    }

    function generateReference(node) {
      assertType(node.type, 'reference');

      return '\\' + node.matchIndex;
    }

    function generateTerm(node) {
      assertType(node.type, 'anchor|characterClass|characterClassEscape|empty|group|quantifier|reference|unicodePropertyEscape|value');

      return generate(node);
    }

    function generateValue(node) {
      assertType(node.type, 'value');

      var kind = node.kind,
          codePoint = node.codePoint;

      switch (kind) {
        case 'controlLetter':
          return '\\c' + fromCodePoint(codePoint + 64);
        case 'hexadecimalEscape':
          return '\\x' + ('00' + codePoint.toString(16).toUpperCase()).slice(-2);
        case 'identifier':
          return '\\' + fromCodePoint(codePoint);
        case 'null':
          return '\\' + codePoint;
        case 'octal':
          return '\\' + codePoint.toString(8);
        case 'singleEscape':
          switch (codePoint) {
            case 0x0008:
              return '\\b';
            case 0x0009:
              return '\\t';
            case 0x000A:
              return '\\n';
            case 0x000B:
              return '\\v';
            case 0x000C:
              return '\\f';
            case 0x000D:
              return '\\r';
            default:
              throw Error('Invalid codepoint: ' + codePoint);
          }
        case 'symbol':
          return fromCodePoint(codePoint);
        case 'unicodeEscape':
          return '\\u' + ('0000' + codePoint.toString(16).toUpperCase()).slice(-4);
        case 'unicodeCodePointEscape':
          return '\\u{' + codePoint.toString(16).toUpperCase() + '}';
        default:
          throw Error('Unsupported node kind: ' + kind);
      }
    }

    /*--------------------------------------------------------------------------*/

    // Used to generate strings for each node type.
    var generators = {
      'alternative': generateAlternative,
      'anchor': generateAnchor,
      'characterClass': generateCharacterClass,
      'characterClassEscape': generateCharacterClassEscape,
      'characterClassRange': generateCharacterClassRange,
      'unicodePropertyEscape': generateUnicodePropertyEscape,
      'disjunction': generateDisjunction,
      'dot': generateDot,
      'group': generateGroup,
      'quantifier': generateQuantifier,
      'reference': generateReference,
      'value': generateValue
    };

    /*--------------------------------------------------------------------------*/

    // Export regjsgen.
    // Some AMD build optimizers, like r.js, check for condition patterns like the following:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      // Define as an anonymous module so it can be aliased through path mapping.
      define(function() {
        return {
          'generate': generate
        };
      });
    }
    // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
    else if (freeExports && freeModule) {
      // Export for CommonJS support.
      freeExports.generate = generate;
    }
    else {
      // Export to the global object.
      root.regjsgen = {
        'generate': generate
      };
    }
  }.call(__commonjs_global));
  });

  var require$$6 = (regjsgen && typeof regjsgen === 'object' && 'default' in regjsgen ? regjsgen['default'] : regjsgen);

  var rewritePattern = __commonjs(function (module) {
  'use strict';

  var generate = require$$6.generate;
  var parse = require$$5.parse;
  var regenerate = require$$0$2;
  var looseMatch = require$$3;
  var knownUnicodeProperties = new Set(
  	require$$2
  );
  var iuMappings = require$$1;
  var ESCAPE_SETS = require$$0$1;

  var getCharacterClassEscapeSet = function(character) {
  	if (config.unicode) {
  		if (config.ignoreCase) {
  			return ESCAPE_SETS.UNICODE_IGNORE_CASE.get(character);
  		}
  		return ESCAPE_SETS.UNICODE.get(character);
  	}
  	return ESCAPE_SETS.REGULAR.get(character);
  };

  var getUnicodePropertyValueSet = function(property, value) {
  	var path = knownUnicodeProperties.has(property) ?
  		(property + "/" + value) :
  		("Binary_Property/" + property);
  	try {
  		return require(("regenerate-unicode-properties/" + path + ".js"));
  	} catch (exception) {
  		throw new Error(
  			"Failed to recognize value `" + value + "` for property " +
  			"`" + property + "`."
  		);
  	}
  };

  var getUnicodePropertyEscapeSet = function(value, isNegative) {
  	var parts = value.split('=');
  	var canonical;
  	if (parts.length == 1) {
  		var firstPart = parts[0];
  		// It could be a `General_Category` value or a binary property.
  		canonical = looseMatch('General_Category', firstPart);
  		if (!canonical.value) {
  			// It’s not a `General_Category` value, so check if it’s a binary
  			// property. Note: `looseMatch` throws on invalid properties.
  			canonical = looseMatch(firstPart);
  		}
  	} else {
  		// The pattern consists of two parts, i.e. `Property=Value`.
  		canonical = looseMatch(parts[0], parts[1]);
  	}
  	var set = getUnicodePropertyValueSet(
  		canonical.property,
  		canonical.value
  	).clone();
  	if (isNegative) {
  		return UNICODE_SET.clone().remove(set);
  	}
  	return set;
  };

  // Prepare a Regenerate set containing all code points, used for negative
  // character classes (if any).
  var UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
  // Without the `u` flag, the range stops at 0xFFFF.
  // https://mths.be/es6#sec-pattern-semantics
  var BMP_SET = regenerate().addRange(0x0, 0xFFFF);

  // Prepare a Regenerate set containing all code points that are supposed to be
  // matched by `/./u`. https://mths.be/es6#sec-atom
  var DOT_SET_UNICODE = UNICODE_SET.clone() // all Unicode code points
  	.remove(
  		// minus `LineTerminator`s (https://mths.be/es6#sec-line-terminators):
  		0x000A, // Line Feed <LF>
  		0x000D, // Carriage Return <CR>
  		0x2028, // Line Separator <LS>
  		0x2029  // Paragraph Separator <PS>
  	);
  // Prepare a Regenerate set containing all code points that are supposed to be
  // matched by `/./` (only BMP code points).
  var DOT_SET = DOT_SET_UNICODE.clone()
  	.intersection(BMP_SET);

  // Given a range of code points, add any case-folded code points in that range
  // to a set.
  regenerate.prototype.iuAddRange = function(min, max) {
  	var $this = this;
  	do {
  		var folded = caseFold(min);
  		if (folded) {
  			$this.add(folded);
  		}
  	} while (++min <= max);
  	return $this;
  };

  var update = function(item, pattern) {
  	var tree = parse(pattern, config.useUnicodeFlag ? 'u' : '');
  	switch (tree.type) {
  		case 'characterClass':
  		case 'group':
  		case 'value':
  			// No wrapping needed.
  			break;
  		default:
  			// Wrap the pattern in a non-capturing group.
  			tree = wrap(tree, pattern);
  	}
  	Object.assign(item, tree);
  };

  var wrap = function(tree, pattern) {
  	// Wrap the pattern in a non-capturing group.
  	return {
  		'type': 'group',
  		'behavior': 'ignore',
  		'body': [tree],
  		'raw': ("(?:" + pattern + ")")
  	};
  };

  var caseFold = function(codePoint) {
  	return iuMappings.get(codePoint) || false;
  };

  var processCharacterClass = function(characterClassItem, regenerateOptions) {
  	var set = regenerate();
  	var body = characterClassItem.body.forEach(function(item) {
  		switch (item.type) {
  			case 'value':
  				set.add(item.codePoint);
  				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
  					var folded = caseFold(item.codePoint);
  					if (folded) {
  						set.add(folded);
  					}
  				}
  				break;
  			case 'characterClassRange':
  				var min = item.min.codePoint;
  				var max = item.max.codePoint;
  				set.addRange(min, max);
  				if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
  					set.iuAddRange(min, max);
  				}
  				break;
  			case 'characterClassEscape':
  				set.add(getCharacterClassEscapeSet(item.value));
  				break;
  			case 'unicodePropertyEscape':
  				set.add(getUnicodePropertyEscapeSet(item.value, item.negative));
  				break;
  			// The `default` clause is only here as a safeguard; it should never be
  			// reached. Code coverage tools should ignore it.
  			/* istanbul ignore next */
  			default:
  				throw new Error(("Unknown term type: " + (item.type)));
  		}
  	});
  	if (characterClassItem.negative) {
  		set = (config.unicode ? UNICODE_SET : BMP_SET).clone().remove(set);
  	}
  	update(characterClassItem, set.toString(regenerateOptions));
  	return characterClassItem;
  };

  var processTerm = function(item, regenerateOptions) {
  	switch (item.type) {
  		case 'dot':
  			update(
  				item,
  				(config.unicode ? DOT_SET_UNICODE : DOT_SET)
  					.toString(regenerateOptions)
  			);
  			break;
  		case 'characterClass':
  			item = processCharacterClass(item, regenerateOptions);
  			break;
  		case 'unicodePropertyEscape':
  			update(
  				item,
  				getUnicodePropertyEscapeSet(item.value, item.negative)
  					.toString(regenerateOptions)
  			);
  			break;
  		case 'characterClassEscape':
  			update(
  				item,
  				getCharacterClassEscapeSet(item.value).toString(regenerateOptions)
  			);
  			break;
  		case 'alternative':
  		case 'disjunction':
  		case 'group':
  		case 'quantifier':
  			item.body = item.body.map(processTerm);
  			break;
  		case 'value':
  			var codePoint = item.codePoint;
  			var set = regenerate(codePoint);
  			if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
  				var folded = caseFold(codePoint);
  				if (folded) {
  					set.add(folded);
  				}
  			}
  			update(item, set.toString(regenerateOptions));
  			break;
  		case 'anchor':
  		case 'empty':
  		case 'group':
  		case 'reference':
  			// Nothing to do here.
  			break;
  		// The `default` clause is only here as a safeguard; it should never be
  		// reached. Code coverage tools should ignore it.
  		/* istanbul ignore next */
  		default:
  			throw new Error(("Unknown term type: " + (item.type)));
  	}
  	return item;
  };

  var config = {
  	'ignoreCase': false,
  	'unicode': false,
  	'useUnicodeFlag': false
  };
  var rewritePattern = function(pattern, flags, options) {
  	var regjsparserFeatures = {
  		'unicodePropertyEscape': options && options.unicodePropertyEscape
  	};
  	config.useUnicodeFlag = options && options.useUnicodeFlag;
  	var regenerateOptions = {
  		'hasUnicodeFlag': config.useUnicodeFlag
  	};
  	var tree = parse(pattern, flags, regjsparserFeatures);
  	config.ignoreCase = flags && flags.includes('i');
  	config.unicode = flags && flags.includes('u');
  	Object.assign(tree, processTerm(tree, regenerateOptions));
  	return generate(tree);
  };

  module.exports = rewritePattern;
  });

  var rewritePattern$1 = (rewritePattern && typeof rewritePattern === 'object' && 'default' in rewritePattern ? rewritePattern['default'] : rewritePattern);

  var Literal = (function (Node) {
  	function Literal () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) Literal.__proto__ = Node;
  	Literal.prototype = Object.create( Node && Node.prototype );
  	Literal.prototype.constructor = Literal;

  	Literal.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.numericLiteral ) {
  			var leading = this.raw.slice( 0, 2 );
  			if ( leading === '0b' || leading === '0o' ) {
  				code.overwrite( this.start, this.end, String( this.value ), true );
  			}
  		}

  		if ( this.regex ) {
  			var ref = this.regex;
  			var pattern = ref.pattern;
  			var flags = ref.flags;

  			if ( transforms.stickyRegExp && /y/.test( flags ) ) throw new CompileError( this, 'Regular expression sticky flag is not supported' );
  			if ( transforms.unicodeRegExp && /u/.test( flags ) ) {
  				code.overwrite( this.start, this.end, ("/" + (rewritePattern$1( pattern, flags )) + "/" + (flags.replace( 'u', '' ))) );
  			}
  		}
  	};

  	return Literal;
  }(Node));

  var MemberExpression = (function (Node) {
  	function MemberExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) MemberExpression.__proto__ = Node;
  	MemberExpression.prototype = Object.create( Node && Node.prototype );
  	MemberExpression.prototype.constructor = MemberExpression;

  	MemberExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.reservedProperties && reserved[ this.property.name ] ) {
  			code.overwrite( this.object.end, this.property.start, "['" );
  			code.insertLeft( this.property.end, "']" );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return MemberExpression;
  }(Node));

  var ObjectExpression = (function (Node) {
  	function ObjectExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ObjectExpression.__proto__ = Node;
  	ObjectExpression.prototype = Object.create( Node && Node.prototype );
  	ObjectExpression.prototype.constructor = ObjectExpression;

  	ObjectExpression.prototype.transpile = function transpile ( code, transforms ) {
  		var this$1 = this;

  		Node.prototype.transpile.call( this, code, transforms );

  		var spreadPropertyCount = 0;
  		var computedPropertyCount = 0;

  		for ( var i$2 = 0, list = this.properties; i$2 < list.length; i$2 += 1 ) {
  			var prop = list[i$2];

  			if ( prop.type === 'SpreadProperty' ) spreadPropertyCount += 1;
  			if ( prop.computed ) computedPropertyCount += 1;
  		}

  		if ( spreadPropertyCount ) {
  			// enclose run of non-spread properties in curlies
  			var i = this.properties.length;
  			while ( i-- ) {
  				var prop$1 = this$1.properties[i];

  				if ( prop$1.type === 'Property' ) {
  					var lastProp = this$1.properties[ i - 1 ];
  					var nextProp = this$1.properties[ i + 1 ];

  					if ( !lastProp || lastProp.type !== 'Property' ) {
  						code.insertRight( prop$1.start, '{' );
  					}

  					if ( !nextProp || nextProp.type !== 'Property' ) {
  						code.insertLeft( prop$1.end, '}' );
  					}
  				}
  			}

  			// wrap the whole thing in Object.assign
  			code.overwrite( this.start, this.properties[0].start, ((this.program.objectAssign) + "({}, "));
  			code.overwrite( this.properties[ this.properties.length - 1 ].end, this.end, ')' );
  		}

  		if ( computedPropertyCount && transforms.computedProperty ) {
  			var i0 = this.getIndentation();

  			var isSimpleAssignment;
  			var name;

  			var start;
  			var end;

  			if ( this.parent.type === 'VariableDeclarator' && this.parent.parent.declarations.length === 1 ) {
  				isSimpleAssignment = true;
  				name = this.parent.id.alias || this.parent.id.name; // TODO is this right?
  			} else if ( this.parent.type === 'AssignmentExpression' && this.parent.parent.type === 'ExpressionStatement' && this.parent.left.type === 'Identifier' ) {
  				isSimpleAssignment = true;
  				name = this.parent.left.alias || this.parent.left.name; // TODO is this right?
  			}

  			// handle block scoping
  			var declaration = this.findScope( false ).findDeclaration( name );
  			if ( declaration ) name = declaration.name;

  			start = this.start + 1;
  			end = this.end;

  			if ( isSimpleAssignment ) {
  				// ???
  			} else {
  				name = this.findScope( true ).createIdentifier( 'obj' );

  				var statement = this.findNearest( /(?:Statement|Declaration)$/ );
  				code.insertRight( statement.start, ("var " + name + ";\n" + i0) );

  				code.insertRight( this.start, ("( " + name + " = ") );
  			}

  			var len = this.properties.length;
  			var lastComputedProp;

  			for ( var i$1 = 0; i$1 < len; i$1 += 1 ) {
  				var prop$2 = this$1.properties[i$1];

  				if ( prop$2.computed ) {
  					lastComputedProp = prop$2;
  					var moveStart = i$1 > 0 ? this$1.properties[ i$1 - 1 ].end : start;

  					code.overwrite( moveStart, prop$2.start, isSimpleAssignment ? (";\n" + i0 + name) : (", " + name) );
  					var c = prop$2.key.end;
  					while ( code.original[c] !== ']' ) c += 1;
  					c += 1;

  					if ( prop$2.value.start > c ) code.remove( c, prop$2.value.start );
  					code.insertLeft( c, ' = ' );
  					code.move( moveStart, prop$2.end, end );

  					if ( i$1 === 0 && len > 1 ) {
  						// remove trailing comma
  						c = prop$2.end;
  						while ( code.original[c] !== ',' ) c += 1;

  						code.remove( prop$2.end, c + 1 );
  					}

  					if ( prop$2.method && transforms.conciseMethodProperty ) {
  						code.insertRight( prop$2.value.start, 'function ' );
  					}

  					deindent( prop$2.value, code );
  				}
  			}

  			// special case
  			if ( computedPropertyCount === len ) {
  				code.remove( this.properties[ len - 1 ].end, this.end - 1 );
  			}

  			if ( !isSimpleAssignment ) {
  				code.insertLeft( lastComputedProp.end, (", " + name + " )") );
  			}
  		}
  	};

  	return ObjectExpression;
  }(Node));

  var Property = (function (Node) {
  	function Property () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) Property.__proto__ = Node;
  	Property.prototype = Object.create( Node && Node.prototype );
  	Property.prototype.constructor = Property;

  	Property.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.conciseMethodProperty && !this.computed && this.parent.type !== 'ObjectPattern' ) {
  			if ( this.shorthand ) {
  				code.insertRight( this.start, ((this.key.name) + ": ") );
  			} else if ( this.method ) {
  				var name = this.findScope( true ).createIdentifier( this.key.type === 'Identifier' ? this.key.name : this.key.value );
  				if ( this.value.generator ) code.remove( this.start, this.key.start );
  				code.insertLeft( this.key.end, (": function" + (this.value.generator ? '*' : '') + " " + name) );
  			}
  		}

  		if ( transforms.reservedProperties && reserved[ this.key.name ] ) {
  			code.insertRight( this.key.start, "'" );
  			code.insertLeft( this.key.end, "'" );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return Property;
  }(Node));

  var ReturnStatement = (function (Node) {
  	function ReturnStatement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ReturnStatement.__proto__ = Node;
  	ReturnStatement.prototype = Object.create( Node && Node.prototype );
  	ReturnStatement.prototype.constructor = ReturnStatement;

  	ReturnStatement.prototype.initialise = function initialise ( transforms ) {
  		this.loop = this.findNearest( /(?:For(?:In)?|While)Statement/ );
  		this.nearestFunction = this.findNearest( /Function/ );

  		if ( this.loop && ( !this.nearestFunction || this.loop.depth > this.nearestFunction.depth ) ) {
  			this.loop.canReturn = true;
  			this.shouldWrap = true;
  		}

  		if ( this.argument ) this.argument.initialise( transforms );
  	};

  	ReturnStatement.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.argument ) {
  			var shouldWrap = this.shouldWrap && this.loop && this.loop.shouldRewriteAsFunction;

  			if ( shouldWrap ) code.insertRight( this.argument.start, "{ v: " );

  			if ( this.argument ) this.argument.transpile( code, transforms );

  			if ( shouldWrap ) code.insertLeft( this.argument.end, " }" );
  		}
  	};

  	return ReturnStatement;
  }(Node));

  var SpreadProperty = (function (Node) {
  	function SpreadProperty () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) SpreadProperty.__proto__ = Node;
  	SpreadProperty.prototype = Object.create( Node && Node.prototype );
  	SpreadProperty.prototype.constructor = SpreadProperty;

  	SpreadProperty.prototype.transpile = function transpile ( code, transforms ) {
  		code.remove( this.start, this.argument.start );
  		code.remove( this.argument.end, this.end );

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return SpreadProperty;
  }(Node));

  var Super = (function (Node) {
  	function Super () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) Super.__proto__ = Node;
  	Super.prototype = Object.create( Node && Node.prototype );
  	Super.prototype.constructor = Super;

  	Super.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.classes ) {
  			this.method = this.findNearest( 'MethodDefinition' );
  			if ( !this.method ) throw new CompileError( this, 'use of super outside class method' );

  			var parentClass = this.findNearest( 'ClassBody' ).parent;
  			this.superClassName = parentClass.superClass && (parentClass.superClass.name || 'superclass');

  			if ( !this.superClassName ) throw new CompileError( this, 'super used in base class' );

  			this.isCalled = this.parent.type === 'CallExpression' && this === this.parent.callee;

  			if ( this.method.kind !== 'constructor' && this.isCalled ) {
  				throw new CompileError( this, 'super() not allowed outside class constructor' );
  			}

  			this.isMember = this.parent.type === 'MemberExpression';

  			if ( !this.isCalled && !this.isMember ) {
  				throw new CompileError( this, 'Unexpected use of `super` (expected `super(...)` or `super.*`)' );
  			}
  		}

  		if ( transforms.arrow ) {
  			var lexicalBoundary = this.findLexicalBoundary();
  			var arrowFunction = this.findNearest( 'ArrowFunctionExpression' );
  			var loop = this.findNearest( /(?:For(?:In|Of)?|While)Statement/ );

  			if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
  				this.thisAlias = lexicalBoundary.getThisAlias();
  			}

  			if ( loop && loop.body.contains( this ) && loop.depth > lexicalBoundary.depth ) {
  				this.thisAlias = lexicalBoundary.getThisAlias();
  			}
  		}
  	};

  	Super.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.classes ) {
  			var expression = ( this.isCalled || this.method.static ) ?
  				this.superClassName :
  				((this.superClassName) + ".prototype");

  			code.overwrite( this.start, this.end, expression, true );

  			var callExpression = this.isCalled ? this.parent : this.parent.parent;

  			if ( callExpression && callExpression.type === 'CallExpression' ) {
  				if ( !this.noCall ) { // special case – `super( ...args )`
  					code.insertLeft( callExpression.callee.end, '.call' );
  				}

  				var thisAlias = this.thisAlias || 'this';

  				if ( callExpression.arguments.length ) {
  					code.insertLeft( callExpression.arguments[0].start, (thisAlias + ", ") );
  				} else {
  					code.insertLeft( callExpression.end - 1, ("" + thisAlias) );
  				}
  			}
  		}
  	};

  	return Super;
  }(Node));

  var TaggedTemplateExpression = (function (Node) {
  	function TaggedTemplateExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) TaggedTemplateExpression.__proto__ = Node;
  	TaggedTemplateExpression.prototype = Object.create( Node && Node.prototype );
  	TaggedTemplateExpression.prototype.constructor = TaggedTemplateExpression;

  	TaggedTemplateExpression.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.templateString && !transforms.dangerousTaggedTemplateString ) {
  			throw new CompileError( this, 'Tagged template strings are not supported. Use `transforms: { templateString: false }` to skip transformation and disable this error, or `transforms: { dangerousTaggedTemplateString: true }` if you know what you\'re doing' );
  		}

  		Node.prototype.initialise.call( this, transforms );
  	};

  	TaggedTemplateExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.templateString && transforms.dangerousTaggedTemplateString ) {
  			var ordered = this.quasi.expressions.concat( this.quasi.quasis ).sort( function ( a, b ) { return a.start - b.start; } );

  			// insert strings at start
  			var templateStrings = this.quasi.quasis.map( function ( quasi ) { return JSON.stringify( quasi.value.cooked ); } );
  			code.overwrite( this.tag.end, ordered[0].start, ("([" + (templateStrings.join(', ')) + "]") );

  			var lastIndex = ordered[0].start;
  			ordered.forEach( function ( node ) {
  				if ( node.type === 'TemplateElement' ) {
  					code.remove( lastIndex, node.end );
  				} else {
  					code.overwrite( lastIndex, node.start, ', ' );
  				}

  				lastIndex = node.end;
  			});

  			code.overwrite( lastIndex, this.end, ')' );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return TaggedTemplateExpression;
  }(Node));

  var TemplateElement = (function (Node) {
  	function TemplateElement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) TemplateElement.__proto__ = Node;
  	TemplateElement.prototype = Object.create( Node && Node.prototype );
  	TemplateElement.prototype.constructor = TemplateElement;

  	TemplateElement.prototype.initialise = function initialise ( transforms ) {
  		this.program.templateElements.push( this );
  	};

  	return TemplateElement;
  }(Node));

  var TemplateLiteral = (function (Node) {
  	function TemplateLiteral () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) TemplateLiteral.__proto__ = Node;
  	TemplateLiteral.prototype = Object.create( Node && Node.prototype );
  	TemplateLiteral.prototype.constructor = TemplateLiteral;

  	TemplateLiteral.prototype.transpile = function transpile ( code, transforms ) {
  		if ( transforms.templateString && this.parent.type !== 'TaggedTemplateExpression' ) {
  			var ordered = this.expressions.concat( this.quasis )
  				.sort( function ( a, b ) { return a.start - b.start || a.end - b.end; } )
  				.filter( function ( node, i ) {
  					// include all expressions
  					if ( node.type !== 'TemplateElement' ) return true;

  					// include all non-empty strings
  					if ( node.value.raw ) return true;

  					// exclude all empty strings not at the head
  					return !i;
  				});

  			// special case – we may be able to skip the first element,
  			// if it's the empty string, but only if the second and
  			// third elements aren't both expressions (since they maybe
  			// be numeric, and `1 + 2 + '3' === '33'`)
  			if ( ordered.length >= 3 ) {
  				var first = ordered[0];
  				var third = ordered[2];
  				if ( first.type === 'TemplateElement' && first.value.raw === '' && third.type === 'TemplateElement' ) {
  					ordered.shift();
  				}
  			}

  			var parenthesise = ( this.quasis.length !== 1 || this.expressions.length !== 0 ) &&
  			                     this.parent.type !== 'AssignmentExpression' &&
  			                     this.parent.type !== 'VariableDeclarator' &&
  			                     ( this.parent.type !== 'BinaryExpression' || this.parent.operator !== '+' );

  			if ( parenthesise ) code.insertRight( this.start, '(' );

  			var lastIndex = this.start;

  			ordered.forEach( function ( node, i ) {
  				if ( node.type === 'TemplateElement' ) {
  					var replacement = '';
  					if ( i ) replacement += ' + ';
  					replacement += JSON.stringify( node.value.cooked );

  					code.overwrite( lastIndex, node.end, replacement );
  				} else {
  					var parenthesise = node.type !== 'Identifier'; // TODO other cases where it's safe

  					var replacement$1 = '';
  					if ( i ) replacement$1 += ' + ';
  					if ( parenthesise ) replacement$1 += '(';

  					code.overwrite( lastIndex, node.start, replacement$1 );

  					if ( parenthesise ) code.insertLeft( node.end, ')' );
  				}

  				lastIndex = node.end;
  			});

  			var close = '';
  			if ( parenthesise ) close += ')';

  			code.overwrite( lastIndex, this.end, close );
  		}

  		Node.prototype.transpile.call( this, code, transforms );
  	};

  	return TemplateLiteral;
  }(Node));

  var ThisExpression = (function (Node) {
  	function ThisExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) ThisExpression.__proto__ = Node;
  	ThisExpression.prototype = Object.create( Node && Node.prototype );
  	ThisExpression.prototype.constructor = ThisExpression;

  	ThisExpression.prototype.initialise = function initialise ( transforms ) {
  		if ( transforms.arrow ) {
  			var lexicalBoundary = this.findLexicalBoundary();
  			var arrowFunction = this.findNearest( 'ArrowFunctionExpression' );
  			var loop = this.findNearest( /(?:For(?:In|Of)?|While)Statement/ );

  			if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
  				this.alias = lexicalBoundary.getThisAlias();
  			}

  			if ( loop && loop.body.contains( this ) && loop.depth > lexicalBoundary.depth ) {
  				this.alias = lexicalBoundary.getThisAlias();
  			}
  		}
  	};

  	ThisExpression.prototype.transpile = function transpile ( code, transforms ) {
  		if ( this.alias ) {
  			code.overwrite( this.start, this.end, this.alias, true );
  		}
  	};

  	return ThisExpression;
  }(Node));

  var UpdateExpression = (function (Node) {
  	function UpdateExpression () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) UpdateExpression.__proto__ = Node;
  	UpdateExpression.prototype = Object.create( Node && Node.prototype );
  	UpdateExpression.prototype.constructor = UpdateExpression;

  	UpdateExpression.prototype.initialise = function initialise ( transforms ) {
  		if ( this.argument.type === 'Identifier' ) {
  			var declaration = this.findScope( false ).findDeclaration( this.argument.name );
  			if ( declaration && declaration.kind === 'const' ) {
  				throw new CompileError( this, ((this.argument.name) + " is read-only") );
  			}
  		}

  		Node.prototype.initialise.call( this, transforms );
  	};

  	return UpdateExpression;
  }(Node));

  var handlers = {
  	ArrayPattern: destructureArrayPattern,
  	ObjectPattern: destructureObjectPattern,
  	AssignmentPattern: destructureAssignmentPattern,
  	Identifier: destructureIdentifier
  };

  function destructure ( code, scope, node, ref, statementGenerators ) {
  	_destructure( code, scope, node, ref, ref, statementGenerators );
  }

  function _destructure ( code, scope, node, ref, expr, statementGenerators ) {
  	var handler = handlers[ node.type ];
  	if ( !handler ) throw new Error( ("not implemented: " + (node.type)) );

  	handler( code, scope, node, ref, expr, statementGenerators );
  }

  function destructureIdentifier ( code, scope, node, ref, expr, statementGenerators ) {
  	statementGenerators.push( function ( start, prefix, suffix ) {
  		code.insertRight( node.start, (prefix + "var ") );
  		code.insertLeft( node.end, (" = " + expr + ";" + suffix) );
  		code.move( node.start, node.end, start );
  	});
  }

  function handleProperty ( code, scope, c, node, value, statementGenerators ) {
  	switch ( node.type ) {
  		case 'Identifier':
  			code.remove( c, node.start );
  			statementGenerators.push( function ( start, prefix, suffix ) {
  				code.insertRight( node.start, (prefix + "var ") );
  				code.insertLeft( node.end, (" = " + value + ";" + suffix) );
  				code.move( node.start, node.end, start );
  			});
  			break;

  		case 'AssignmentPattern':
  			var name;

  			var isIdentifier = node.left.type === 'Identifier';

  			if ( isIdentifier ) {
  				name = node.left.name;
  				var declaration = scope.findDeclaration( name );
  				if ( declaration ) name = declaration.name;
  			} else {
  				name = scope.createIdentifier( value );
  			}

  			statementGenerators.push( function ( start, prefix, suffix ) {
  				code.insertRight( node.right.start, (prefix + "var " + name + " = " + value + "; if ( " + name + " === void 0 ) " + name + " = ") );
  				code.move( node.right.start, node.right.end, start );
  				code.insertLeft( node.right.end, (";" + suffix) );
  			});

  			if ( isIdentifier ) {
  				code.remove( c, node.right.start );
  			} else {
  				code.remove( c, node.left.start );
  				code.remove( node.left.end, node.right.start );
  				handleProperty( code, scope, c, node.left, name, statementGenerators );
  			}

  			break;

  		case 'ObjectPattern':
  			code.remove( c, c = node.start );

  			if ( node.properties.length > 1 ) {
  				var ref = scope.createIdentifier( value );

  				statementGenerators.push( function ( start, prefix, suffix ) {
  					// this feels a tiny bit hacky, but we can't do a
  					// straightforward insertLeft and keep correct order...
  					code.insertRight( node.start, (prefix + "var " + ref + " = ") );
  					code.overwrite( node.start, c = node.start + 1, value );
  					code.insertLeft( c, (";" + suffix) );

  					code.move( node.start, c, start );
  				});

  				node.properties.forEach( function ( prop ) {
  					handleProperty( code, scope, c, prop.value, (ref + "." + (prop.key.name)), statementGenerators );
  					c = prop.end;
  				});
  			} else {
  				var prop = node.properties[0];
  				handleProperty( code, scope, c, prop.value, (value + "." + (prop.key.name)), statementGenerators );
  				c = prop.end;
  			}

  			code.remove( c, node.end );
  			break;

  		case 'ArrayPattern':
  			code.remove( c, c = node.start );

  			if ( node.elements.filter( Boolean ).length > 1 ) {
  				var ref$1 = scope.createIdentifier( value );

  				statementGenerators.push( function ( start, prefix, suffix ) {
  					code.insertRight( node.start, (prefix + "var " + ref$1 + " = ") );
  					code.overwrite( node.start, c = node.start + 1, value );
  					code.insertLeft( c, (";" + suffix) );

  					code.move( node.start, c, start );
  				});

  				node.elements.forEach( function ( element, i ) {
  					if ( !element ) return;

  					handleProperty( code, scope, c, element, (ref$1 + "[" + i + "]"), statementGenerators );
  					c = element.end;
  				});
  			} else {
  				var index = findIndex( node.elements, Boolean );
  				var element = node.elements[ index ];
  				handleProperty( code, scope, c, element, (value + "[" + index + "]"), statementGenerators );
  				c = element.end;
  			}

  			code.remove( c, node.end );
  			break;

  		default:
  			throw new Error( ("Unexpected node type in destructuring (" + (node.type) + ")") );
  	}
  }

  function destructureArrayPattern ( code, scope, node, ref, expr, statementGenerators ) {
  	var c = node.start;

  	node.elements.forEach( function ( element, i ) {
  		if ( !element ) return;

  		handleProperty( code, scope, c, element, (ref + "[" + i + "]"), statementGenerators );
  		c = element.end;
  	});

  	code.remove( c, node.end );
  }

  function destructureObjectPattern ( code, scope, node, ref, expr, statementGenerators ) {
  	var c = node.start;

  	node.properties.forEach( function ( prop ) {
  		handleProperty( code, scope, c, prop.value, (ref + "." + (prop.key.name)), statementGenerators );
  		c = prop.end;
  	});

  	code.remove( c, node.end );
  }

  function destructureAssignmentPattern ( code, scope, node, ref, expr, statementGenerators ) {
  	var isIdentifier = node.left.type === 'Identifier';
  	var name = isIdentifier ? node.left.name : ref;

  	statementGenerators.push( function ( start, prefix, suffix ) {
  		code.insertRight( node.left.end, (prefix + "if ( " + name + " === void 0 ) " + name) );
  		code.move( node.left.end, node.right.end, start );
  		code.insertLeft( node.right.end, (";" + suffix) );
  	});

  	if ( !isIdentifier ) {
  		_destructure( code, scope, node.left, ref, expr, statementGenerators );
  	}
  }

  var VariableDeclaration = (function (Node) {
  	function VariableDeclaration () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) VariableDeclaration.__proto__ = Node;
  	VariableDeclaration.prototype = Object.create( Node && Node.prototype );
  	VariableDeclaration.prototype.constructor = VariableDeclaration;

  	VariableDeclaration.prototype.initialise = function initialise ( transforms ) {
  		this.scope = this.findScope( this.kind === 'var' );
  		this.declarations.forEach( function ( declarator ) { return declarator.initialise( transforms ); } );
  	};

  	VariableDeclaration.prototype.transpile = function transpile ( code, transforms ) {
  		var this$1 = this;

  		var i0 = this.getIndentation();
  		var kind = this.kind;

  		if ( transforms.letConst && kind !== 'var' ) {
  			kind = 'var';
  			code.overwrite( this.start, this.start + this.kind.length, kind, true );
  		}

  		if ( transforms.destructuring ) {
  			var c = this.start;
  			var lastDeclaratorIsPattern;

  			this.declarations.forEach( function ( declarator, i ) {
  				if ( declarator.id.type === 'Identifier' ) {
  					if ( i > 0 && this$1.declarations[ i - 1 ].id.type !== 'Identifier' ) {
  						code.overwrite( c, declarator.id.start, "var " );
  					}
  				} else {
  					if ( i === 0 ) {
  						code.remove( c, declarator.id.start );
  					} else {
  						code.overwrite( c, declarator.id.start, (";\n" + i0) );
  					}

  					var simple = declarator.init.type === 'Identifier' && !declarator.init.rewritten;

  					var name = simple ? declarator.init.name : declarator.findScope( true ).createIdentifier( 'ref' );

  					var c$1 = declarator.start;

  					var statementGenerators = [];

  					if ( simple ) {
  						code.remove( declarator.id.end, declarator.end );
  					} else {
  						statementGenerators.push( function ( start, prefix, suffix ) {
  							code.insertRight( declarator.id.end, ("var " + name) );
  							code.insertLeft( declarator.init.end, (";" + suffix) );
  							code.move( declarator.id.end, declarator.end, start );
  						});
  					}

  					destructure( code, declarator.findScope( false ), declarator.id, name, statementGenerators );

  					var suffix = "\n" + i0;
  					statementGenerators.forEach( function ( fn, j ) {
  						if ( i === this$1.declarations.length - 1 && j === statementGenerators.length - 1 ) {
  							suffix = '';
  						}

  						fn( declarator.start, '', suffix );
  					});
  				}

  				if ( declarator.init ) {
  					declarator.init.transpile( code, transforms );
  				}

  				c = declarator.end;
  				lastDeclaratorIsPattern = declarator.id.type !== 'Identifier';
  			});

  			if ( lastDeclaratorIsPattern ) {
  				code.remove( c, this.end );
  			}
  		}

  		else {
  			this.declarations.forEach( function ( declarator ) {
  				if ( declarator.init ) declarator.init.transpile( code, transforms );
  			});
  		}

  	};

  	return VariableDeclaration;
  }(Node));

  var VariableDeclarator = (function (Node) {
  	function VariableDeclarator () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) VariableDeclarator.__proto__ = Node;
  	VariableDeclarator.prototype = Object.create( Node && Node.prototype );
  	VariableDeclarator.prototype.constructor = VariableDeclarator;

  	VariableDeclarator.prototype.initialise = function initialise ( transforms ) {
  		var kind = this.parent.kind;
  		if ( kind === 'let' && this.parent.parent.type === 'ForStatement' ) {
  			kind = 'for.let'; // special case...
  		}

  		this.parent.scope.addDeclaration( this.id, kind );
  		Node.prototype.initialise.call( this, transforms );
  	};

  	return VariableDeclarator;
  }(Node));

  var types = {
  	ArrayExpression: ArrayExpression,
  	ArrowFunctionExpression: ArrowFunctionExpression,
  	AssignmentExpression: AssignmentExpression,
  	BinaryExpression: BinaryExpression,
  	BreakStatement: BreakStatement,
  	CallExpression: CallExpression,
  	ClassBody: ClassBody,
  	ClassDeclaration: ClassDeclaration,
  	ClassExpression: ClassExpression,
  	ContinueStatement: ContinueStatement,
  	DoWhileStatement: LoopStatement,
  	ExportNamedDeclaration: ExportNamedDeclaration,
  	ExportDefaultDeclaration: ExportDefaultDeclaration,
  	ForStatement: ForStatement,
  	ForInStatement: ForInStatement,
  	ForOfStatement: ForOfStatement,
  	FunctionDeclaration: FunctionDeclaration,
  	FunctionExpression: FunctionExpression,
  	Identifier: Identifier,
  	ImportDeclaration: ImportDeclaration,
  	ImportDefaultSpecifier: ImportDefaultSpecifier,
  	ImportSpecifier: ImportSpecifier,
  	JSXAttribute: JSXAttribute,
  	JSXClosingElement: JSXClosingElement,
  	JSXElement: JSXElement,
  	JSXExpressionContainer: JSXExpressionContainer,
  	JSXOpeningElement: JSXOpeningElement,
    JSXSpreadAttribute: JSXSpreadAttribute,
  	Literal: Literal,
  	MemberExpression: MemberExpression,
  	ObjectExpression: ObjectExpression,
  	Property: Property,
  	ReturnStatement: ReturnStatement,
  	SpreadProperty: SpreadProperty,
  	Super: Super,
  	TaggedTemplateExpression: TaggedTemplateExpression,
  	TemplateElement: TemplateElement,
  	TemplateLiteral: TemplateLiteral,
  	ThisExpression: ThisExpression,
  	UpdateExpression: UpdateExpression,
  	VariableDeclaration: VariableDeclaration,
  	VariableDeclarator: VariableDeclarator,
  	WhileStatement: LoopStatement
  };

  var statementsWithBlocks = {
  	IfStatement: 'consequent',
  	ForStatement: 'body',
  	ForInStatement: 'body',
  	ForOfStatement: 'body',
  	WhileStatement: 'body',
  	DoWhileStatement: 'body',
  	ArrowFunctionExpression: 'body'
  };

  function wrap ( raw, parent ) {
  	if ( !raw ) return;

  	if ( 'length' in raw ) {
  		var i = raw.length;
  		while ( i-- ) wrap( raw[i], parent );
  		return;
  	}

  	// with e.g. shorthand properties, key and value are
  	// the same node. We don't want to wrap an object twice
  	if ( raw.__wrapped ) return;
  	raw.__wrapped = true;

  	if ( !keys[ raw.type ] ) {
  		keys[ raw.type ] = Object.keys( raw ).filter( function ( key ) { return typeof raw[ key ] === 'object'; } );
  	}

  	// special case – body-less if/for/while statements. TODO others?
  	var bodyType = statementsWithBlocks[ raw.type ];
  	if ( bodyType && raw[ bodyType ].type !== 'BlockStatement' ) {
  		var expression = raw[ bodyType ];

  		// create a synthetic block statement, otherwise all hell
  		// breaks loose when it comes to block scoping
  		raw[ bodyType ] = {
  			start: expression.start,
  			end: expression.end,
  			type: 'BlockStatement',
  			body: [ expression ],
  			synthetic: true
  		};
  	}

  	Node( raw, parent );

  	var type = ( raw.type === 'BlockStatement' ? BlockStatement : types[ raw.type ] ) || Node;
  	raw.__proto__ = type.prototype;
  }

  var letConst = /^(?:let|const)$/;

  function Scope ( options ) {
  	options = options || {};

  	this.parent = options.parent;
  	this.isBlockScope = !!options.block;

  	var scope = this;
  	while ( scope.isBlockScope ) scope = scope.parent;
  	this.functionScope = scope;

  	this.identifiers = [];
  	this.declarations = Object.create( null );
  	this.references = Object.create( null );
  	this.blockScopedDeclarations = this.isBlockScope ? null : Object.create( null );
  	this.aliases = this.isBlockScope ? null : Object.create( null );
  }

  Scope.prototype = {
  	addDeclaration: function addDeclaration ( node, kind ) {
  		for ( var i = 0, list = extractNames( node ); i < list.length; i += 1 ) {
  			var identifier = list[i];

  			var name = identifier.name;
  			var existingDeclaration = this.declarations[ name ];
  			if ( existingDeclaration && ( letConst.test( kind ) || letConst.test( existingDeclaration.kind ) ) ) {
  				// TODO warn about double var declarations?
  				throw new CompileError( identifier, (name + " is already declared") );
  			}

  			var declaration = { name: name, node: identifier, kind: kind, instances: [] };
  			this.declarations[ name ] = declaration;

  			if ( this.isBlockScope ) {
  				if ( !this.functionScope.blockScopedDeclarations[ name ] ) this.functionScope.blockScopedDeclarations[ name ] = [];
  				this.functionScope.blockScopedDeclarations[ name ].push( declaration );
  			}
  		}
  	},

  	addReference: function addReference ( identifier ) {
  		if ( this.consolidated ) {
  			this.consolidateReference( identifier );
  		} else {
  			this.identifiers.push( identifier );
  		}
  	},

  	consolidate: function consolidate () {
  		var this$1 = this;

  		for ( var i = 0; i < this$1.identifiers.length; i += 1 ) { // we might push to the array during consolidation, so don't cache length
  			var identifier = this$1.identifiers[i];
  			this$1.consolidateReference( identifier );
  		}

  		this.consolidated = true; // TODO understand why this is necessary... seems bad
  	},

  	consolidateReference: function consolidateReference ( identifier ) {
  		var declaration = this.declarations[ identifier.name ];
  		if ( declaration ) {
  			declaration.instances.push( identifier );
  		} else {
  			this.references[ identifier.name ] = true;
  			if ( this.parent ) this.parent.addReference( identifier );
  		}
  	},

  	contains: function contains ( name ) {
  		return this.declarations[ name ] ||
  		       ( this.parent ? this.parent.contains( name ) : false );
  	},

  	createIdentifier: function createIdentifier ( base ) {
  		var this$1 = this;

  		base = base
  			.replace( /\s/g, '' )
  			.replace( /\[([^\]]+)\]/g, '_$1' )
  			.replace( /[^a-zA-Z0-9_$]/g, '_' )
  			.replace( /_{2,}/, '_' );

  		var name = base;
  		var counter = 1;

  		while ( this$1.declarations[ name ] || this$1.references[ name ] || this$1.aliases[ name ] || name in reserved ) {
  			name = base + "$" + (counter++);
  		}

  		this.aliases[ name ] = true;
  		return name;
  	},

  	findDeclaration: function findDeclaration ( name ) {
  		return this.declarations[ name ] ||
  		       ( this.parent && this.parent.findDeclaration( name ) );
  	}
  };

  function isUseStrict ( node ) {
  	if ( !node ) return false;
  	if ( node.type !== 'ExpressionStatement' ) return false;
  	if ( node.expression.type !== 'Literal' ) return false;
  	return node.expression.value === 'use strict';
  }

  var BlockStatement = (function (Node) {
  	function BlockStatement () {
  		Node.apply(this, arguments);
  	}

  	if ( Node ) BlockStatement.__proto__ = Node;
  	BlockStatement.prototype = Object.create( Node && Node.prototype );
  	BlockStatement.prototype.constructor = BlockStatement;

  	BlockStatement.prototype.createScope = function createScope () {
  		var this$1 = this;

  		this.parentIsFunction = /Function/.test( this.parent.type );
  		this.isFunctionBlock = this.parentIsFunction || this.parent.type === 'Root';
  		this.scope = new Scope({
  			block: !this.isFunctionBlock,
  			parent: this.parent.findScope( false )
  		});

  		if ( this.parentIsFunction ) {
  			this.parent.params.forEach( function ( node ) {
  				this$1.scope.addDeclaration( node, 'param' );
  			});
  		}
  	};

  	BlockStatement.prototype.initialise = function initialise ( transforms ) {
  		this.thisAlias = null;
  		this.argumentsAlias = null;
  		this.defaultParameters = [];

  		// normally the scope gets created here, during initialisation,
  		// but in some cases (e.g. `for` statements), we need to create
  		// the scope early, as it pertains to both the init block and
  		// the body of the statement
  		if ( !this.scope ) this.createScope();

  		this.body.forEach( function ( node ) { return node.initialise( transforms ); } );

  		this.scope.consolidate();
  	};

  	BlockStatement.prototype.findLexicalBoundary = function findLexicalBoundary () {
  		if ( this.type === 'Program' ) return this;
  		if ( /^Function/.test( this.parent.type ) ) return this;

  		return this.parent.findLexicalBoundary();
  	};

  	BlockStatement.prototype.findScope = function findScope ( functionScope ) {
  		if ( functionScope && !this.isFunctionBlock ) return this.parent.findScope( functionScope );
  		return this.scope;
  	};

  	BlockStatement.prototype.getArgumentsAlias = function getArgumentsAlias () {
  		if ( !this.argumentsAlias ) {
  			this.argumentsAlias = this.scope.createIdentifier( 'arguments' );
  		}

  		return this.argumentsAlias;
  	};

  	BlockStatement.prototype.getArgumentsArrayAlias = function getArgumentsArrayAlias () {
  		if ( !this.argumentsArrayAlias ) {
  			this.argumentsArrayAlias = this.scope.createIdentifier( 'argsArray' );
  		}

  		return this.argumentsArrayAlias;
  	};

  	BlockStatement.prototype.getThisAlias = function getThisAlias () {
  		if ( !this.thisAlias ) {
  			this.thisAlias = this.scope.createIdentifier( 'this' );
  		}

  		return this.thisAlias;
  	};

  	BlockStatement.prototype.getIndentation = function getIndentation () {
  		var this$1 = this;

  		if ( this.indentation === undefined ) {
  			var source = this.program.magicString.original;

  			var useOuter = this.synthetic || !this.body.length;
  			var c = useOuter ? this.start : this.body[0].start;

  			while ( c && source[c] !== '\n' ) c -= 1;

  			this.indentation = '';

  			while ( true ) {
  				c += 1;
  				var char = source[c];

  				if ( char !== ' ' && char !== '\t' ) break;

  				this$1.indentation += char;
  			}

  			var indentString = this.program.magicString.getIndentString();

  			// account for dedented class constructors
  			var parent = this.parent;
  			while ( parent ) {
  				if ( parent.kind === 'constructor' && !parent.parent.parent.superClass ) {
  					this$1.indentation = this$1.indentation.replace( indentString, '' );
  				}

  				parent = parent.parent;
  			}

  			if ( useOuter ) this.indentation += indentString;
  		}

  		return this.indentation;
  	};

  	BlockStatement.prototype.transpile = function transpile ( code, transforms ) {
  		var this$1 = this;

  		var indentation = this.getIndentation();

  		var introStatementGenerators = [];

  		if ( this.argumentsAlias ) {
  			introStatementGenerators.push( function ( start, prefix, suffix ) {
  				var assignment = prefix + "var " + (this$1.argumentsAlias) + " = arguments;" + suffix;
  				code.insertLeft( start, assignment );
  			});
  		}

  		if ( this.thisAlias ) {
  			introStatementGenerators.push( function ( start, prefix, suffix ) {
  				var assignment = prefix + "var " + (this$1.thisAlias) + " = this;" + suffix;
  				code.insertLeft( start, assignment );
  			});
  		}

  		if ( this.argumentsArrayAlias ) {
  			introStatementGenerators.push( function ( start, prefix, suffix ) {
  				var i = this$1.scope.createIdentifier( 'i' );
  				var assignment = prefix + "var " + i + " = arguments.length, " + (this$1.argumentsArrayAlias) + " = Array(" + i + ");\n" + indentation + "while ( " + i + "-- ) " + (this$1.argumentsArrayAlias) + "[" + i + "] = arguments[" + i + "];" + suffix;
  				code.insertLeft( start, assignment );
  			});
  		}

  		if ( /Function/.test( this.parent.type ) ) {
  			this.transpileParameters( code, transforms, indentation, introStatementGenerators );
  		}

  		if ( transforms.letConst && this.isFunctionBlock ) {
  			this.transpileBlockScopedIdentifiers( code );
  		}

  		Node.prototype.transpile.call( this, code, transforms );

  		if ( this.synthetic ) {
  			if ( this.parent.type === 'ArrowFunctionExpression' ) {
  				var expr = this.body[0];

  				if ( introStatementGenerators.length ) {
  					code.insertLeft( this.start, "{" ).insertRight( this.end, ((this.parent.getIndentation()) + "}") );

  					code.insertRight( expr.start, ("\n" + indentation + "return ") );
  					code.insertLeft( expr.end, ";\n" );
  				} else if ( transforms.arrow ) {
  					code.insertRight( expr.start, "{ return " );
  					code.insertLeft( expr.end, "; }" );
  				}
  			}

  			else if ( introStatementGenerators.length ) {
  				code.insertLeft( this.start, "{" ).insertRight( this.end, "}" );
  			}
  		}

  		var start;
  		if ( isUseStrict( this.body[0] ) ) {
  			start = this.body[0].end;
  		} else if ( this.synthetic || this.parent.type === 'Root' ) {
  			start = this.start;
  		} else {
  			start = this.start + 1;
  		}

  		var prefix = "\n" + indentation;
  		var suffix = '';
  		introStatementGenerators.forEach( function ( fn, i ) {
  			if ( i === introStatementGenerators.length - 1 ) suffix = "\n";
  			fn( start, prefix, suffix );
  		});
  	};

  	BlockStatement.prototype.transpileParameters = function transpileParameters ( code, transforms, indentation, introStatementGenerators ) {
  		var this$1 = this;

  		var params = this.parent.params;

  		params.forEach( function ( param ) {
  			if ( param.type === 'AssignmentPattern' && param.left.type === 'Identifier' ) {
  				if ( transforms.defaultParameter ) {
  					introStatementGenerators.push( function ( start, prefix, suffix ) {
  						var lhs = prefix + "if ( " + (param.left.name) + " === void 0 ) " + (param.left.name);

  						code
  							.insertRight( param.left.end, ("" + lhs) )
  							.move( param.left.end, param.right.end, start )
  							.insertLeft( param.right.end, (";" + suffix) );
  					});
  				}
  			}

  			else if ( param.type === 'RestElement' ) {
  				if ( transforms.spreadRest ) {
  					introStatementGenerators.push( function ( start, prefix, suffix ) {
  						var penultimateParam = params[ params.length - 2 ];

  						if ( penultimateParam ) {
  							code.remove( penultimateParam ? penultimateParam.end : param.start, param.end );
  						} else {
  							var start$1 = param.start, end = param.end; // TODO https://gitlab.com/Rich-Harris/buble/issues/8

  							while ( /\s/.test( code.original[ start$1 - 1 ] ) ) start$1 -= 1;
  							while ( /\s/.test( code.original[ end ] ) ) end += 1;

  							code.remove( start$1, end );
  						}

  						var name = param.argument.name;
  						var len = this$1.scope.createIdentifier( 'len' );
  						var count = params.length - 1;

  						if ( count ) {
  							code.insertLeft( start, (prefix + "var " + name + " = [], " + len + " = arguments.length - " + count + ";\n" + indentation + "while ( " + len + "-- > 0 ) " + name + "[ " + len + " ] = arguments[ " + len + " + " + count + " ];" + suffix) );
  						} else {
  							code.insertLeft( start, (prefix + "var " + name + " = [], " + len + " = arguments.length;\n" + indentation + "while ( " + len + "-- ) " + name + "[ " + len + " ] = arguments[ " + len + " ];" + suffix) );
  						}
  					});
  				}
  			}

  			else if ( param.type !== 'Identifier' ) {
  				if ( transforms.parameterDestructuring ) {
  					var ref = this$1.scope.createIdentifier( 'ref' );
  					destructure( code, this$1.scope, param, ref, introStatementGenerators );
  					code.insertLeft( param.start, ref );
  				}
  			}
  		});
  	};

  	BlockStatement.prototype.transpileBlockScopedIdentifiers = function transpileBlockScopedIdentifiers ( code ) {
  		var this$1 = this;

  		Object.keys( this.scope.blockScopedDeclarations ).forEach( function ( name ) {
  			var declarations = this$1.scope.blockScopedDeclarations[ name ];

  			for ( var i = 0, list = declarations; i < list.length; i += 1 ) {
  				var declaration = list[i];

  				var cont = false; // TODO implement proper continue...

  				if ( declaration.kind === 'for.let' ) {
  					// special case
  					var forStatement = declaration.node.findNearest( 'ForStatement' );

  					if ( forStatement.shouldRewriteAsFunction ) {
  						var outerAlias = this$1.scope.createIdentifier( name );
  						var innerAlias = forStatement.reassigned[ name ] ?
  							this$1.scope.createIdentifier( name ) :
  							name;

  						declaration.name = outerAlias;
  						code.overwrite( declaration.node.start, declaration.node.end, outerAlias, true );

  						forStatement.aliases[ name ] = {
  							outer: outerAlias,
  							inner: innerAlias
  						};

  						for ( var i$1 = 0, list$1 = declaration.instances; i$1 < list$1.length; i$1 += 1 ) {
  							var identifier = list$1[i$1];

  							var alias = forStatement.body.contains( identifier ) ?
  								innerAlias :
  								outerAlias;

  							if ( name !== alias ) {
  								code.overwrite( identifier.start, identifier.end, alias, true );
  							}
  						}

  						cont = true;
  					}
  				}

  				if ( !cont ) {
  					var alias$1 = this$1.scope.createIdentifier( name );

  					if ( name !== alias$1 ) {
  						declaration.name = alias$1;
  						code.overwrite( declaration.node.start, declaration.node.end, alias$1, true );

  						for ( var i$2 = 0, list$2 = declaration.instances; i$2 < list$2.length; i$2 += 1 ) {
  							var identifier$1 = list$2[i$2];

  							identifier$1.rewritten = true;
  							code.overwrite( identifier$1.start, identifier$1.end, alias$1, true );
  						}
  					}
  				}
  			}
  		});
  	};

  	return BlockStatement;
  }(Node));

  function Program ( source, ast, transforms, options ) {
  	var this$1 = this;

  	this.type = 'Root';

  	// options
  	this.jsx = options.jsx || 'React.createElement';
  	this.objectAssign = options.objectAssign || 'Object.assign';

  	this.source = source;
  	this.magicString = new MagicString( source );

  	this.ast = ast;
  	this.depth = 0;

  	wrap( this.body = ast, this );
  	this.body.__proto__ = BlockStatement.prototype;

  	this.templateElements = [];
  	this.body.initialise( transforms );

  	this.indentExclusions = {};
  	for ( var i$1 = 0, list = this.templateElements; i$1 < list.length; i$1 += 1 ) {
  		var node = list[i$1];

  		for ( var i = node.start; i < node.end; i += 1 ) {
  			this$1.indentExclusions[ node.start + i ] = true;
  		}
  	}

  	this.body.transpile( this.magicString, transforms );
  }

  Program.prototype = {
  	export: function export$1 ( options ) {
  		if ( options === void 0 ) options = {};

  		return {
  			code: this.magicString.toString(),
  			map: this.magicString.generateMap({
  				file: options.file,
  				source: options.source,
  				includeContent: options.includeContent !== false
  			})
  		};
  	},

  	findNearest: function findNearest () {
  		return null;
  	},

  	findScope: function findScope () {
  		return null;
  	}
  };

  var matrix = {
  	chrome: {
  		    48: 1333689725,
  		    49: 1342078975,
  		    50: 1610514431
  	},
  	firefox: {
  		    43: 1207307741,
  		    44: 1207307741,
  		    45: 1207307741
  	},
  	safari: {
  		     8: 1073741824,
  		     9: 1328940894
  	},
  	ie: {
  		     8: 0,
  		     9: 1073741824,
  		    10: 1073741824,
  		    11: 1073770592
  	},
  	edge: {
  		    12: 1591620701,
  		    13: 1608400479
  	},
  	node: {
  		'0.10': 1075052608,
  		'0.12': 1091830852,
  		     4: 1327398527,
  		     5: 1327398527,
  		     6: 1610514431
  	}
  };

  var features = [
  	'arrow',
  	'classes',
  	'collections',
  	'computedProperty',
  	'conciseMethodProperty',
  	'constLoop',
  	'constRedef',
  	'defaultParameter',
  	'destructuring',
  	'extendNatives',
  	'forOf',
  	'generator',
  	'letConst',
  	'letLoop',
  	'letLoopScope',
  	'moduleExport',
  	'moduleImport',
  	'numericLiteral',
  	'objectProto',
  	'objectSuper',
  	'oldOctalLiteral',
  	'parameterDestructuring',
  	'spreadRest',
  	'stickyRegExp',
  	'symbol',
  	'templateString',
  	'unicodeEscape',
  	'unicodeIdentifier',
  	'unicodeRegExp',

  	// ES2016
  	'exponentiation',

  	// additional transforms, not from
  	// https://featuretests.io
  	'reservedProperties'
  ];

  var version = "0.12.5";

  var ref = [
  	acornObjectSpread,
  	acornJsx
  ].reduce( function ( final, plugin ) { return plugin( final ); }, acorn$1 );
  var parse = ref.parse;

  var dangerousTransforms = [
  	'dangerousTaggedTemplateString',
  	'dangerousForOf'
  ];

  function target ( target ) {
  	var targets = Object.keys( target );
  	var bitmask = targets.length ?
  		2147483647 :
  		1073741824;

  	Object.keys( target ).forEach( function ( environment ) {
  		var versions = matrix[ environment ];
  		if ( !versions ) throw new Error( ("Unknown environment '" + environment + "'. Please raise an issue at https://gitlab.com/Rich-Harris/buble/issues") );

  		var targetVersion = target[ environment ];
  		if ( !( targetVersion in versions ) ) throw new Error( ("Support data exists for the following versions of " + environment + ": " + (Object.keys( versions ).join( ', ')) + ". Please raise an issue at https://gitlab.com/Rich-Harris/buble/issues") );
  		var support = versions[ targetVersion ];

  		bitmask &= support;
  	});

  	var transforms = Object.create( null );
  	features.forEach( function ( name, i ) {
  		transforms[ name ] = !( bitmask & 1 << i );
  	});

  	dangerousTransforms.forEach( function ( name ) {
  		transforms[ name ] = false;
  	});

  	return transforms;
  }

  function transform ( source, options ) {
  	if ( options === void 0 ) options = {};

  	var ast;

  	try {
  		ast = parse( source, {
  			ecmaVersion: 7,
  			preserveParens: true,
  			sourceType: 'module',
  			plugins: {
  				jsx: true,
  				objectSpread: true
  			}
  		});
  	} catch ( err ) {
  		err.snippet = getSnippet( source, err.loc );
  		err.toString = function () { return ((err.name) + ": " + (err.message) + "\n" + (err.snippet)); };
  		throw err;
  	}

  	var transforms = target( options.target || {} );
  	Object.keys( options.transforms || {} ).forEach( function ( name ) {
  		if ( name === 'modules' ) {
  			if ( !( 'moduleImport' in options.transforms ) ) transforms.moduleImport = options.transforms.modules;
  			if ( !( 'moduleExport' in options.transforms ) ) transforms.moduleExport = options.transforms.modules;
  			return;
  		}

  		if ( !( name in transforms ) ) throw new Error( ("Unknown transform '" + name + "'") );
  		transforms[ name ] = options.transforms[ name ];
  	});

  	return new Program( source, ast, transforms, options ).export( options );
  }

  exports.target = target;
  exports.transform = transform;
  exports.VERSION = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=buble.deps.js.map