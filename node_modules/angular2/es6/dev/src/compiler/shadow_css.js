import { ListWrapper } from 'angular2/src/facade/collection';
import { StringWrapper, RegExpWrapper, RegExpMatcherWrapper, isPresent, isBlank } from 'angular2/src/facade/lang';
/**
 * This file is a port of shadowCSS from webcomponents.js to TypeScript.
 *
 * Please make sure to keep to edits in sync with the source file.
 *
 * Source:
 * https://github.com/webcomponents/webcomponentsjs/blob/4efecd7e0e/src/ShadowCSS/ShadowCSS.js
 *
 * The original file level comment is reproduced below
 */
/*
  This is a limited shim for ShadowDOM css styling.
  https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#styles

  The intention here is to support only the styling features which can be
  relatively simply implemented. The goal is to allow users to avoid the
  most obvious pitfalls and do so without compromising performance significantly.
  For ShadowDOM styling that's not covered here, a set of best practices
  can be provided that should allow users to accomplish more complex styling.

  The following is a list of specific ShadowDOM styling features and a brief
  discussion of the approach used to shim.

  Shimmed features:

  * :host, :host-context: ShadowDOM allows styling of the shadowRoot's host
  element using the :host rule. To shim this feature, the :host styles are
  reformatted and prefixed with a given scope name and promoted to a
  document level stylesheet.
  For example, given a scope name of .foo, a rule like this:

    :host {
        background: red;
      }
    }

  becomes:

    .foo {
      background: red;
    }

  * encapsultion: Styles defined within ShadowDOM, apply only to
  dom inside the ShadowDOM. Polymer uses one of two techniques to implement
  this feature.

  By default, rules are prefixed with the host element tag name
  as a descendant selector. This ensures styling does not leak out of the 'top'
  of the element's ShadowDOM. For example,

  div {
      font-weight: bold;
    }

  becomes:

  x-foo div {
      font-weight: bold;
    }

  becomes:


  Alternatively, if WebComponents.ShadowCSS.strictStyling is set to true then
  selectors are scoped by adding an attribute selector suffix to each
  simple selector that contains the host element tag name. Each element
  in the element's ShadowDOM template is also given the scope attribute.
  Thus, these rules match only elements that have the scope attribute.
  For example, given a scope name of x-foo, a rule like this:

    div {
      font-weight: bold;
    }

  becomes:

    div[x-foo] {
      font-weight: bold;
    }

  Note that elements that are dynamically added to a scope must have the scope
  selector added to them manually.

  * upper/lower bound encapsulation: Styles which are defined outside a
  shadowRoot should not cross the ShadowDOM boundary and should not apply
  inside a shadowRoot.

  This styling behavior is not emulated. Some possible ways to do this that
  were rejected due to complexity and/or performance concerns include: (1) reset
  every possible property for every possible selector for a given scope name;
  (2) re-implement css in javascript.

  As an alternative, users should make sure to use selectors
  specific to the scope in which they are working.

  * ::distributed: This behavior is not emulated. It's often not necessary
  to style the contents of a specific insertion point and instead, descendants
  of the host element can be styled selectively. Users can also create an
  extra node around an insertion point and style that node's contents
  via descendent selectors. For example, with a shadowRoot like this:

    <style>
      ::content(div) {
        background: red;
      }
    </style>
    <content></content>

  could become:

    <style>
      / *@polyfill .content-container div * /
      ::content(div) {
        background: red;
      }
    </style>
    <div class="content-container">
      <content></content>
    </div>

  Note the use of @polyfill in the comment above a ShadowDOM specific style
  declaration. This is a directive to the styling shim to use the selector
  in comments in lieu of the next selector when running under polyfill.
*/
export class ShadowCss {
    constructor() {
        this.strictStyling = true;
    }
    /*
    * Shim some cssText with the given selector. Returns cssText that can
    * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
    *
    * When strictStyling is true:
    * - selector is the attribute added to all elements inside the host,
    * - hostSelector is the attribute added to the host itself.
    */
    shimCssText(cssText, selector, hostSelector = '') {
        cssText = stripComments(cssText);
        cssText = this._insertDirectives(cssText);
        return this._scopeCssText(cssText, selector, hostSelector);
    }
    _insertDirectives(cssText) {
        cssText = this._insertPolyfillDirectivesInCssText(cssText);
        return this._insertPolyfillRulesInCssText(cssText);
    }
    /*
     * Process styles to convert native ShadowDOM rules that will trip
     * up the css parser; we rely on decorating the stylesheet with inert rules.
     *
     * For example, we convert this rule:
     *
     * polyfill-next-selector { content: ':host menu-item'; }
     * ::content menu-item {
     *
     * to this:
     *
     * scopeName menu-item {
     *
    **/
    _insertPolyfillDirectivesInCssText(cssText) {
        // Difference with webcomponents.js: does not handle comments
        return StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe, function (m) { return m[1] + '{'; });
    }
    /*
     * Process styles to add rules which will only apply under the polyfill
     *
     * For example, we convert this rule:
     *
     * polyfill-rule {
     *   content: ':host menu-item';
     * ...
     * }
     *
     * to this:
     *
     * scopeName menu-item {...}
     *
    **/
    _insertPolyfillRulesInCssText(cssText) {
        // Difference with webcomponents.js: does not handle comments
        return StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, function (m) {
            var rule = m[0];
            rule = StringWrapper.replace(rule, m[1], '');
            rule = StringWrapper.replace(rule, m[2], '');
            return m[3] + rule;
        });
    }
    /* Ensure styles are scoped. Pseudo-scoping takes a rule like:
     *
     *  .foo {... }
     *
     *  and converts this to
     *
     *  scopeName .foo { ... }
    */
    _scopeCssText(cssText, scopeSelector, hostSelector) {
        var unscoped = this._extractUnscopedRulesFromCssText(cssText);
        cssText = this._insertPolyfillHostInCssText(cssText);
        cssText = this._convertColonHost(cssText);
        cssText = this._convertColonHostContext(cssText);
        cssText = this._convertShadowDOMSelectors(cssText);
        if (isPresent(scopeSelector)) {
            cssText = this._scopeSelectors(cssText, scopeSelector, hostSelector);
        }
        cssText = cssText + '\n' + unscoped;
        return cssText.trim();
    }
    /*
     * Process styles to add rules which will only apply under the polyfill
     * and do not process via CSSOM. (CSSOM is destructive to rules on rare
     * occasions, e.g. -webkit-calc on Safari.)
     * For example, we convert this rule:
     *
     * @polyfill-unscoped-rule {
     *   content: 'menu-item';
     * ... }
     *
     * to this:
     *
     * menu-item {...}
     *
    **/
    _extractUnscopedRulesFromCssText(cssText) {
        // Difference with webcomponents.js: does not handle comments
        var r = '', m;
        var matcher = RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
        while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
            var rule = m[0];
            rule = StringWrapper.replace(rule, m[2], '');
            rule = StringWrapper.replace(rule, m[1], m[3]);
            r += rule + '\n\n';
        }
        return r;
    }
    /*
     * convert a rule like :host(.foo) > .bar { }
     *
     * to
     *
     * scopeName.foo > .bar
    */
    _convertColonHost(cssText) {
        return this._convertColonRule(cssText, _cssColonHostRe, this._colonHostPartReplacer);
    }
    /*
     * convert a rule like :host-context(.foo) > .bar { }
     *
     * to
     *
     * scopeName.foo > .bar, .foo scopeName > .bar { }
     *
     * and
     *
     * :host-context(.foo:host) .bar { ... }
     *
     * to
     *
     * scopeName.foo .bar { ... }
    */
    _convertColonHostContext(cssText) {
        return this._convertColonRule(cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
    }
    _convertColonRule(cssText, regExp, partReplacer) {
        // p1 = :host, p2 = contents of (), p3 rest of rule
        return StringWrapper.replaceAllMapped(cssText, regExp, function (m) {
            if (isPresent(m[2])) {
                var parts = m[2].split(','), r = [];
                for (var i = 0; i < parts.length; i++) {
                    var p = parts[i];
                    if (isBlank(p))
                        break;
                    p = p.trim();
                    r.push(partReplacer(_polyfillHostNoCombinator, p, m[3]));
                }
                return r.join(',');
            }
            else {
                return _polyfillHostNoCombinator + m[3];
            }
        });
    }
    _colonHostContextPartReplacer(host, part, suffix) {
        if (StringWrapper.contains(part, _polyfillHost)) {
            return this._colonHostPartReplacer(host, part, suffix);
        }
        else {
            return host + part + suffix + ', ' + part + ' ' + host + suffix;
        }
    }
    _colonHostPartReplacer(host, part, suffix) {
        return host + StringWrapper.replace(part, _polyfillHost, '') + suffix;
    }
    /*
     * Convert combinators like ::shadow and pseudo-elements like ::content
     * by replacing with space.
    */
    _convertShadowDOMSelectors(cssText) {
        for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
            cssText = StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], ' ');
        }
        return cssText;
    }
    // change a selector like 'div' to 'name div'
    _scopeSelectors(cssText, scopeSelector, hostSelector) {
        return processRules(cssText, (rule) => {
            var selector = rule.selector;
            var content = rule.content;
            if (rule.selector[0] != '@' || rule.selector.startsWith('@page')) {
                selector =
                    this._scopeSelector(rule.selector, scopeSelector, hostSelector, this.strictStyling);
            }
            else if (rule.selector.startsWith('@media')) {
                content = this._scopeSelectors(rule.content, scopeSelector, hostSelector);
            }
            return new CssRule(selector, content);
        });
    }
    _scopeSelector(selector, scopeSelector, hostSelector, strict) {
        var r = [], parts = selector.split(',');
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i].trim();
            var deepParts = StringWrapper.split(p, _shadowDeepSelectors);
            var shallowPart = deepParts[0];
            if (this._selectorNeedsScoping(shallowPart, scopeSelector)) {
                deepParts[0] = strict && !StringWrapper.contains(shallowPart, _polyfillHostNoCombinator) ?
                    this._applyStrictSelectorScope(shallowPart, scopeSelector) :
                    this._applySelectorScope(shallowPart, scopeSelector, hostSelector);
            }
            // replace /deep/ with a space for child selectors
            r.push(deepParts.join(' '));
        }
        return r.join(', ');
    }
    _selectorNeedsScoping(selector, scopeSelector) {
        var re = this._makeScopeMatcher(scopeSelector);
        return !isPresent(RegExpWrapper.firstMatch(re, selector));
    }
    _makeScopeMatcher(scopeSelector) {
        var lre = /\[/g;
        var rre = /\]/g;
        scopeSelector = StringWrapper.replaceAll(scopeSelector, lre, '\\[');
        scopeSelector = StringWrapper.replaceAll(scopeSelector, rre, '\\]');
        return RegExpWrapper.create('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
    }
    _applySelectorScope(selector, scopeSelector, hostSelector) {
        // Difference from webcomponentsjs: scopeSelector could not be an array
        return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
    }
    // scope via name and [is=name]
    _applySimpleSelectorScope(selector, scopeSelector, hostSelector) {
        if (isPresent(RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
            var replaceBy = this.strictStyling ? `[${hostSelector}]` : scopeSelector;
            selector = StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
            return StringWrapper.replaceAll(selector, _polyfillHostRe, replaceBy + ' ');
        }
        else {
            return scopeSelector + ' ' + selector;
        }
    }
    // return a selector with [name] suffix on each simple selector
    // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
    _applyStrictSelectorScope(selector, scopeSelector) {
        var isRe = /\[is=([^\]]*)\]/g;
        scopeSelector = StringWrapper.replaceAllMapped(scopeSelector, isRe, (m) => m[1]);
        var splits = [' ', '>', '+', '~'], scoped = selector, attrName = '[' + scopeSelector + ']';
        for (var i = 0; i < splits.length; i++) {
            var sep = splits[i];
            var parts = scoped.split(sep);
            scoped = parts.map(p => {
                // remove :host since it should be unnecessary
                var t = StringWrapper.replaceAll(p.trim(), _polyfillHostRe, '');
                if (t.length > 0 && !ListWrapper.contains(splits, t) &&
                    !StringWrapper.contains(t, attrName)) {
                    var re = /([^:]*)(:*)(.*)/g;
                    var m = RegExpWrapper.firstMatch(re, t);
                    if (isPresent(m)) {
                        p = m[1] + attrName + m[2] + m[3];
                    }
                }
                return p;
            })
                .join(sep);
        }
        return scoped;
    }
    _insertPolyfillHostInCssText(selector) {
        selector = StringWrapper.replaceAll(selector, _colonHostContextRe, _polyfillHostContext);
        selector = StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
        return selector;
    }
}
var _cssContentNextSelectorRe = /polyfill-next-selector[^}]*content:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim;
var _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
var _cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
var _polyfillHost = '-shadowcsshost';
// note: :host-context pre-processed to -shadowcsshostcontext.
var _polyfillHostContext = '-shadowcsscontext';
var _parenSuffix = ')(?:\\((' +
    '(?:\\([^)(]*\\)|[^)(]*)+?' +
    ')\\))?([^,{]*)';
