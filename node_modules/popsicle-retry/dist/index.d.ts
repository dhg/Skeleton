import { Request } from 'popsicle';
declare function popsicleRetry(retries?: (request: Request, iter: number) => number): (self: Request) => void;
declare namespace popsicleRetry {
    function retryAllowed(request: Request): boolean;
    function retries(count?: number, isRetryAllowed?: typeof retryAllowed): (request: Request, iter: number) => number;
}
export = popsicleRetry;
