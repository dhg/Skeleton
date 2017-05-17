import Promise = require('any-promise');
import { Emitter, DependencyTree } from './interfaces';
export interface ListOptions {
    cwd: string;
    production?: boolean;
    emitter?: Emitter;
}
export declare function list(options: ListOptions): Promise<DependencyTree>;
