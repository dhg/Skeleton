import Promise = require('any-promise');
import { DependencyTree } from 'typings-core';
export interface PrintOptions {
    verbose: boolean;
}
export declare function log(message: string): void;
export declare function logInfo(message: string, prefix?: string): void;
export declare function logWarning(message: string, prefix?: string): void;
export declare function logError(message: string, prefix?: string): void;
export declare function handle(promise: any, options: PrintOptions): Promise<any>;
export declare function handleError(error: Error, options: PrintOptions): any;
export interface ArchifyOptions {
    name?: string;
    tree: DependencyTree;
}
export declare function archifyDependencyTree(options: ArchifyOptions): string;
