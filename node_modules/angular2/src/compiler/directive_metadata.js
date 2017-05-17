'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var view_1 = require('angular2/src/core/metadata/view');
var selector_1 = require('angular2/src/compiler/selector');
var util_1 = require('./util');
var interfaces_1 = require('angular2/src/core/linker/interfaces');
// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;
var CompileMetadataWithIdentifier = (function () {
    function CompileMetadataWithIdentifier() {
    }
    CompileMetadataWithIdentifier.fromJson = function (data) {
        return _COMPILE_METADATA_FROM_JSON[data['class']](data);
    };
    Object.defineProperty(CompileMetadataWithIdentifier.prototype, "identifier", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return CompileMetadataWithIdentifier;
})();
exports.CompileMetadataWithIdentifier = CompileMetadataWithIdentifier;
var CompileMetadataWithType = (function (_super) {
    __extends(CompileMetadataWithType, _super);
    function CompileMetadataWithType() {
        _super.apply(this, arguments);
    }
    CompileMetadataWithType.fromJson = function (data) {
        return _COMPILE_METADATA_FROM_JSON[data['class']](data);
    };
    Object.defineProperty(CompileMetadataWithType.prototype, "type", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompileMetadataWithType.prototype, "identifier", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return CompileMetadataWithType;
})(CompileMetadataWithIdentifier);
exports.CompileMetadataWithType = CompileMetadataWithType;
var CompileIdentifierMetadata = (function () {
    function CompileIdentifierMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, runtime = _b.runtime, name = _b.name, moduleUrl = _b.moduleUrl, prefix = _b.prefix, constConstructor = _b.constConstructor;
        this.runtime = runtime;
        this.name = name;
        this.prefix = prefix;
        this.moduleUrl = moduleUrl;
        this.constConstructor = constConstructor;
    }
    CompileIdentifierMetadata.fromJson = function (data) {
        return new CompileIdentifierMetadata({
            name: data['name'],
            prefix: data['prefix'],
            moduleUrl: data['moduleUrl'],
            constConstructor: data['constConstructor']
        });
    };
    CompileIdentifierMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Identifier',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'constConstructor': this.constConstructor
        };
    };
    Object.defineProperty(CompileIdentifierMetadata.prototype, "identifier", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    return CompileIdentifierMetadata;
})();
exports.CompileIdentifierMetadata = CompileIdentifierMetadata;
var CompileDiDependencyMetadata = (function () {
    function CompileDiDependencyMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, isAttribute = _b.isAttribute, isSelf = _b.isSelf, isHost = _b.isHost, isSkipSelf = _b.isSkipSelf, isOptional = _b.isOptional, query = _b.query, viewQuery = _b.viewQuery, token = _b.token;
        this.isAttribute = lang_1.normalizeBool(isAttribute);
        this.isSelf = lang_1.normalizeBool(isSelf);
        this.isHost = lang_1.normalizeBool(isHost);
        this.isSkipSelf = lang_1.normalizeBool(isSkipSelf);
        this.isOptional = lang_1.normalizeBool(isOptional);
        this.query = query;
        this.viewQuery = viewQuery;
        this.token = token;
    }
    CompileDiDependencyMetadata.fromJson = function (data) {
        return new CompileDiDependencyMetadata({
            token: objFromJson(data['token'], CompileIdentifierMetadata.fromJson),
            query: objFromJson(data['query'], CompileQueryMetadata.fromJson),
            viewQuery: objFromJson(data['viewQuery'], CompileQueryMetadata.fromJson),
            isAttribute: data['isAttribute'],
            isSelf: data['isSelf'],
            isHost: data['isHost'],
            isSkipSelf: data['isSkipSelf'],
            isOptional: data['isOptional']
        });
    };
    CompileDiDependencyMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'token': objToJson(this.token),
            'query': objToJson(this.query),
            'viewQuery': objToJson(this.viewQuery),
            'isAttribute': this.isAttribute,
            'isSelf': this.isSelf,
            'isHost': this.isHost,
            'isSkipSelf': this.isSkipSelf,
            'isOptional': this.isOptional
        };
    };
    return CompileDiDependencyMetadata;
})();
exports.CompileDiDependencyMetadata = CompileDiDependencyMetadata;
var CompileProviderMetadata = (function () {
    function CompileProviderMetadata(_a) {
        var token = _a.token, useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.deps = deps;
        this.multi = multi;
    }
    CompileProviderMetadata.fromJson = function (data) {
        return new CompileProviderMetadata({
            token: objFromJson(data['token'], CompileIdentifierMetadata.fromJson),
            useClass: objFromJson(data['useClass'], CompileTypeMetadata.fromJson)
        });
    };
    CompileProviderMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'token': objToJson(this.token),
            'useClass': objToJson(this.useClass)
        };
    };
    return CompileProviderMetadata;
})();
exports.CompileProviderMetadata = CompileProviderMetadata;
var CompileFactoryMetadata = (function () {
    function CompileFactoryMetadata(_a) {
        var runtime = _a.runtime, name = _a.name, moduleUrl = _a.moduleUrl, constConstructor = _a.constConstructor, diDeps = _a.diDeps;
        this.runtime = runtime;
        this.name = name;
        this.moduleUrl = moduleUrl;
        this.diDeps = diDeps;
        this.constConstructor = constConstructor;
    }
    Object.defineProperty(CompileFactoryMetadata.prototype, "identifier", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    CompileFactoryMetadata.prototype.toJson = function () { return null; };
    return CompileFactoryMetadata;
})();
exports.CompileFactoryMetadata = CompileFactoryMetadata;
/**
 * Metadata regarding compilation of a type.
 */
var CompileTypeMetadata = (function () {
    function CompileTypeMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, runtime = _b.runtime, name = _b.name, moduleUrl = _b.moduleUrl, prefix = _b.prefix, isHost = _b.isHost, constConstructor = _b.constConstructor, diDeps = _b.diDeps;
        this.runtime = runtime;
        this.name = name;
        this.moduleUrl = moduleUrl;
        this.prefix = prefix;
        this.isHost = lang_1.normalizeBool(isHost);
        this.constConstructor = constConstructor;
        this.diDeps = lang_1.normalizeBlank(diDeps);
    }
    CompileTypeMetadata.fromJson = function (data) {
        return new CompileTypeMetadata({
            name: data['name'],
            moduleUrl: data['moduleUrl'],
            prefix: data['prefix'],
            isHost: data['isHost'],
            constConstructor: data['constConstructor'],
            diDeps: arrayFromJson(data['diDeps'], CompileDiDependencyMetadata.fromJson)
        });
    };
    Object.defineProperty(CompileTypeMetadata.prototype, "identifier", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompileTypeMetadata.prototype, "type", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    CompileTypeMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'class': 'Type',
            'name': this.name,
            'moduleUrl': this.moduleUrl,
            'prefix': this.prefix,
            'isHost': this.isHost,
            'constConstructor': this.constConstructor,
            'diDeps': arrayToJson(this.diDeps)
        };
    };
    return CompileTypeMetadata;
})();
exports.CompileTypeMetadata = CompileTypeMetadata;
var CompileQueryMetadata = (function () {
    function CompileQueryMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, selectors = _b.selectors, descendants = _b.descendants, first = _b.first, propertyName = _b.propertyName;
        this.selectors = selectors;
        this.descendants = descendants;
        this.first = lang_1.normalizeBool(first);
        this.propertyName = propertyName;
    }
    CompileQueryMetadata.fromJson = function (data) {
        return new CompileQueryMetadata({
            selectors: arrayFromJson(data['selectors'], CompileIdentifierMetadata.fromJson),
            descendants: data['descendants'],
            first: data['first'],
            propertyName: data['propertyName']
        });
    };
    CompileQueryMetadata.prototype.toJson = function () {
        return {
            // Note: Runtime type can't be serialized...
            'selectors': arrayToJson(this.selectors),
            'descendants': this.descendants,
            'first': this.first,
            'propertyName': this.propertyName
        };
    };
    return CompileQueryMetadata;
})();
exports.CompileQueryMetadata = CompileQueryMetadata;
/**
 * Metadata regarding compilation of a template.
 */