var _cssColonHostRe = RegExpWrapper.create('(' + _polyfillHost + _parenSuffix, 'im');
var _cssColonHostContextRe = RegExpWrapper.create('(' + _polyfillHostContext + _parenSuffix, 'im');
var _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
var _shadowDOMSelectorsRe = [
    /::shadow/g,
    /::content/g,
    // Deprecated selectors
    // TODO(vicb): see https://github.com/angular/clang-format/issues/16
    // clang-format off
    /\/shadow-deep\//g,
    /\/shadow\//g,
];
var _shadowDeepSelectors = /(?:>>>)|(?:\/deep\/)/g;
var _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
var _polyfillHostRe = RegExpWrapper.create(_polyfillHost, 'im');
var _colonHostRe = /:host/gim;
var _colonHostContextRe = /:host-context/gim;
var _commentRe = /\/\*[\s\S]*?\*\//g;
function stripComments(input) {
    return StringWrapper.replaceAllMapped(input, _commentRe, (_) => '');
}
var _ruleRe = /(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g;
var _curlyRe = /([{}])/g;
const OPEN_CURLY = '{';
const CLOSE_CURLY = '}';
const BLOCK_PLACEHOLDER = '%BLOCK%';
export class CssRule {
    constructor(selector, content) {
        this.selector = selector;
        this.content = content;
    }
}
export function processRules(input, ruleCallback) {
    var inputWithEscapedBlocks = escapeBlocks(input);
    var nextBlockIndex = 0;
    return StringWrapper.replaceAllMapped(inputWithEscapedBlocks.escapedString, _ruleRe, function (m) {
        var selector = m[2];
        var content = '';
        var suffix = m[4];
        var contentPrefix = '';
        if (isPresent(m[4]) && m[4].startsWith('{' + BLOCK_PLACEHOLDER)) {
            content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
            suffix = m[4].substring(BLOCK_PLACEHOLDER.length + 1);
            contentPrefix = '{';
        }
        var rule = ruleCallback(new CssRule(selector, content));
        return `${m[1]}${rule.selector}${m[3]}${contentPrefix}${rule.content}${suffix}`;
    });
}
class StringWithEscapedBlocks {
    constructor(escapedString, blocks) {
        this.escapedString = escapedString;
        this.blocks = blocks;
    }
}
function escapeBlocks(input) {
    var inputParts = StringWrapper.split(input, _curlyRe);
    var resultParts = [];
    var escapedBlocks = [];
    var bracketCount = 0;
    var currentBlockParts = [];
    for (var partIndex = 0; partIndex < inputParts.length; partIndex++) {
        var part = inputParts[partIndex];
        if (part == CLOSE_CURLY) {
            bracketCount--;
        }
        if (bracketCount > 0) {
            currentBlockParts.push(part);
        }
        else {
            if (currentBlockParts.length > 0) {
                escapedBlocks.push(currentBlockParts.join(''));
                resultParts.push(BLOCK_PLACEHOLDER);
                currentBlockParts = [];
            }
            resultParts.push(part);
        }
        if (part == OPEN_CURLY) {
            bracketCount++;
        }
    }
    if (currentBlockParts.length > 0) {
        escapedBlocks.push(currentBlockParts.join(''));
        resultParts.push(BLOCK_PLACEHOLDER);
    }
    return new StringWithEscapedBlocks(resultParts.join(''), escapedBlocks);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbIlNoYWRvd0NzcyIsIlNoYWRvd0Nzcy5jb25zdHJ1Y3RvciIsIlNoYWRvd0Nzcy5zaGltQ3NzVGV4dCIsIlNoYWRvd0Nzcy5faW5zZXJ0RGlyZWN0aXZlcyIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxEaXJlY3RpdmVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9zY29wZUNzc1RleHQiLCJTaGFkb3dDc3MuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3QiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0IiwiU2hhZG93Q3NzLl9jb252ZXJ0Q29sb25SdWxlIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RDb250ZXh0UGFydFJlcGxhY2VyIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIiLCJTaGFkb3dDc3MuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMiLCJTaGFkb3dDc3MuX3Njb3BlU2VsZWN0b3JzIiwiU2hhZG93Q3NzLl9zY29wZVNlbGVjdG9yIiwiU2hhZG93Q3NzLl9zZWxlY3Rvck5lZWRzU2NvcGluZyIsIlNoYWRvd0Nzcy5fbWFrZVNjb3BlTWF0Y2hlciIsIlNoYWRvd0Nzcy5fYXBwbHlTZWxlY3RvclNjb3BlIiwiU2hhZG93Q3NzLl9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUiLCJTaGFkb3dDc3MuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZSIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0Iiwic3RyaXBDb21tZW50cyIsIkNzc1J1bGUiLCJDc3NSdWxlLmNvbnN0cnVjdG9yIiwicHJvY2Vzc1J1bGVzIiwiU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3MiLCJTdHJpbmdXaXRoRXNjYXBlZEJsb2Nrcy5jb25zdHJ1Y3RvciIsImVzY2FwZUJsb2NrcyJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFDTCxhQUFhLEVBRWIsYUFBYSxFQUNiLG9CQUFvQixFQUNwQixTQUFTLEVBQ1QsT0FBTyxFQUNSLE1BQU0sMEJBQTBCO0FBRWpDOzs7Ozs7Ozs7R0FTRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWlIRTtBQUVGO0lBR0VBO1FBRkFDLGtCQUFhQSxHQUFZQSxJQUFJQSxDQUFDQTtJQUVmQSxDQUFDQTtJQUVoQkQ7Ozs7Ozs7TUFPRUE7SUFDRkEsV0FBV0EsQ0FBQ0EsT0FBZUEsRUFBRUEsUUFBZ0JBLEVBQUVBLFlBQVlBLEdBQVdBLEVBQUVBO1FBQ3RFRSxPQUFPQSxHQUFHQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNqQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMxQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRU9GLGlCQUFpQkEsQ0FBQ0EsT0FBZUE7UUFDdkNHLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGtDQUFrQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBRURIOzs7Ozs7Ozs7Ozs7O09BYUdBO0lBQ0tBLGtDQUFrQ0EsQ0FBQ0Es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dUJBQXVCQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxhQUFhQSxDQUFDQSxDQUFDQTtBQUMxRUEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgU3RyaW5nV3JhcHBlcixcbiAgUmVnRXhwLFxuICBSZWdFeHBXcmFwcGVyLFxuICBSZWdFeHBNYXRjaGVyV3JhcHBlcixcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogVGhpcyBmaWxlIGlzIGEgcG9ydCBvZiBzaGFkb3dDU1MgZnJvbSB3ZWJjb21wb25lbnRzLmpzIHRvIFR5cGVTY3JpcHQuXG4gKlxuICogUGxlYXNlIG1ha2Ugc3VyZSB0byBrZWVwIHRvIGVkaXRzIGluIHN5bmMgd2l0aCB0aGUgc291cmNlIGZpbGUuXG4gKlxuICogU291cmNlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL3dlYmNvbXBvbmVudHMvd2ViY29tcG9uZW50c2pzL2Jsb2IvNGVmZWNkN2UwZS9zcmMvU2hhZG93Q1NTL1NoYWRvd0NTUy5qc1xuICpcbiAqIFRoZSBvcmlnaW5hbCBmaWxlIGxldmVsIGNvbW1lbnQgaXMgcmVwcm9kdWNlZCBiZWxvd1xuICovXG5cbi8qXG4gIFRoaXMgaXMgYSBsaW1pdGVkIHNoaW0gZm9yIFNoYWRvd0RPTSBjc3Mgc3R5bGluZy5cbiAgaHR0cHM6Ly9kdmNzLnczLm9yZy9oZy93ZWJjb21wb25lbnRzL3Jhdy1maWxlL3RpcC9zcGVjL3NoYWRvdy9pbmRleC5odG1sI3N0eWxlc1xuXG4gIFRoZSBpbnRlbnRpb24gaGVyZSBpcyB0byBzdXBwb3J0IG9ubHkgdGhlIHN0eWxpbmcgZmVhdHVyZXMgd2hpY2ggY2FuIGJlXG4gIHJlbGF0aXZlbHkgc2ltcGx5IGltcGxlbWVudGVkLiBUaGUgZ29hbCBpcyB0byBhbGxvdyB1c2VycyB0byBhdm9pZCB0aGVcbiAgbW9zdCBvYnZpb3VzIHBpdGZhbGxzIGFuZCBkbyBzbyB3aXRob3V0IGNvbXByb21pc2luZyBwZXJmb3JtYW5jZSBzaWduaWZpY2FudGx5LlxuICBGb3IgU2hhZG93RE9NIHN0eWxpbmcgdGhhdCdzIG5vdCBjb3ZlcmVkIGhlcmUsIGEgc2V0IG9mIGJlc3QgcHJhY3RpY2VzXG4gIGNhbiBiZSBwcm92aWRlZCB0aGF0IHNob3VsZCBhbGxvdyB1c2VycyB0byBhY2NvbXBsaXNoIG1vcmUgY29tcGxleCBzdHlsaW5nLlxuXG4gIFRoZSBmb2xsb3dpbmcgaXMgYSBsaXN0IG9mIHNwZWNpZmljIFNoYWRvd0RPTSBzdHlsaW5nIGZlYXR1cmVzIGFuZCBhIGJyaWVmXG4gIGRpc2N1c3Npb24gb2YgdGhlIGFwcHJvYWNoIHVzZWQgdG8gc2hpbS5cblxuICBTaGltbWVkIGZlYXR1cmVzOlxuXG4gICogOmhvc3QsIDpob3N0LWNvbnRleHQ6IFNoYWRvd0RPTSBhbGxvd3Mgc3R5bGluZyBvZiB0aGUgc2hhZG93Um9vdCdzIGhvc3RcbiAgZWxlbWVudCB1c2luZyB0aGUgOmhvc3QgcnVsZS4gVG8gc2hpbSB0aGlzIGZlYXR1cmUsIHRoZSA6aG9zdCBzdHlsZXMgYXJlXG4gIHJlZm9ybWF0dGVkIGFuZCBwcmVmaXhlZCB3aXRoIGEgZ2l2ZW4gc2NvcGUgbmFtZSBhbmQgcHJvbW90ZWQgdG8gYVxuICBkb2N1bWVudCBsZXZlbCBzdHlsZXNoZWV0LlxuICBGb3IgZXhhbXBsZSwgZ2l2ZW4gYSBzY29wZSBuYW1lIG9mIC5mb28sIGEgcnVsZSBsaWtlIHRoaXM6XG5cbiAgICA6aG9zdCB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgYmVjb21lczpcblxuICAgIC5mb28ge1xuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgIH1cblxuICAqIGVuY2Fwc3VsdGlvbjogU3R5bGVzIGRlZmluZWQgd2l0aGluIFNoYWRvd0RPTSwgYXBwbHkgb25seSB0b1xuICBkb20gaW5zaWRlIHRoZSBTaGFkb3dET00uIFBvbHltZXIgdXNlcyBvbmUgb2YgdHdvIHRlY2huaXF1ZXMgdG8gaW1wbGVtZW50XG4gIHRoaXMgZmVhdHVyZS5cblxuICBCeSBkZWZhdWx0LCBydWxlcyBhcmUgcHJlZml4ZWQgd2l0aCB0aGUgaG9zdCBlbGVtZW50IHRhZyBuYW1lXG4gIGFzIGEgZGVzY2VuZGFudCBzZWxlY3Rvci4gVGhpcyBlbnN1cmVzIHN0eWxpbmcgZG9lcyBub3QgbGVhayBvdXQgb2YgdGhlICd0b3AnXG4gIG9mIHRoZSBlbGVtZW50J3MgU2hhZG93RE9NLiBGb3IgZXhhbXBsZSxcblxuICBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgeC1mb28gZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG5cbiAgQWx0ZXJuYXRpdmVseSwgaWYgV2ViQ29tcG9uZW50cy5TaGFkb3dDU1Muc3RyaWN0U3R5bGluZyBpcyBzZXQgdG8gdHJ1ZSB0aGVuXG4gIHNlbGVjdG9ycyBhcmUgc2NvcGVkIGJ5IGFkZGluZyBhbiBhdHRyaWJ1dGUgc2VsZWN0b3Igc3VmZml4IHRvIGVhY2hcbiAgc2ltcGxlIHNlbGVjdG9yIHRoYXQgY29udGFpbnMgdGhlIGhvc3QgZWxlbWVudCB0YWcgbmFtZS4gRWFjaCBlbGVtZW50XG4gIGluIHRoZSBlbGVtZW50J3MgU2hhZG93RE9NIHRlbXBsYXRlIGlzIGFsc28gZ2l2ZW4gdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgVGh1cywgdGhlc2UgcnVsZXMgbWF0Y2ggb25seSBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiB4LWZvbywgYSBydWxlIGxpa2UgdGhpczpcblxuICAgIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuICAgIGRpdlt4LWZvb10ge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIE5vdGUgdGhhdCBlbGVtZW50cyB0aGF0IGFyZSBkeW5hbWljYWxseSBhZGRlZCB0byBhIHNjb3BlIG11c3QgaGF2ZSB0aGUgc2NvcGVcbiAgc2VsZWN0b3IgYWRkZWQgdG8gdGhlbSBtYW51YWxseS5cblxuICAqIHVwcGVyL2xvd2VyIGJvdW5kIGVuY2Fwc3VsYXRpb246IFN0eWxlcyB3aGljaCBhcmUgZGVmaW5lZCBvdXRzaWRlIGFcbiAgc2hhZG93Um9vdCBzaG91bGQgbm90IGNyb3NzIHRoZSBTaGFkb3dET00gYm91bmRhcnkgYW5kIHNob3VsZCBub3QgYXBwbHlcbiAgaW5zaWRlIGEgc2hhZG93Um9vdC5cblxuICBUaGlzIHN0eWxpbmcgYmVoYXZpb3IgaXMgbm90IGVtdWxhdGVkLiBTb21lIHBvc3NpYmxlIHdheXMgdG8gZG8gdGhpcyB0aGF0XG4gIHdlcmUgcmVqZWN0ZWQgZHVlIHRvIGNvbXBsZXhpdHkgYW5kL29yIHBlcmZvcm1hbmNlIGNvbmNlcm5zIGluY2x1ZGU6ICgxKSByZXNldFxuICBldmVyeSBwb3NzaWJsZSBwcm9wZXJ0eSBmb3IgZXZlcnkgcG9zc2libGUgc2VsZWN0b3IgZm9yIGEgZ2l2ZW4gc2NvcGUgbmFtZTtcbiAgKDIpIHJlLWltcGxlbWVudCBjc3MgaW4gamF2YXNjcmlwdC5cblxuICBBcyBhbiBhbHRlcm5hdGl2ZSwgdXNlcnMgc2hvdWxkIG1ha2Ugc3VyZSB0byB1c2Ugc2VsZWN0b3JzXG4gIHNwZWNpZmljIHRvIHRoZSBzY29wZSBpbiB3aGljaCB0aGV5IGFyZSB3b3JraW5nLlxuXG4gICogOjpkaXN0cmlidXRlZDogVGhpcyBiZWhhdmlvciBpcyBub3QgZW11bGF0ZWQuIEl0J3Mgb2Z0ZW4gbm90IG5lY2Vzc2FyeVxuICB0byBzdHlsZSB0aGUgY29udGVudHMgb2YgYSBzcGVjaWZpYyBpbnNlcnRpb24gcG9pbnQgYW5kIGluc3RlYWQsIGRlc2NlbmRhbnRzXG4gIG9mIHRoZSBob3N0IGVsZW1lbnQgY2FuIGJlIHN0eWxlZCBzZWxlY3RpdmVseS4gVXNlcnMgY2FuIGFsc28gY3JlYXRlIGFuXG4gIGV4dHJhIG5vZGUgYXJvdW5kIGFuIGluc2VydGlvbiBwb2ludCBhbmQgc3R5bGUgdGhhdCBub2RlJ3MgY29udGVudHNcbiAgdmlhIGRlc2NlbmRlbnQgc2VsZWN0b3JzLiBGb3IgZXhhbXBsZSwgd2l0aCBhIHNoYWRvd1Jvb3QgbGlrZSB0aGlzOlxuXG4gICAgPHN0eWxlPlxuICAgICAgOjpjb250ZW50KGRpdikge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgPC9zdHlsZT5cbiAgICA8Y29udGVudD48L2NvbnRlbnQ+XG5cbiAgY291bGQgYmVjb21lOlxuXG4gICAgPHN0eWxlPlxuICAgICAgLyAqQHBvbHlmaWxsIC5jb250ZW50LWNvbnRhaW5lciBkaXYgKiAvXG4gICAgICA6OmNvbnRlbnQoZGl2KSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgIH1cbiAgICA8L3N0eWxlPlxuICAgIDxkaXYgY2xhc3M9XCJjb250ZW50LWNvbnRhaW5lclwiPlxuICAgICAgPGNvbnRlbnQ+PC9jb250ZW50PlxuICAgIDwvZGl2PlxuXG4gIE5vdGUgdGhlIHVzZSBvZiBAcG9seWZpbGwgaW4gdGhlIGNvbW1lbnQgYWJvdmUgYSBTaGFkb3dET00gc3BlY2lmaWMgc3R5bGVcbiAgZGVjbGFyYXRpb24uIFRoaXMgaXMgYSBkaXJlY3RpdmUgdG8gdGhlIHN0eWxpbmcgc2hpbSB0byB1c2UgdGhlIHNlbGVjdG9yXG4gIGluIGNvbW1lbnRzIGluIGxpZXUgb2YgdGhlIG5leHQgc2VsZWN0b3Igd2hlbiBydW5uaW5nIHVuZGVyIHBvbHlmaWxsLlxuKi9cblxuZXhwb3J0IGNsYXNzIFNoYWRvd0NzcyB7XG4gIHN0cmljdFN0eWxpbmc6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvKlxuICAqIFNoaW0gc29tZSBjc3NUZXh0IHdpdGggdGhlIGdpdmVuIHNlbGVjdG9yLiBSZXR1cm5zIGNzc1RleHQgdGhhdCBjYW5cbiAgKiBiZSBpbmNsdWRlZCBpbiB0aGUgZG9jdW1lbnQgdmlhIFdlYkNvbXBvbmVudHMuU2hhZG93Q1NTLmFkZENzc1RvRG9jdW1lbnQoY3NzKS5cbiAgKlxuICAqIFdoZW4gc3RyaWN0U3R5bGluZyBpcyB0cnVlOlxuICAqIC0gc2VsZWN0b3IgaXMgdGhlIGF0dHJpYnV0ZSBhZGRlZCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIHRoZSBob3N0LFxuICAqIC0gaG9zdFNlbGVjdG9yIGlzIHRoZSBhdHRyaWJ1dGUgYWRkZWQgdG8gdGhlIGhvc3QgaXRzZWxmLlxuICAqL1xuICBzaGltQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcsIHNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgIGNzc1RleHQgPSBzdHJpcENvbW1lbnRzKGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnREaXJlY3RpdmVzKGNzc1RleHQpO1xuICAgIHJldHVybiB0aGlzLl9zY29wZUNzc1RleHQoY3NzVGV4dCwgc2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9pbnNlcnREaXJlY3RpdmVzKGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydFBvbHlmaWxsRGlyZWN0aXZlc0luQ3NzVGV4dChjc3NUZXh0KTtcbiAgICByZXR1cm4gdGhpcy5faW5zZXJ0UG9seWZpbGxSdWxlc0luQ3NzVGV4dChjc3NUZXh0KTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb2Nlc3Mgc3R5bGVzIHRvIGNvbnZlcnQgbmF0aXZlIFNoYWRvd0RPTSBydWxlcyB0aGF0IHdpbGwgdHJpcFxuICAgKiB1cCB0aGUgY3NzIHBhcnNlcjsgd2UgcmVseSBvbiBkZWNvcmF0aW5nIHRoZSBzdHlsZXNoZWV0IHdpdGggaW5lcnQgcnVsZXMuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCB3ZSBjb252ZXJ0IHRoaXMgcnVsZTpcbiAgICpcbiAgICogcG9seWZpbGwtbmV4dC1zZWxlY3RvciB7IGNvbnRlbnQ6ICc6aG9zdCBtZW51LWl0ZW0nOyB9XG4gICAqIDo6Y29udGVudCBtZW51LWl0ZW0ge1xuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBzY29wZU5hbWUgbWVudS1pdGVtIHtcbiAgICpcbiAgKiovXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsRGlyZWN0aXZlc0luQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2Ugd2l0aCB3ZWJjb21wb25lbnRzLmpzOiBkb2VzIG5vdCBoYW5kbGUgY29tbWVudHNcbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGNzc1RleHQsIF9jc3NDb250ZW50TmV4dFNlbGVjdG9yUmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihtKSB7IHJldHVybiBtWzFdICsgJ3snOyB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb2Nlc3Mgc3R5bGVzIHRvIGFkZCBydWxlcyB3aGljaCB3aWxsIG9ubHkgYXBwbHkgdW5kZXIgdGhlIHBvbHlmaWxsXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCB3ZSBjb252ZXJ0IHRoaXMgcnVsZTpcbiAgICpcbiAgICogcG9seWZpbGwtcnVsZSB7XG4gICAqICAgY29udGVudDogJzpob3N0IG1lbnUtaXRlbSc7XG4gICAqIC4uLlxuICAgKiB9XG4gICAqXG4gICAqIHRvIHRoaXM6XG4gICAqXG4gICAqIHNjb3BlTmFtZSBtZW51LWl0ZW0gey4uLn1cbiAgICpcbiAgKiovXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChjc3NUZXh0LCBfY3NzQ29udGVudFJ1bGVSZSwgZnVuY3Rpb24obSkge1xuICAgICAgdmFyIHJ1bGUgPSBtWzBdO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzFdLCAnJyk7XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMl0sICcnKTtcbiAgICAgIHJldHVybiBtWzNdICsgcnVsZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIEVuc3VyZSBzdHlsZXMgYXJlIHNjb3BlZC4gUHNldWRvLXNjb3BpbmcgdGFrZXMgYSBydWxlIGxpa2U6XG4gICAqXG4gICAqICAuZm9vIHsuLi4gfVxuICAgKlxuICAgKiAgYW5kIGNvbnZlcnRzIHRoaXMgdG9cbiAgICpcbiAgICogIHNjb3BlTmFtZSAuZm9vIHsgLi4uIH1cbiAgKi9cbiAgcHJpdmF0ZSBfc2NvcGVDc3NUZXh0KGNzc1RleHQ6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIHVuc2NvcGVkID0gdGhpcy5fZXh0cmFjdFVuc2NvcGVkUnVsZXNGcm9tQ3NzVGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5faW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9jb252ZXJ0Q29sb25Ib3N0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9jb252ZXJ0Q29sb25Ib3N0Q29udGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydFNoYWRvd0RPTVNlbGVjdG9ycyhjc3NUZXh0KTtcbiAgICBpZiAoaXNQcmVzZW50KHNjb3BlU2VsZWN0b3IpKSB7XG4gICAgICBjc3NUZXh0ID0gdGhpcy5fc2NvcGVTZWxlY3RvcnMoY3NzVGV4dCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICB9XG4gICAgY3NzVGV4dCA9IGNzc1RleHQgKyAnXFxuJyArIHVuc2NvcGVkO1xuICAgIHJldHVybiBjc3NUZXh0LnRyaW0oKTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb2Nlc3Mgc3R5bGVzIHRvIGFkZCBydWxlcyB3aGljaCB3aWxsIG9ubHkgYXBwbHkgdW5kZXIgdGhlIHBvbHlmaWxsXG4gICAqIGFuZCBkbyBub3QgcHJvY2VzcyB2aWEgQ1NTT00uIChDU1NPTSBpcyBkZXN0cnVjdGl2ZSB0byBydWxlcyBvbiByYXJlXG4gICAqIG9jY2FzaW9ucywgZS5nLiAtd2Via2l0LWNhbGMgb24gU2FmYXJpLilcbiAgICogRm9yIGV4YW1wbGUsIHdlIGNvbnZlcnQgdGhpcyBydWxlOlxuICAgKlxuICAgKiBAcG9seWZpbGwtdW5zY29wZWQtcnVsZSB7XG4gICAqICAgY29udGVudDogJ21lbnUtaXRlbSc7XG4gICAqIC4uLiB9XG4gICAqXG4gICAqIHRvIHRoaXM6XG4gICAqXG4gICAqIG1lbnUtaXRlbSB7Li4ufVxuICAgKlxuICAqKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFVuc2NvcGVkUnVsZXNGcm9tQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2Ugd2l0aCB3ZWJjb21wb25lbnRzLmpzOiBkb2VzIG5vdCBoYW5kbGUgY29tbWVudHNcbiAgICB2YXIgciA9ICcnLCBtO1xuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwV3JhcHBlci5tYXRjaGVyKF9jc3NDb250ZW50VW5zY29wZWRSdWxlUmUsIGNzc1RleHQpO1xuICAgIHdoaWxlIChpc1ByZXNlbnQobSA9IFJlZ0V4cE1hdGNoZXJXcmFwcGVyLm5leHQobWF0Y2hlcikpKSB7XG4gICAgICB2YXIgcnVsZSA9IG1bMF07XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMl0sICcnKTtcbiAgICAgIHJ1bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocnVsZSwgbVsxXSwgbVszXSk7XG4gICAgICByICs9IHJ1bGUgKyAnXFxuXFxuJztcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuICAvKlxuICAgKiBjb252ZXJ0IGEgcnVsZSBsaWtlIDpob3N0KC5mb28pID4gLmJhciB7IH1cbiAgICpcbiAgICogdG9cbiAgICpcbiAgICogc2NvcGVOYW1lLmZvbyA+IC5iYXJcbiAgKi9cbiAgcHJpdmF0ZSBfY29udmVydENvbG9uSG9zdChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQsIF9jc3NDb2xvbkhvc3RSZSwgdGhpcy5fY29sb25Ib3N0UGFydFJlcGxhY2VyKTtcbiAgfVxuXG4gIC8qXG4gICAqIGNvbnZlcnQgYSBydWxlIGxpa2UgOmhvc3QtY29udGV4dCguZm9vKSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIHNjb3BlTmFtZS5mb28gPiAuYmFyLCAuZm9vIHNjb3BlTmFtZSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIGFuZFxuICAgKlxuICAgKiA6aG9zdC1jb250ZXh0KC5mb286aG9zdCkgLmJhciB7IC4uLiB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIHNjb3BlTmFtZS5mb28gLmJhciB7IC4uLiB9XG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRDb2xvblJ1bGUoY3NzVGV4dCwgX2Nzc0NvbG9uSG9zdENvbnRleHRSZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb2xvbkhvc3RDb250ZXh0UGFydFJlcGxhY2VyKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvblJ1bGUoY3NzVGV4dDogc3RyaW5nLCByZWdFeHA6IFJlZ0V4cCwgcGFydFJlcGxhY2VyOiBGdW5jdGlvbik6IHN0cmluZyB7XG4gICAgLy8gcDEgPSA6aG9zdCwgcDIgPSBjb250ZW50cyBvZiAoKSwgcDMgcmVzdCBvZiBydWxlXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChjc3NUZXh0LCByZWdFeHAsIGZ1bmN0aW9uKG0pIHtcbiAgICAgIGlmIChpc1ByZXNlbnQobVsyXSkpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gbVsyXS5zcGxpdCgnLCcpLCByID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcCA9IHBhcnRzW2ldO1xuICAgICAgICAgIGlmIChpc0JsYW5rKHApKSBicmVhaztcbiAgICAgICAgICBwID0gcC50cmltKCk7XG4gICAgICAgICAgci5wdXNoKHBhcnRSZXBsYWNlcihfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yLCBwLCBtWzNdKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHIuam9pbignLCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgKyBtWzNdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29sb25Ib3N0Q29udGV4dFBhcnRSZXBsYWNlcihob3N0OiBzdHJpbmcsIHBhcnQ6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChTdHJpbmdXcmFwcGVyLmNvbnRhaW5zKHBhcnQsIF9wb2x5ZmlsbEhvc3QpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29sb25Ib3N0UGFydFJlcGxhY2VyKGhvc3QsIHBhcnQsIHN1ZmZpeCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBob3N0ICsgcGFydCArIHN1ZmZpeCArICcsICcgKyBwYXJ0ICsgJyAnICsgaG9zdCArIHN1ZmZpeDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIoaG9zdDogc3RyaW5nLCBwYXJ0OiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaG9zdCArIFN0cmluZ1dyYXBwZXIucmVwbGFjZShwYXJ0LCBfcG9seWZpbGxIb3N0LCAnJykgKyBzdWZmaXg7XG4gIH1cblxuICAvKlxuICAgKiBDb252ZXJ0IGNvbWJpbmF0b3JzIGxpa2UgOjpzaGFkb3cgYW5kIHBzZXVkby1lbGVtZW50cyBsaWtlIDo6Y29udGVudFxuICAgKiBieSByZXBsYWNpbmcgd2l0aCBzcGFjZS5cbiAgKi9cbiAgcHJpdmF0ZSBfY29udmVydFNoYWRvd0RPTVNlbGVjdG9ycyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3NoYWRvd0RPTVNlbGVjdG9yc1JlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjc3NUZXh0ID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKGNzc1RleHQsIF9zaGFkb3dET01TZWxlY3RvcnNSZVtpXSwgJyAnKTtcbiAgICB9XG4gICAgcmV0dXJuIGNzc1RleHQ7XG4gIH1cblxuICAvLyBjaGFuZ2UgYSBzZWxlY3RvciBsaWtlICdkaXYnIHRvICduYW1lIGRpdidcbiAgcHJpdmF0ZSBfc2NvcGVTZWxlY3RvcnMoY3NzVGV4dDogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcHJvY2Vzc1J1bGVzKGNzc1RleHQsIChydWxlOiBDc3NSdWxlKSA9PiB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSBydWxlLnNlbGVjdG9yO1xuICAgICAgdmFyIGNvbnRlbnQgPSBydWxlLmNvbnRlbnQ7XG4gICAgICBpZiAocnVsZS5zZWxlY3RvclswXSAhPSAnQCcgfHwgcnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAcGFnZScpKSB7XG4gICAgICAgIHNlbGVjdG9yID1cbiAgICAgICAgICAgIHRoaXMuX3Njb3BlU2VsZWN0b3IocnVsZS5zZWxlY3Rvciwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yLCB0aGlzLnN0cmljdFN0eWxpbmcpO1xuICAgICAgfSBlbHNlIGlmIChydWxlLnNlbGVjdG9yLnN0YXJ0c1dpdGgoJ0BtZWRpYScpKSB7XG4gICAgICAgIGNvbnRlbnQgPSB0aGlzLl9zY29wZVNlbGVjdG9ycyhydWxlLmNvbnRlbnQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENzc1J1bGUoc2VsZWN0b3IsIGNvbnRlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2NvcGVTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmljdDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgdmFyIHIgPSBbXSwgcGFydHMgPSBzZWxlY3Rvci5zcGxpdCgnLCcpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwID0gcGFydHNbaV0udHJpbSgpO1xuICAgICAgdmFyIGRlZXBQYXJ0cyA9IFN0cmluZ1dyYXBwZXIuc3BsaXQocCwgX3NoYWRvd0RlZXBTZWxlY3RvcnMpO1xuICAgICAgdmFyIHNoYWxsb3dQYXJ0ID0gZGVlcFBhcnRzWzBdO1xuICAgICAgaWYgKHRoaXMuX3NlbGVjdG9yTmVlZHNTY29waW5nKHNoYWxsb3dQYXJ0LCBzY29wZVNlbGVjdG9yKSkge1xuICAgICAgICBkZWVwUGFydHNbMF0gPSBzdHJpY3QgJiYgIVN0cmluZ1dyYXBwZXIuY29udGFpbnMoc2hhbGxvd1BhcnQsIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShzaGFsbG93UGFydCwgc2NvcGVTZWxlY3RvcikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3RvclNjb3BlKHNoYWxsb3dQYXJ0LCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICAgICAgfVxuICAgICAgLy8gcmVwbGFjZSAvZGVlcC8gd2l0aCBhIHNwYWNlIGZvciBjaGlsZCBzZWxlY3RvcnNcbiAgICAgIHIucHVzaChkZWVwUGFydHMuam9pbignICcpKTtcbiAgICB9XG4gICAgcmV0dXJuIHIuam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NlbGVjdG9yTmVlZHNTY29waW5nKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciByZSA9IHRoaXMuX21ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcik7XG4gICAgcmV0dXJuICFpc1ByZXNlbnQoUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKHJlLCBzZWxlY3RvcikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFrZVNjb3BlTWF0Y2hlcihzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBSZWdFeHAge1xuICAgIHZhciBscmUgPSAvXFxbL2c7XG4gICAgdmFyIHJyZSA9IC9cXF0vZztcbiAgICBzY29wZVNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNjb3BlU2VsZWN0b3IsIGxyZSwgJ1xcXFxbJyk7XG4gICAgc2NvcGVTZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzY29wZVNlbGVjdG9yLCBycmUsICdcXFxcXScpO1xuICAgIHJldHVybiBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnXignICsgc2NvcGVTZWxlY3RvciArICcpJyArIF9zZWxlY3RvclJlU3VmZml4LCAnbScpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTZWxlY3RvclNjb3BlKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIGZyb20gd2ViY29tcG9uZW50c2pzOiBzY29wZVNlbGVjdG9yIGNvdWxkIG5vdCBiZSBhbiBhcnJheVxuICAgIHJldHVybiB0aGlzLl9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUoc2VsZWN0b3IsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gIH1cblxuICAvLyBzY29wZSB2aWEgbmFtZSBhbmQgW2lzPW5hbWVdXG4gIHByaXZhdGUgX2FwcGx5U2ltcGxlU2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKGlzUHJlc2VudChSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goX3BvbHlmaWxsSG9zdFJlLCBzZWxlY3RvcikpKSB7XG4gICAgICB2YXIgcmVwbGFjZUJ5ID0gdGhpcy5zdHJpY3RTdHlsaW5nID8gYFske2hvc3RTZWxlY3Rvcn1dYCA6IHNjb3BlU2VsZWN0b3I7XG4gICAgICBzZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShzZWxlY3RvciwgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciwgcmVwbGFjZUJ5KTtcbiAgICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2VsZWN0b3IsIF9wb2x5ZmlsbEhvc3RSZSwgcmVwbGFjZUJ5ICsgJyAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNjb3BlU2VsZWN0b3IgKyAnICcgKyBzZWxlY3RvcjtcbiAgICB9XG4gIH1cblxuICAvLyByZXR1cm4gYSBzZWxlY3RvciB3aXRoIFtuYW1lXSBzdWZmaXggb24gZWFjaCBzaW1wbGUgc2VsZWN0b3JcbiAgLy8gZS5nLiAuZm9vLmJhciA+IC56b3QgYmVjb21lcyAuZm9vW25hbWVdLmJhcltuYW1lXSA+IC56b3RbbmFtZV0gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYXBwbHlTdHJpY3RTZWxlY3RvclNjb3BlKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIGlzUmUgPSAvXFxbaXM9KFteXFxdXSopXFxdL2c7XG4gICAgc2NvcGVTZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChzY29wZVNlbGVjdG9yLCBpc1JlLCAobSkgPT4gbVsxXSk7XG4gICAgdmFyIHNwbGl0cyA9IFsnICcsICc+JywgJysnLCAnfiddLCBzY29wZWQgPSBzZWxlY3RvciwgYXR0ck5hbWUgPSAnWycgKyBzY29wZVNlbGVjdG9yICsgJ10nO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VwID0gc3BsaXRzW2ldO1xuICAgICAgdmFyIHBhcnRzID0gc2NvcGVkLnNwbGl0KHNlcCk7XG4gICAgICBzY29wZWQgPSBwYXJ0cy5tYXAocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIDpob3N0IHNpbmNlIGl0IHNob3VsZCBiZSB1bm5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgICAgICAgIHZhciB0ID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHAudHJpbSgpLCBfcG9seWZpbGxIb3N0UmUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodC5sZW5ndGggPiAwICYmICFMaXN0V3JhcHBlci5jb250YWlucyhzcGxpdHMsIHQpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICFTdHJpbmdXcmFwcGVyLmNvbnRhaW5zKHQsIGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlID0gLyhbXjpdKikoOiopKC4qKS9nO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2gocmUsIHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwID0gbVsxXSArIGF0dHJOYW1lICsgbVsyXSArIG1bM107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgIC5qb2luKHNlcCk7XG4gICAgfVxuICAgIHJldHVybiBzY29wZWQ7XG4gIH1cblxuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbEhvc3RJbkNzc1RleHQoc2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2VsZWN0b3IsIF9jb2xvbkhvc3RDb250ZXh0UmUsIF9wb2x5ZmlsbEhvc3RDb250ZXh0KTtcbiAgICBzZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzZWxlY3RvciwgX2NvbG9uSG9zdFJlLCBfcG9seWZpbGxIb3N0KTtcbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH1cbn1cbnZhciBfY3NzQ29udGVudE5leHRTZWxlY3RvclJlID1cbiAgICAvcG9seWZpbGwtbmV4dC1zZWxlY3RvcltefV0qY29udGVudDpbXFxzXSo/WydcIl0oLio/KVsnXCJdWztcXHNdKn0oW157XSo/KXsvZ2ltO1xudmFyIF9jc3NDb250ZW50UnVsZVJlID0gLyhwb2x5ZmlsbC1ydWxlKVtefV0qKGNvbnRlbnQ6W1xcc10qWydcIl0oLio/KVsnXCJdKVs7XFxzXSpbXn1dKn0vZ2ltO1xudmFyIF9jc3NDb250ZW50VW5zY29wZWRSdWxlUmUgPVxuICAgIC8ocG9seWZpbGwtdW5zY29wZWQtcnVsZSlbXn1dKihjb250ZW50OltcXHNdKlsnXCJdKC4qPylbJ1wiXSlbO1xcc10qW159XSp9L2dpbTtcbnZhciBfcG9seWZpbGxIb3N0ID0gJy1zaGFkb3djc3Nob3N0Jztcbi8vIG5vdGU6IDpob3N0LWNvbnRleHQgcHJlLXByb2Nlc3NlZCB0byAtc2hhZG93Y3NzaG9zdGNvbnRleHQuXG52YXIgX3BvbHlmaWxsSG9zdENvbnRleHQgPSAnLXNoYWRvd2Nzc2NvbnRleHQnO1xudmFyIF9wYXJlblN1ZmZpeCA9ICcpKD86XFxcXCgoJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwoW14pKF0qXFxcXCl8W14pKF0qKSs/JyArXG4gICAgICAgICAgICAgICAgICAgJylcXFxcKSk/KFteLHtdKiknO1xudmFyIF9jc3NDb2xvbkhvc3RSZSA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCcoJyArIF9wb2x5ZmlsbEhvc3QgKyBfcGFyZW5TdWZmaXgsICdpbScpO1xudmFyIF9jc3NDb2xvbkhvc3RDb250ZXh0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnKCcgKyBfcG9seWZpbGxIb3N0Q29udGV4dCArIF9wYXJlblN1ZmZpeCwgJ2ltJyk7XG52YXIgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciA9IF9wb2x5ZmlsbEhvc3QgKyAnLW5vLWNvbWJpbmF0b3InO1xudmFyIF9zaGFkb3dET01TZWxlY3RvcnNSZSA9IFtcbiAgLzo6c2hhZG93L2csXG4gIC86OmNvbnRlbnQvZyxcbiAgLy8gRGVwcmVjYXRlZCBzZWxlY3RvcnNcbiAgLy8gVE9ETyh2aWNiKTogc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NsYW5nLWZvcm1hdC9pc3N1ZXMvMTZcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICAvXFwvc2hhZG93LWRlZXBcXC8vZywgIC8vIGZvcm1lciAvZGVlcC9cbiAgL1xcL3NoYWRvd1xcLy9nLCAgICAgICAvLyBmb3JtZXIgOjpzaGFkb3dcbiAgLy8gY2xhbmYtZm9ybWF0IG9uXG5dO1xudmFyIF9zaGFkb3dEZWVwU2VsZWN0b3JzID0gLyg/Oj4+Pil8KD86XFwvZGVlcFxcLykvZztcbnZhciBfc2VsZWN0b3JSZVN1ZmZpeCA9ICcoWz5cXFxcc34rXFxbLix7Ol1bXFxcXHNcXFxcU10qKT8kJztcbnZhciBfcG9seWZpbGxIb3N0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZShfcG9seWZpbGxIb3N0LCAnaW0nKTtcbnZhciBfY29sb25Ib3N0UmUgPSAvOmhvc3QvZ2ltO1xudmFyIF9jb2xvbkhvc3RDb250ZXh0UmUgPSAvOmhvc3QtY29udGV4dC9naW07XG5cbnZhciBfY29tbWVudFJlID0gL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZztcblxuZnVuY3Rpb24gc3RyaXBDb21tZW50cyhpbnB1dDpzdHJpbmcpOnN0cmluZyB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoaW5wdXQsIF9jb21tZW50UmUsIChfKSA9PiAnJyk7XG59XG5cbnZhciBfcnVsZVJlID0gLyhcXHMqKShbXjtcXHtcXH1dKz8pKFxccyopKCg/OnslQkxPQ0slfT9cXHMqOz8pfCg/Olxccyo7KSkvZztcbnZhciBfY3VybHlSZSA9IC8oW3t9XSkvZztcbmNvbnN0IE9QRU5fQ1VSTFkgPSAneyc7XG5jb25zdCBDTE9TRV9DVVJMWSA9ICd9JztcbmNvbnN0IEJMT0NLX1BMQUNFSE9MREVSID0gJyVCTE9DSyUnO1xuXG5leHBvcnQgY2xhc3MgQ3NzUnVsZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3RvcjpzdHJpbmcsIHB1YmxpYyBjb250ZW50OnN0cmluZykge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NSdWxlcyhpbnB1dDpzdHJpbmcsIHJ1bGVDYWxsYmFjazpGdW5jdGlvbik6c3RyaW5nIHtcbiAgdmFyIGlucHV0V2l0aEVzY2FwZWRCbG9ja3MgPSBlc2NhcGVCbG9ja3MoaW5wdXQpO1xuICB2YXIgbmV4dEJsb2NrSW5kZXggPSAwO1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuZXNjYXBlZFN0cmluZywgX3J1bGVSZSwgZnVuY3Rpb24obSkge1xuICAgIHZhciBzZWxlY3RvciA9IG1bMl07XG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgc3VmZml4ID0gbVs0XTtcbiAgICB2YXIgY29udGVudFByZWZpeCA9ICcnO1xuICAgIGlmIChpc1ByZXNlbnQobVs0XSkgJiYgbVs0XS5zdGFydHNXaXRoKCd7JytCTE9DS19QTEFDRUhPTERFUikpIHtcbiAgICAgIGNvbnRlbnQgPSBpbnB1dFdpdGhFc2NhcGVkQmxvY2tzLmJsb2Nrc1tuZXh0QmxvY2tJbmRleCsrXTtcbiAgICAgIHN1ZmZpeCA9IG1bNF0uc3Vic3RyaW5nKEJMT0NLX1BMQUNFSE9MREVSLmxlbmd0aCsxKTtcbiAgICAgIGNvbnRlbnRQcmVmaXggPSAneyc7XG4gICAgfVxuICAgIHZhciBydWxlID0gcnVsZUNhbGxiYWNrKG5ldyBDc3NSdWxlKHNlbGVjdG9yLCBjb250ZW50KSk7XG4gICAgcmV0dXJuIGAke21bMV19JHtydWxlLnNlbGVjdG9yfSR7bVszXX0ke2NvbnRlbnRQcmVmaXh9JHtydWxlLmNvbnRlbnR9JHtzdWZmaXh9YDtcbiAgfSk7XG59XG5cbmNsYXNzIFN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVzY2FwZWRTdHJpbmc6c3RyaW5nLCBwdWJsaWMgYmxvY2tzOnN0cmluZ1tdKSB7fVxufVxuXG5mdW5jdGlvbiBlc2NhcGVCbG9ja3MoaW5wdXQ6c3RyaW5nKTpTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyB7XG4gIHZhciBpbnB1dFBhcnRzID0gU3RyaW5nV3JhcHBlci5zcGxpdChpbnB1dCwgX2N1cmx5UmUpO1xuICB2YXIgcmVzdWx0UGFydHMgPSBbXTtcbiAgdmFyIGVzY2FwZWRCbG9ja3MgPSBbXTtcbiAgdmFyIGJyYWNrZXRDb3VudCA9IDA7XG4gIHZhciBjdXJyZW50QmxvY2tQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBwYXJ0SW5kZXggPSAwOyBwYXJ0SW5kZXg8aW5wdXRQYXJ0cy5sZW5ndGg7IHBhcnRJbmRleCsrKSB7XG4gICAgdmFyIHBhcnQgPSBpbnB1dFBhcnRzW3BhcnRJbmRleF07XG4gICAgaWYgKHBhcnQgPT0gQ0xPU0VfQ1VSTFkpIHtcbiAgICAgIGJyYWNrZXRDb3VudC0tO1xuICAgIH1cbiAgICBpZiAoYnJhY2tldENvdW50ID4gMCkge1xuICAgICAgY3VycmVudEJsb2NrUGFydHMucHVzaChwYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJlbnRCbG9ja1BhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZXNjYXBlZEJsb2Nrcy5wdXNoKGN1cnJlbnRCbG9ja1BhcnRzLmpvaW4oJycpKTtcbiAgICAgICAgcmVzdWx0UGFydHMucHVzaChCTE9DS19QTEFDRUhPTERFUik7XG4gICAgICAgIGN1cnJlbnRCbG9ja1BhcnRzID0gW107XG4gICAgICB9XG4gICAgICByZXN1bHRQYXJ0cy5wdXNoKHBhcnQpO1xuICAgIH1cbiAgICBpZiAocGFydCA9PSBPUEVOX0NVUkxZKSB7XG4gICAgICBicmFja2V0Q291bnQrKztcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnRCbG9ja1BhcnRzLmxlbmd0aCA+IDApIHtcbiAgICBlc2NhcGVkQmxvY2tzLnB1c2goY3VycmVudEJsb2NrUGFydHMuam9pbignJykpO1xuICAgIHJlc3VsdFBhcnRzLnB1c2goQkxPQ0tfUExBQ0VIT0xERVIpO1xuICB9XG4gIHJldHVybiBuZXcgU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3MocmVzdWx0UGFydHMuam9pbignJyksIGVzY2FwZWRCbG9ja3MpO1xufVxuIl19