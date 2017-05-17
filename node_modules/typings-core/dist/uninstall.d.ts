import Promise = require('any-promise');
import { Emitter } from './interfaces';
export interface UninstallDependencyOptions {
    save?: boolean;
    saveDev?: boolean;
    savePeer?: boolean;
    ambient?: boolean;
    cwd: string;
    emitter?: Emitter;
}
export declare function uninstallDependency(name: string, options: UninstallDependencyOptions): Promise<void>;
