import Promise = require('any-promise');
import Request from './request';
import { defaults as use } from './plugins/index';
export { open, abort, use };
declare function open(request: Request): Promise<{}>;
declare function abort(request: Request): void;
