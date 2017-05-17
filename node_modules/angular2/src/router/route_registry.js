'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var core_1 = require('angular2/core');
var route_config_impl_1 = require('./route_config/route_config_impl');
var rules_1 = require('./rules/rules');
var rule_set_1 = require('./rules/rule_set');
var instruction_1 = require('./instruction');
var route_config_normalizer_1 = require('./route_config/route_config_normalizer');
var url_parser_1 = require('./url_parser');
var _resolveToNull = async_1.PromiseWrapper.resolve(null);
// A LinkItemArray is an array, which describes a set of routes
// The items in the array are found in groups:
// - the first item is the name of the route
// - the next items are:
//   - an object containing parameters
//   - or an array describing an aux route
// export type LinkRouteItem = string | Object;
// export type LinkItem = LinkRouteItem | Array<LinkRouteItem>;
// export type LinkItemArray = Array<LinkItem>;
/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
exports.ROUTER_PRIMARY_COMPONENT = lang_1.CONST_EXPR(new core_1.OpaqueToken('RouterPrimaryComponent'));
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
var RouteRegistry = (function () {
    function RouteRegistry(_rootComponent) {
        this._rootComponent = _rootComponent;
        this._rules = new collection_1.Map();
    }
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    RouteRegistry.prototype.config = function (parentComponent, config) {
        config = route_config_normalizer_1.normalizeRouteConfig(config, this);
        // this is here because Dart type guard reasons
        if (config instanceof route_config_impl_1.Route) {
            route_config_normalizer_1.assertComponentExists(config.component, config.path);
        }
        else if (config instanceof route_config_impl_1.AuxRoute) {
            route_config_normalizer_1.assertComponentExists(config.component, config.path);
        }
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            rules = new rule_set_1.RuleSet();
            this._rules.set(parentComponent, rules);
        }
        var terminal = rules.config(config);
        if (config instanceof route_config_impl_1.Route) {
            if (terminal) {
                assertTerminalComponent(config.component, config.path);
            }
            else {
                this.configFromComponent(config.component);
            }
        }
    };
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    RouteRegistry.prototype.configFromComponent = function (component) {
        var _this = this;
        if (!lang_1.isType(component)) {
            return;
        }
        // Don't read the annotations from a type more than once –
        // this prevents an infinite loop if a component routes recursively.
        if (this._rules.has(component)) {
            return;
        }
        var annotations = reflection_1.reflector.annotations(component);
        if (lang_1.isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof route_config_impl_1.RouteConfig) {
                    var routeCfgs = annotation.configs;
                    routeCfgs.forEach(function (config) { return _this.config(component, config); });
                }
            }
        }
    };
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    RouteRegistry.prototype.recognize = function (url, ancestorInstructions) {
        var parsedUrl = url_parser_1.parser.parse(url);
        return this._recognize(parsedUrl, []);
    };
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    RouteRegistry.prototype._recognize = function (parsedUrl, ancestorInstructions, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        var parentComponent = lang_1.isPresent(parentInstruction) ? parentInstruction.component.componentType :
            this._rootComponent;
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = _aux ? rules.recognizeAuxiliary(parsedUrl) : rules.recognize(parsedUrl);
        var matchPromises = possibleMatches.map(function (candidate) { return candidate.then(function (candidate) {
            if (candidate instanceof rules_1.PathMatch) {
                var auxParentInstructions = ancestorInstructions.length > 0 ? [collection_1.ListWrapper.last(ancestorInstructions)] : [];
                var auxInstructions = _this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
                var instruction = new instruction_1.ResolvedInstruction(candidate.instruction, null, auxInstructions);
                if (lang_1.isBlank(candidate.instruction) || candidate.instruction.terminal) {
                    return instruction;
                }
                var newAncestorInstructions = ancestorInstructions.concat([instruction]);
                return _this._recognize(candidate.remaining, newAncestorInstructions)
                    .then(function (childInstruction) {
                    if (lang_1.isBlank(childInstruction)) {
                        return null;
                    }
                    // redirect instructions are already absolute
                    if (childInstruction instanceof instruction_1.RedirectInstruction) {
                        return childInstruction;
                    }
                    instruction.child = childInstruction;
                    return instruction;
                });
            }
            if (candidate instanceof rules_1.RedirectMatch) {
                var instruction = _this.generate(candidate.redirectTo, ancestorInstructions.concat([null]));
                return new instruction_1.RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction, candidate.specificity);
            }
        }); });
        if ((lang_1.isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
            return async_1.PromiseWrapper.resolve(this.generateDefault(parentComponent));
        }
        return async_1.PromiseWrapper.all(matchPromises).then(mostSpecific);
    };
    RouteRegistry.prototype._auxRoutesToUnresolved = function (auxRoutes, parentInstructions) {
        var _this = this;
        var unresolvedAuxInstructions = {};
        auxRoutes.forEach(function (auxUrl) {
            unresolvedAuxInstructions[auxUrl.path] = new instruction_1.UnresolvedInstruction(function () { return _this._recognize(auxUrl, parentInstructions, true); });
        });
        return unresolvedAuxInstructions;
    };
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    RouteRegistry.prototype.generate = function (linkParams, ancestorInstructions, _aux) {
        if (_aux === void 0) { _aux = false; }
        var params = splitAndFlattenLinkParams(linkParams);
        var prevInstruction;
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (collection_1.ListWrapper.first(params) == '') {
            params.shift();
            prevInstruction = collection_1.ListWrapper.first(ancestorInstructions);
            ancestorInstructions = [];
        }
        else {
            prevInstruction = ancestorInstructions.length > 0 ? ancestorInstructions.pop() : null;
            if (collection_1.ListWrapper.first(params) == '.') {
                params.shift();
            }
            else if (collection_1.ListWrapper.first(params) == '..') {
                while (collection_1.ListWrapper.first(params) == '..') {
                    if (ancestorInstructions.length <= 0) {
                        throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
                    }
                    prevInstruction = ancestorInstructions.pop();
                    params = collection_1.ListWrapper.slice(params, 1);
                }
            }
            else {
                // we must only peak at the link param, and not consume it
                var routeName = collection_1.ListWrapper.first(params);
                var parentComponentType = this._rootComponent;
                var grandparentComponentType = null;
                if (ancestorInstructions.length > 1) {
                    var parentComponentInstruction = ancestorInstructions[ancestorInstructions.length - 1];
                    var grandComponentInstruction = ancestorInstructions[ancestorInstructions.length - 2];
                    parentComponentType = parentComponentInstruction.component.componentType;
                    grandparentComponentType = grandComponentInstruction.component.componentType;
                }
                else if (ancestorInstructions.length == 1) {
                    parentComponentType = ancestorInstructions[0].component.componentType;
                    grandparentComponentType = this._rootComponent;
                }
                // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.
                // If both exist, we throw. Otherwise, we prefer whichever exists.
                var childRouteExists = this.hasRoute(routeName, parentComponentType);
                var parentRouteExists = lang_1.isPresent(grandparentComponentType) &&
                    this.hasRoute(routeName, grandparentComponentType);
                if (parentRouteExists && childRouteExists) {
                    var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
                    throw new exceptions_1.BaseException(msg);
                }
                if (parentRouteExists) {
                    prevInstruction = ancestorInstructions.pop();
                }
            }
        }
        if (params[params.length - 1] == '') {
            params.pop();
        }
        if (params.length > 0 && params[0] == '') {
            params.shift();
        }
        if (params.length < 1) {
            var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
            throw new exceptions_1.BaseException(msg);
        }
        var generatedInstruction = this._generate(params, ancestorInstructions, prevInstruction, _aux, linkParams);
        // we don't clone the first (root) element
        for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
            var ancestorInstruction = ancestorInstructions[i];
            if (lang_1.isBlank(ancestorInstruction)) {
                break;
            }
            generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
        }
        return generatedInstruction;
    };
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL.
     * `ancestorInstructions` are parents that will be cloned.
     * `prevInstruction` is the existing instruction that would be replaced, but which might have
     * aux routes that need to be cloned.
     */
    RouteRegistry.prototype._generate = function (linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponentType = this._rootComponent;
        var componentInstruction = null;
        var auxInstructions = {};
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        if (lang_1.isPresent(parentInstruction) && lang_1.isPresent(parentInstruction.component)) {
            parentComponentType = parentInstruction.component.componentType;
        }
        if (linkParams.length == 0) {
            var defaultInstruction = this.generateDefault(parentComponentType);
            if (lang_1.isBlank(defaultInstruction)) {
                throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(_originalLink) + "\" does not resolve to a terminal instruction.");
            }
            return defaultInstruction;
        }
        // for non-aux routes, we want to reuse the predecessor's existing primary and aux routes
        // and only override routes for which the given link DSL provides
        if (lang_1.isPresent(prevInstruction) && !_aux) {
            auxInstructions = collection_1.StringMapWrapper.merge(prevInstruction.auxInstruction, auxInstructions);
            componentInstruction = prevInstruction.component;
        }
        var rules = this._rules.get(parentComponentType);
        if (lang_1.isBlank(rules)) {
            throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route config.");
        }
        var linkParamIndex = 0;
        var routeParams = {};
        // first, recognize the primary route if one is provided
        if (linkParamIndex < linkParams.length && lang_1.isString(linkParams[linkParamIndex])) {
            var routeName = linkParams[linkParamIndex];
            if (routeName == '' || routeName == '.' || routeName == '..') {
                throw new exceptions_1.BaseException("\"" + routeName + "/\" is only allowed at the beginning of a link DSL.");
            }
            linkParamIndex += 1;
            if (linkParamIndex < linkParams.length) {
                var linkParam = linkParams[linkParamIndex];
                if (lang_1.isStringMap(linkParam) && !lang_1.isArray(linkParam)) {
                    routeParams = linkParam;
                    linkParamIndex += 1;
                }
            }
            var routeRecognizer = (_aux ? rules.auxRulesByName : rules.rulesByName).get(routeName);
            if (lang_1.isBlank(routeRecognizer)) {
                throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route named \"" + routeName + "\".");
            }
            // Create an "unresolved instruction" for async routes
            // we'll figure out the rest of the route when we resolve the instruction and
            // perform a navigation
            if (lang_1.isBlank(routeRecognizer.handler.componentType)) {
                var generatedUrl = routeRecognizer.generateComponentPathValues(routeParams);
                return new instruction_1.UnresolvedInstruction(function () {
                    return routeRecognizer.handler.resolveComponentType().then(function (_) {
                        return _this._generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
                    });
                }, generatedUrl.urlPath, url_parser_1.convertUrlParamsToArray(generatedUrl.urlParams));
            }
            componentInstruction = _aux ? rules.generateAuxiliary(routeName, routeParams) :
                rules.generate(routeName, routeParams);
        }
        // Next, recognize auxiliary instructions.
        // If we have an ancestor instruction, we preserve whatever aux routes are active from it.
        while (linkParamIndex < linkParams.length && lang_1.isArray(linkParams[linkParamIndex])) {
            var auxParentInstruction = [parentInstruction];
            var auxInstruction = this._generate(linkParams[linkParamIndex], auxParentInstruction, null, true, _originalLink);
            // TODO: this will not work for aux routes with parameters or multiple segments
            auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
            linkParamIndex += 1;
        }
        var instruction = new instruction_1.ResolvedInstruction(componentInstruction, null, auxInstructions);
        // If the component is sync, we can generate resolved child route instructions
        // If not, we'll resolve the instructions at navigation time
        if (lang_1.isPresent(componentInstruction) && lang_1.isPresent(componentInstruction.componentType)) {
            var childInstruction = null;
            if (componentInstruction.terminal) {
                if (linkParamIndex >= linkParams.length) {
                }
            }
            else {
                var childAncestorComponents = ancestorInstructions.concat([instruction]);
                var remainingLinkParams = linkParams.slice(linkParamIndex);
                childInstruction = this._generate(remainingLinkParams, childAncestorComponents, null, false, _originalLink);
            }
            instruction.child = childInstruction;
        }
        return instruction;
    };
    RouteRegistry.prototype.hasRoute = function (name, parentComponent) {
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            return false;
        }
        return rules.hasRoute(name);
    };
    RouteRegistry.prototype.generateDefault = function (componentCursor) {
        var _this = this;
        if (lang_1.isBlank(componentCursor)) {
            return null;
        }
        var rules = this._rules.get(componentCursor);
        if (lang_1.isBlank(rules) || lang_1.isBlank(rules.defaultRule)) {
            return null;
        }
        var defaultChild = null;
        if (lang_1.isPresent(rules.defaultRule.handler.componentType)) {
            var componentInstruction = rules.defaultRule.generate({});
            if (!rules.defaultRule.terminal) {
                defaultChild = this.generateDefault(rules.defaultRule.handler.componentType);
            }
            return new instruction_1.DefaultInstruction(componentInstruction, defaultChild);
        }
        return new instruction_1.UnresolvedInstruction(function () {
            return rules.defaultRule.handler.resolveComponentType().then(function (_) { return _this.generateDefault(componentCursor); });
        });
    };
    RouteRegistry = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(exports.ROUTER_PRIMARY_COMPONENT)), 
        __metadata('design:paramtypes', [lang_1.Type])
    ], RouteRegistry);
    return RouteRegistry;
})();
exports.RouteRegistry = RouteRegistry;
/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
function splitAndFlattenLinkParams(linkParams) {
    var accumulation = [];
    linkParams.forEach(function (item) {
        if (lang_1.isString(item)) {
            var strItem = item;
            accumulation = accumulation.concat(strItem.split('/'));
        }
        else {
            accumulation.push(item);
        }
    });
    return accumulation;
}
/*
 * Given a list of instructions, returns the most specific instruction
 */