var CompileTemplateMetadata = (function () {
    function CompileTemplateMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, encapsulation = _b.encapsulation, template = _b.template, templateUrl = _b.templateUrl, styles = _b.styles, styleUrls = _b.styleUrls, ngContentSelectors = _b.ngContentSelectors;
        this.encapsulation = lang_1.isPresent(encapsulation) ? encapsulation : view_1.ViewEncapsulation.Emulated;
        this.template = template;
        this.templateUrl = templateUrl;
        this.styles = lang_1.isPresent(styles) ? styles : [];
        this.styleUrls = lang_1.isPresent(styleUrls) ? styleUrls : [];
        this.ngContentSelectors = lang_1.isPresent(ngContentSelectors) ? ngContentSelectors : [];
    }
    CompileTemplateMetadata.fromJson = function (data) {
        return new CompileTemplateMetadata({
            encapsulation: lang_1.isPresent(data['encapsulation']) ?
                view_1.VIEW_ENCAPSULATION_VALUES[data['encapsulation']] :
                data['encapsulation'],
            template: data['template'],
            templateUrl: data['templateUrl'],
            styles: data['styles'],
            styleUrls: data['styleUrls'],
            ngContentSelectors: data['ngContentSelectors']
        });
    };
    CompileTemplateMetadata.prototype.toJson = function () {
        return {
            'encapsulation': lang_1.isPresent(this.encapsulation) ? lang_1.serializeEnum(this.encapsulation) : this.encapsulation,
            'template': this.template,
            'templateUrl': this.templateUrl,
            'styles': this.styles,
            'styleUrls': this.styleUrls,
            'ngContentSelectors': this.ngContentSelectors
        };
    };
    return CompileTemplateMetadata;
})();
exports.CompileTemplateMetadata = CompileTemplateMetadata;
/**
 * Metadata regarding compilation of a directive.
 */
