import Promise = require('any-promise');
export declare function help(): string;
export interface Options {
    verbose: boolean;
    cwd: string;
    upgrade: boolean;
}
export declare function exec(args: string[], options: Options): Promise<void>;
