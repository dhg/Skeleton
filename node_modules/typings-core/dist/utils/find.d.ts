import Promise = require('any-promise');
export declare function findProject(dir: string): Promise<string>;
export declare function findConfigFile(dir: string): Promise<string>;
export declare function findUp(dir: string, filename: string, from?: string): Promise<string>;
