export * from './common';
import Request, { Middleware } from '../request';
export declare function unzip(): (request: Request) => void;
export declare function concatStream(encoding: string): (request: Request) => void;
export declare function headers(): (request: Request) => void;
export declare const defaults: Middleware[];
