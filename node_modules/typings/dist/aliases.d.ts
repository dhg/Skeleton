export interface Aliases {
    [cmd: string]: {
        exec(args: string[], options: Object): any;
        help(): string;
    };
}
export declare const aliases: Aliases;
