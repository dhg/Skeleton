export declare const EOL: string;
export declare function isHttp(url: string): boolean;
export declare function isDefinition(path: string): boolean;
export declare function isModuleName(value: string): boolean;
export declare function normalizeSlashes(path: string): string;
export declare function resolveFrom(from: string, to: string): string;
export declare function relativeTo(from: string, to: string): string;
export declare function toDefinition(path: string): string;
export declare function pathFromDefinition(path: string): string;
export declare function normalizeToDefinition(path: string): string;
export declare function getTypingsLocation(options: {
    cwd: string;
}): {
    typingsDir: string;
    mainDtsFile: string;
    browserDtsFile: string;
};
export interface DefinitionOptions {
    cwd: string;
    name: string;
    ambient?: boolean;
}
export declare function getDependencyLocation(options: DefinitionOptions): {
    mainFile: string;
    browserFile: string;
    mainPath: string;
    browserPath: string;
    mainDtsFile: string;
    browserDtsFile: string;
};
export declare function detectEOL(contents: string): string;
export declare function normalizeEOL(contents: string, eol: string): string;
