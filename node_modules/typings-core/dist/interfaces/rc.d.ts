export interface RcConfig {
    proxy?: string;
    httpProxy?: string;
    httpsProxy?: string;
    noProxy?: string;
    rejectUnauthorized?: boolean;
    ca?: string | string[];
    key?: string;
    cert?: string;
    userAgent?: string;
    githubToken?: string;
    registryURL?: string;
    defaultSource?: string;
    defaultAmbientSource?: string;
}
