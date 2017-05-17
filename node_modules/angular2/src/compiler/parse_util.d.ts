export declare class ParseLocation {
    file: ParseSourceFile;
    offset: number;
    line: number;
    col: number;
    constructor(file: ParseSourceFile, offset: number, line: number, col: number);
    toString(): string;
}
export declare class ParseSourceFile {
    content: string;
    url: string;
    constructor(content: string, url: string);
}
export declare class ParseSourceSpan {
    start: ParseLocation;
    end: ParseLocation;
    constructor(start: ParseLocation, end: ParseLocation);
    toString(): string;
}
export declare abstract class ParseError {
    span: ParseSourceSpan;
    msg: string;
    constructor(span: ParseSourceSpan, msg: string);
    toString(): string;
}
