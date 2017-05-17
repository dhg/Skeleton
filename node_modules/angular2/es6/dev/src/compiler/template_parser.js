var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import { RegExpWrapper, isPresent, StringWrapper, isBlank } from 'angular2/src/facade/lang';
import { Injectable, Inject, OpaqueToken, Optional } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Parser } from 'angular2/src/core/change_detection/change_detection';
import { HtmlParser } from './html_parser';
import { splitNsName, mergeNsAndName } from './html_tags';
import { ParseError } from './parse_util';
import { RecursiveAstVisitor } from 'angular2/src/core/change_detection/parser/ast';
import { ElementAst, BoundElementPropertyAst, BoundEventAst, VariableAst, templateVisitAll, TextAst, BoundTextAst, EmbeddedTemplateAst, AttrAst, NgContentAst, PropertyBindingType, DirectiveAst, BoundDirectivePropertyAst } from './template_ast';
import { CssSelector, SelectorMatcher } from 'angular2/src/compiler/selector';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
import { preparseElement, PreparsedElementType } from './template_preparser';
import { isStyleUrlResolvable } from './style_url_resolver';
import { htmlVisitAll } from './html_ast';
import { splitAtColon } from './util';
// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = "bindon-"
// Group 5 = the identifier after "bind-", "var-/#", or "on-"
// Group 6 = identifier inside [()]
// Group 7 = identifier inside []
// Group 8 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export const TEMPLATE_TRANSFORMS = CONST_EXPR(new OpaqueToken('TemplateTransforms'));
export class TemplateParseError extends ParseError {
    constructor(message, span) {
        super(span, message);
    }
}
export let TemplateParser = class {
    constructor(_exprParser, _schemaRegistry, _htmlParser, transforms) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
        this.transforms = transforms;
    }
    parse(template, directives, pipes, templateUrl) {
        var parseVisitor = new TemplateParseVisitor(directives, pipes, this._exprParser, this._schemaRegistry);
        var htmlAstWithErrors = this._htmlParser.parse(template, templateUrl);
        var result = htmlVisitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_COMPONENT);
        var errors = htmlAstWithErrors.errors.concat(parseVisitor.errors);
        if (errors.length > 0) {
            var errorString = errors.join('\n');
            throw new BaseException(`Template parse errors:\n${errorString}`);
        }
        if (isPresent(this.transforms)) {
            this.transforms.forEach((transform) => { result = templateVisitAll(transform, result); });
        }
        return result;
    }
};
TemplateParser = __decorate([
    Injectable(),
    __param(3, Optional()),
    __param(3, Inject(TEMPLATE_TRANSFORMS)), 
    __metadata('design:paramtypes', [Parser, ElementSchemaRegistry, HtmlParser, Array])
], TemplateParser);
class TemplateParseVisitor {
    constructor(directives, pipes, _exprParser, _schemaRegistry) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this.errors = [];
        this.directivesIndex = new Map();
        this.ngContentCount = 0;
        this.selectorMatcher = new SelectorMatcher();
        ListWrapper.forEachWithIndex(directives, (directive, index) => {
            var selector = CssSelector.parse(directive.selector);
            this.selectorMatcher.addSelectables(selector, directive);
            this.directivesIndex.set(directive, index);
        });
        this.pipesByName = new Map();
        pipes.forEach(pipe => this.pipesByName.set(pipe.name, pipe));
    }
    _reportError(message, sourceSpan) {
        this.errors.push(new TemplateParseError(message, sourceSpan));
    }
    _parseInterpolation(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseInterpolation(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseAction(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseAction(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseBinding(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseBinding(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseTemplateBindings(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var bindings = this._exprParser.parseTemplateBindings(value, sourceInfo);
            bindings.forEach((binding) => {
                if (isPresent(binding.expression)) {
                    this._checkPipes(binding.expression, sourceSpan);
                }
            });
            return bindings;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return [];
        }
    }
    _checkPipes(ast, sourceSpan) {
        if (isPresent(ast)) {
            var collector = new PipeCollector();
            ast.visit(collector);
            collector.pipes.forEach((pipeName) => {
                if (!this.pipesByName.has(pipeName)) {
                    this._reportError(`The pipe '${pipeName}' could not be found`, sourceSpan);
                }
            });
        }
    }
    visitText(ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        var expr = this._parseInterpolation(ast.value, ast.sourceSpan);
        if (isPresent(expr)) {
            return new BoundTextAst(expr, ngContentIndex, ast.sourceSpan);
        }
        else {
            return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
        }
    }
    visitAttr(ast, contex) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitElement(element, component) {
        var nodeName = element.name;
        var preparsedElement = preparseElement(element);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE) {
            // Skipping <script> for security reasons
            // Skipping <style> as we already processed them
            // in the StyleCompiler
            return null;
        }
        if (preparsedElement.type === PreparsedElementType.STYLESHEET &&
            isStyleUrlResolvable(preparsedElement.hrefAttr)) {
            // Skipping stylesheets with either relative urls or package scheme as we already processed
            // them in the StyleCompiler
            return null;
        }
        var matchableAttrs = [];
        var elementOrDirectiveProps = [];
        var vars = [];
        var events = [];
        var templateElementOrDirectiveProps = [];
        var templateVars = [];
        var templateMatchableAttrs = [];
        var hasInlineTemplates = false;
        var attrs = [];
        element.attrs.forEach(attr => {
            var hasBinding = this._parseAttr(attr, matchableAttrs, elementOrDirectiveProps, events, vars);
            var hasTemplateBinding = this._parseInlineTemplateBinding(attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateVars);
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(this.visitAttr(attr, null));
                matchableAttrs.push([attr.name, attr.value]);
            }
            if (hasTemplateBinding) {
                hasInlineTemplates = true;
            }
        });
        var lcElName = splitNsName(nodeName.toLowerCase())[1];
        var isTemplateElement = lcElName == TEMPLATE_ELEMENT;
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, elementCssSelector), elementOrDirectiveProps, isTemplateElement ? [] : vars, element.sourceSpan);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directives);
        var children = htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, Component.create(directives));
        // Override the actual selector when the `ngProjectAs` attribute is provided
        var projectionSelector = isPresent(preparsedElement.projectAs) ?
            CssSelector.parse(preparsedElement.projectAs)[0] :
            elementCssSelector;
        var ngContentIndex = component.findNgContentIndex(projectionSelector);
        var parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            if (isPresent(element.children) && element.children.length > 0) {
                this._reportError(`<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>`, element.sourceSpan);
            }
            parsedElement = new NgContentAst(this.ngContentCount++, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directives, events);
            this._assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, element.sourceSpan);
            parsedElement =
                new EmbeddedTemplateAst(attrs, events, vars, directives, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else {
            this._assertOnlyOneComponent(directives, element.sourceSpan);
            var elementExportAsVars = vars.filter(varAst => varAst.value.length === 0);
            let ngContentIndex = hasInlineTemplates ? null : component.findNgContentIndex(projectionSelector);
            parsedElement =
                new ElementAst(nodeName, attrs, elementProps, events, elementExportAsVars, directives, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, templateCssSelector), templateElementOrDirectiveProps, [], element.sourceSpan);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectives);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectives, templateElementProps, element.sourceSpan);
            parsedElement = new EmbeddedTemplateAst([], [], templateVars, templateDirectives, [parsedElement], ngContentIndex, element.sourceSpan);
        }
        return parsedElement;
    }
    _parseInlineTemplateBinding(attr, targetMatchableAttrs, targetProps, targetVars) {
        var templateBindingsSource = null;
        if (attr.name == TEMPLATE_ATTR) {
            templateBindingsSource = attr.value;
        }
        else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            var key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length); // remove the star
            templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
        }
        if (isPresent(templateBindingsSource)) {
            var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceSpan);
            for (var i = 0; i < bindings.length; i++) {
                var binding = bindings[i];
                if (binding.keyIsVar) {
                    targetVars.push(new VariableAst(binding.key, binding.name, attr.sourceSpan));
                    targetMatchableAttrs.push([binding.key, binding.name]);
                }
                else if (isPresent(binding.expression)) {
                    this._parsePropertyAst(binding.key, binding.expression, attr.sourceSpan, targetMatchableAttrs, targetProps);
                }
                else {
                    targetMatchableAttrs.push([binding.key, '']);
                    this._parseLiteralAttr(binding.key, null, attr.sourceSpan, targetProps);
                }
            }
            return true;
        }
        return false;
    }
    _parseAttr(attr, targetMatchableAttrs, targetProps, targetEvents, targetVars) {
        var attrName = this._normalizeAttributeName(attr.name);
        var attrValue = attr.value;
        var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
        var hasBinding = false;
        if (isPresent(bindParts)) {
            hasBinding = true;
            if (isPresent(bindParts[1])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[2])) {
                var identifier = bindParts[5];
                this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
            }
            else if (isPresent(bindParts[3])) {
                this._parseEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[4])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[6])) {
                this._parseProperty(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[7])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[8])) {
                this._parseEvent(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
        }
        else {
            hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
        }
        if (!hasBinding) {
            this._parseLiteralAttr(attrName, attrValue, attr.sourceSpan, targetProps);
        }
        return hasBinding;
    }
    _normalizeAttributeName(attrName) {
        return attrName.toLowerCase().startsWith('data-') ? attrName.substring(5) : attrName;
    }
    _parseVariable(identifier, value, sourceSpan, targetVars) {
        if (identifier.indexOf('-') > -1) {
            this._reportError(`"-" is not allowed in variable names`, sourceSpan);
        }
        targetVars.push(new VariableAst(identifier, value, sourceSpan));
    }
    _parseProperty(name, expression, sourceSpan, targetMatchableAttrs, targetProps) {
        this._parsePropertyAst(name, this._parseBinding(expression, sourceSpan), sourceSpan, targetMatchableAttrs, targetProps);
    }
    _parsePropertyInterpolation(name, value, sourceSpan, targetMatchableAttrs, targetProps) {
        var expr = this._parseInterpolation(value, sourceSpan);
        if (isPresent(expr)) {
            this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    }
    _parsePropertyAst(name, ast, sourceSpan, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceSpan));
    }
    _parseAssignmentEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        this._parseEvent(`${name}Change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, targetEvents);
    }
    _parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        var ast = this._parseAction(expression, sourceSpan);
        targetMatchableAttrs.push([name, ast.source]);
        targetEvents.push(new BoundEventAst(eventName, target, ast, sourceSpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseLiteralAttr(name, value, sourceSpan, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(name, this._exprParser.wrapLiteralPrimitive(value, ''), true, sourceSpan));
    }
    _parseDirectives(selectorMatcher, elementCssSelector) {
        var directives = [];
        selectorMatcher.match(elementCssSelector, (selector, directive) => { directives.push(directive); });
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also need to make components the first directive in the array
        ListWrapper.sort(directives, (dir1, dir2) => {
            var dir1Comp = dir1.isComponent;
            var dir2Comp = dir2.isComponent;
            if (dir1Comp && !dir2Comp) {
                return -1;
            }
            else if (!dir1Comp && dir2Comp) {
                return 1;
            }
            else {
                return this.directivesIndex.get(dir1) - this.directivesIndex.get(dir2);
            }
        });
        return directives;
    }
    _createDirectiveAsts(elementName, directives, props, possibleExportAsVars, sourceSpan) {
        var matchedVariables = new Set();
        var directiveAsts = directives.map((directive) => {
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceSpan, hostProperties);
            this._createDirectiveHostEventAsts(directive.hostListeners, sourceSpan, hostEvents);
            this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            var exportAsVars = [];
            possibleExportAsVars.forEach((varAst) => {
                if ((varAst.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == varAst.value)) {
                    exportAsVars.push(varAst);
                    matchedVariables.add(varAst.name);
                }
            });
            return new DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, exportAsVars, sourceSpan);
        });
        possibleExportAsVars.forEach((varAst) => {
            if (varAst.value.length > 0 && !SetWrapper.has(matchedVariables, varAst.name)) {
                this._reportError(`There is no directive with "exportAs" set to "${varAst.value}"`, varAst.sourceSpan);
            }
        });
        return directiveAsts;
    }
    _createDirectiveHostPropertyAsts(elementName, hostProps, sourceSpan, targetPropertyAsts) {
        if (isPresent(hostProps)) {
            StringMapWrapper.forEach(hostProps, (expression, propName) => {
                var exprAst = this._parseBinding(expression, sourceSpan);
                targetPropertyAsts.push(this._createElementPropertyAst(elementName, propName, exprAst, sourceSpan));
            });
        }
    }
    _createDirectiveHostEventAsts(hostListeners, sourceSpan, targetEventAsts) {
        if (isPresent(hostListeners)) {
            StringMapWrapper.forEach(hostListeners, (expression, propName) => {
                this._parseEvent(propName, expression, sourceSpan, [], targetEventAsts);
            });
        }
    }
    _createDirectivePropertyAsts(directiveProperties, boundProps, targetBoundDirectiveProps) {
        if (isPresent(directiveProperties)) {
            var boundPropsByName = new Map();
            boundProps.forEach(boundProp => {
                var prevValue = boundPropsByName.get(boundProp.name);
                if (isBlank(prevValue) || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence than a="b" on the same element
                    boundPropsByName.set(boundProp.name, boundProp);
                }
            });
            StringMapWrapper.forEach(directiveProperties, (elProp, dirProp) => {
                var boundProp = boundPropsByName.get(elProp);
                // Bindings are optional, so this binding only needs to be set up if an expression is given.
                if (isPresent(boundProp)) {
                    targetBoundDirectiveProps.push(new BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
                }
            });
        }
    }
    _createElementPropertyAsts(elementName, props, directives) {
        var boundElementProps = [];
        var boundDirectivePropsIndex = new Map();
        directives.forEach((directive) => {
            directive.inputs.forEach((prop) => {
                boundDirectivePropsIndex.set(prop.templateName, prop);
            });
        });
        props.forEach((prop) => {
            if (!prop.isLiteral && isBlank(boundDirectivePropsIndex.get(prop.name))) {
                boundElementProps.push(this._createElementPropertyAst(elementName, prop.name, prop.expression, prop.sourceSpan));
            }
        });
        return boundElementProps;
    }
    _createElementPropertyAst(elementName, name, ast, sourceSpan) {
        var unit = null;
        var bindingType;
        var boundPropertyName;
        var parts = name.split(PROPERTY_PARTS_SEPARATOR);
        if (parts.length === 1) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(parts[0]);
            bindingType = PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError(`Can't bind to '${boundPropertyName}' since it isn't a known native property`, sourceSpan);
            }
        }
        else {
            if (parts[0] == ATTRIBUTE_PREFIX) {
                boundPropertyName = parts[1];
                let nsSeparatorIdx = boundPropertyName.indexOf(':');
                if (nsSeparatorIdx > -1) {
                    let ns = boundPropertyName.substring(0, nsSeparatorIdx);
                    let name = boundPropertyName.substring(nsSeparatorIdx + 1);
                    boundPropertyName = mergeNsAndName(ns, name);
                }
                bindingType = PropertyBindingType.Attribute;
            }
            else if (parts[0] == CLASS_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Class;
            }
            else if (parts[0] == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Style;
            }
            else {
                this._reportError(`Invalid property name '${name}'`, sourceSpan);
                bindingType = null;
            }
        }
        return new BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceSpan);
    }
    _findComponentDirectiveNames(directives) {
        var componentTypeNames = [];
        directives.forEach(directive => {
            var typeName = directive.directive.type.name;
            if (directive.directive.isComponent) {
                componentTypeNames.push(typeName);
            }
        });
        return componentTypeNames;
    }
    _assertOnlyOneComponent(directives, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError(`More than one component: ${componentTypeNames.join(',')}`, sourceSpan);
        }
    }
    _assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError(`Components on an embedded template: ${componentTypeNames.join(',')}`, sourceSpan);
        }
        elementProps.forEach(prop => {
            this._reportError(`Property binding ${prop.name} not used by any directive on an embedded template`, sourceSpan);
        });
    }
    _assertAllEventsPublishedByDirectives(directives, events) {
        var allDirectiveEvents = new Set();
        directives.forEach(directive => {
            StringMapWrapper.forEach(directive.directive.outputs, (eventName, _) => { allDirectiveEvents.add(eventName); });
        });
        events.forEach(event => {
            if (isPresent(event.target) || !SetWrapper.has(allDirectiveEvents, event.name)) {
                this._reportError(`Event binding ${event.fullName} not emitted by any directive on an embedded template`, event.sourceSpan);
            }
        });
    }
}
class NonBindableVisitor {
    visitElement(ast, component) {
        var preparsedElement = preparseElement(ast);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE ||
            preparsedElement.type === PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        var attrNameAndValues = ast.attrs.map(attrAst => [attrAst.name, attrAst.value]);
        var selector = createElementCssSelector(ast.name, attrNameAndValues);
        var ngContentIndex = component.findNgContentIndex(selector);
        var children = htmlVisitAll(this, ast.children, EMPTY_COMPONENT);
        return new ElementAst(ast.name, htmlVisitAll(this, ast.attrs), [], [], [], [], children, ngContentIndex, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitAttr(ast, context) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitText(ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
    }
}
class BoundElementOrDirectiveProperty {
    constructor(name, expression, isLiteral, sourceSpan) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceSpan = sourceSpan;
    }
}
export function splitClasses(classAttrValue) {
    return StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
class Component {
    constructor(ngContentIndexMatcher, wildcardNgContentIndex) {
        this.ngContentIndexMatcher = ngContentIndexMatcher;
        this.wildcardNgContentIndex = wildcardNgContentIndex;
    }
    static create(directives) {
        if (directives.length === 0 || !directives[0].directive.isComponent) {
            return EMPTY_COMPONENT;
        }
        var matcher = new SelectorMatcher();
        var ngContentSelectors = directives[0].directive.template.ngContentSelectors;
        var wildcardNgContentIndex = null;
        for (var i = 0; i < ngContentSelectors.length; i++) {
            var selector = ngContentSelectors[i];
            if (StringWrapper.equals(selector, '*')) {
                wildcardNgContentIndex = i;
            }
            else {
                matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
            }
        }
        return new Component(matcher, wildcardNgContentIndex);
    }
    findNgContentIndex(selector) {
        var ngContentIndices = [];
        this.ngContentIndexMatcher.match(selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
        ListWrapper.sort(ngContentIndices);
        if (isPresent(this.wildcardNgContentIndex)) {
            ngContentIndices.push(this.wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    }
}
function createElementCssSelector(elementName, matchableAttrs) {
    var cssSelector = new CssSelector();
    let elNameNoNs = splitNsName(elementName)[1];
    cssSelector.setElement(elNameNoNs);
    for (var i = 0; i < matchableAttrs.length; i++) {
        let attrName = matchableAttrs[i][0];
        let attrNameNoNs = splitNsName(attrName)[1];
        let attrValue = matchableAttrs[i][1];
        cssSelector.addAttribute(attrNameNoNs, attrValue);
        if (attrName.toLowerCase() == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(className => cssSelector.addClassName(className));
        }
    }
    return cssSelector;
}
var EMPTY_COMPONENT = new Component(new SelectorMatcher(), null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
export class PipeCollector extends RecursiveAstVisitor {
    constructor(...args) {
        super(...args);
        this.pipes = new Set();
    }
    visitPipe(ast) {
        this.pipes.add(ast.name);
        ast.exp.visit(this);
        this.visitAll(ast.args);
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX3BhcnNlci50cyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVBhcnNlRXJyb3IiLCJUZW1wbGF0ZVBhcnNlRXJyb3IuY29uc3RydWN0b3IiLCJUZW1wbGF0ZVBhcnNlciIsIlRlbXBsYXRlUGFyc2VyLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVQYXJzZXIucGFyc2UiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvciIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3JlcG9ydEVycm9yIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlSW50ZXJwb2xhdGlvbiIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUFjdGlvbiIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUJpbmRpbmciLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2NoZWNrUGlwZXMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci52aXNpdFRleHQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci52aXNpdEF0dHIiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci52aXNpdENvbW1lbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci52aXNpdEVsZW1lbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmciLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VBdHRyIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VWYXJpYWJsZSIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZVByb3BlcnR5IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlUHJvcGVydHlBc3QiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VBc3NpZ25tZW50RXZlbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VFdmVudCIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUxpdGVyYWxBdHRyIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlRGlyZWN0aXZlcyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9jcmVhdGVEaXJlY3RpdmVBc3RzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2NyZWF0ZURpcmVjdGl2ZUhvc3RQcm9wZXJ0eUFzdHMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3QiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2Fzc2VydE9ubHlPbmVDb21wb25lbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZSIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9hc3NlcnRBbGxFdmVudHNQdWJsaXNoZWRCeURpcmVjdGl2ZXMiLCJOb25CaW5kYWJsZVZpc2l0b3IiLCJOb25CaW5kYWJsZVZpc2l0b3IudmlzaXRFbGVtZW50IiwiTm9uQmluZGFibGVWaXNpdG9yLnZpc2l0Q29tbWVudCIsIk5vbkJpbmRhYmxlVmlzaXRvci52aXNpdEF0dHIiLCJOb25CaW5kYWJsZVZpc2l0b3IudmlzaXRUZXh0IiwiQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eSIsIkJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkuY29uc3RydWN0b3IiLCJzcGxpdENsYXNzZXMiLCJDb21wb25lbnQiLCJDb21wb25lbnQuY29uc3RydWN0b3IiLCJDb21wb25lbnQuY3JlYXRlIiwiQ29tcG9uZW50LmZpbmROZ0NvbnRlbnRJbmRleCIsImNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvciIsIlBpcGVDb2xsZWN0b3IiLCJQaXBlQ29sbGVjdG9yLmNvbnN0cnVjdG9yIiwiUGlwZUNvbGxlY3Rvci52aXNpdFBpcGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBQyxNQUFNLGdDQUFnQztPQUNqRixFQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUNsRixFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWU7T0FDaEUsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxNQUFNLEVBQXFCLE1BQU0scURBQXFEO09BR3ZGLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZTtPQUNqQyxFQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUMsTUFBTSxhQUFhO09BQ2hELEVBQWtCLFVBQVUsRUFBZ0IsTUFBTSxjQUFjO09BQ2hFLEVBQUMsbUJBQW1CLEVBQWMsTUFBTSwrQ0FBK0M7T0FFdkYsRUFDTCxVQUFVLEVBQ1YsdUJBQXVCLEVBQ3ZCLGFBQWEsRUFDYixXQUFXLEVBR1gsZ0JBQWdCLEVBQ2hCLE9BQU8sRUFDUCxZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLE9BQU8sRUFDUCxZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLFlBQVksRUFDWix5QkFBeUIsRUFDMUIsTUFB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WUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDbERBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pDQSxJQUFJQSxPQUFPQSxHQUFHQSxZQUFZQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUN0Q0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsSUFBSUEsV0FBV0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcEVBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0FBQ3JCQSxDQUFDQTtBQUVELElBQUksZUFBZSxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksZUFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakUsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFHcEQsbUNBQW1DLG1CQUFtQjtJQUF0REM7UUFBbUNDLGVBQW1CQTtRQUNwREEsVUFBS0EsR0FBZ0JBLElBQUlBLEdBQUdBLEVBQVVBLENBQUNBO0lBT3pDQSxDQUFDQTtJQU5DRCxTQUFTQSxDQUFDQSxHQUFnQkE7UUFDeEJFLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3pCQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0FBQ0hGLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyLCBTZXRXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtSZWdFeHBXcmFwcGVyLCBpc1ByZXNlbnQsIFN0cmluZ1dyYXBwZXIsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW4sIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UGFyc2VyLCBBU1QsIEFTVFdpdGhTb3VyY2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1RlbXBsYXRlQmluZGluZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvYXN0JztcbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlUGlwZU1ldGFkYXRhfSBmcm9tICcuL2RpcmVjdGl2ZV9tZXRhZGF0YSc7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4vaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtzcGxpdE5zTmFtZSwgbWVyZ2VOc0FuZE5hbWV9IGZyb20gJy4vaHRtbF90YWdzJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFuLCBQYXJzZUVycm9yLCBQYXJzZUxvY2F0aW9ufSBmcm9tICcuL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtSZWN1cnNpdmVBc3RWaXNpdG9yLCBCaW5kaW5nUGlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvYXN0JztcblxuaW1wb3J0IHtcbiAgRWxlbWVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEJvdW5kRXZlbnRBc3QsXG4gIFZhcmlhYmxlQXN0LFxuICBUZW1wbGF0ZUFzdCxcbiAgVGVtcGxhdGVBc3RWaXNpdG9yLFxuICB0ZW1wbGF0ZVZpc2l0QWxsLFxuICBUZXh0QXN0LFxuICBCb3VuZFRleHRBc3QsXG4gIEVtYmVkZGVkVGVtcGxhdGVBc3QsXG4gIEF0dHJBc3QsXG4gIE5nQ29udGVudEFzdCxcbiAgUHJvcGVydHlCaW5kaW5nVHlwZSxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0XG59IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7Q3NzU2VsZWN0b3IsIFNlbGVjdG9yTWF0Y2hlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcblxuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9zY2hlbWEvZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuaW1wb3J0IHtwcmVwYXJzZUVsZW1lbnQsIFByZXBhcnNlZEVsZW1lbnQsIFByZXBhcnNlZEVsZW1lbnRUeXBlfSBmcm9tICcuL3RlbXBsYXRlX3ByZXBhcnNlcic7XG5cbmltcG9ydCB7aXNTdHlsZVVybFJlc29sdmFibGV9IGZyb20gJy4vc3R5bGVfdXJsX3Jlc29sdmVyJztcblxuaW1wb3J0IHtcbiAgSHRtbEFzdFZpc2l0b3IsXG4gIEh0bWxBc3QsXG4gIEh0bWxFbGVtZW50QXN0LFxuICBIdG1sQXR0ckFzdCxcbiAgSHRtbFRleHRBc3QsXG4gIEh0bWxDb21tZW50QXN0LFxuICBodG1sVmlzaXRBbGxcbn0gZnJvbSAnLi9odG1sX2FzdCc7XG5cbmltcG9ydCB7c3BsaXRBdENvbG9ufSBmcm9tICcuL3V0aWwnO1xuXG4vLyBHcm91cCAxID0gXCJiaW5kLVwiXG4vLyBHcm91cCAyID0gXCJ2YXItXCIgb3IgXCIjXCJcbi8vIEdyb3VwIDMgPSBcIm9uLVwiXG4vLyBHcm91cCA0ID0gXCJiaW5kb24tXCJcbi8vIEdyb3VwIDUgPSB0aGUgaWRlbnRpZmllciBhZnRlciBcImJpbmQtXCIsIFwidmFyLS8jXCIsIG9yIFwib24tXCJcbi8vIEdyb3VwIDYgPSBpZGVudGlmaWVyIGluc2lkZSBbKCldXG4vLyBHcm91cCA3ID0gaWRlbnRpZmllciBpbnNpZGUgW11cbi8vIEdyb3VwIDggPSBpZGVudGlmaWVyIGluc2lkZSAoKVxudmFyIEJJTkRfTkFNRV9SRUdFWFAgPVxuICAgIC9eKD86KD86KD86KGJpbmQtKXwodmFyLXwjKXwob24tKXwoYmluZG9uLSkpKC4rKSl8XFxbXFwoKFteXFwpXSspXFwpXFxdfFxcWyhbXlxcXV0rKVxcXXxcXCgoW15cXCldKylcXCkpJC9nO1xuXG5jb25zdCBURU1QTEFURV9FTEVNRU5UID0gJ3RlbXBsYXRlJztcbmNvbnN0IFRFTVBMQVRFX0FUVFIgPSAndGVtcGxhdGUnO1xuY29uc3QgVEVNUExBVEVfQVRUUl9QUkVGSVggPSAnKic7XG5jb25zdCBDTEFTU19BVFRSID0gJ2NsYXNzJztcblxudmFyIFBST1BFUlRZX1BBUlRTX1NFUEFSQVRPUiA9ICcuJztcbmNvbnN0IEFUVFJJQlVURV9QUkVGSVggPSAnYXR0cic7XG5jb25zdCBDTEFTU19QUkVGSVggPSAnY2xhc3MnO1xuY29uc3QgU1RZTEVfUFJFRklYID0gJ3N0eWxlJztcblxudmFyIFRFWFRfQ1NTX1NFTEVDVE9SID0gQ3NzU2VsZWN0b3IucGFyc2UoJyonKVswXTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBhcnJheSBvZiB7QGxpbmsgVGVtcGxhdGVBc3RWaXNpdG9yfXMgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHRyYW5zZm9ybVxuICogcGFyc2VkIHRlbXBsYXRlcyBiZWZvcmUgY29tcGlsYXRpb24gaXMgaW52b2tlZCwgYWxsb3dpbmcgY3VzdG9tIGV4cHJlc3Npb24gc3ludGF4XG4gKiBhbmQgb3RoZXIgYWR2YW5jZWQgdHJhbnNmb3JtYXRpb25zLlxuICpcbiAqIFRoaXMgaXMgY3VycmVudGx5IGFuIGludGVybmFsLW9ubHkgZmVhdHVyZSBhbmQgbm90IG1lYW50IGZvciBnZW5lcmFsIHVzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFTVBMQVRFX1RSQU5TRk9STVMgPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignVGVtcGxhdGVUcmFuc2Zvcm1zJykpO1xuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJzZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7IHN1cGVyKHNwYW4sIG1lc3NhZ2UpOyB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2V4cHJQYXJzZXI6IFBhcnNlciwgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChURU1QTEFURV9UUkFOU0ZPUk1TKSBwdWJsaWMgdHJhbnNmb3JtczogVGVtcGxhdGVBc3RWaXNpdG9yW10pIHt9XG5cbiAgcGFyc2UodGVtcGxhdGU6IHN0cmluZywgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10sXG4gICAgICAgIHRlbXBsYXRlVXJsOiBzdHJpbmcpOiBUZW1wbGF0ZUFzdFtdIHtcbiAgICB2YXIgcGFyc2VWaXNpdG9yID1cbiAgICAgICAgbmV3IFRlbXBsYXRlUGFyc2VWaXNpdG9yKGRpcmVjdGl2ZXMsIHBpcGVzLCB0aGlzLl9leHByUGFyc2VyLCB0aGlzLl9zY2hlbWFSZWdpc3RyeSk7XG4gICAgdmFyIGh0bWxBc3RXaXRoRXJyb3JzID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwpO1xuICAgIHZhciByZXN1bHQgPSBodG1sVmlzaXRBbGwocGFyc2VWaXNpdG9yLCBodG1sQXN0V2l0aEVycm9ycy5yb290Tm9kZXMsIEVNUFRZX0NPTVBPTkVOVCk7XG4gICAgdmFyIGVycm9yczogUGFyc2VFcnJvcltdID0gaHRtbEFzdFdpdGhFcnJvcnMuZXJyb3JzLmNvbmNhdChwYXJzZVZpc2l0b3IuZXJyb3JzKTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBlcnJvclN0cmluZyA9IGVycm9ycy5qb2luKCdcXG4nKTtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBUZW1wbGF0ZSBwYXJzZSBlcnJvcnM6XFxuJHtlcnJvclN0cmluZ31gKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnRyYW5zZm9ybXMpKSB7XG4gICAgICB0aGlzLnRyYW5zZm9ybXMuZm9yRWFjaChcbiAgICAgICAgICAodHJhbnNmb3JtOiBUZW1wbGF0ZUFzdFZpc2l0b3IpID0+IHsgcmVzdWx0ID0gdGVtcGxhdGVWaXNpdEFsbCh0cmFuc2Zvcm0sIHJlc3VsdCk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlUGFyc2VWaXNpdG9yIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICBzZWxlY3Rvck1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcjtcbiAgZXJyb3JzOiBUZW1wbGF0ZVBhcnNlRXJyb3JbXSA9IFtdO1xuICBkaXJlY3RpdmVzSW5kZXggPSBuZXcgTWFwPENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgbnVtYmVyPigpO1xuICBuZ0NvbnRlbnRDb3VudDogbnVtYmVyID0gMDtcbiAgcGlwZXNCeU5hbWU6IE1hcDxzdHJpbmcsIENvbXBpbGVQaXBlTWV0YWRhdGE+O1xuXG4gIGNvbnN0cnVjdG9yKGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdLFxuICAgICAgICAgICAgICBwcml2YXRlIF9leHByUGFyc2VyOiBQYXJzZXIsIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnkpIHtcbiAgICB0aGlzLnNlbGVjdG9yTWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvck1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoc2VsZWN0b3IsIGRpcmVjdGl2ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlc0luZGV4LnNldChkaXJlY3RpdmUsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIHRoaXMucGlwZXNCeU5hbWUgPSBuZXcgTWFwPHN0cmluZywgQ29tcGlsZVBpcGVNZXRhZGF0YT4oKTtcbiAgICBwaXBlcy5mb3JFYWNoKHBpcGUgPT4gdGhpcy5waXBlc0J5TmFtZS5zZXQocGlwZS5uYW1lLCBwaXBlKSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXBvcnRFcnJvcihtZXNzYWdlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFRlbXBsYXRlUGFyc2VFcnJvcihtZXNzYWdlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUludGVycG9sYXRpb24odmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBhc3QgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZSwgc291cmNlSW5mbyk7XG4gICAgICB0aGlzLl9jaGVja1BpcGVzKGFzdCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gYXN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFjdGlvbih2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VBY3Rpb24odmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgdGhpcy5fY2hlY2tQaXBlcyhhc3QsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VCaW5kaW5nKHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHZhciBzb3VyY2VJbmZvID0gc291cmNlU3Bhbi5zdGFydC50b1N0cmluZygpO1xuICAgIHRyeSB7XG4gICAgICB2YXIgYXN0ID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZUJpbmRpbmcodmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgdGhpcy5fY2hlY2tQaXBlcyhhc3QsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IFRlbXBsYXRlQmluZGluZ1tdIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGJpbmRpbmdzID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZVRlbXBsYXRlQmluZGluZ3ModmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgYmluZGluZ3MuZm9yRWFjaCgoYmluZGluZykgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGJpbmRpbmcuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICB0aGlzLl9jaGVja1BpcGVzKGJpbmRpbmcuZXhwcmVzc2lvbiwgc291cmNlU3Bhbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGJpbmRpbmdzO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tQaXBlcyhhc3Q6IEFTVFdpdGhTb3VyY2UsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIGlmIChpc1ByZXNlbnQoYXN0KSkge1xuICAgICAgdmFyIGNvbGxlY3RvciA9IG5ldyBQaXBlQ29sbGVjdG9yKCk7XG4gICAgICBhc3QudmlzaXQoY29sbGVjdG9yKTtcbiAgICAgIGNvbGxlY3Rvci5waXBlcy5mb3JFYWNoKChwaXBlTmFtZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucGlwZXNCeU5hbWUuaGFzKHBpcGVOYW1lKSkge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBUaGUgcGlwZSAnJHtwaXBlTmFtZX0nIGNvdWxkIG5vdCBiZSBmb3VuZGAsIHNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB2aXNpdFRleHQoYXN0OiBIdG1sVGV4dEFzdCwgY29tcG9uZW50OiBDb21wb25lbnQpOiBhbnkge1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IGNvbXBvbmVudC5maW5kTmdDb250ZW50SW5kZXgoVEVYVF9DU1NfU0VMRUNUT1IpO1xuICAgIHZhciBleHByID0gdGhpcy5fcGFyc2VJbnRlcnBvbGF0aW9uKGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIGlmIChpc1ByZXNlbnQoZXhwcikpIHtcbiAgICAgIHJldHVybiBuZXcgQm91bmRUZXh0QXN0KGV4cHIsIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgVGV4dEFzdChhc3QudmFsdWUsIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IEF0dHJBc3QoYXN0Lm5hbWUsIGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGFzdDogSHRtbENvbW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEh0bWxFbGVtZW50QXN0LCBjb21wb25lbnQ6IENvbXBvbmVudCk6IGFueSB7XG4gICAgdmFyIG5vZGVOYW1lID0gZWxlbWVudC5uYW1lO1xuICAgIHZhciBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFKSB7XG4gICAgICAvLyBTa2lwcGluZyA8c2NyaXB0PiBmb3Igc2VjdXJpdHkgcmVhc29uc1xuICAgICAgLy8gU2tpcHBpbmcgPHN0eWxlPiBhcyB3ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGVtXG4gICAgICAvLyBpbiB0aGUgU3R5bGVDb21waWxlclxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFU0hFRVQgJiZcbiAgICAgICAgaXNTdHlsZVVybFJlc29sdmFibGUocHJlcGFyc2VkRWxlbWVudC5ocmVmQXR0cikpIHtcbiAgICAgIC8vIFNraXBwaW5nIHN0eWxlc2hlZXRzIHdpdGggZWl0aGVyIHJlbGF0aXZlIHVybHMgb3IgcGFja2FnZSBzY2hlbWUgYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICAgIC8vIHRoZW0gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBtYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSA9IFtdO1xuICAgIHZhciBlbGVtZW50T3JEaXJlY3RpdmVQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdID0gW107XG4gICAgdmFyIHZhcnM6IFZhcmlhYmxlQXN0W10gPSBbXTtcbiAgICB2YXIgZXZlbnRzOiBCb3VuZEV2ZW50QXN0W10gPSBbXTtcblxuICAgIHZhciB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10gPSBbXTtcbiAgICB2YXIgdGVtcGxhdGVWYXJzOiBWYXJpYWJsZUFzdFtdID0gW107XG4gICAgdmFyIHRlbXBsYXRlTWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10gPSBbXTtcbiAgICB2YXIgaGFzSW5saW5lVGVtcGxhdGVzID0gZmFsc2U7XG4gICAgdmFyIGF0dHJzID0gW107XG5cbiAgICBlbGVtZW50LmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICB2YXIgaGFzQmluZGluZyA9IHRoaXMuX3BhcnNlQXR0cihhdHRyLCBtYXRjaGFibGVBdHRycywgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIGV2ZW50cywgdmFycyk7XG4gICAgICB2YXIgaGFzVGVtcGxhdGVCaW5kaW5nID0gdGhpcy5fcGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgICAgICAgYXR0ciwgdGVtcGxhdGVNYXRjaGFibGVBdHRycywgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgdGVtcGxhdGVWYXJzKTtcbiAgICAgIGlmICghaGFzQmluZGluZyAmJiAhaGFzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIC8vIGRvbid0IGluY2x1ZGUgdGhlIGJpbmRpbmdzIGFzIGF0dHJpYnV0ZXMgYXMgd2VsbCBpbiB0aGUgQVNUXG4gICAgICAgIGF0dHJzLnB1c2godGhpcy52aXNpdEF0dHIoYXR0ciwgbnVsbCkpO1xuICAgICAgICBtYXRjaGFibGVBdHRycy5wdXNoKFthdHRyLm5hbWUsIGF0dHIudmFsdWVdKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNUZW1wbGF0ZUJpbmRpbmcpIHtcbiAgICAgICAgaGFzSW5saW5lVGVtcGxhdGVzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBsY0VsTmFtZSA9IHNwbGl0TnNOYW1lKG5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpWzFdO1xuICAgIHZhciBpc1RlbXBsYXRlRWxlbWVudCA9IGxjRWxOYW1lID09IFRFTVBMQVRFX0VMRU1FTlQ7XG4gICAgdmFyIGVsZW1lbnRDc3NTZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3Rvcihub2RlTmFtZSwgbWF0Y2hhYmxlQXR0cnMpO1xuICAgIHZhciBkaXJlY3RpdmVzID0gdGhpcy5fY3JlYXRlRGlyZWN0aXZlQXN0cyhcbiAgICAgICAgZWxlbWVudC5uYW1lLCB0aGlzLl9wYXJzZURpcmVjdGl2ZXModGhpcy5zZWxlY3Rvck1hdGNoZXIsIGVsZW1lbnRDc3NTZWxlY3RvciksXG4gICAgICAgIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBpc1RlbXBsYXRlRWxlbWVudCA/IFtdIDogdmFycywgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB2YXIgZWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID1cbiAgICAgICAgdGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhlbGVtZW50Lm5hbWUsIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBkaXJlY3RpdmVzKTtcbiAgICB2YXIgY2hpbGRyZW4gPSBodG1sVmlzaXRBbGwocHJlcGFyc2VkRWxlbWVudC5ub25CaW5kYWJsZSA/IE5PTl9CSU5EQUJMRV9WSVNJVE9SIDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jaGlsZHJlbiwgQ29tcG9uZW50LmNyZWF0ZShkaXJlY3RpdmVzKSk7XG5cbiAgICAvLyBPdmVycmlkZSB0aGUgYWN0dWFsIHNlbGVjdG9yIHdoZW4gdGhlIGBuZ1Byb2plY3RBc2AgYXR0cmlidXRlIGlzIHByb3ZpZGVkXG4gICAgdmFyIHByb2plY3Rpb25TZWxlY3RvciA9IGlzUHJlc2VudChwcmVwYXJzZWRFbGVtZW50LnByb2plY3RBcykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3NzU2VsZWN0b3IucGFyc2UocHJlcGFyc2VkRWxlbWVudC5wcm9qZWN0QXMpWzBdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRDc3NTZWxlY3RvcjtcbiAgICB2YXIgbmdDb250ZW50SW5kZXggPSBjb21wb25lbnQuZmluZE5nQ29udGVudEluZGV4KHByb2plY3Rpb25TZWxlY3Rvcik7XG4gICAgdmFyIHBhcnNlZEVsZW1lbnQ7XG5cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5OR19DT05URU5UKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KGVsZW1lbnQuY2hpbGRyZW4pICYmIGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGA8bmctY29udGVudD4gZWxlbWVudCBjYW5ub3QgaGF2ZSBjb250ZW50LiA8bmctY29udGVudD4gbXVzdCBiZSBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSA8L25nLWNvbnRlbnQ+YCxcbiAgICAgICAgICAgIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgTmdDb250ZW50QXN0KFxuICAgICAgICAgIHRoaXMubmdDb250ZW50Q291bnQrKywgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCA6IG5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2Fzc2VydEFsbEV2ZW50c1B1Ymxpc2hlZEJ5RGlyZWN0aXZlcyhkaXJlY3RpdmVzLCBldmVudHMpO1xuICAgICAgdGhpcy5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShkaXJlY3RpdmVzLCBlbGVtZW50UHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc291cmNlU3Bhbik7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPVxuICAgICAgICAgIG5ldyBFbWJlZGRlZFRlbXBsYXRlQXN0KGF0dHJzLCBldmVudHMsIHZhcnMsIGRpcmVjdGl2ZXMsIGNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXNzZXJ0T25seU9uZUNvbXBvbmVudChkaXJlY3RpdmVzLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgdmFyIGVsZW1lbnRFeHBvcnRBc1ZhcnMgPSB2YXJzLmZpbHRlcih2YXJBc3QgPT4gdmFyQXN0LnZhbHVlLmxlbmd0aCA9PT0gMCk7XG4gICAgICBsZXQgbmdDb250ZW50SW5kZXggPVxuICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBjb21wb25lbnQuZmluZE5nQ29udGVudEluZGV4KHByb2plY3Rpb25TZWxlY3Rvcik7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPVxuICAgICAgICAgIG5ldyBFbGVtZW50QXN0KG5vZGVOYW1lLCBhdHRycywgZWxlbWVudFByb3BzLCBldmVudHMsIGVsZW1lbnRFeHBvcnRBc1ZhcnMsIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4sIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgaWYgKGhhc0lubGluZVRlbXBsYXRlcykge1xuICAgICAgdmFyIHRlbXBsYXRlQ3NzU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoVEVNUExBVEVfRUxFTUVOVCwgdGVtcGxhdGVNYXRjaGFibGVBdHRycyk7XG4gICAgICB2YXIgdGVtcGxhdGVEaXJlY3RpdmVzID0gdGhpcy5fY3JlYXRlRGlyZWN0aXZlQXN0cyhcbiAgICAgICAgICBlbGVtZW50Lm5hbWUsIHRoaXMuX3BhcnNlRGlyZWN0aXZlcyh0aGlzLnNlbGVjdG9yTWF0Y2hlciwgdGVtcGxhdGVDc3NTZWxlY3RvciksXG4gICAgICAgICAgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgW10sIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB2YXIgdGVtcGxhdGVFbGVtZW50UHJvcHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10gPSB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3RzKFxuICAgICAgICAgIGVsZW1lbnQubmFtZSwgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgdGVtcGxhdGVEaXJlY3RpdmVzKTtcbiAgICAgIHRoaXMuX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUodGVtcGxhdGVEaXJlY3RpdmVzLCB0ZW1wbGF0ZUVsZW1lbnRQcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuKTtcblxuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyBFbWJlZGRlZFRlbXBsYXRlQXN0KFtdLCBbXSwgdGVtcGxhdGVWYXJzLCB0ZW1wbGF0ZURpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3BhcnNlZEVsZW1lbnRdLCBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZEVsZW1lbnQ7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhhdHRyOiBIdG1sQXR0ckFzdCwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pOiBib29sZWFuIHtcbiAgICB2YXIgdGVtcGxhdGVCaW5kaW5nc1NvdXJjZSA9IG51bGw7XG4gICAgaWYgKGF0dHIubmFtZSA9PSBURU1QTEFURV9BVFRSKSB7XG4gICAgICB0ZW1wbGF0ZUJpbmRpbmdzU291cmNlID0gYXR0ci52YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGF0dHIubmFtZS5zdGFydHNXaXRoKFRFTVBMQVRFX0FUVFJfUFJFRklYKSkge1xuICAgICAgdmFyIGtleSA9IGF0dHIubmFtZS5zdWJzdHJpbmcoVEVNUExBVEVfQVRUUl9QUkVGSVgubGVuZ3RoKTsgIC8vIHJlbW92ZSB0aGUgc3RhclxuICAgICAgdGVtcGxhdGVCaW5kaW5nc1NvdXJjZSA9IChhdHRyLnZhbHVlLmxlbmd0aCA9PSAwKSA/IGtleSA6IGtleSArICcgJyArIGF0dHIudmFsdWU7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGVtcGxhdGVCaW5kaW5nc1NvdXJjZSkpIHtcbiAgICAgIHZhciBiaW5kaW5ncyA9IHRoaXMuX3BhcnNlVGVtcGxhdGVCaW5kaW5ncyh0ZW1wbGF0ZUJpbmRpbmdzU291cmNlLCBhdHRyLnNvdXJjZVNwYW4pO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYmluZGluZyA9IGJpbmRpbmdzW2ldO1xuICAgICAgICBpZiAoYmluZGluZy5rZXlJc1Zhcikge1xuICAgICAgICAgIHRhcmdldFZhcnMucHVzaChuZXcgVmFyaWFibGVBc3QoYmluZGluZy5rZXksIGJpbmRpbmcubmFtZSwgYXR0ci5zb3VyY2VTcGFuKSk7XG4gICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbYmluZGluZy5rZXksIGJpbmRpbmcubmFtZV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kaW5nLmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChiaW5kaW5nLmtleSwgYmluZGluZy5leHByZXNzaW9uLCBhdHRyLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW2JpbmRpbmcua2V5LCAnJ10pO1xuICAgICAgICAgIHRoaXMuX3BhcnNlTGl0ZXJhbEF0dHIoYmluZGluZy5rZXksIG51bGwsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0UHJvcHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBdHRyKGF0dHI6IEh0bWxBdHRyQXN0LCB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sIHRhcmdldEV2ZW50czogQm91bmRFdmVudEFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFyczogVmFyaWFibGVBc3RbXSk6IGJvb2xlYW4ge1xuICAgIHZhciBhdHRyTmFtZSA9IHRoaXMuX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ci5uYW1lKTtcbiAgICB2YXIgYXR0clZhbHVlID0gYXR0ci52YWx1ZTtcbiAgICB2YXIgYmluZFBhcnRzID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKEJJTkRfTkFNRV9SRUdFWFAsIGF0dHJOYW1lKTtcbiAgICB2YXIgaGFzQmluZGluZyA9IGZhbHNlO1xuICAgIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzKSkge1xuICAgICAgaGFzQmluZGluZyA9IHRydWU7XG4gICAgICBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1sxXSkpIHsgIC8vIG1hdGNoOiBiaW5kLXByb3BcbiAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eShiaW5kUGFydHNbNV0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wcyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KFxuICAgICAgICAgICAgICAgICAgICAgYmluZFBhcnRzWzJdKSkgeyAgLy8gbWF0Y2g6IHZhci1uYW1lIC8gdmFyLW5hbWU9XCJpZGVuXCIgLyAjbmFtZSAvICNuYW1lPVwiaWRlblwiXG4gICAgICAgIHZhciBpZGVudGlmaWVyID0gYmluZFBhcnRzWzVdO1xuICAgICAgICB0aGlzLl9wYXJzZVZhcmlhYmxlKGlkZW50aWZpZXIsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRWYXJzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzNdKSkgeyAgLy8gbWF0Y2g6IG9uLWV2ZW50XG4gICAgICAgIHRoaXMuX3BhcnNlRXZlbnQoYmluZFBhcnRzWzVdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzRdKSkgeyAgLy8gbWF0Y2g6IGJpbmRvbi1wcm9wXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzVdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuICAgICAgICB0aGlzLl9wYXJzZUFzc2lnbm1lbnRFdmVudChiaW5kUGFydHNbNV0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzZdKSkgeyAgLy8gbWF0Y2g6IFsoZXhwcildXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzZdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuICAgICAgICB0aGlzLl9wYXJzZUFzc2lnbm1lbnRFdmVudChiaW5kUGFydHNbNl0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzddKSkgeyAgLy8gbWF0Y2g6IFtleHByXVxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s3XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzhdKSkgeyAgLy8gbWF0Y2g6IChldmVudClcbiAgICAgICAgdGhpcy5fcGFyc2VFdmVudChiaW5kUGFydHNbOF0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBoYXNCaW5kaW5nID0gdGhpcy5fcGFyc2VQcm9wZXJ0eUludGVycG9sYXRpb24oYXR0ck5hbWUsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgfVxuICAgIGlmICghaGFzQmluZGluZykge1xuICAgICAgdGhpcy5fcGFyc2VMaXRlcmFsQXR0cihhdHRyTmFtZSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFByb3BzKTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0JpbmRpbmc7XG4gIH1cblxuICBwcml2YXRlIF9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBhdHRyTmFtZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoJ2RhdGEtJykgPyBhdHRyTmFtZS5zdWJzdHJpbmcoNSkgOiBhdHRyTmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVmFyaWFibGUoaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFyczogVmFyaWFibGVBc3RbXSkge1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgXCItXCIgaXMgbm90IGFsbG93ZWQgaW4gdmFyaWFibGUgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgdGFyZ2V0VmFycy5wdXNoKG5ldyBWYXJpYWJsZUFzdChpZGVudGlmaWVyLCB2YWx1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pIHtcbiAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KG5hbWUsIHRoaXMuX3BhcnNlQmluZGluZyhleHByZXNzaW9uLCBzb3VyY2VTcGFuKSwgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbihuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pOiBib29sZWFuIHtcbiAgICB2YXIgZXhwciA9IHRoaXMuX3BhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZSwgc291cmNlU3Bhbik7XG4gICAgaWYgKGlzUHJlc2VudChleHByKSkge1xuICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChuYW1lLCBleHByLCBzb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUHJvcGVydHlBc3QobmFtZTogc3RyaW5nLCBhc3Q6IEFTVFdpdGhTb3VyY2UsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKSB7XG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbbmFtZSwgYXN0LnNvdXJjZV0pO1xuICAgIHRhcmdldFByb3BzLnB1c2gobmV3IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkobmFtZSwgYXN0LCBmYWxzZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBc3NpZ25tZW50RXZlbnQobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldEV2ZW50czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgdGhpcy5fcGFyc2VFdmVudChgJHtuYW1lfUNoYW5nZWAsIGAke2V4cHJlc3Npb259PSRldmVudGAsIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRXZlbnQobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10pIHtcbiAgICAvLyBsb25nIGZvcm1hdDogJ3RhcmdldDogZXZlbnROYW1lJ1xuICAgIHZhciBwYXJ0cyA9IHNwbGl0QXRDb2xvbihuYW1lLCBbbnVsbCwgbmFtZV0pO1xuICAgIHZhciB0YXJnZXQgPSBwYXJ0c1swXTtcbiAgICB2YXIgZXZlbnROYW1lID0gcGFydHNbMV07XG4gICAgdmFyIGFzdCA9IHRoaXMuX3BhcnNlQWN0aW9uKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUsIGFzdC5zb3VyY2VdKTtcbiAgICB0YXJnZXRFdmVudHMucHVzaChuZXcgQm91bmRFdmVudEFzdChldmVudE5hbWUsIHRhcmdldCwgYXN0LCBzb3VyY2VTcGFuKSk7XG4gICAgLy8gRG9uJ3QgZGV0ZWN0IGRpcmVjdGl2ZXMgZm9yIGV2ZW50IG5hbWVzIGZvciBub3csXG4gICAgLy8gc28gZG9uJ3QgYWRkIHRoZSBldmVudCBuYW1lIHRvIHRoZSBtYXRjaGFibGVBdHRyc1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VMaXRlcmFsQXR0cihuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKSB7XG4gICAgdGFyZ2V0UHJvcHMucHVzaChuZXcgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eShcbiAgICAgICAgbmFtZSwgdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSh2YWx1ZSwgJycpLCB0cnVlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZURpcmVjdGl2ZXMoc2VsZWN0b3JNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Q3NzU2VsZWN0b3I6IENzc1NlbGVjdG9yKTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10ge1xuICAgIHZhciBkaXJlY3RpdmVzID0gW107XG4gICAgc2VsZWN0b3JNYXRjaGVyLm1hdGNoKGVsZW1lbnRDc3NTZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHNlbGVjdG9yLCBkaXJlY3RpdmUpID0+IHsgZGlyZWN0aXZlcy5wdXNoKGRpcmVjdGl2ZSk7IH0pO1xuICAgIC8vIE5lZWQgdG8gc29ydCB0aGUgZGlyZWN0aXZlcyBzbyB0aGF0IHdlIGdldCBjb25zaXN0ZW50IHJlc3VsdHMgdGhyb3VnaG91dCxcbiAgICAvLyBhcyBzZWxlY3Rvck1hdGNoZXIgdXNlcyBNYXBzIGluc2lkZS5cbiAgICAvLyBBbHNvIG5lZWQgdG8gbWFrZSBjb21wb25lbnRzIHRoZSBmaXJzdCBkaXJlY3RpdmUgaW4gdGhlIGFycmF5XG4gICAgTGlzdFdyYXBwZXIuc29ydChkaXJlY3RpdmVzLFxuICAgICAgICAgICAgICAgICAgICAgKGRpcjE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgZGlyMjogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXIxQ29tcCA9IGRpcjEuaXNDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXIyQ29tcCA9IGRpcjIuaXNDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXIxQ29tcCAmJiAhZGlyMkNvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRpcjFDb21wICYmIGRpcjJDb21wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aXZlc0luZGV4LmdldChkaXIxKSAtIHRoaXMuZGlyZWN0aXZlc0luZGV4LmdldChkaXIyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXM7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVBc3RzKGVsZW1lbnROYW1lOiBzdHJpbmcsIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFeHBvcnRBc1ZhcnM6IFZhcmlhYmxlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogRGlyZWN0aXZlQXN0W10ge1xuICAgIHZhciBtYXRjaGVkVmFyaWFibGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgdmFyIGRpcmVjdGl2ZUFzdHMgPSBkaXJlY3RpdmVzLm1hcCgoZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpID0+IHtcbiAgICAgIHZhciBob3N0UHJvcGVydGllczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9IFtdO1xuICAgICAgdmFyIGhvc3RFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSA9IFtdO1xuICAgICAgdmFyIGRpcmVjdGl2ZVByb3BlcnRpZXM6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3RbXSA9IFtdO1xuICAgICAgdGhpcy5fY3JlYXRlRGlyZWN0aXZlSG9zdFByb3BlcnR5QXN0cyhlbGVtZW50TmFtZSwgZGlyZWN0aXZlLmhvc3RQcm9wZXJ0aWVzLCBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0UHJvcGVydGllcyk7XG4gICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKGRpcmVjdGl2ZS5ob3N0TGlzdGVuZXJzLCBzb3VyY2VTcGFuLCBob3N0RXZlbnRzKTtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZVByb3BlcnR5QXN0cyhkaXJlY3RpdmUuaW5wdXRzLCBwcm9wcywgZGlyZWN0aXZlUHJvcGVydGllcyk7XG4gICAgICB2YXIgZXhwb3J0QXNWYXJzID0gW107XG4gICAgICBwb3NzaWJsZUV4cG9ydEFzVmFycy5mb3JFYWNoKCh2YXJBc3QpID0+IHtcbiAgICAgICAgaWYgKCh2YXJBc3QudmFsdWUubGVuZ3RoID09PSAwICYmIGRpcmVjdGl2ZS5pc0NvbXBvbmVudCkgfHxcbiAgICAgICAgICAgIChkaXJlY3RpdmUuZXhwb3J0QXMgPT0gdmFyQXN0LnZhbHVlKSkge1xuICAgICAgICAgIGV4cG9ydEFzVmFycy5wdXNoKHZhckFzdCk7XG4gICAgICAgICAgbWF0Y2hlZFZhcmlhYmxlcy5hZGQodmFyQXN0Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgRGlyZWN0aXZlQXN0KGRpcmVjdGl2ZSwgZGlyZWN0aXZlUHJvcGVydGllcywgaG9zdFByb3BlcnRpZXMsIGhvc3RFdmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRBc1ZhcnMsIHNvdXJjZVNwYW4pO1xuICAgIH0pO1xuICAgIHBvc3NpYmxlRXhwb3J0QXNWYXJzLmZvckVhY2goKHZhckFzdCkgPT4ge1xuICAgICAgaWYgKHZhckFzdC52YWx1ZS5sZW5ndGggPiAwICYmICFTZXRXcmFwcGVyLmhhcyhtYXRjaGVkVmFyaWFibGVzLCB2YXJBc3QubmFtZSkpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFRoZXJlIGlzIG5vIGRpcmVjdGl2ZSB3aXRoIFwiZXhwb3J0QXNcIiBzZXQgdG8gXCIke3ZhckFzdC52YWx1ZX1cImAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhckFzdC5zb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGlyZWN0aXZlQXN0cztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZURpcmVjdGl2ZUhvc3RQcm9wZXJ0eUFzdHMoZWxlbWVudE5hbWU6IHN0cmluZywgaG9zdFByb3BzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcGVydHlBc3RzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdKSB7XG4gICAgaWYgKGlzUHJlc2VudChob3N0UHJvcHMpKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaG9zdFByb3BzLCAoZXhwcmVzc2lvbjogc3RyaW5nLCBwcm9wTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHZhciBleHByQXN0ID0gdGhpcy5fcGFyc2VCaW5kaW5nKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgICAgICB0YXJnZXRQcm9wZXJ0eUFzdHMucHVzaChcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdChlbGVtZW50TmFtZSwgcHJvcE5hbWUsIGV4cHJBc3QsIHNvdXJjZVNwYW4pKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50QXN0czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgaWYgKGlzUHJlc2VudChob3N0TGlzdGVuZXJzKSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3RMaXN0ZW5lcnMsIChleHByZXNzaW9uOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgdGhpcy5fcGFyc2VFdmVudChwcm9wTmFtZSwgZXhwcmVzc2lvbiwgc291cmNlU3BhbiwgW10sIHRhcmdldEV2ZW50QXN0cyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMoZGlyZWN0aXZlUHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3VuZFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzOiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KGRpcmVjdGl2ZVByb3BlcnRpZXMpKSB7XG4gICAgICB2YXIgYm91bmRQcm9wc0J5TmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5PigpO1xuICAgICAgYm91bmRQcm9wcy5mb3JFYWNoKGJvdW5kUHJvcCA9PiB7XG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSBib3VuZFByb3BzQnlOYW1lLmdldChib3VuZFByb3AubmFtZSk7XG4gICAgICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgcHJldlZhbHVlLmlzTGl0ZXJhbCkge1xuICAgICAgICAgIC8vIGdpdmUgW2FdPVwiYlwiIGEgaGlnaGVyIHByZWNlZGVuY2UgdGhhbiBhPVwiYlwiIG9uIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgICAgICBib3VuZFByb3BzQnlOYW1lLnNldChib3VuZFByb3AubmFtZSwgYm91bmRQcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChkaXJlY3RpdmVQcm9wZXJ0aWVzLCAoZWxQcm9wOiBzdHJpbmcsIGRpclByb3A6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgYm91bmRQcm9wID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoZWxQcm9wKTtcblxuICAgICAgICAvLyBCaW5kaW5ncyBhcmUgb3B0aW9uYWwsIHNvIHRoaXMgYmluZGluZyBvbmx5IG5lZWRzIHRvIGJlIHNldCB1cCBpZiBhbiBleHByZXNzaW9uIGlzIGdpdmVuLlxuICAgICAgICBpZiAoaXNQcmVzZW50KGJvdW5kUHJvcCkpIHtcbiAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzLnB1c2gobmV3IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QoXG4gICAgICAgICAgICAgIGRpclByb3AsIGJvdW5kUHJvcC5uYW1lLCBib3VuZFByb3AuZXhwcmVzc2lvbiwgYm91bmRQcm9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhlbGVtZW50TmFtZTogc3RyaW5nLCBwcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKTogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSB7XG4gICAgdmFyIGJvdW5kRWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgdmFyIGJvdW5kRGlyZWN0aXZlUHJvcHNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0PigpO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyZWN0aXZlOiBEaXJlY3RpdmVBc3QpID0+IHtcbiAgICAgIGRpcmVjdGl2ZS5pbnB1dHMuZm9yRWFjaCgocHJvcDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCkgPT4ge1xuICAgICAgICBib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguc2V0KHByb3AudGVtcGxhdGVOYW1lLCBwcm9wKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHByb3BzLmZvckVhY2goKHByb3A6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkpID0+IHtcbiAgICAgIGlmICghcHJvcC5pc0xpdGVyYWwgJiYgaXNCbGFuayhib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguZ2V0KHByb3AubmFtZSkpKSB7XG4gICAgICAgIGJvdW5kRWxlbWVudFByb3BzLnB1c2godGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lLCBwcm9wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3AuZXhwcmVzc2lvbiwgcHJvcC5zb3VyY2VTcGFuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGJvdW5kRWxlbWVudFByb3BzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgYXN0OiBBU1QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCB7XG4gICAgdmFyIHVuaXQgPSBudWxsO1xuICAgIHZhciBiaW5kaW5nVHlwZTtcbiAgICB2YXIgYm91bmRQcm9wZXJ0eU5hbWU7XG4gICAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdChQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gdGhpcy5fc2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUocGFydHNbMF0pO1xuICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLlByb3BlcnR5O1xuICAgICAgaWYgKCF0aGlzLl9zY2hlbWFSZWdpc3RyeS5oYXNQcm9wZXJ0eShlbGVtZW50TmFtZSwgYm91bmRQcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgYENhbid0IGJpbmQgdG8gJyR7Ym91bmRQcm9wZXJ0eU5hbWV9JyBzaW5jZSBpdCBpc24ndCBhIGtub3duIG5hdGl2ZSBwcm9wZXJ0eWAsXG4gICAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBhcnRzWzBdID09IEFUVFJJQlVURV9QUkVGSVgpIHtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgbGV0IG5zU2VwYXJhdG9ySWR4ID0gYm91bmRQcm9wZXJ0eU5hbWUuaW5kZXhPZignOicpO1xuICAgICAgICBpZiAobnNTZXBhcmF0b3JJZHggPiAtMSkge1xuICAgICAgICAgIGxldCBucyA9IGJvdW5kUHJvcGVydHlOYW1lLnN1YnN0cmluZygwLCBuc1NlcGFyYXRvcklkeCk7XG4gICAgICAgICAgbGV0IG5hbWUgPSBib3VuZFByb3BlcnR5TmFtZS5zdWJzdHJpbmcobnNTZXBhcmF0b3JJZHggKyAxKTtcbiAgICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IG1lcmdlTnNBbmROYW1lKG5zLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBiaW5kaW5nVHlwZSA9IFByb3BlcnR5QmluZGluZ1R5cGUuQXR0cmlidXRlO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0c1swXSA9PSBDTEFTU19QUkVGSVgpIHtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLkNsYXNzO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0c1swXSA9PSBTVFlMRV9QUkVGSVgpIHtcbiAgICAgICAgdW5pdCA9IHBhcnRzLmxlbmd0aCA+IDIgPyBwYXJ0c1syXSA6IG51bGw7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5TdHlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBJbnZhbGlkIHByb3BlcnR5IG5hbWUgJyR7bmFtZX0nYCwgc291cmNlU3Bhbik7XG4gICAgICAgIGJpbmRpbmdUeXBlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0KGJvdW5kUHJvcGVydHlOYW1lLCBiaW5kaW5nVHlwZSwgYXN0LCB1bml0LCBzb3VyY2VTcGFuKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKTogc3RyaW5nW10ge1xuICAgIHZhciBjb21wb25lbnRUeXBlTmFtZXM6IHN0cmluZ1tdID0gW107XG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZSA9PiB7XG4gICAgICB2YXIgdHlwZU5hbWUgPSBkaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUubmFtZTtcbiAgICAgIGlmIChkaXJlY3RpdmUuZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbXBvbmVudFR5cGVOYW1lcy5wdXNoKHR5cGVOYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcG9uZW50VHlwZU5hbWVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0T25seU9uZUNvbXBvbmVudChkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgdmFyIGNvbXBvbmVudFR5cGVOYW1lcyA9IHRoaXMuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzKTtcbiAgICBpZiAoY29tcG9uZW50VHlwZU5hbWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBNb3JlIHRoYW4gb25lIGNvbXBvbmVudDogJHtjb21wb25lbnRUeXBlTmFtZXMuam9pbignLCcpfWAsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHZhciBjb21wb25lbnRUeXBlTmFtZXM6IHN0cmluZ1tdID0gdGhpcy5fZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzKGRpcmVjdGl2ZXMpO1xuICAgIGlmIChjb21wb25lbnRUeXBlTmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYENvbXBvbmVudHMgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGU6ICR7Y29tcG9uZW50VHlwZU5hbWVzLmpvaW4oJywnKX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgfVxuICAgIGVsZW1lbnRQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgYFByb3BlcnR5IGJpbmRpbmcgJHtwcm9wLm5hbWV9IG5vdCB1c2VkIGJ5IGFueSBkaXJlY3RpdmUgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGVgLFxuICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0QWxsRXZlbnRzUHVibGlzaGVkQnlEaXJlY3RpdmVzKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiBCb3VuZEV2ZW50QXN0W10pIHtcbiAgICB2YXIgYWxsRGlyZWN0aXZlRXZlbnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZSA9PiB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGlyZWN0aXZlLmRpcmVjdGl2ZS5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChldmVudE5hbWU6IHN0cmluZywgXykgPT4geyBhbGxEaXJlY3RpdmVFdmVudHMuYWRkKGV2ZW50TmFtZSk7IH0pO1xuICAgIH0pO1xuICAgIGV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQoZXZlbnQudGFyZ2V0KSB8fCAhU2V0V3JhcHBlci5oYXMoYWxsRGlyZWN0aXZlRXZlbnRzLCBldmVudC5uYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGBFdmVudCBiaW5kaW5nICR7ZXZlbnQuZnVsbE5hbWV9IG5vdCBlbWl0dGVkIGJ5IGFueSBkaXJlY3RpdmUgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGVgLFxuICAgICAgICAgICAgZXZlbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuY2xhc3MgTm9uQmluZGFibGVWaXNpdG9yIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICB2aXNpdEVsZW1lbnQoYXN0OiBIdG1sRWxlbWVudEFzdCwgY29tcG9uZW50OiBDb21wb25lbnQpOiBFbGVtZW50QXN0IHtcbiAgICB2YXIgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYW5kIHN0eWxlc2hlZXRzIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgYXR0ck5hbWVBbmRWYWx1ZXMgPSBhc3QuYXR0cnMubWFwKGF0dHJBc3QgPT4gW2F0dHJBc3QubmFtZSwgYXR0ckFzdC52YWx1ZV0pO1xuICAgIHZhciBzZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3Rvcihhc3QubmFtZSwgYXR0ck5hbWVBbmRWYWx1ZXMpO1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IGNvbXBvbmVudC5maW5kTmdDb250ZW50SW5kZXgoc2VsZWN0b3IpO1xuICAgIHZhciBjaGlsZHJlbiA9IGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIEVNUFRZX0NPTVBPTkVOVCk7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50QXN0KGFzdC5uYW1lLCBodG1sVmlzaXRBbGwodGhpcywgYXN0LmF0dHJzKSwgW10sIFtdLCBbXSwgW10sIGNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0Q29tbWVudChhc3Q6IEh0bWxDb21tZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdEF0dHIoYXN0OiBIdG1sQXR0ckFzdCwgY29udGV4dDogYW55KTogQXR0ckFzdCB7XG4gICAgcmV0dXJuIG5ldyBBdHRyQXN0KGFzdC5uYW1lLCBhc3QudmFsdWUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdFRleHQoYXN0OiBIdG1sVGV4dEFzdCwgY29tcG9uZW50OiBDb21wb25lbnQpOiBUZXh0QXN0IHtcbiAgICB2YXIgbmdDb250ZW50SW5kZXggPSBjb21wb25lbnQuZmluZE5nQ29udGVudEluZGV4KFRFWFRfQ1NTX1NFTEVDVE9SKTtcbiAgICByZXR1cm4gbmV3IFRleHRBc3QoYXN0LnZhbHVlLCBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmNsYXNzIEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNULCBwdWJsaWMgaXNMaXRlcmFsOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRDbGFzc2VzKGNsYXNzQXR0clZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnNwbGl0KGNsYXNzQXR0clZhbHVlLnRyaW0oKSwgL1xccysvZyk7XG59XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gIHN0YXRpYyBjcmVhdGUoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10pOiBDb21wb25lbnQge1xuICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA9PT0gMCB8fCAhZGlyZWN0aXZlc1swXS5kaXJlY3RpdmUuaXNDb21wb25lbnQpIHtcbiAgICAgIHJldHVybiBFTVBUWV9DT01QT05FTlQ7XG4gICAgfVxuICAgIHZhciBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIHZhciBuZ0NvbnRlbnRTZWxlY3RvcnMgPSBkaXJlY3RpdmVzWzBdLmRpcmVjdGl2ZS50ZW1wbGF0ZS5uZ0NvbnRlbnRTZWxlY3RvcnM7XG4gICAgdmFyIHdpbGRjYXJkTmdDb250ZW50SW5kZXggPSBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSBuZ0NvbnRlbnRTZWxlY3RvcnNbaV07XG4gICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoc2VsZWN0b3IsICcqJykpIHtcbiAgICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKG5nQ29udGVudFNlbGVjdG9yc1tpXSksIGkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbXBvbmVudChtYXRjaGVyLCB3aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgfVxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmdDb250ZW50SW5kZXhNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXIpIHt9XG5cbiAgZmluZE5nQ29udGVudEluZGV4KHNlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IG51bWJlciB7XG4gICAgdmFyIG5nQ29udGVudEluZGljZXMgPSBbXTtcbiAgICB0aGlzLm5nQ29udGVudEluZGV4TWF0Y2hlci5tYXRjaChcbiAgICAgICAgc2VsZWN0b3IsIChzZWxlY3RvciwgbmdDb250ZW50SW5kZXgpID0+IHsgbmdDb250ZW50SW5kaWNlcy5wdXNoKG5nQ29udGVudEluZGV4KTsgfSk7XG4gICAgTGlzdFdyYXBwZXIuc29ydChuZ0NvbnRlbnRJbmRpY2VzKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMud2lsZGNhcmROZ0NvbnRlbnRJbmRleCkpIHtcbiAgICAgIG5nQ29udGVudEluZGljZXMucHVzaCh0aGlzLndpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gbmdDb250ZW50SW5kaWNlcy5sZW5ndGggPiAwID8gbmdDb250ZW50SW5kaWNlc1swXSA6IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yKGVsZW1lbnROYW1lOiBzdHJpbmcsIG1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdKTogQ3NzU2VsZWN0b3Ige1xuICB2YXIgY3NzU2VsZWN0b3IgPSBuZXcgQ3NzU2VsZWN0b3IoKTtcbiAgbGV0IGVsTmFtZU5vTnMgPSBzcGxpdE5zTmFtZShlbGVtZW50TmFtZSlbMV07XG5cbiAgY3NzU2VsZWN0b3Iuc2V0RWxlbWVudChlbE5hbWVOb05zKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoYWJsZUF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGF0dHJOYW1lID0gbWF0Y2hhYmxlQXR0cnNbaV1bMF07XG4gICAgbGV0IGF0dHJOYW1lTm9OcyA9IHNwbGl0TnNOYW1lKGF0dHJOYW1lKVsxXTtcbiAgICBsZXQgYXR0clZhbHVlID0gbWF0Y2hhYmxlQXR0cnNbaV1bMV07XG5cbiAgICBjc3NTZWxlY3Rvci5hZGRBdHRyaWJ1dGUoYXR0ck5hbWVOb05zLCBhdHRyVmFsdWUpO1xuICAgIGlmIChhdHRyTmFtZS50b0xvd2VyQ2FzZSgpID09IENMQVNTX0FUVFIpIHtcbiAgICAgIHZhciBjbGFzc2VzID0gc3BsaXRDbGFzc2VzKGF0dHJWYWx1ZSk7XG4gICAgICBjbGFzc2VzLmZvckVhY2goY2xhc3NOYW1lID0+IGNzc1NlbGVjdG9yLmFkZENsYXNzTmFtZShjbGFzc05hbWUpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNzc1NlbGVjdG9yO1xufVxuXG52YXIgRU1QVFlfQ09NUE9ORU5UID0gbmV3IENvbXBvbmVudChuZXcgU2VsZWN0b3JNYXRjaGVyKCksIG51bGwpO1xudmFyIE5PTl9CSU5EQUJMRV9WSVNJVE9SID0gbmV3IE5vbkJpbmRhYmxlVmlzaXRvcigpO1xuXG5cbmV4cG9ydCBjbGFzcyBQaXBlQ29sbGVjdG9yIGV4dGVuZHMgUmVjdXJzaXZlQXN0VmlzaXRvciB7XG4gIHBpcGVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSk6IGFueSB7XG4gICAgdGhpcy5waXBlcy5hZGQoYXN0Lm5hbWUpO1xuICAgIGFzdC5leHAudmlzaXQodGhpcyk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==