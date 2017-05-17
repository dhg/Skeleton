export interface OpenOptions {
    homepage?: boolean;
    issues?: boolean;
}
export declare function open(raw: string, options?: OpenOptions): string;
