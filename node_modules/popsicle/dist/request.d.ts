import Promise = require('any-promise');
import Base, { BaseOptions, Headers } from './base';
import Response, { ResponseOptions } from './response';
import PopsicleError from './error';
export interface DefaultsOptions extends BaseOptions {
    url?: string;
    method?: string;
    timeout?: number;
    body?: any;
    options?: any;
    use?: Middleware[];
    before?: RequestPluginFunction[];
    after?: ResponsePluginFunction[];
    always?: RequestPluginFunction[];
    progress?: RequestPluginFunction[];
    transport?: TransportOptions;
}
export interface RequestOptions extends DefaultsOptions {
    url: string;
}
export interface RequestJSON {
    url: string;
    headers: Headers;
    body: any;
    timeout: number;
    options: any;
    method: string;
}
export interface TransportOptions {
    open: OpenHandler;
    abort?: AbortHandler;
    use?: Middleware[];
}
export declare type Middleware = (request?: Request) => any;
export declare type RequestPluginFunction = (request?: Request) => any;
export declare type ResponsePluginFunction = (response?: Response) => any;
export declare type OpenHandler = (request: Request) => Promise<ResponseOptions>;
export declare type AbortHandler = (request: Request) => any;
export default class Request extends Base implements Promise<Response> {
    method: string;
    timeout: number;
    body: any;
    options: any;
    response: Response;
    raw: any;
    errored: PopsicleError;
    transport: TransportOptions;
    aborted: boolean;
    timedout: boolean;
    opened: boolean;
    started: boolean;
    uploadLength: number;
    downloadLength: number;
    private _uploadedBytes;
    private _downloadedBytes;
    private _promise;
    private _before;
    private _after;
    private _always;
    private _progress;
    constructor(options: RequestOptions);
    use(fn: Middleware | Middleware[]): this;
    error(message: string, code: string, original?: Error): PopsicleError;
    then(onFulfilled: (response?: Response) => any, onRejected?: (error?: PopsicleError) => any): Promise<any>;
    catch(onRejected: (error?: PopsicleError) => any): Promise<any>;
    exec(cb: (err: PopsicleError, response?: Response) => any): void;
    toOptions(): RequestOptions;
    toJSON(): RequestJSON;
    clone(): Request;
    progress(fn: RequestPluginFunction | RequestPluginFunction[]): Request;
    before(fn: RequestPluginFunction | RequestPluginFunction[]): Request;
    after(fn: ResponsePluginFunction | ResponsePluginFunction[]): Request;
    always(fn: RequestPluginFunction | RequestPluginFunction[]): Request;
    abort(): this;
    uploaded: number;
    downloaded: number;
    completed: number;
    completedBytes: number;
    totalBytes: number;
    uploadedBytes: number;
    downloadedBytes: number;
}
