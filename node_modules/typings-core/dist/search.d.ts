import Promise = require('any-promise');
export interface SearchOptions {
    query?: string;
    name?: string;
    source?: string;
    offset?: string;
    limit?: string;
    order?: string;
    sort?: string;
}
export interface SearchResults {
    total: number;
    results: Array<{
        name: string;
        source: string;
        homepage: string;
        description: string;
        updated: string;
        versions: number;
    }>;
}
export declare function search(options?: SearchOptions): Promise<SearchResults>;
