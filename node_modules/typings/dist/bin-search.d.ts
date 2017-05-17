import Promise = require('any-promise');
export declare function help(): string;
export interface Options {
    name: string;
    source: string;
    offset: string;
    limit: string;
    order: string;
    sort: string;
    verbose: boolean;
}
export declare function exec(args: string[], options: Options): Promise<void>;
