export interface ConfigJson {
    main?: string;
    browser?: Browser;
    version?: string;
    files?: string[];
    ambient?: boolean;
    postmessage?: string;
    name?: string;
    dependencies?: Dependencies;
    devDependencies?: Dependencies;
    peerDependencies?: Dependencies;
    ambientDependencies?: Dependencies;
    ambientDevDependencies?: Dependencies;
}
export declare type DependencyString = string;
export declare type Browser = string | Overrides;
export interface Overrides {
    [dependency: string]: string;
}
export interface Dependencies {
    [name: string]: DependencyString;
}
