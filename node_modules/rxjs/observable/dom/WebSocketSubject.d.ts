import { Subject } from '../../Subject';
import { Subscriber } from '../../Subscriber';
import { Observable } from '../../Observable';
import { Operator } from '../../Operator';
import { Subscription } from '../../Subscription';
import { Observer } from '../../Observer';
export interface WebSocketSubjectConfig {
    url: string;
    protocol?: string | Array<string>;
    resultSelector?: <T>(e: MessageEvent) => T;
    openObserver?: Observer<Event>;
    closeObserver?: Observer<CloseEvent>;
    closingObserver?: Observer<void>;
    WebSocketCtor?: {
        new (url: string, protocol?: string | Array<string>): WebSocket;
    };
}
export declare class WebSocketSubject<T> extends Subject<T> {
    url: string;
    protocol: string | Array<string>;
    socket: WebSocket;
    openObserver: Observer<Event>;
    closeObserver: Observer<CloseEvent>;
    closingObserver: Observer<void>;
    WebSocketCtor: {
        new (url: string, protocol?: string | Array<string>): WebSocket;
    };
    resultSelector(e: MessageEvent): any;
    static create<T>(urlConfigOrSource: string | WebSocketSubjectConfig): WebSocketSubject<T>;
    constructor(urlConfigOrSource: string | WebSocketSubjectConfig | Observable<T>, destination?: Observer<T>);
    lift<R>(operator: Operator<T, R>): WebSocketSubject<T>;
    multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean): Observable<{}>;
    protected _unsubscribe(): void;
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
}
