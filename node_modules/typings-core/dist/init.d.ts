import Promise = require('any-promise');
export interface InitOptions {
    cwd: string;
    name?: string;
    main?: string;
    version?: string;
    upgrade?: boolean;
}
export declare function init(options: InitOptions): Promise<void>;
