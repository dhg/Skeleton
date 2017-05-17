import Promise = require('any-promise');
import { CompiledOutput } from './lib/compile';
import { Emitter } from './interfaces';
export interface BundleOptions {
    name?: string;
    cwd: string;
    ambient?: boolean;
    out: string;
    emitter?: Emitter;
}
export declare function bundle(options: BundleOptions): Promise<CompiledOutput>;
