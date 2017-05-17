export declare const REFERENCE_REGEXP: RegExp;
export interface Reference {
    start: number;
    end: number;
    path: string;
}
export declare function extractReferences(contents: string, cwd: string): Reference[];
export declare function parseReferences(contents: string, cwd: string): string[];
export declare function stringifyReferences(paths: string[], cwd: string): string;
export declare function toReference(path: string, cwd: string): string;