var CompileDirectiveMetadata = (function () {
    function CompileDirectiveMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, isComponent = _b.isComponent, dynamicLoadable = _b.dynamicLoadable, selector = _b.selector, exportAs = _b.exportAs, changeDetection = _b.changeDetection, inputs = _b.inputs, outputs = _b.outputs, hostListeners = _b.hostListeners, hostProperties = _b.hostProperties, hostAttributes = _b.hostAttributes, lifecycleHooks = _b.lifecycleHooks, providers = _b.providers, viewProviders = _b.viewProviders, queries = _b.queries, viewQueries = _b.viewQueries, template = _b.template;
        this.type = type;
        this.isComponent = isComponent;
        this.dynamicLoadable = dynamicLoadable;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.lifecycleHooks = lifecycleHooks;
        this.providers = lang_1.normalizeBlank(providers);
        this.viewProviders = lang_1.normalizeBlank(viewProviders);
        this.queries = queries;
        this.viewQueries = viewQueries;
        this.template = template;
    }
    CompileDirectiveMetadata.create = function (_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, isComponent = _b.isComponent, dynamicLoadable = _b.dynamicLoadable, selector = _b.selector, exportAs = _b.exportAs, changeDetection = _b.changeDetection, inputs = _b.inputs, outputs = _b.outputs, host = _b.host, lifecycleHooks = _b.lifecycleHooks, providers = _b.providers, viewProviders = _b.viewProviders, queries = _b.queries, viewQueries = _b.viewQueries, template = _b.template;
        var hostListeners = {};
        var hostProperties = {};
        var hostAttributes = {};
        if (lang_1.isPresent(host)) {
            collection_1.StringMapWrapper.forEach(host, function (value, key) {
                var matches = lang_1.RegExpWrapper.firstMatch(HOST_REG_EXP, key);
                if (lang_1.isBlank(matches)) {
                    hostAttributes[key] = value;
                }
                else if (lang_1.isPresent(matches[1])) {
                    hostProperties[matches[1]] = value;
                }
                else if (lang_1.isPresent(matches[2])) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        var inputsMap = {};
        if (lang_1.isPresent(inputs)) {
            inputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        var outputsMap = {};
        if (lang_1.isPresent(outputs)) {
            outputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            type: type,
            isComponent: lang_1.normalizeBool(isComponent),
            dynamicLoadable: lang_1.normalizeBool(dynamicLoadable),
            selector: selector,
            exportAs: exportAs,
            changeDetection: changeDetection,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            lifecycleHooks: lang_1.isPresent(lifecycleHooks) ? lifecycleHooks : [],
            providers: providers,
            viewProviders: viewProviders,
            queries: queries,
            viewQueries: viewQueries,
            template: template
        });
    };
    Object.defineProperty(CompileDirectiveMetadata.prototype, "identifier", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    CompileDirectiveMetadata.fromJson = function (data) {
        return new CompileDirectiveMetadata({
            isComponent: data['isComponent'],
            dynamicLoadable: data['dynamicLoadable'],
            selector: data['selector'],
            exportAs: data['exportAs'],
            type: lang_1.isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            changeDetection: lang_1.isPresent(data['changeDetection']) ?
                change_detection_1.CHANGE_DETECTION_STRATEGY_VALUES[data['changeDetection']] :
                data['changeDetection'],
            inputs: data['inputs'],
            outputs: data['outputs'],
            hostListeners: data['hostListeners'],
            hostProperties: data['hostProperties'],
            hostAttributes: data['hostAttributes'],
            lifecycleHooks: data['lifecycleHooks'].map(function (hookValue) { return interfaces_1.LIFECYCLE_HOOKS_VALUES[hookValue]; }),
            template: lang_1.isPresent(data['template']) ? CompileTemplateMetadata.fromJson(data['template']) :
                data['template'],
            providers: arrayFromJson(data['providers'], CompileProviderMetadata.fromJson)
        });
    };
    CompileDirectiveMetadata.prototype.toJson = function () {
        return {
            'class': 'Directive',
            'isComponent': this.isComponent,
            'dynamicLoadable': this.dynamicLoadable,
            'selector': this.selector,
            'exportAs': this.exportAs,
            'type': lang_1.isPresent(this.type) ? this.type.toJson() : this.type,
            'changeDetection': lang_1.isPresent(this.changeDetection) ? lang_1.serializeEnum(this.changeDetection) :
                this.changeDetection,
            'inputs': this.inputs,
            'outputs': this.outputs,
            'hostListeners': this.hostListeners,
            'hostProperties': this.hostProperties,
            'hostAttributes': this.hostAttributes,
            'lifecycleHooks': this.lifecycleHooks.map(function (hook) { return lang_1.serializeEnum(hook); }),
            'template': lang_1.isPresent(this.template) ? this.template.toJson() : this.template,
            'providers': arrayToJson(this.providers)
        };
    };
    return CompileDirectiveMetadata;
})();
exports.CompileDirectiveMetadata = CompileDirectiveMetadata;
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
function createHostComponentMeta(componentType, componentSelector) {
    var template = selector_1.CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
    return CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({
            runtime: Object,
            name: "Host" + componentType.name,
            moduleUrl: componentType.moduleUrl,
            isHost: true
        }),
        template: new CompileTemplateMetadata({ template: template, templateUrl: '', styles: [], styleUrls: [], ngContentSelectors: [] }),
        changeDetection: change_detection_1.ChangeDetectionStrategy.Default,
        inputs: [],
        outputs: [],
        host: {},
        lifecycleHooks: [],
        isComponent: true,
        dynamicLoadable: false,
        selector: '*',
        providers: [],
        viewProviders: [],
        queries: [],
        viewQueries: []
    });
}
exports.createHostComponentMeta = createHostComponentMeta;
var CompilePipeMetadata = (function () {
    function CompilePipeMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, type = _b.type, name = _b.name, pure = _b.pure;
        this.type = type;
        this.name = name;
        this.pure = lang_1.normalizeBool(pure);
    }
    Object.defineProperty(CompilePipeMetadata.prototype, "identifier", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    CompilePipeMetadata.fromJson = function (data) {
        return new CompilePipeMetadata({
            type: lang_1.isPresent(data['type']) ? CompileTypeMetadata.fromJson(data['type']) : data['type'],
            name: data['name'],
            pure: data['pure']
        });
    };
    CompilePipeMetadata.prototype.toJson = function () {
        return {
            'class': 'Pipe',
            'type': lang_1.isPresent(this.type) ? this.type.toJson() : null,
            'name': this.name,
            'pure': this.pure
        };
    };
    return CompilePipeMetadata;
})();
exports.CompilePipeMetadata = CompilePipeMetadata;
var _COMPILE_METADATA_FROM_JSON = {
    'Directive': CompileDirectiveMetadata.fromJson,
    'Pipe': CompilePipeMetadata.fromJson,
    'Type': CompileTypeMetadata.fromJson,
    'Identifier': CompileIdentifierMetadata.fromJson
};
function arrayFromJson(obj, fn) {
    return lang_1.isBlank(obj) ? null : obj.map(function (o) { return objFromJson(o, fn); });
}
function arrayToJson(obj) {
    return lang_1.isBlank(obj) ? null : obj.map(objToJson);
}
function objFromJson(obj, fn) {
    return (lang_1.isString(obj) || lang_1.isBlank(obj)) ? obj : fn(obj);
}
function objToJson(obj) {
    return (lang_1.isString(obj) || lang_1.isBlank(obj)) ? obj : obj.toJson();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2RpcmVjdGl2ZV9tZXRhZGF0YS50cyJdLCJuYW1lcyI6WyJDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciIsIkNvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyLmNvbnN0cnVjdG9yIiwiQ29tcGlsZU1ldGFkYXRhV2l0aElkZW50aWZpZXIuZnJvbUpzb24iLCJDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllci5pZGVudGlmaWVyIiwiQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUiLCJDb21waWxlTWV0YWRhdGFXaXRoVHlwZS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVNZXRhZGF0YVdpdGhUeXBlLmZyb21Kc29uIiwiQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUudHlwZSIsIkNvbXBpbGVNZXRhZGF0YVdpdGhUeXBlLmlkZW50aWZpZXIiLCJDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIiwiQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLnRvSnNvbiIsIkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS5mcm9tSnNvbiIsIkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YS50b0pzb24iLCJDb21waWxlUHJvdmlkZXJNZXRhZGF0YSIsIkNvbXBpbGVQcm92aWRlck1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlUHJvdmlkZXJNZXRhZGF0YS50b0pzb24iLCJDb21waWxlRmFjdG9yeU1ldGFkYXRhIiwiQ29tcGlsZUZhY3RvcnlNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEudG9Kc29uIiwiQ29tcGlsZVR5cGVNZXRhZGF0YSIsIkNvbXBpbGVUeXBlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS5pZGVudGlmaWVyIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS50eXBlIiwiQ29tcGlsZVR5cGVNZXRhZGF0YS50b0pzb24iLCJDb21waWxlUXVlcnlNZXRhZGF0YSIsIkNvbXBpbGVRdWVyeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVF1ZXJ5TWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlUXVlcnlNZXRhZGF0YS50b0pzb24iLCJDb21waWxlVGVtcGxhdGVNZXRhZGF0YSIsIkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlVGVtcGxhdGVNZXRhZGF0YS50b0pzb24iLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEiLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY29uc3RydWN0b3IiLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlIiwiQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmlkZW50aWZpZXIiLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEudG9Kc29uIiwiY3JlYXRlSG9zdENvbXBvbmVudE1ldGEiLCJDb21waWxlUGlwZU1ldGFkYXRhIiwiQ29tcGlsZVBpcGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkNvbXBpbGVQaXBlTWV0YWRhdGEuaWRlbnRpZmllciIsIkNvbXBpbGVQaXBlTWV0YWRhdGEuZnJvbUpzb24iLCJDb21waWxlUGlwZU1ldGFkYXRhLnRvSnNvbiIsImFycmF5RnJvbUpzb24iLCJhcnJheVRvSnNvbiIsIm9iakZyb21Kc29uIiwib2JqVG9Kc29uIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFCQVVPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QsMkJBQStCLGdDQUFnQyxDQUFDLENBQUE7QUFDaEUsaUNBR08scURBQXFELENBQUMsQ0FBQTtBQUM3RCxxQkFBMkQsaUNBQWlDLENBQUMsQ0FBQTtBQUM3Rix5QkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCxxQkFBMkIsUUFBUSxDQUFDLENBQUE7QUFDcEMsMkJBQXFELHFDQUFxQyxDQUFDLENBQUE7QUFFM0Ysd0NBQXdDO0FBQ3hDLGtDQUFrQztBQUNsQyxJQUFJLFlBQVksR0FBRywwQ0FBMEMsQ0FBQztBQUU5RDtJQUFBQTtJQVFBQyxDQUFDQTtJQVBRRCxzQ0FBUUEsR0FBZkEsVUFBZ0JBLElBQTBCQTtRQUN4Q0UsTUFBTUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUMxREEsQ0FBQ0E7SUFJREYsc0JBQUlBLHFEQUFVQTthQUFkQSxjQUE4Q0csTUFBTUEsQ0FBNEJBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFIO0lBQ3BHQSxvQ0FBQ0E7QUFBREEsQ0FBQ0EsQUFSRCxJQVFDO0FBUnFCLHFDQUE2QixnQ0FRbEQsQ0FBQTtBQUVEO0lBQXNESSwyQ0FBNkJBO0lBQW5GQTtRQUFzREMsOEJBQTZCQTtJQVVuRkEsQ0FBQ0E7SUFUUUQsZ0NBQVFBLEdBQWZBLFVBQWdCQSxJQUEwQkE7UUFDeENFLE1BQU1BLENBQUNBLDJCQUEyQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7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QztJQUNyRUssTUFBTUEsQ0FBQ0EsY0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQUEsQ0FBQ0EsSUFBSUEsT0FBQUEsV0FBV0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBbEJBLENBQWtCQSxDQUFDQSxDQUFDQTtBQUNoRUEsQ0FBQ0E7QUFFRCxxQkFBcUIsR0FBVTtJQUM3QkMsTUFBTUEsQ0FBQ0EsY0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7QUFDbERBLENBQUNBO0FBRUQscUJBQXFCLEdBQVEsRUFBRSxFQUFvQztJQUNqRUMsTUFBTUEsQ0FBQ0EsQ0FBQ0EsZUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDekRBLENBQUNBO0FBRUQsbUJBQW1CLEdBQVE7SUFDekJDLE1BQU1BLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLGNBQU9BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0FBQzlEQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgbm9ybWFsaXplQm9vbCxcbiAgbm9ybWFsaXplQmxhbmssXG4gIHNlcmlhbGl6ZUVudW0sXG4gIFR5cGUsXG4gIGlzU3RyaW5nLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVNcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb24sIFZJRVdfRU5DQVBTVUxBVElPTl9WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcbmltcG9ydCB7c3BsaXRBdENvbG9ufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2ludGVyZmFjZXMnO1xuXG4vLyBncm91cCAxOiBcInByb3BlcnR5XCIgZnJvbSBcIltwcm9wZXJ0eV1cIlxuLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbnZhciBIT1NUX1JFR19FWFAgPSAvXig/Oig/OlxcWyhbXlxcXV0rKVxcXSl8KD86XFwoKFteXFwpXSspXFwpKSkkL2c7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlTWV0YWRhdGFXaXRoSWRlbnRpZmllciB7XG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgICByZXR1cm4gX0NPTVBJTEVfTUVUQURBVEFfRlJPTV9KU09OW2RhdGFbJ2NsYXNzJ11dKGRhdGEpO1xuICB9XG5cbiAgYWJzdHJhY3QgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIGdldCBpZGVudGlmaWVyKCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gPENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGE+dW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSBleHRlbmRzIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICAgIHJldHVybiBfQ09NUElMRV9NRVRBREFUQV9GUk9NX0pTT05bZGF0YVsnY2xhc3MnXV0oZGF0YSk7XG4gIH1cblxuICBhYnN0cmFjdCB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgZ2V0IHR5cGUoKTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7IHJldHVybiA8Q29tcGlsZVR5cGVNZXRhZGF0YT51bmltcGxlbWVudGVkKCk7IH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIDxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSBpbXBsZW1lbnRzIENvbXBpbGVNZXRhZGF0YVdpdGhJZGVudGlmaWVyIHtcbiAgcnVudGltZTogYW55O1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgY29uc3RDb25zdHJ1Y3RvcjogYm9vbGVhbjtcbiAgY29uc3RydWN0b3Ioe3J1bnRpbWUsIG5hbWUsIG1vZHVsZVVybCwgcHJlZml4LCBjb25zdENvbnN0cnVjdG9yfToge1xuICAgIHJ1bnRpbWU/OiBhbnksXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIGNvbnN0Q29uc3RydWN0b3I/OiBib29sZWFuXG4gIH0gPSB7fSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLmNvbnN0Q29uc3RydWN0b3IgPSBjb25zdENvbnN0cnVjdG9yO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIHByZWZpeDogZGF0YVsncHJlZml4J10sXG4gICAgICBtb2R1bGVVcmw6IGRhdGFbJ21vZHVsZVVybCddLFxuICAgICAgY29uc3RDb25zdHJ1Y3RvcjogZGF0YVsnY29uc3RDb25zdHJ1Y3RvciddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ2NsYXNzJzogJ0lkZW50aWZpZXInLFxuICAgICAgJ25hbWUnOiB0aGlzLm5hbWUsXG4gICAgICAnbW9kdWxlVXJsJzogdGhpcy5tb2R1bGVVcmwsXG4gICAgICAncHJlZml4JzogdGhpcy5wcmVmaXgsXG4gICAgICAnY29uc3RDb25zdHJ1Y3Rvcic6IHRoaXMuY29uc3RDb25zdHJ1Y3RvclxuICAgIH07XG4gIH1cblxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXM7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGlzQXR0cmlidXRlOiBib29sZWFuO1xuICBpc1NlbGY6IGJvb2xlYW47XG4gIGlzSG9zdDogYm9vbGVhbjtcbiAgaXNTa2lwU2VsZjogYm9vbGVhbjtcbiAgaXNPcHRpb25hbDogYm9vbGVhbjtcbiAgcXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhO1xuICB2aWV3UXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhO1xuICB0b2tlbjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih7aXNBdHRyaWJ1dGUsIGlzU2VsZiwgaXNIb3N0LCBpc1NraXBTZWxmLCBpc09wdGlvbmFsLCBxdWVyeSwgdmlld1F1ZXJ5LCB0b2tlbn06IHtcbiAgICBpc0F0dHJpYnV0ZT86IGJvb2xlYW4sXG4gICAgaXNTZWxmPzogYm9vbGVhbixcbiAgICBpc0hvc3Q/OiBib29sZWFuLFxuICAgIGlzU2tpcFNlbGY/OiBib29sZWFuLFxuICAgIGlzT3B0aW9uYWw/OiBib29sZWFuLFxuICAgIHF1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdmlld1F1ZXJ5PzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gICAgdG9rZW4/OiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuaXNBdHRyaWJ1dGUgPSBub3JtYWxpemVCb29sKGlzQXR0cmlidXRlKTtcbiAgICB0aGlzLmlzU2VsZiA9IG5vcm1hbGl6ZUJvb2woaXNTZWxmKTtcbiAgICB0aGlzLmlzSG9zdCA9IG5vcm1hbGl6ZUJvb2woaXNIb3N0KTtcbiAgICB0aGlzLmlzU2tpcFNlbGYgPSBub3JtYWxpemVCb29sKGlzU2tpcFNlbGYpO1xuICAgIHRoaXMuaXNPcHRpb25hbCA9IG5vcm1hbGl6ZUJvb2woaXNPcHRpb25hbCk7XG4gICAgdGhpcy5xdWVyeSA9IHF1ZXJ5O1xuICAgIHRoaXMudmlld1F1ZXJ5ID0gdmlld1F1ZXJ5O1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe1xuICAgICAgdG9rZW46IG9iakZyb21Kc29uKGRhdGFbJ3Rva2VuJ10sIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEuZnJvbUpzb24pLFxuICAgICAgcXVlcnk6IG9iakZyb21Kc29uKGRhdGFbJ3F1ZXJ5J10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHZpZXdRdWVyeTogb2JqRnJvbUpzb24oZGF0YVsndmlld1F1ZXJ5J10sIENvbXBpbGVRdWVyeU1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIGlzQXR0cmlidXRlOiBkYXRhWydpc0F0dHJpYnV0ZSddLFxuICAgICAgaXNTZWxmOiBkYXRhWydpc1NlbGYnXSxcbiAgICAgIGlzSG9zdDogZGF0YVsnaXNIb3N0J10sXG4gICAgICBpc1NraXBTZWxmOiBkYXRhWydpc1NraXBTZWxmJ10sXG4gICAgICBpc09wdGlvbmFsOiBkYXRhWydpc09wdGlvbmFsJ11cbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAndG9rZW4nOiBvYmpUb0pzb24odGhpcy50b2tlbiksXG4gICAgICAncXVlcnknOiBvYmpUb0pzb24odGhpcy5xdWVyeSksXG4gICAgICAndmlld1F1ZXJ5Jzogb2JqVG9Kc29uKHRoaXMudmlld1F1ZXJ5KSxcbiAgICAgICdpc0F0dHJpYnV0ZSc6IHRoaXMuaXNBdHRyaWJ1dGUsXG4gICAgICAnaXNTZWxmJzogdGhpcy5pc1NlbGYsXG4gICAgICAnaXNIb3N0JzogdGhpcy5pc0hvc3QsXG4gICAgICAnaXNTa2lwU2VsZic6IHRoaXMuaXNTa2lwU2VsZixcbiAgICAgICdpc09wdGlvbmFsJzogdGhpcy5pc09wdGlvbmFsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICB0b2tlbjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IHN0cmluZztcbiAgdXNlQ2xhc3M6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIHVzZVZhbHVlOiBhbnk7XG4gIHVzZUV4aXN0aW5nOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nO1xuICB1c2VGYWN0b3J5OiBDb21waWxlRmFjdG9yeU1ldGFkYXRhO1xuICBkZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe3Rva2VuLCB1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b2tlbj86IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBzdHJpbmcsXG4gICAgdXNlQ2xhc3M/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIHVzZVZhbHVlPzogYW55LFxuICAgIHVzZUV4aXN0aW5nPzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IHN0cmluZyxcbiAgICB1c2VGYWN0b3J5PzogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSxcbiAgICBkZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10sXG4gICAgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy51c2VDbGFzcyA9IHVzZUNsYXNzO1xuICAgIHRoaXMudXNlVmFsdWUgPSB1c2VWYWx1ZTtcbiAgICB0aGlzLnVzZUV4aXN0aW5nID0gdXNlRXhpc3Rpbmc7XG4gICAgdGhpcy51c2VGYWN0b3J5ID0gdXNlRmFjdG9yeTtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuICAgIHRoaXMubXVsdGkgPSBtdWx0aTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQcm92aWRlck1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiBvYmpGcm9tSnNvbihkYXRhWyd0b2tlbiddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIHVzZUNsYXNzOiBvYmpGcm9tSnNvbihkYXRhWyd1c2VDbGFzcyddLCBDb21waWxlVHlwZU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gTm90ZTogUnVudGltZSB0eXBlIGNhbid0IGJlIHNlcmlhbGl6ZWQuLi5cbiAgICAgICd0b2tlbic6IG9ialRvSnNvbih0aGlzLnRva2VuKSxcbiAgICAgICd1c2VDbGFzcyc6IG9ialRvSnNvbih0aGlzLnVzZUNsYXNzKVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgcnVudGltZTogRnVuY3Rpb247XG4gIG5hbWU6IHN0cmluZztcbiAgcHJlZml4OiBzdHJpbmc7XG4gIG1vZHVsZVVybDogc3RyaW5nO1xuICBjb25zdENvbnN0cnVjdG9yOiBib29sZWFuO1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIGNvbnN0Q29uc3RydWN0b3IsIGRpRGVwc306IHtcbiAgICBydW50aW1lPzogRnVuY3Rpb24sXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgY29uc3RDb25zdHJ1Y3Rvcj86IGJvb2xlYW4sXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSkge1xuICAgIHRoaXMucnVudGltZSA9IHJ1bnRpbWU7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybDtcbiAgICB0aGlzLmRpRGVwcyA9IGRpRGVwcztcbiAgICB0aGlzLmNvbnN0Q29uc3RydWN0b3IgPSBjb25zdENvbnN0cnVjdG9yO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG5cbiAgdG9Kc29uKCkgeyByZXR1cm4gbnVsbDsgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHR5cGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlVHlwZU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSwgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICBydW50aW1lOiBUeXBlO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByZWZpeDogc3RyaW5nO1xuICBtb2R1bGVVcmw6IHN0cmluZztcbiAgaXNIb3N0OiBib29sZWFuO1xuICBjb25zdENvbnN0cnVjdG9yOiBib29sZWFuO1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuXG4gIGNvbnN0cnVjdG9yKHtydW50aW1lLCBuYW1lLCBtb2R1bGVVcmwsIHByZWZpeCwgaXNIb3N0LCBjb25zdENvbnN0cnVjdG9yLCBkaURlcHN9OiB7XG4gICAgcnVudGltZT86IFR5cGUsXG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBtb2R1bGVVcmw/OiBzdHJpbmcsXG4gICAgcHJlZml4Pzogc3RyaW5nLFxuICAgIGlzSG9zdD86IGJvb2xlYW4sXG4gICAgY29uc3RDb25zdHJ1Y3Rvcj86IGJvb2xlYW4sXG4gICAgZGlEZXBzPzogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5ydW50aW1lID0gcnVudGltZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsO1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMuaXNIb3N0ID0gbm9ybWFsaXplQm9vbChpc0hvc3QpO1xuICAgIHRoaXMuY29uc3RDb25zdHJ1Y3RvciA9IGNvbnN0Q29uc3RydWN0b3I7XG4gICAgdGhpcy5kaURlcHMgPSBub3JtYWxpemVCbGFuayhkaURlcHMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVR5cGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIG1vZHVsZVVybDogZGF0YVsnbW9kdWxlVXJsJ10sXG4gICAgICBwcmVmaXg6IGRhdGFbJ3ByZWZpeCddLFxuICAgICAgaXNIb3N0OiBkYXRhWydpc0hvc3QnXSxcbiAgICAgIGNvbnN0Q29uc3RydWN0b3I6IGRhdGFbJ2NvbnN0Q29uc3RydWN0b3InXSxcbiAgICAgIGRpRGVwczogYXJyYXlGcm9tSnNvbihkYXRhWydkaURlcHMnXSwgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLmZyb21Kc29uKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzOyB9XG4gIGdldCB0eXBlKCk6IENvbXBpbGVUeXBlTWV0YWRhdGEgeyByZXR1cm4gdGhpczsgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIE5vdGU6IFJ1bnRpbWUgdHlwZSBjYW4ndCBiZSBzZXJpYWxpemVkLi4uXG4gICAgICAnY2xhc3MnOiAnVHlwZScsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdtb2R1bGVVcmwnOiB0aGlzLm1vZHVsZVVybCxcbiAgICAgICdwcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICdpc0hvc3QnOiB0aGlzLmlzSG9zdCxcbiAgICAgICdjb25zdENvbnN0cnVjdG9yJzogdGhpcy5jb25zdENvbnN0cnVjdG9yLFxuICAgICAgJ2RpRGVwcyc6IGFycmF5VG9Kc29uKHRoaXMuZGlEZXBzKVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgc2VsZWN0b3JzOiBBcnJheTxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nPjtcbiAgZGVzY2VuZGFudHM6IGJvb2xlYW47XG4gIGZpcnN0OiBib29sZWFuO1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih7c2VsZWN0b3JzLCBkZXNjZW5kYW50cywgZmlyc3QsIHByb3BlcnR5TmFtZX06IHtcbiAgICBzZWxlY3RvcnM/OiBBcnJheTxDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHwgc3RyaW5nPixcbiAgICBkZXNjZW5kYW50cz86IGJvb2xlYW4sXG4gICAgZmlyc3Q/OiBib29sZWFuLFxuICAgIHByb3BlcnR5TmFtZT86IHN0cmluZ1xuICB9ID0ge30pIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICB0aGlzLmRlc2NlbmRhbnRzID0gZGVzY2VuZGFudHM7XG4gICAgdGhpcy5maXJzdCA9IG5vcm1hbGl6ZUJvb2woZmlyc3QpO1xuICAgIHRoaXMucHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lO1xuICB9XG5cbiAgc3RhdGljIGZyb21Kc29uKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3NlbGVjdG9ycyddLCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uKSxcbiAgICAgIGRlc2NlbmRhbnRzOiBkYXRhWydkZXNjZW5kYW50cyddLFxuICAgICAgZmlyc3Q6IGRhdGFbJ2ZpcnN0J10sXG4gICAgICBwcm9wZXJ0eU5hbWU6IGRhdGFbJ3Byb3BlcnR5TmFtZSddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBOb3RlOiBSdW50aW1lIHR5cGUgY2FuJ3QgYmUgc2VyaWFsaXplZC4uLlxuICAgICAgJ3NlbGVjdG9ycyc6IGFycmF5VG9Kc29uKHRoaXMuc2VsZWN0b3JzKSxcbiAgICAgICdkZXNjZW5kYW50cyc6IHRoaXMuZGVzY2VuZGFudHMsXG4gICAgICAnZmlyc3QnOiB0aGlzLmZpcnN0LFxuICAgICAgJ3Byb3BlcnR5TmFtZSc6IHRoaXMucHJvcGVydHlOYW1lXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlZ2FyZGluZyBjb21waWxhdGlvbiBvZiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEge1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgdGVtcGxhdGU6IHN0cmluZztcbiAgdGVtcGxhdGVVcmw6IHN0cmluZztcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgY29uc3RydWN0b3Ioe2VuY2Fwc3VsYXRpb24sIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgc3R5bGVzLCBzdHlsZVVybHMsIG5nQ29udGVudFNlbGVjdG9yc306IHtcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgbmdDb250ZW50U2VsZWN0b3JzPzogc3RyaW5nW11cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gaXNQcmVzZW50KGVuY2Fwc3VsYXRpb24pID8gZW5jYXBzdWxhdGlvbiA6IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlVXJsID0gdGVtcGxhdGVVcmw7XG4gICAgdGhpcy5zdHlsZXMgPSBpc1ByZXNlbnQoc3R5bGVzKSA/IHN0eWxlcyA6IFtdO1xuICAgIHRoaXMuc3R5bGVVcmxzID0gaXNQcmVzZW50KHN0eWxlVXJscykgPyBzdHlsZVVybHMgOiBbXTtcbiAgICB0aGlzLm5nQ29udGVudFNlbGVjdG9ycyA9IGlzUHJlc2VudChuZ0NvbnRlbnRTZWxlY3RvcnMpID8gbmdDb250ZW50U2VsZWN0b3JzIDogW107XG4gIH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICBlbmNhcHN1bGF0aW9uOiBpc1ByZXNlbnQoZGF0YVsnZW5jYXBzdWxhdGlvbiddKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFU1tkYXRhWydlbmNhcHN1bGF0aW9uJ11dIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWydlbmNhcHN1bGF0aW9uJ10sXG4gICAgICB0ZW1wbGF0ZTogZGF0YVsndGVtcGxhdGUnXSxcbiAgICAgIHRlbXBsYXRlVXJsOiBkYXRhWyd0ZW1wbGF0ZVVybCddLFxuICAgICAgc3R5bGVzOiBkYXRhWydzdHlsZXMnXSxcbiAgICAgIHN0eWxlVXJsczogZGF0YVsnc3R5bGVVcmxzJ10sXG4gICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IGRhdGFbJ25nQ29udGVudFNlbGVjdG9ycyddXG4gICAgfSk7XG4gIH1cblxuICB0b0pzb24oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHJldHVybiB7XG4gICAgICAnZW5jYXBzdWxhdGlvbic6XG4gICAgICAgICAgaXNQcmVzZW50KHRoaXMuZW5jYXBzdWxhdGlvbikgPyBzZXJpYWxpemVFbnVtKHRoaXMuZW5jYXBzdWxhdGlvbikgOiB0aGlzLmVuY2Fwc3VsYXRpb24sXG4gICAgICAndGVtcGxhdGUnOiB0aGlzLnRlbXBsYXRlLFxuICAgICAgJ3RlbXBsYXRlVXJsJzogdGhpcy50ZW1wbGF0ZVVybCxcbiAgICAgICdzdHlsZXMnOiB0aGlzLnN0eWxlcyxcbiAgICAgICdzdHlsZVVybHMnOiB0aGlzLnN0eWxlVXJscyxcbiAgICAgICduZ0NvbnRlbnRTZWxlY3RvcnMnOiB0aGlzLm5nQ29udGVudFNlbGVjdG9yc1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEgaW1wbGVtZW50cyBDb21waWxlTWV0YWRhdGFXaXRoVHlwZSB7XG4gIHN0YXRpYyBjcmVhdGUoe3R5cGUsIGlzQ29tcG9uZW50LCBkeW5hbWljTG9hZGFibGUsIHNlbGVjdG9yLCBleHBvcnRBcywgY2hhbmdlRGV0ZWN0aW9uLCBpbnB1dHMsXG4gICAgICAgICAgICAgICAgIG91dHB1dHMsIGhvc3QsIGxpZmVjeWNsZUhvb2tzLCBwcm92aWRlcnMsIHZpZXdQcm92aWRlcnMsIHF1ZXJpZXMsIHZpZXdRdWVyaWVzLFxuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZX06IHtcbiAgICB0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudD86IGJvb2xlYW4sXG4gICAgZHluYW1pY0xvYWRhYmxlPzogYm9vbGVhbixcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGxpZmVjeWNsZUhvb2tzPzogTGlmZWN5Y2xlSG9va3NbXSxcbiAgICBwcm92aWRlcnM/OiBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgdmlld1Byb3ZpZGVycz86IEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPixcbiAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB2aWV3UXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU/OiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxuICB9ID0ge30pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHZhciBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHZhciBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlzUHJlc2VudChob3N0KSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3QsICh2YWx1ZTogc3RyaW5nLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChIT1NUX1JFR19FWFAsIGtleSk7XG4gICAgICAgIGlmIChpc0JsYW5rKG1hdGNoZXMpKSB7XG4gICAgICAgICAgaG9zdEF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChtYXRjaGVzWzFdKSkge1xuICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzW21hdGNoZXNbMV1dID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KG1hdGNoZXNbMl0pKSB7XG4gICAgICAgICAgaG9zdExpc3RlbmVyc1ttYXRjaGVzWzJdXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIGlucHV0c01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaXNQcmVzZW50KGlucHV0cykpIHtcbiAgICAgIGlucHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgaW5wdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBvdXRwdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpc1ByZXNlbnQob3V0cHV0cykpIHtcbiAgICAgIG91dHB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgdmFyIHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIG91dHB1dHNNYXBbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgaXNDb21wb25lbnQ6IG5vcm1hbGl6ZUJvb2woaXNDb21wb25lbnQpLFxuICAgICAgZHluYW1pY0xvYWRhYmxlOiBub3JtYWxpemVCb29sKGR5bmFtaWNMb2FkYWJsZSksXG4gICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogZXhwb3J0QXMsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGNoYW5nZURldGVjdGlvbixcbiAgICAgIGlucHV0czogaW5wdXRzTWFwLFxuICAgICAgb3V0cHV0czogb3V0cHV0c01hcCxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IGhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllczogaG9zdFByb3BlcnRpZXMsXG4gICAgICBob3N0QXR0cmlidXRlczogaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBsaWZlY3ljbGVIb29rczogaXNQcmVzZW50KGxpZmVjeWNsZUhvb2tzKSA/IGxpZmVjeWNsZUhvb2tzIDogW10sXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnMsXG4gICAgICBxdWVyaWVzOiBxdWVyaWVzLFxuICAgICAgdmlld1F1ZXJpZXM6IHZpZXdRdWVyaWVzLFxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gICAgfSk7XG4gIH1cbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG4gIGR5bmFtaWNMb2FkYWJsZTogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgZXhwb3J0QXM6IHN0cmluZztcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgbGlmZWN5Y2xlSG9va3M6IExpZmVjeWNsZUhvb2tzW107XG4gIHByb3ZpZGVyczogQXJyYXk8Q29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBDb21waWxlVHlwZU1ldGFkYXRhIHwgYW55W10+O1xuICB2aWV3UHJvdmlkZXJzOiBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBhbnlbXT47XG4gIHF1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGE7XG4gIGNvbnN0cnVjdG9yKHt0eXBlLCBpc0NvbXBvbmVudCwgZHluYW1pY0xvYWRhYmxlLCBzZWxlY3RvciwgZXhwb3J0QXMsIGNoYW5nZURldGVjdGlvbiwgaW5wdXRzLFxuICAgICAgICAgICAgICAgb3V0cHV0cywgaG9zdExpc3RlbmVycywgaG9zdFByb3BlcnRpZXMsIGhvc3RBdHRyaWJ1dGVzLCBsaWZlY3ljbGVIb29rcywgcHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgdmlld1Byb3ZpZGVycywgcXVlcmllcywgdmlld1F1ZXJpZXMsIHRlbXBsYXRlfToge1xuICAgIHR5cGU/OiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIGlzQ29tcG9uZW50PzogYm9vbGVhbixcbiAgICBkeW5hbWljTG9hZGFibGU/OiBib29sZWFuLFxuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIGlucHV0cz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIG91dHB1dHM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0TGlzdGVuZXJzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdFByb3BlcnRpZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0QXR0cmlidXRlcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGxpZmVjeWNsZUhvb2tzPzogTGlmZWN5Y2xlSG9va3NbXSxcbiAgICBwcm92aWRlcnM/OiBBcnJheTxDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB8IENvbXBpbGVUeXBlTWV0YWRhdGEgfCBhbnlbXT4sXG4gICAgdmlld1Byb3ZpZGVycz86IEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPixcbiAgICBxdWVyaWVzPzogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICB2aWV3UXVlcmllcz86IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU/OiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YVxuICB9ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuaXNDb21wb25lbnQgPSBpc0NvbXBvbmVudDtcbiAgICB0aGlzLmR5bmFtaWNMb2FkYWJsZSA9IGR5bmFtaWNMb2FkYWJsZTtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5leHBvcnRBcyA9IGV4cG9ydEFzO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uID0gY2hhbmdlRGV0ZWN0aW9uO1xuICAgIHRoaXMuaW5wdXRzID0gaW5wdXRzO1xuICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gICAgdGhpcy5ob3N0TGlzdGVuZXJzID0gaG9zdExpc3RlbmVycztcbiAgICB0aGlzLmhvc3RQcm9wZXJ0aWVzID0gaG9zdFByb3BlcnRpZXM7XG4gICAgdGhpcy5ob3N0QXR0cmlidXRlcyA9IGhvc3RBdHRyaWJ1dGVzO1xuICAgIHRoaXMubGlmZWN5Y2xlSG9va3MgPSBsaWZlY3ljbGVIb29rcztcbiAgICB0aGlzLnByb3ZpZGVycyA9IG5vcm1hbGl6ZUJsYW5rKHByb3ZpZGVycyk7XG4gICAgdGhpcy52aWV3UHJvdmlkZXJzID0gbm9ybWFsaXplQmxhbmsodmlld1Byb3ZpZGVycyk7XG4gICAgdGhpcy5xdWVyaWVzID0gcXVlcmllcztcbiAgICB0aGlzLnZpZXdRdWVyaWVzID0gdmlld1F1ZXJpZXM7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICB9XG5cbiAgZ2V0IGlkZW50aWZpZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB0aGlzLnR5cGU7IH1cblxuICBzdGF0aWMgZnJvbUpzb24oZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIGlzQ29tcG9uZW50OiBkYXRhWydpc0NvbXBvbmVudCddLFxuICAgICAgZHluYW1pY0xvYWRhYmxlOiBkYXRhWydkeW5hbWljTG9hZGFibGUnXSxcbiAgICAgIHNlbGVjdG9yOiBkYXRhWydzZWxlY3RvciddLFxuICAgICAgZXhwb3J0QXM6IGRhdGFbJ2V4cG9ydEFzJ10sXG4gICAgICB0eXBlOiBpc1ByZXNlbnQoZGF0YVsndHlwZSddKSA/IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndHlwZSddKSA6IGRhdGFbJ3R5cGUnXSxcbiAgICAgIGNoYW5nZURldGVjdGlvbjogaXNQcmVzZW50KGRhdGFbJ2NoYW5nZURldGVjdGlvbiddKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFU1tkYXRhWydjaGFuZ2VEZXRlY3Rpb24nXV0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVsnY2hhbmdlRGV0ZWN0aW9uJ10sXG4gICAgICBpbnB1dHM6IGRhdGFbJ2lucHV0cyddLFxuICAgICAgb3V0cHV0czogZGF0YVsnb3V0cHV0cyddLFxuICAgICAgaG9zdExpc3RlbmVyczogZGF0YVsnaG9zdExpc3RlbmVycyddLFxuICAgICAgaG9zdFByb3BlcnRpZXM6IGRhdGFbJ2hvc3RQcm9wZXJ0aWVzJ10sXG4gICAgICBob3N0QXR0cmlidXRlczogZGF0YVsnaG9zdEF0dHJpYnV0ZXMnXSxcbiAgICAgIGxpZmVjeWNsZUhvb2tzOlxuICAgICAgICAgICg8YW55W10+ZGF0YVsnbGlmZWN5Y2xlSG9va3MnXSkubWFwKGhvb2tWYWx1ZSA9PiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTW2hvb2tWYWx1ZV0pLFxuICAgICAgdGVtcGxhdGU6IGlzUHJlc2VudChkYXRhWyd0ZW1wbGF0ZSddKSA/IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLmZyb21Kc29uKGRhdGFbJ3RlbXBsYXRlJ10pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWyd0ZW1wbGF0ZSddLFxuICAgICAgcHJvdmlkZXJzOiBhcnJheUZyb21Kc29uKGRhdGFbJ3Byb3ZpZGVycyddLCBDb21waWxlUHJvdmlkZXJNZXRhZGF0YS5mcm9tSnNvbilcbiAgICB9KTtcbiAgfVxuXG4gIHRvSnNvbigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdjbGFzcyc6ICdEaXJlY3RpdmUnLFxuICAgICAgJ2lzQ29tcG9uZW50JzogdGhpcy5pc0NvbXBvbmVudCxcbiAgICAgICdkeW5hbWljTG9hZGFibGUnOiB0aGlzLmR5bmFtaWNMb2FkYWJsZSxcbiAgICAgICdzZWxlY3Rvcic6IHRoaXMuc2VsZWN0b3IsXG4gICAgICAnZXhwb3J0QXMnOiB0aGlzLmV4cG9ydEFzLFxuICAgICAgJ3R5cGUnOiBpc1ByZXNlbnQodGhpcy50eXBlKSA/IHRoaXMudHlwZS50b0pzb24oKSA6IHRoaXMudHlwZSxcbiAgICAgICdjaGFuZ2VEZXRlY3Rpb24nOiBpc1ByZXNlbnQodGhpcy5jaGFuZ2VEZXRlY3Rpb24pID8gc2VyaWFsaXplRW51bSh0aGlzLmNoYW5nZURldGVjdGlvbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdGlvbixcbiAgICAgICdpbnB1dHMnOiB0aGlzLmlucHV0cyxcbiAgICAgICdvdXRwdXRzJzogdGhpcy5vdXRwdXRzLFxuICAgICAgJ2hvc3RMaXN0ZW5lcnMnOiB0aGlzLmhvc3RMaXN0ZW5lcnMsXG4gICAgICAnaG9zdFByb3BlcnRpZXMnOiB0aGlzLmhvc3RQcm9wZXJ0aWVzLFxuICAgICAgJ2hvc3RBdHRyaWJ1dGVzJzogdGhpcy5ob3N0QXR0cmlidXRlcyxcbiAgICAgICdsaWZlY3ljbGVIb29rcyc6IHRoaXMubGlmZWN5Y2xlSG9va3MubWFwKGhvb2sgPT4gc2VyaWFsaXplRW51bShob29rKSksXG4gICAgICAndGVtcGxhdGUnOiBpc1ByZXNlbnQodGhpcy50ZW1wbGF0ZSkgPyB0aGlzLnRlbXBsYXRlLnRvSnNvbigpIDogdGhpcy50ZW1wbGF0ZSxcbiAgICAgICdwcm92aWRlcnMnOiBhcnJheVRvSnNvbih0aGlzLnByb3ZpZGVycylcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQ29uc3RydWN0IHtAbGluayBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20ge0BsaW5rIENvbXBvbmVudFR5cGVNZXRhZGF0YX0gYW5kIGEgc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YShjb21wb25lbnRUeXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlbGVjdG9yOiBzdHJpbmcpOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICB2YXIgdGVtcGxhdGUgPSBDc3NTZWxlY3Rvci5wYXJzZShjb21wb25lbnRTZWxlY3RvcilbMF0uZ2V0TWF0Y2hpbmdFbGVtZW50VGVtcGxhdGUoKTtcbiAgcmV0dXJuIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgIHR5cGU6IG5ldyBDb21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIHJ1bnRpbWU6IE9iamVjdCxcbiAgICAgIG5hbWU6IGBIb3N0JHtjb21wb25lbnRUeXBlLm5hbWV9YCxcbiAgICAgIG1vZHVsZVVybDogY29tcG9uZW50VHlwZS5tb2R1bGVVcmwsXG4gICAgICBpc0hvc3Q6IHRydWVcbiAgICB9KSxcbiAgICB0ZW1wbGF0ZTogbmV3IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKFxuICAgICAgICB7dGVtcGxhdGU6IHRlbXBsYXRlLCB0ZW1wbGF0ZVVybDogJycsIHN0eWxlczogW10sIHN0eWxlVXJsczogW10sIG5nQ29udGVudFNlbGVjdG9yczogW119KSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gICAgaW5wdXRzOiBbXSxcbiAgICBvdXRwdXRzOiBbXSxcbiAgICBob3N0OiB7fSxcbiAgICBsaWZlY3ljbGVIb29rczogW10sXG4gICAgaXNDb21wb25lbnQ6IHRydWUsXG4gICAgZHluYW1pY0xvYWRhYmxlOiBmYWxzZSxcbiAgICBzZWxlY3RvcjogJyonLFxuICAgIHByb3ZpZGVyczogW10sXG4gICAgdmlld1Byb3ZpZGVyczogW10sXG4gICAgcXVlcmllczogW10sXG4gICAgdmlld1F1ZXJpZXM6IFtdXG4gIH0pO1xufVxuXG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUGlwZU1ldGFkYXRhIGltcGxlbWVudHMgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBuYW1lOiBzdHJpbmc7XG4gIHB1cmU6IGJvb2xlYW47XG4gIGNvbnN0cnVjdG9yKHt0eXBlLCBuYW1lLFxuICAgICAgICAgICAgICAgcHVyZX06IHt0eXBlPzogQ29tcGlsZVR5cGVNZXRhZGF0YSwgbmFtZT86IHN0cmluZywgcHVyZT86IGJvb2xlYW59ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wdXJlID0gbm9ybWFsaXplQm9vbChwdXJlKTtcbiAgfVxuICBnZXQgaWRlbnRpZmllcigpOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBpbGVQaXBlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVBpcGVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiBpc1ByZXNlbnQoZGF0YVsndHlwZSddKSA/IENvbXBpbGVUeXBlTWV0YWRhdGEuZnJvbUpzb24oZGF0YVsndHlwZSddKSA6IGRhdGFbJ3R5cGUnXSxcbiAgICAgIG5hbWU6IGRhdGFbJ25hbWUnXSxcbiAgICAgIHB1cmU6IGRhdGFbJ3B1cmUnXVxuICAgIH0pO1xuICB9XG5cbiAgdG9Kc29uKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ2NsYXNzJzogJ1BpcGUnLFxuICAgICAgJ3R5cGUnOiBpc1ByZXNlbnQodGhpcy50eXBlKSA/IHRoaXMudHlwZS50b0pzb24oKSA6IG51bGwsXG4gICAgICAnbmFtZSc6IHRoaXMubmFtZSxcbiAgICAgICdwdXJlJzogdGhpcy5wdXJlXG4gICAgfTtcbiAgfVxufVxuXG52YXIgX0NPTVBJTEVfTUVUQURBVEFfRlJPTV9KU09OID0ge1xuICAnRGlyZWN0aXZlJzogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmZyb21Kc29uLFxuICAnUGlwZSc6IENvbXBpbGVQaXBlTWV0YWRhdGEuZnJvbUpzb24sXG4gICdUeXBlJzogQ29tcGlsZVR5cGVNZXRhZGF0YS5mcm9tSnNvbixcbiAgJ0lkZW50aWZpZXInOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLmZyb21Kc29uXG59O1xuXG5mdW5jdGlvbiBhcnJheUZyb21Kc29uKG9iajogYW55W10sIGZuOiAoYToge1trZXk6IHN0cmluZ106IGFueX0pID0+IGFueSk6IGFueSB7XG4gIHJldHVybiBpc0JsYW5rKG9iaikgPyBudWxsIDogb2JqLm1hcChvID0+IG9iakZyb21Kc29uKG8sIGZuKSk7XG59XG5cbmZ1bmN0aW9uIGFycmF5VG9Kc29uKG9iajogYW55W10pOiBzdHJpbmcgfCB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIHJldHVybiBpc0JsYW5rKG9iaikgPyBudWxsIDogb2JqLm1hcChvYmpUb0pzb24pO1xufVxuXG5mdW5jdGlvbiBvYmpGcm9tSnNvbihvYmo6IGFueSwgZm46IChhOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYW55KTogYW55IHtcbiAgcmV0dXJuIChpc1N0cmluZyhvYmopIHx8IGlzQmxhbmsob2JqKSkgPyBvYmogOiBmbihvYmopO1xufVxuXG5mdW5jdGlvbiBvYmpUb0pzb24ob2JqOiBhbnkpOiBzdHJpbmcgfCB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIHJldHVybiAoaXNTdHJpbmcob2JqKSB8fCBpc0JsYW5rKG9iaikpID8gb2JqIDogb2JqLnRvSnNvbigpO1xufVxuIl19