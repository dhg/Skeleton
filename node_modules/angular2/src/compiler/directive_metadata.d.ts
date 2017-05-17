import { Type } from 'angular2/src/facade/lang';
import { ChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { LifecycleHooks } from 'angular2/src/core/linker/interfaces';
export declare abstract class CompileMetadataWithIdentifier {
    static fromJson(data: {
        [key: string]: any;
    }): CompileMetadataWithIdentifier;
    abstract toJson(): {
        [key: string]: any;
    };
    identifier: CompileIdentifierMetadata;
}
export declare abstract class CompileMetadataWithType extends CompileMetadataWithIdentifier {
    static fromJson(data: {
        [key: string]: any;
    }): CompileMetadataWithType;
    abstract toJson(): {
        [key: string]: any;
    };
    type: CompileTypeMetadata;
    identifier: CompileIdentifierMetadata;
}
export declare class CompileIdentifierMetadata implements CompileMetadataWithIdentifier {
    runtime: any;
    name: string;
    prefix: string;
    moduleUrl: string;
    constConstructor: boolean;
    constructor({runtime, name, moduleUrl, prefix, constConstructor}?: {
        runtime?: any;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        constConstructor?: boolean;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileIdentifierMetadata;
    toJson(): {
        [key: string]: any;
    };
    identifier: CompileIdentifierMetadata;
}
export declare class CompileDiDependencyMetadata {
    isAttribute: boolean;
    isSelf: boolean;
    isHost: boolean;
    isSkipSelf: boolean;
    isOptional: boolean;
    query: CompileQueryMetadata;
    viewQuery: CompileQueryMetadata;
    token: CompileIdentifierMetadata | string;
    constructor({isAttribute, isSelf, isHost, isSkipSelf, isOptional, query, viewQuery, token}?: {
        isAttribute?: boolean;
        isSelf?: boolean;
        isHost?: boolean;
        isSkipSelf?: boolean;
        isOptional?: boolean;
        query?: CompileQueryMetadata;
        viewQuery?: CompileQueryMetadata;
        token?: CompileIdentifierMetadata | string;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileDiDependencyMetadata;
    toJson(): {
        [key: string]: any;
    };
}
export declare class CompileProviderMetadata {
    token: CompileIdentifierMetadata | string;
    useClass: CompileTypeMetadata;
    useValue: any;
    useExisting: CompileIdentifierMetadata | string;
    useFactory: CompileFactoryMetadata;
    deps: CompileDiDependencyMetadata[];
    multi: boolean;
    constructor({token, useClass, useValue, useExisting, useFactory, deps, multi}: {
        token?: CompileIdentifierMetadata | string;
        useClass?: CompileTypeMetadata;
        useValue?: any;
        useExisting?: CompileIdentifierMetadata | string;
        useFactory?: CompileFactoryMetadata;
        deps?: CompileDiDependencyMetadata[];
        multi?: boolean;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileProviderMetadata;
    toJson(): {
        [key: string]: any;
    };
}
export declare class CompileFactoryMetadata implements CompileIdentifierMetadata {
    runtime: Function;
    name: string;
    prefix: string;
    moduleUrl: string;
    constConstructor: boolean;
    diDeps: CompileDiDependencyMetadata[];
    constructor({runtime, name, moduleUrl, constConstructor, diDeps}: {
        runtime?: Function;
        name?: string;
        moduleUrl?: string;
        constConstructor?: boolean;
        diDeps?: CompileDiDependencyMetadata[];
    });
    identifier: CompileIdentifierMetadata;
    toJson(): any;
}
/**
 * Metadata regarding compilation of a type.
 */
export declare class CompileTypeMetadata implements CompileIdentifierMetadata, CompileMetadataWithType {
    runtime: Type;
    name: string;
    prefix: string;
    moduleUrl: string;
    isHost: boolean;
    constConstructor: boolean;
    diDeps: CompileDiDependencyMetadata[];
    constructor({runtime, name, moduleUrl, prefix, isHost, constConstructor, diDeps}?: {
        runtime?: Type;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        isHost?: boolean;
        constConstructor?: boolean;
        diDeps?: CompileDiDependencyMetadata[];
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileTypeMetadata;
    identifier: CompileIdentifierMetadata;
    type: CompileTypeMetadata;
    toJson(): {
        [key: string]: any;
    };
}
export declare class CompileQueryMetadata {
    selectors: Array<CompileIdentifierMetadata | string>;
    descendants: boolean;
    first: boolean;
    propertyName: string;
    constructor({selectors, descendants, first, propertyName}?: {
        selectors?: Array<CompileIdentifierMetadata | string>;
        descendants?: boolean;
        first?: boolean;
        propertyName?: string;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileQueryMetadata;
    toJson(): {
        [key: string]: any;
    };
}
/**
 * Metadata regarding compilation of a template.
 */
export declare class CompileTemplateMetadata {
    encapsulation: ViewEncapsulation;
    template: string;
    templateUrl: string;
    styles: string[];
    styleUrls: string[];
    ngContentSelectors: string[];
    constructor({encapsulation, template, templateUrl, styles, styleUrls, ngContentSelectors}?: {
        encapsulation?: ViewEncapsulation;
        template?: string;
        templateUrl?: string;
        styles?: string[];
        styleUrls?: string[];
        ngContentSelectors?: string[];
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileTemplateMetadata;
    toJson(): {
        [key: string]: any;
    };
}
/**
 * Metadata regarding compilation of a directive.
 */
export declare class CompileDirectiveMetadata implements CompileMetadataWithType {
    static create({type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        dynamicLoadable?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: string[];
        outputs?: string[];
        host?: {
            [key: string]: string;
        };
        lifecycleHooks?: LifecycleHooks[];
        providers?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
        viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
        queries?: CompileQueryMetadata[];
        viewQueries?: CompileQueryMetadata[];
        template?: CompileTemplateMetadata;
    }): CompileDirectiveMetadata;
    type: CompileTypeMetadata;
    isComponent: boolean;
    dynamicLoadable: boolean;
    selector: string;
    exportAs: string;
    changeDetection: ChangeDetectionStrategy;
    inputs: {
        [key: string]: string;
    };
    outputs: {
        [key: string]: string;
    };
    hostListeners: {
        [key: string]: string;
    };
    hostProperties: {
        [key: string]: string;
    };
    hostAttributes: {
        [key: string]: string;
    };
    lifecycleHooks: LifecycleHooks[];
    providers: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
    viewProviders: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
    queries: CompileQueryMetadata[];
    viewQueries: CompileQueryMetadata[];
    template: CompileTemplateMetadata;
    constructor({type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers, viewProviders, queries, viewQueries, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        dynamicLoadable?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: {
            [key: string]: string;
        };
        outputs?: {
            [key: string]: string;
        };
        hostListeners?: {
            [key: string]: string;
        };
        hostProperties?: {
            [key: string]: string;
        };
        hostAttributes?: {
            [key: string]: string;
        };
        lifecycleHooks?: LifecycleHooks[];
        providers?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
        viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | any[]>;
        queries?: CompileQueryMetadata[];
        viewQueries?: CompileQueryMetadata[];
        template?: CompileTemplateMetadata;
    });
    identifier: CompileIdentifierMetadata;
    static fromJson(data: {
        [key: string]: any;
    }): CompileDirectiveMetadata;
    toJson(): {
        [key: string]: any;
    };
}
/**
 * Construct {@link CompileDirectiveMetadata} from {@link ComponentTypeMetadata} and a selector.
 */
export declare function createHostComponentMeta(componentType: CompileTypeMetadata, componentSelector: string): CompileDirectiveMetadata;
export declare class CompilePipeMetadata implements CompileMetadataWithType {
    type: CompileTypeMetadata;
    name: string;
    pure: boolean;
    constructor({type, name, pure}?: {
        type?: CompileTypeMetadata;
        name?: string;
        pure?: boolean;
    });
    identifier: CompileIdentifierMetadata;
    static fromJson(data: {
        [key: string]: any;
    }): CompilePipeMetadata;
    toJson(): {
        [key: string]: any;
    };
}
