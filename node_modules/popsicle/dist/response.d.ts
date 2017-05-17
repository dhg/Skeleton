import Base, { BaseOptions, Headers, RawHeaders } from './base';
import Request from './request';
import PopsicleError from './error';
export interface ResponseOptions extends BaseOptions {
    body: any;
    status: number;
    statusText: string;
}
export interface ResponseJSON {
    headers: Headers;
    rawHeaders: RawHeaders;
    body: any;
    url: string;
    status: number;
    statusText: string;
}
export default class Response extends Base {
    status: number;
    statusText: string;
    body: any;
    request: Request;
    constructor(options: ResponseOptions);
    statusType(): number;
    error(message: string, type: string, error?: Error): PopsicleError;
    toJSON(): ResponseJSON;
}
