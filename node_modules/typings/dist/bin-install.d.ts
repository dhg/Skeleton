import Promise = require('any-promise');
import { Emitter } from 'typings-core';
export declare function help(): string;
export interface Options {
    cwd: string;
    verbose: boolean;
    save: boolean;
    saveDev: boolean;
    savePeer: boolean;
    ambient: boolean;
    emitter: Emitter;
}
export declare function exec(args: string[], options: Options): Promise<void>;
