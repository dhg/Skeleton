export declare class Subscription {
    static EMPTY: Subscription;
    isUnsubscribed: boolean;
    constructor(_unsubscribe?: () => void);
    unsubscribe(): void;
    add(subscription: Subscription | Function | void): void;
    remove(subscription: Subscription): void;
}
export declare class UnsubscriptionError extends Error {
    errors: any[];
    constructor(errors: any[]);
}
