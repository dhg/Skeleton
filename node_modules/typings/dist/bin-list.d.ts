import Promise = require('any-promise');
export declare function help(): string;
export interface Options {
    cwd: string;
    dev: boolean;
    verbose: boolean;
}
export declare function exec(args: string[], options: Options): Promise<void>;