function mostSpecific(instructions) {
    instructions = instructions.filter(function (instruction) { return lang_1.isPresent(instruction); });
    if (instructions.length == 0) {
        return null;
    }
    if (instructions.length == 1) {
        return instructions[0];
    }
    var first = instructions[0];
    var rest = instructions.slice(1);
    return rest.reduce(function (instruction, contender) {
        if (compareSpecificityStrings(contender.specificity, instruction.specificity) == -1) {
            return contender;
        }
        return instruction;
    }, first);
}
/*
 * Expects strings to be in the form of "[0-2]+"
 * Returns -1 if string A should be sorted above string B, 1 if it should be sorted after,
 * or 0 if they are the same.
 */
function compareSpecificityStrings(a, b) {
    var l = lang_1.Math.min(a.length, b.length);
    for (var i = 0; i < l; i += 1) {
        var ai = lang_1.StringWrapper.charCodeAt(a, i);
        var bi = lang_1.StringWrapper.charCodeAt(b, i);
        var difference = bi - ai;
        if (difference != 0) {
            return difference;
        }
    }
    return a.length - b.length;
}
function assertTerminalComponent(component, path) {
    if (!lang_1.isType(component)) {
        return;
    }
    var annotations = reflection_1.reflector.annotations(component);
    if (lang_1.isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof route_config_impl_1.RouteConfig) {
                throw new exceptions_1.BaseException("Child routes are not allowed for \"" + path + "\". Use \"...\" on the parent's route path.");
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJjb21wYXJlU3BlY2lmaWNpdHlTdHJpbmdzIiwiYXNzZXJ0VGVybWluYWxDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHNCQUE2QiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3pELHFCQVlPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUscUJBQThDLGVBQWUsQ0FBQyxDQUFBO0FBRTlELGtDQU9PLGtDQUFrQyxDQUFDLENBQUE7QUFDMUMsc0JBQW1ELGVBQWUsQ0FBQyxDQUFBO0FBQ25FLHlCQUFzQixrQkFBa0IsQ0FBQyxDQUFBO0FBQ3pDLDRCQU1PLGVBQWUsQ0FBQyxDQUFBO0FBRXZCLHdDQUEwRCx3Q0FBd0MsQ0FBQyxDQUFBO0FBQ25HLDJCQUFzRSxjQUFjLENBQUMsQ0FBQTtBQUdyRixJQUFJ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Q0E7WUFDM0ZBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQXJyYXksXG4gIGlzQmxhbmssXG4gIGlzVHlwZSxcbiAgaXNTdHJpbmcsXG4gIGlzU3RyaW5nTWFwLFxuICBUeXBlLFxuICBTdHJpbmdXcmFwcGVyLFxuICBNYXRoLFxuICBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyxcbiAgQ09OU1RfRVhQUlxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBSb3V0ZUNvbmZpZyxcbiAgQXN5bmNSb3V0ZSxcbiAgUm91dGUsXG4gIEF1eFJvdXRlLFxuICBSZWRpcmVjdCxcbiAgUm91dGVEZWZpbml0aW9uXG59IGZyb20gJy4vcm91dGVfY29uZmlnL3JvdXRlX2NvbmZpZ19pbXBsJztcbmltcG9ydCB7UGF0aE1hdGNoLCBSZWRpcmVjdE1hdGNoLCBSb3V0ZU1hdGNofSBmcm9tICcuL3J1bGVzL3J1bGVzJztcbmltcG9ydCB7UnVsZVNldH0gZnJvbSAnLi9ydWxlcy9ydWxlX3NldCc7XG5pbXBvcnQge1xuICBJbnN0cnVjdGlvbixcbiAgUmVzb2x2ZWRJbnN0cnVjdGlvbixcbiAgUmVkaXJlY3RJbnN0cnVjdGlvbixcbiAgVW5yZXNvbHZlZEluc3RydWN0aW9uLFxuICBEZWZhdWx0SW5zdHJ1Y3Rpb25cbn0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5cbmltcG9ydCB7bm9ybWFsaXplUm91dGVDb25maWcsIGFzc2VydENvbXBvbmVudEV4aXN0c30gZnJvbSAnLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtwYXJzZXIsIFVybCwgY29udmVydFVybFBhcmFtc1RvQXJyYXksIHBhdGhTZWdtZW50c1RvVXJsfSBmcm9tICcuL3VybF9wYXJzZXInO1xuaW1wb3J0IHtHZW5lcmF0ZWRVcmx9IGZyb20gJy4vcnVsZXMvcm91dGVfcGF0aHMvcm91dGVfcGF0aCc7XG5cbnZhciBfcmVzb2x2ZVRvTnVsbCA9IFByb21pc2VXcmFwcGVyLnJlc29sdmU8SW5zdHJ1Y3Rpb24+KG51bGwpO1xuXG4vLyBBIExpbmtJdGVtQXJyYXkgaXMgYW4gYXJyYXksIHdoaWNoIGRlc2NyaWJlcyBhIHNldCBvZiByb3V0ZXNcbi8vIFRoZSBpdGVtcyBpbiB0aGUgYXJyYXkgYXJlIGZvdW5kIGluIGdyb3Vwczpcbi8vIC0gdGhlIGZpcnN0IGl0ZW0gaXMgdGhlIG5hbWUgb2YgdGhlIHJvdXRlXG4vLyAtIHRoZSBuZXh0IGl0ZW1zIGFyZTpcbi8vICAgLSBhbiBvYmplY3QgY29udGFpbmluZyBwYXJhbWV0ZXJzXG4vLyAgIC0gb3IgYW4gYXJyYXkgZGVzY3JpYmluZyBhbiBhdXggcm91dGVcbi8vIGV4cG9ydCB0eXBlIExpbmtSb3V0ZUl0ZW0gPSBzdHJpbmcgfCBPYmplY3Q7XG4vLyBleHBvcnQgdHlwZSBMaW5rSXRlbSA9IExpbmtSb3V0ZUl0ZW0gfCBBcnJheTxMaW5rUm91dGVJdGVtPjtcbi8vIGV4cG9ydCB0eXBlIExpbmtJdGVtQXJyYXkgPSBBcnJheTxMaW5rSXRlbT47XG5cbi8qKlxuICogVG9rZW4gdXNlZCB0byBiaW5kIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgdG9wLWxldmVsIHtAbGluayBSb3V0ZUNvbmZpZ31zIGZvciB0aGVcbiAqIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UOiBPcGFxdWVUb2tlbiA9XG4gICAgQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ1JvdXRlclByaW1hcnlDb21wb25lbnQnKSk7XG5cblxuLyoqXG4gKiBUaGUgUm91dGVSZWdpc3RyeSBob2xkcyByb3V0ZSBjb25maWd1cmF0aW9ucyBmb3IgZWFjaCBjb21wb25lbnQgaW4gYW4gQW5ndWxhciBhcHAuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgSW5zdHJ1Y3Rpb25zIGZyb20gVVJMcywgYW5kIGdlbmVyYXRpbmcgVVJMcyBiYXNlZCBvbiByb3V0ZSBhbmRcbiAqIHBhcmFtZXRlcnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfcnVsZXMgPSBuZXcgTWFwPGFueSwgUnVsZVNldD4oKTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpdmF0ZSBfcm9vdENvbXBvbmVudDogVHlwZSkge31cblxuICAvKipcbiAgICogR2l2ZW4gYSBjb21wb25lbnQgYW5kIGEgY29uZmlndXJhdGlvbiBvYmplY3QsIGFkZCB0aGUgcm91dGUgdG8gdGhpcyByZWdpc3RyeVxuICAgKi9cbiAgY29uZmlnKHBhcmVudENvbXBvbmVudDogYW55LCBjb25maWc6IFJvdXRlRGVmaW5pdGlvbik6IHZvaWQge1xuICAgIGNvbmZpZyA9IG5vcm1hbGl6ZVJvdXRlQ29uZmlnKGNvbmZpZywgdGhpcyk7XG5cbiAgICAvLyB0aGlzIGlzIGhlcmUgYmVjYXVzZSBEYXJ0IHR5cGUgZ3VhcmQgcmVhc29uc1xuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50RXhpc3RzKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEF1eFJvdXRlKSB7XG4gICAgICBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgIH1cblxuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICBydWxlcyA9IG5ldyBSdWxlU2V0KCk7XG4gICAgICB0aGlzLl9ydWxlcy5zZXQocGFyZW50Q29tcG9uZW50LCBydWxlcyk7XG4gICAgfVxuXG4gICAgdmFyIHRlcm1pbmFsID0gcnVsZXMuY29uZmlnKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGlmICh0ZXJtaW5hbCkge1xuICAgICAgICBhc3NlcnRUZXJtaW5hbENvbXBvbmVudChjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbmZpZ0Zyb21Db21wb25lbnQoY29uZmlnLmNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBhbm5vdGF0aW9ucyBvZiBhIGNvbXBvbmVudCBhbmQgY29uZmlndXJlcyB0aGUgcmVnaXN0cnkgYmFzZWQgb24gdGhlbVxuICAgKi9cbiAgY29uZmlnRnJvbUNvbXBvbmVudChjb21wb25lbnQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNUeXBlKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEb24ndCByZWFkIHRoZSBhbm5vdGF0aW9ucyBmcm9tIGEgdHlwZSBtb3JlIHRoYW4gb25jZSDigJNcbiAgICAvLyB0aGlzIHByZXZlbnRzIGFuIGluZmluaXRlIGxvb3AgaWYgYSBjb21wb25lbnQgcm91dGVzIHJlY3Vyc2l2ZWx5LlxuICAgIGlmICh0aGlzLl9ydWxlcy5oYXMoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYW5ub3RhdGlvbnMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2ldO1xuXG4gICAgICAgIGlmIChhbm5vdGF0aW9uIGluc3RhbmNlb2YgUm91dGVDb25maWcpIHtcbiAgICAgICAgICBsZXQgcm91dGVDZmdzOiBSb3V0ZURlZmluaXRpb25bXSA9IGFubm90YXRpb24uY29uZmlncztcbiAgICAgICAgICByb3V0ZUNmZ3MuZm9yRWFjaChjb25maWcgPT4gdGhpcy5jb25maWcoY29tcG9uZW50LCBjb25maWcpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgVVJMIGFuZCBhIHBhcmVudCBjb21wb25lbnQsIHJldHVybiB0aGUgbW9zdCBzcGVjaWZpYyBpbnN0cnVjdGlvbiBmb3IgbmF2aWdhdGluZ1xuICAgKiB0aGUgYXBwbGljYXRpb24gaW50byB0aGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSB1cmxcbiAgICovXG4gIHJlY29nbml6ZSh1cmw6IHN0cmluZywgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIHBhcnNlZFVybCA9IHBhcnNlci5wYXJzZSh1cmwpO1xuICAgIHJldHVybiB0aGlzLl9yZWNvZ25pemUocGFyc2VkVXJsLCBbXSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWNvZ25pemVzIGFsbCBwYXJlbnQtY2hpbGQgcm91dGVzLCBidXQgY3JlYXRlcyB1bnJlc29sdmVkIGF1eGlsaWFyeSByb3V0ZXNcbiAgICovXG4gIHByaXZhdGUgX3JlY29nbml6ZShwYXJzZWRVcmw6IFVybCwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sXG4gICAgICAgICAgICAgICAgICAgICBfYXV4ID0gZmFsc2UpOiBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIHBhcmVudEluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgdmFyIHBhcmVudENvbXBvbmVudCA9IGlzUHJlc2VudChwYXJlbnRJbnN0cnVjdGlvbikgPyBwYXJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yb290Q29tcG9uZW50O1xuXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb051bGw7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2hlcyBzb21lIGJlZ2lubmluZyBwYXJ0IG9mIHRoZSBnaXZlbiBVUkxcbiAgICB2YXIgcG9zc2libGVNYXRjaGVzOiBQcm9taXNlPFJvdXRlTWF0Y2g+W10gPVxuICAgICAgICBfYXV4ID8gcnVsZXMucmVjb2duaXplQXV4aWxpYXJ5KHBhcnNlZFVybCkgOiBydWxlcy5yZWNvZ25pemUocGFyc2VkVXJsKTtcblxuICAgIHZhciBtYXRjaFByb21pc2VzOiBQcm9taXNlPEluc3RydWN0aW9uPltdID0gcG9zc2libGVNYXRjaGVzLm1hcChcbiAgICAgICAgKGNhbmRpZGF0ZTogUHJvbWlzZTxSb3V0ZU1hdGNoPikgPT4gY2FuZGlkYXRlLnRoZW4oKGNhbmRpZGF0ZTogUm91dGVNYXRjaCkgPT4ge1xuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFBhdGhNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGF1eFBhcmVudEluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSA9XG4gICAgICAgICAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/IFtMaXN0V3JhcHBlci5sYXN0KGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKV0gOiBbXTtcbiAgICAgICAgICAgIHZhciBhdXhJbnN0cnVjdGlvbnMgPVxuICAgICAgICAgICAgICAgIHRoaXMuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZChjYW5kaWRhdGUucmVtYWluaW5nQXV4LCBhdXhQYXJlbnRJbnN0cnVjdGlvbnMpO1xuXG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbihjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmIChpc0JsYW5rKGNhbmRpZGF0ZS5pbnN0cnVjdGlvbikgfHwgY2FuZGlkYXRlLmluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5ld0FuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjb2duaXplKGNhbmRpZGF0ZS5yZW1haW5pbmcsIG5ld0FuY2VzdG9ySW5zdHJ1Y3Rpb25zKVxuICAgICAgICAgICAgICAgIC50aGVuKChjaGlsZEluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNCbGFuayhjaGlsZEluc3RydWN0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gcmVkaXJlY3QgaW5zdHJ1Y3Rpb25zIGFyZSBhbHJlYWR5IGFic29sdXRlXG4gICAgICAgICAgICAgICAgICBpZiAoY2hpbGRJbnN0cnVjdGlvbiBpbnN0YW5jZW9mIFJlZGlyZWN0SW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbi5jaGlsZCA9IGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFJlZGlyZWN0TWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbnN0cnVjdGlvbiA9XG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZShjYW5kaWRhdGUucmVkaXJlY3RUbywgYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtudWxsXSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWRpcmVjdEluc3RydWN0aW9uKGluc3RydWN0aW9uLmNvbXBvbmVudCwgaW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24sIGNhbmRpZGF0ZS5zcGVjaWZpY2l0eSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICBpZiAoKGlzQmxhbmsocGFyc2VkVXJsKSB8fCBwYXJzZWRVcmwucGF0aCA9PSAnJykgJiYgcG9zc2libGVNYXRjaGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmdlbmVyYXRlRGVmYXVsdChwYXJlbnRDb21wb25lbnQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsPEluc3RydWN0aW9uPihtYXRjaFByb21pc2VzKS50aGVuKG1vc3RTcGVjaWZpYyk7XG4gIH1cblxuICBwcml2YXRlIF9hdXhSb3V0ZXNUb1VucmVzb2x2ZWQoYXV4Um91dGVzOiBVcmxbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0ge1xuICAgIHZhciB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgICBhdXhSb3V0ZXMuZm9yRWFjaCgoYXV4VXJsOiBVcmwpID0+IHtcbiAgICAgIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnNbYXV4VXJsLnBhdGhdID0gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbihcbiAgICAgICAgICAoKSA9PiB7IHJldHVybiB0aGlzLl9yZWNvZ25pemUoYXV4VXJsLCBwYXJlbnRJbnN0cnVjdGlvbnMsIHRydWUpOyB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBub3JtYWxpemVkIGxpc3Qgd2l0aCBjb21wb25lbnQgbmFtZXMgYW5kIHBhcmFtcyBsaWtlOiBgWyd1c2VyJywge2lkOiAzIH1dYFxuICAgKiBnZW5lcmF0ZXMgYSB1cmwgd2l0aCBhIGxlYWRpbmcgc2xhc2ggcmVsYXRpdmUgdG8gdGhlIHByb3ZpZGVkIGBwYXJlbnRDb21wb25lbnRgLlxuICAgKlxuICAgKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW0gYF9hdXhgIGlzIGB0cnVlYCwgdGhlbiB3ZSBnZW5lcmF0ZSBzdGFydGluZyBhdCBhbiBhdXhpbGlhcnlcbiAgICogcm91dGUgYm91bmRhcnkuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sIF9hdXggPSBmYWxzZSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgcGFyYW1zID0gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zKTtcbiAgICB2YXIgcHJldkluc3RydWN0aW9uO1xuXG4gICAgLy8gVGhlIGZpcnN0IHNlZ21lbnQgc2hvdWxkIGJlIGVpdGhlciAnLicgKGdlbmVyYXRlIGZyb20gcGFyZW50KSBvciAnJyAoZ2VuZXJhdGUgZnJvbSByb290KS5cbiAgICAvLyBXaGVuIHdlIG5vcm1hbGl6ZSBhYm92ZSwgd2Ugc3RyaXAgYWxsIHRoZSBzbGFzaGVzLCAnLi8nIGJlY29tZXMgJy4nIGFuZCAnLycgYmVjb21lcyAnJy5cbiAgICBpZiAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnJykge1xuICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBMaXN0V3JhcHBlci5maXJzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgICBhbmNlc3Rvckluc3RydWN0aW9ucyA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID8gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCkgOiBudWxsO1xuXG4gICAgICBpZiAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnLicpIHtcbiAgICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgICB9IGVsc2UgaWYgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJy4uJykge1xuICAgICAgICB3aGlsZSAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnLi4nKSB7XG4gICAgICAgICAgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGhhcyB0b28gbWFueSBcIi4uL1wiIHNlZ21lbnRzLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgICAgICBwYXJhbXMgPSBMaXN0V3JhcHBlci5zbGljZShwYXJhbXMsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UncmUgb24gdG8gaW1wbGljaXQgY2hpbGQvc2libGluZyByb3V0ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UgbXVzdCBvbmx5IHBlYWsgYXQgdGhlIGxpbmsgcGFyYW0sIGFuZCBub3QgY29uc3VtZSBpdFxuICAgICAgICBsZXQgcm91dGVOYW1lID0gTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKTtcbiAgICAgICAgbGV0IHBhcmVudENvbXBvbmVudFR5cGUgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgICBsZXQgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gbnVsbDtcblxuICAgICAgICBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGxldCBwYXJlbnRDb21wb25lbnRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgIGxldCBncmFuZENvbXBvbmVudEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMl07XG5cbiAgICAgICAgICBwYXJlbnRDb21wb25lbnRUeXBlID0gcGFyZW50Q29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgICAgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gZ3JhbmRDb21wb25lbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgfSBlbHNlIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIHBhcmVudENvbXBvbmVudFR5cGUgPSBhbmNlc3Rvckluc3RydWN0aW9uc1swXS5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgICBncmFuZHBhcmVudENvbXBvbmVudFR5cGUgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9yIGEgbGluayB3aXRoIG5vIGxlYWRpbmcgYC4vYCwgYC9gLCBvciBgLi4vYCwgd2UgbG9vayBmb3IgYSBzaWJsaW5nIGFuZCBjaGlsZC5cbiAgICAgICAgLy8gSWYgYm90aCBleGlzdCwgd2UgdGhyb3cuIE90aGVyd2lzZSwgd2UgcHJlZmVyIHdoaWNoZXZlciBleGlzdHMuXG4gICAgICAgIHZhciBjaGlsZFJvdXRlRXhpc3RzID0gdGhpcy5oYXNSb3V0ZShyb3V0ZU5hbWUsIHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgICAgICB2YXIgcGFyZW50Um91dGVFeGlzdHMgPSBpc1ByZXNlbnQoZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc1JvdXRlKHJvdXRlTmFtZSwgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlKTtcblxuICAgICAgICBpZiAocGFyZW50Um91dGVFeGlzdHMgJiYgY2hpbGRSb3V0ZUV4aXN0cykge1xuICAgICAgICAgIGxldCBtc2cgPVxuICAgICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGlzIGFtYmlndW91cywgdXNlIFwiLi9cIiBvciBcIi4uL1wiIHRvIGRpc2FtYmlndWF0ZS5gO1xuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKG1zZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyZW50Um91dGVFeGlzdHMpIHtcbiAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJhbXNbcGFyYW1zLmxlbmd0aCAtIDFdID09ICcnKSB7XG4gICAgICBwYXJhbXMucG9wKCk7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5sZW5ndGggPiAwICYmIHBhcmFtc1swXSA9PSAnJykge1xuICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5sZW5ndGggPCAxKSB7XG4gICAgICBsZXQgbXNnID0gYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBtdXN0IGluY2x1ZGUgYSByb3V0ZSBuYW1lLmA7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihtc2cpO1xuICAgIH1cblxuICAgIHZhciBnZW5lcmF0ZWRJbnN0cnVjdGlvbiA9XG4gICAgICAgIHRoaXMuX2dlbmVyYXRlKHBhcmFtcywgYW5jZXN0b3JJbnN0cnVjdGlvbnMsIHByZXZJbnN0cnVjdGlvbiwgX2F1eCwgbGlua1BhcmFtcyk7XG5cbiAgICAvLyB3ZSBkb24ndCBjbG9uZSB0aGUgZmlyc3QgKHJvb3QpIGVsZW1lbnRcbiAgICBmb3IgKHZhciBpID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBhbmNlc3Rvckluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbaV07XG4gICAgICBpZiAoaXNCbGFuayhhbmNlc3Rvckluc3RydWN0aW9uKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGdlbmVyYXRlZEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbi5yZXBsYWNlQ2hpbGQoZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBnZW5lcmF0ZWRJbnN0cnVjdGlvbjtcbiAgfVxuXG5cbiAgLypcbiAgICogSW50ZXJuYWwgaGVscGVyIHRoYXQgZG9lcyBub3QgbWFrZSBhbnkgYXNzZXJ0aW9ucyBhYm91dCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5rIERTTC5cbiAgICogYGFuY2VzdG9ySW5zdHJ1Y3Rpb25zYCBhcmUgcGFyZW50cyB0aGF0IHdpbGwgYmUgY2xvbmVkLlxuICAgKiBgcHJldkluc3RydWN0aW9uYCBpcyB0aGUgZXhpc3RpbmcgaW5zdHJ1Y3Rpb24gdGhhdCB3b3VsZCBiZSByZXBsYWNlZCwgYnV0IHdoaWNoIG1pZ2h0IGhhdmVcbiAgICogYXV4IHJvdXRlcyB0aGF0IG5lZWQgdG8gYmUgY2xvbmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2VuZXJhdGUobGlua1BhcmFtczogYW55W10sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfYXV4ID0gZmFsc2UsIF9vcmlnaW5hbExpbms6IGFueVtdKTogSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBwYXJlbnRDb21wb25lbnRUeXBlID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICBsZXQgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGxldCBhdXhJbnN0cnVjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0gPSB7fTtcblxuICAgIGxldCBwYXJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBMaXN0V3JhcHBlci5sYXN0KGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudEluc3RydWN0aW9uKSAmJiBpc1ByZXNlbnQocGFyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgcGFyZW50Q29tcG9uZW50VHlwZSA9IHBhcmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgIH1cblxuICAgIGlmIChsaW5rUGFyYW1zLmxlbmd0aCA9PSAwKSB7XG4gICAgICBsZXQgZGVmYXVsdEluc3RydWN0aW9uID0gdGhpcy5nZW5lcmF0ZURlZmF1bHQocGFyZW50Q29tcG9uZW50VHlwZSk7XG4gICAgICBpZiAoaXNCbGFuayhkZWZhdWx0SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihfb3JpZ2luYWxMaW5rKX1cIiBkb2VzIG5vdCByZXNvbHZlIHRvIGEgdGVybWluYWwgaW5zdHJ1Y3Rpb24uYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmYXVsdEluc3RydWN0aW9uO1xuICAgIH1cblxuICAgIC8vIGZvciBub24tYXV4IHJvdXRlcywgd2Ugd2FudCB0byByZXVzZSB0aGUgcHJlZGVjZXNzb3IncyBleGlzdGluZyBwcmltYXJ5IGFuZCBhdXggcm91dGVzXG4gICAgLy8gYW5kIG9ubHkgb3ZlcnJpZGUgcm91dGVzIGZvciB3aGljaCB0aGUgZ2l2ZW4gbGluayBEU0wgcHJvdmlkZXNcbiAgICBpZiAoaXNQcmVzZW50KHByZXZJbnN0cnVjdGlvbikgJiYgIV9hdXgpIHtcbiAgICAgIGF1eEluc3RydWN0aW9ucyA9IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UocHJldkluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLCBhdXhJbnN0cnVjdGlvbnMpO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBwcmV2SW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgIH1cblxuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnRUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhydWxlcykpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBDb21wb25lbnQgXCIke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHBhcmVudENvbXBvbmVudFR5cGUpfVwiIGhhcyBubyByb3V0ZSBjb25maWcuYCk7XG4gICAgfVxuXG4gICAgbGV0IGxpbmtQYXJhbUluZGV4ID0gMDtcbiAgICBsZXQgcm91dGVQYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG5cbiAgICAvLyBmaXJzdCwgcmVjb2duaXplIHRoZSBwcmltYXJ5IHJvdXRlIGlmIG9uZSBpcyBwcm92aWRlZFxuICAgIGlmIChsaW5rUGFyYW1JbmRleCA8IGxpbmtQYXJhbXMubGVuZ3RoICYmIGlzU3RyaW5nKGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdKSkge1xuICAgICAgbGV0IHJvdXRlTmFtZSA9IGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdO1xuICAgICAgaWYgKHJvdXRlTmFtZSA9PSAnJyB8fCByb3V0ZU5hbWUgPT0gJy4nIHx8IHJvdXRlTmFtZSA9PSAnLi4nKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBcIiR7cm91dGVOYW1lfS9cIiBpcyBvbmx5IGFsbG93ZWQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmsgRFNMLmApO1xuICAgICAgfVxuICAgICAgbGlua1BhcmFtSW5kZXggKz0gMTtcbiAgICAgIGlmIChsaW5rUGFyYW1JbmRleCA8IGxpbmtQYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBsaW5rUGFyYW0gPSBsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XTtcbiAgICAgICAgaWYgKGlzU3RyaW5nTWFwKGxpbmtQYXJhbSkgJiYgIWlzQXJyYXkobGlua1BhcmFtKSkge1xuICAgICAgICAgIHJvdXRlUGFyYW1zID0gbGlua1BhcmFtO1xuICAgICAgICAgIGxpbmtQYXJhbUluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByb3V0ZVJlY29nbml6ZXIgPSAoX2F1eCA/IHJ1bGVzLmF1eFJ1bGVzQnlOYW1lIDogcnVsZXMucnVsZXNCeU5hbWUpLmdldChyb3V0ZU5hbWUpO1xuXG4gICAgICBpZiAoaXNCbGFuayhyb3V0ZVJlY29nbml6ZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYENvbXBvbmVudCBcIiR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcocGFyZW50Q29tcG9uZW50VHlwZSl9XCIgaGFzIG5vIHJvdXRlIG5hbWVkIFwiJHtyb3V0ZU5hbWV9XCIuYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhbiBcInVucmVzb2x2ZWQgaW5zdHJ1Y3Rpb25cIiBmb3IgYXN5bmMgcm91dGVzXG4gICAgICAvLyB3ZSdsbCBmaWd1cmUgb3V0IHRoZSByZXN0IG9mIHRoZSByb3V0ZSB3aGVuIHdlIHJlc29sdmUgdGhlIGluc3RydWN0aW9uIGFuZFxuICAgICAgLy8gcGVyZm9ybSBhIG5hdmlnYXRpb25cbiAgICAgIGlmIChpc0JsYW5rKHJvdXRlUmVjb2duaXplci5oYW5kbGVyLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgIHZhciBnZW5lcmF0ZWRVcmw6IEdlbmVyYXRlZFVybCA9IHJvdXRlUmVjb2duaXplci5nZW5lcmF0ZUNvbXBvbmVudFBhdGhWYWx1ZXMocm91dGVQYXJhbXMpO1xuICAgICAgICByZXR1cm4gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJvdXRlUmVjb2duaXplci5oYW5kbGVyLnJlc29sdmVDb21wb25lbnRUeXBlKCkudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLCBwcmV2SW5zdHJ1Y3Rpb24sIF9hdXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX29yaWdpbmFsTGluayk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGdlbmVyYXRlZFVybC51cmxQYXRoLCBjb252ZXJ0VXJsUGFyYW1zVG9BcnJheShnZW5lcmF0ZWRVcmwudXJsUGFyYW1zKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gX2F1eCA/IHJ1bGVzLmdlbmVyYXRlQXV4aWxpYXJ5KHJvdXRlTmFtZSwgcm91dGVQYXJhbXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVzLmdlbmVyYXRlKHJvdXRlTmFtZSwgcm91dGVQYXJhbXMpO1xuICAgIH1cblxuICAgIC8vIE5leHQsIHJlY29nbml6ZSBhdXhpbGlhcnkgaW5zdHJ1Y3Rpb25zLlxuICAgIC8vIElmIHdlIGhhdmUgYW4gYW5jZXN0b3IgaW5zdHJ1Y3Rpb24sIHdlIHByZXNlcnZlIHdoYXRldmVyIGF1eCByb3V0ZXMgYXJlIGFjdGl2ZSBmcm9tIGl0LlxuICAgIHdoaWxlIChsaW5rUGFyYW1JbmRleCA8IGxpbmtQYXJhbXMubGVuZ3RoICYmIGlzQXJyYXkobGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF0pKSB7XG4gICAgICBsZXQgYXV4UGFyZW50SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uW10gPSBbcGFyZW50SW5zdHJ1Y3Rpb25dO1xuICAgICAgbGV0IGF1eEluc3RydWN0aW9uID0gdGhpcy5fZ2VuZXJhdGUobGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF0sIGF1eFBhcmVudEluc3RydWN0aW9uLCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSwgX29yaWdpbmFsTGluayk7XG5cbiAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBub3Qgd29yayBmb3IgYXV4IHJvdXRlcyB3aXRoIHBhcmFtZXRlcnMgb3IgbXVsdGlwbGUgc2VnbWVudHNcbiAgICAgIGF1eEluc3RydWN0aW9uc1thdXhJbnN0cnVjdGlvbi5jb21wb25lbnQudXJsUGF0aF0gPSBhdXhJbnN0cnVjdGlvbjtcbiAgICAgIGxpbmtQYXJhbUluZGV4ICs9IDE7XG4gICAgfVxuXG4gICAgdmFyIGluc3RydWN0aW9uID0gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAvLyBJZiB0aGUgY29tcG9uZW50IGlzIHN5bmMsIHdlIGNhbiBnZW5lcmF0ZSByZXNvbHZlZCBjaGlsZCByb3V0ZSBpbnN0cnVjdGlvbnNcbiAgICAvLyBJZiBub3QsIHdlJ2xsIHJlc29sdmUgdGhlIGluc3RydWN0aW9ucyBhdCBuYXZpZ2F0aW9uIHRpbWVcbiAgICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudEluc3RydWN0aW9uKSAmJiBpc1ByZXNlbnQoY29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIGxldCBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24udGVybWluYWwpIHtcbiAgICAgICAgaWYgKGxpbmtQYXJhbUluZGV4ID49IGxpbmtQYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gVE9ETzogdGhyb3cgdGhhdCB0aGVyZSBhcmUgZXh0cmEgbGluayBwYXJhbXMgYmV5b25kIHRoZSB0ZXJtaW5hbCBjb21wb25lbnRcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNoaWxkQW5jZXN0b3JDb21wb25lbnRzOiBJbnN0cnVjdGlvbltdID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuICAgICAgICBsZXQgcmVtYWluaW5nTGlua1BhcmFtcyA9IGxpbmtQYXJhbXMuc2xpY2UobGlua1BhcmFtSW5kZXgpO1xuICAgICAgICBjaGlsZEluc3RydWN0aW9uID0gdGhpcy5fZ2VuZXJhdGUocmVtYWluaW5nTGlua1BhcmFtcywgY2hpbGRBbmNlc3RvckNvbXBvbmVudHMsIG51bGwsIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX29yaWdpbmFsTGluayk7XG4gICAgICB9XG4gICAgICBpbnN0cnVjdGlvbi5jaGlsZCA9IGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICB9XG5cbiAgcHVibGljIGhhc1JvdXRlKG5hbWU6IHN0cmluZywgcGFyZW50Q29tcG9uZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcbiAgICBpZiAoaXNCbGFuayhydWxlcykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHJ1bGVzLmhhc1JvdXRlKG5hbWUpO1xuICB9XG5cbiAgcHVibGljIGdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3I6IFR5cGUpOiBJbnN0cnVjdGlvbiB7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50Q3Vyc29yKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KGNvbXBvbmVudEN1cnNvcik7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpIHx8IGlzQmxhbmsocnVsZXMuZGVmYXVsdFJ1bGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdENoaWxkID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KHJ1bGVzLmRlZmF1bHRSdWxlLmhhbmRsZXIuY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbiA9IHJ1bGVzLmRlZmF1bHRSdWxlLmdlbmVyYXRlKHt9KTtcbiAgICAgIGlmICghcnVsZXMuZGVmYXVsdFJ1bGUudGVybWluYWwpIHtcbiAgICAgICAgZGVmYXVsdENoaWxkID0gdGhpcy5nZW5lcmF0ZURlZmF1bHQocnVsZXMuZGVmYXVsdFJ1bGUuaGFuZGxlci5jb21wb25lbnRUeXBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRGVmYXVsdEluc3RydWN0aW9uKGNvbXBvbmVudEluc3RydWN0aW9uLCBkZWZhdWx0Q2hpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgVW5yZXNvbHZlZEluc3RydWN0aW9uKCgpID0+IHtcbiAgICAgIHJldHVybiBydWxlcy5kZWZhdWx0UnVsZS5oYW5kbGVyLnJlc29sdmVDb21wb25lbnRUeXBlKCkudGhlbihcbiAgICAgICAgICAoXykgPT4gdGhpcy5nZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50Q3Vyc29yKSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLypcbiAqIEdpdmVuOiBbJy9hL2InLCB7YzogMn1dXG4gKiBSZXR1cm5zOiBbJycsICdhJywgJ2InLCB7YzogMn1dXG4gKi9cbmZ1bmN0aW9uIHNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMobGlua1BhcmFtczogYW55W10pIHtcbiAgdmFyIGFjY3VtdWxhdGlvbiA9IFtdO1xuICBsaW5rUGFyYW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbTogYW55KSB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICB2YXIgc3RySXRlbTogc3RyaW5nID0gPHN0cmluZz5pdGVtO1xuICAgICAgYWNjdW11bGF0aW9uID0gYWNjdW11bGF0aW9uLmNvbmNhdChzdHJJdGVtLnNwbGl0KCcvJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY2N1bXVsYXRpb24ucHVzaChpdGVtKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYWNjdW11bGF0aW9uO1xufVxuXG5cbi8qXG4gKiBHaXZlbiBhIGxpc3Qgb2YgaW5zdHJ1Y3Rpb25zLCByZXR1cm5zIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uXG4gKi9cbmZ1bmN0aW9uIG1vc3RTcGVjaWZpYyhpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBJbnN0cnVjdGlvbiB7XG4gIGluc3RydWN0aW9ucyA9IGluc3RydWN0aW9ucy5maWx0ZXIoKGluc3RydWN0aW9uKSA9PiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKTtcbiAgaWYgKGluc3RydWN0aW9ucy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChpbnN0cnVjdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zWzBdO1xuICB9XG4gIHZhciBmaXJzdCA9IGluc3RydWN0aW9uc1swXTtcbiAgdmFyIHJlc3QgPSBpbnN0cnVjdGlvbnMuc2xpY2UoMSk7XG4gIHJldHVybiByZXN0LnJlZHVjZSgoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBjb250ZW5kZXI6IEluc3RydWN0aW9uKSA9PiB7XG4gICAgaWYgKGNvbXBhcmVTcGVjaWZpY2l0eVN0cmluZ3MoY29udGVuZGVyLnNwZWNpZmljaXR5LCBpbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSkgPT0gLTEpIHtcbiAgICAgIHJldHVybiBjb250ZW5kZXI7XG4gICAgfVxuICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgfSwgZmlyc3QpO1xufVxuXG4vKlxuICogRXhwZWN0cyBzdHJpbmdzIHRvIGJlIGluIHRoZSBmb3JtIG9mIFwiWzAtMl0rXCJcbiAqIFJldHVybnMgLTEgaWYgc3RyaW5nIEEgc2hvdWxkIGJlIHNvcnRlZCBhYm92ZSBzdHJpbmcgQiwgMSBpZiBpdCBzaG91bGQgYmUgc29ydGVkIGFmdGVyLFxuICogb3IgMCBpZiB0aGV5IGFyZSB0aGUgc2FtZS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNwZWNpZmljaXR5U3RyaW5ncyhhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIHZhciBsID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcbiAgICB2YXIgYWkgPSBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoYSwgaSk7XG4gICAgdmFyIGJpID0gU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGIsIGkpO1xuICAgIHZhciBkaWZmZXJlbmNlID0gYmkgLSBhaTtcbiAgICBpZiAoZGlmZmVyZW5jZSAhPSAwKSB7XG4gICAgICByZXR1cm4gZGlmZmVyZW5jZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbXBvbmVudCwgcGF0aCkge1xuICBpZiAoIWlzVHlwZShjb21wb25lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGFubm90YXRpb25zID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCk7XG4gIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1tpXTtcblxuICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBSb3V0ZUNvbmZpZykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDaGlsZCByb3V0ZXMgYXJlIG5vdCBhbGxvd2VkIGZvciBcIiR7cGF0aH1cIi4gVXNlIFwiLi4uXCIgb24gdGhlIHBhcmVudCdzIHJvdXRlIHBhdGguYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=