import Promise = require('any-promise');
import { CompiledOutput } from './lib/compile';
import { DependencyTree, Emitter } from './interfaces';
export interface InstallDependencyOptions {
    save?: boolean;
    saveDev?: boolean;
    savePeer?: boolean;
    ambient?: boolean;
    cwd: string;
    emitter?: Emitter;
}
export interface InstallOptions {
    cwd: string;
    production?: boolean;
    emitter?: Emitter;
}
export declare function install(options: InstallOptions): Promise<{
    tree: DependencyTree;
}>;
export declare function installDependencyRaw(raw: string, options: InstallDependencyOptions): Promise<CompiledOutput>;
export interface InstallExpression {
    name: string;
    location: string;
}
export declare function installDependency(expression: InstallExpression, options: InstallDependencyOptions): Promise<CompiledOutput>;
