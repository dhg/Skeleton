var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { XHR } from 'angular2/src/compiler/xhr';
import { FnArg, UiArguments, ClientMessageBrokerFactory } from 'angular2/src/web_workers/shared/client_message_broker';
import { XHR_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
/**
 * Implementation of compiler/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
export let WebWorkerXHRImpl = class extends XHR {
    constructor(messageBrokerFactory) {
        super();
        this._messageBroker = messageBrokerFactory.createMessageBroker(XHR_CHANNEL);
    }
    get(url) {
        var fnArgs = [new FnArg(url, null)];
        var args = new UiArguments("get", fnArgs);
        return this._messageBroker.runOnService(args, String);
    }
};
WebWorkerXHRImpl = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ClientMessageBrokerFactory])
], WebWorkerXHRImpl);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3hocl9pbXBsLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclhIUkltcGwiLCJXZWJXb3JrZXJYSFJJbXBsLmNvbnN0cnVjdG9yIiwiV2ViV29ya2VyWEhSSW1wbC5nZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsR0FBRyxFQUFDLE1BQU0sMkJBQTJCO09BQ3RDLEVBQ0wsS0FBSyxFQUNMLFdBQVcsRUFFWCwwQkFBMEIsRUFDM0IsTUFBTSx1REFBdUQ7T0FDdkQsRUFBQyxXQUFXLEVBQUMsTUFBTSwrQ0FBK0M7QUFFekU7OztHQUdHO0FBQ0gsNENBQ3NDLEdBQUc7SUFHdkNBLFlBQVlBLG9CQUFnREE7UUFDMURDLE9BQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUM5RUEsQ0FBQ0E7SUFFREQsR0FBR0EsQ0FBQ0EsR0FBV0E7UUFDYkUsSUFBSUEsTUFBTUEsR0FBWUEsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLElBQUlBLElBQUlBLEdBQWdCQSxJQUFJQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN2REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0FBQ0hGLENBQUNBO0FBZEQ7SUFBQyxVQUFVLEVBQUU7O3FCQWNaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7XG4gIEZuQXJnLFxuICBVaUFyZ3VtZW50cyxcbiAgQ2xpZW50TWVzc2FnZUJyb2tlcixcbiAgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnlcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXInO1xuaW1wb3J0IHtYSFJfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBjb21waWxlci94aHIgdGhhdCByZWxheXMgWEhSIHJlcXVlc3RzIHRvIHRoZSBVSSBzaWRlIHdoZXJlIHRoZXkgYXJlIHNlbnRcbiAqIGFuZCB0aGUgcmVzdWx0IGlzIHByb3hpZWQgYmFjayB0byB0aGUgd29ya2VyXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJYSFJJbXBsIGV4dGVuZHMgWEhSIHtcbiAgcHJpdmF0ZSBfbWVzc2FnZUJyb2tlcjogQ2xpZW50TWVzc2FnZUJyb2tlcjtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlQnJva2VyRmFjdG9yeTogQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIgPSBtZXNzYWdlQnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKFhIUl9DSEFOTkVMKTtcbiAgfVxuXG4gIGdldCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdmFyIGZuQXJnczogRm5BcmdbXSA9IFtuZXcgRm5BcmcodXJsLCBudWxsKV07XG4gICAgdmFyIGFyZ3M6IFVpQXJndW1lbnRzID0gbmV3IFVpQXJndW1lbnRzKFwiZ2V0XCIsIGZuQXJncyk7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIFN0cmluZyk7XG4gIH1cbn1cbiJdfQ==