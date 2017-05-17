import { HtmlElementAst } from 'angular2/src/compiler/html_ast';
import { isPresent } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { id } from './message';
import { I18nError, I18N_ATTR_PREFIX, partition, messageFromAttribute } from './shared';
/**
 * All messages extracted from a template.
 */
export class ExtractionResult {
    constructor(messages, errors) {
        this.messages = messages;
        this.errors = errors;
    }
}
/**
 * Removes duplicate messages.
 *
 * E.g.
 *
 * ```
 *  var m = [new Message("message", "meaning", "desc1"), new Message("message", "meaning",
 * "desc2")];
 *  expect(removeDuplicates(m)).toEqual([new Message("message", "meaning", "desc1")]);
 * ```
 */
export function removeDuplicates(messages) {
    let uniq = {};
    messages.forEach(m => {
        if (!StringMapWrapper.contains(uniq, id(m))) {
            uniq[id(m)] = m;
        }
    });
    return StringMapWrapper.values(uniq);
}
/**
 * Extracts all messages from a template.
 *
 * Algorithm:
 *
 * To understand the algorithm, you need to know how partitioning works.
 * Partitioning is required as we can use two i18n comments to group node siblings together.
 * That is why we cannot just use nodes.
 *
 * Partitioning transforms an array of HtmlAst into an array of Part.
 * A part can optionally contain a root element or a root text node. And it can also contain
 * children.
 * A part can contain i18n property, in which case it needs to be extracted.
 *
 * Example:
 *
 * The following array of nodes will be split into four parts:
 *
 * ```
 * <a>A</a>
 * <b i18n>B</b>
 * <!-- i18n -->
 * <c>C</c>
 * D
 * <!-- /i18n -->
 * E
 * ```
 *
 * Part 1 containing the a tag. It should not be translated.
 * Part 2 containing the b tag. It should be translated.
 * Part 3 containing the c tag and the D text node. It should be translated.
 * Part 4 containing the E text node. It should not be translated..
 *
 * It is also important to understand how we stringify nodes to create a message.
 *
 * We walk the tree and replace every element node with a placeholder. We also replace
 * all expressions in interpolation with placeholders. We also insert a placeholder element
 * to wrap a text node containing interpolation.
 *
 * Example:
 *
 * The following tree:
 *
 * ```
 * <a>A{{I}}</a><b>B</b>
 * ```
 *
 * will be stringified into:
 * ```
 * <ph name="e0"><ph name="t1">A<ph name="0"/></ph></ph><ph name="e2">B</ph>
 * ```
 *
 * This is what the algorithm does:
 *
 * 1. Use the provided html parser to get the html AST of the template.
 * 2. Partition the root nodes, and process each part separately.
 * 3. If a part does not have the i18n attribute, recurse to process children and attributes.
 * 4. If a part has the i18n attribute, stringify the nodes to create a Message.
 */
export class MessageExtractor {
    constructor(_htmlParser, _parser) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
    }
    extract(template, sourceUrl) {
        this.messages = [];
        this.errors = [];
        let res = this._htmlParser.parse(template, sourceUrl);
        if (res.errors.length > 0) {
            return new ExtractionResult([], res.errors);
        }
        else {
            this._recurse(res.rootNodes);
            return new ExtractionResult(this.messages, this.errors);
        }
    }
    _extractMessagesFromPart(p) {
        if (p.hasI18n) {
            this.messages.push(p.createMessage(this._parser));
            this._recurseToExtractMessagesFromAttributes(p.children);
        }
        else {
            this._recurse(p.children);
        }
        if (isPresent(p.rootElement)) {
            this._extractMessagesFromAttributes(p.rootElement);
        }
    }
    _recurse(nodes) {
        if (isPresent(nodes)) {
            let ps = partition(nodes, this.errors);
            ps.forEach(p => this._extractMessagesFromPart(p));
        }
    }
    _recurseToExtractMessagesFromAttributes(nodes) {
        nodes.forEach(n => {
            if (n instanceof HtmlElementAst) {
                this._extractMessagesFromAttributes(n);
                this._recurseToExtractMessagesFromAttributes(n.children);
            }
        });
    }
    _extractMessagesFromAttributes(p) {
        p.attrs.forEach(attr => {
            if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
                try {
                    this.messages.push(messageFromAttribute(this._parser, p, attr));
                }
                catch (e) {
                    if (e instanceof I18nError) {
                        this.errors.push(e);
                    }
                    else {
                        throw e;
                    }
                }
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZV9leHRyYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaTE4bi9tZXNzYWdlX2V4dHJhY3Rvci50cyJdLCJuYW1lcyI6WyJFeHRyYWN0aW9uUmVzdWx0IiwiRXh0cmFjdGlvblJlc3VsdC5jb25zdHJ1Y3RvciIsInJlbW92ZUR1cGxpY2F0ZXMiLCJNZXNzYWdlRXh0cmFjdG9yIiwiTWVzc2FnZUV4dHJhY3Rvci5jb25zdHJ1Y3RvciIsIk1lc3NhZ2VFeHRyYWN0b3IuZXh0cmFjdCIsIk1lc3NhZ2VFeHRyYWN0b3IuX2V4dHJhY3RNZXNzYWdlc0Zyb21QYXJ0IiwiTWVzc2FnZUV4dHJhY3Rvci5fcmVjdXJzZSIsIk1lc3NhZ2VFeHRyYWN0b3IuX3JlY3Vyc2VUb0V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzIiwiTWVzc2FnZUV4dHJhY3Rvci5fZXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMiXSwibWFwcGluZ3MiOiJPQUVPLEVBR0wsY0FBYyxFQUtmLE1BQU0sZ0NBQWdDO09BQ2hDLEVBQUMsU0FBUyxFQUFVLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFeEQsRUFBVSxFQUFFLEVBQUMsTUFBTSxXQUFXO09BQzlCLEVBQ0wsU0FBUyxFQUVULGdCQUFnQixFQUNoQixTQUFTLEVBSVQsb0JBQW9CLEVBQ3JCLE1BQU0sVUFBVTtBQUVqQjs7R0FFRztBQUNIO0lBQ0VBLFlBQW1CQSxRQUFtQkEsRUFBU0EsTUFBb0JBO1FBQWhEQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFXQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFjQTtJQUFHQSxDQUFDQTtBQUN6RUQsQ0FBQ0E7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsaUNBQWlDLFFBQW1CO0lBQ2xERSxJQUFJQSxJQUFJQSxHQUE2QkEsRUFBRUEsQ0FBQ0E7SUFDeENBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNB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QUlBLENBQUNBLENBQUNBO3dCQUNOQSxNQUFNQSxDQUFDQSxDQUFDQTtvQkFDVkEsQ0FBQ0E7Z0JBQ0hBLENBQUNBO1lBQ0hBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0FBQ0hOLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge1BhcnNlU291cmNlU3BhbiwgUGFyc2VFcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtcbiAgSHRtbEFzdCxcbiAgSHRtbEFzdFZpc2l0b3IsXG4gIEh0bWxFbGVtZW50QXN0LFxuICBIdG1sQXR0ckFzdCxcbiAgSHRtbFRleHRBc3QsXG4gIEh0bWxDb21tZW50QXN0LFxuICBodG1sVmlzaXRBbGxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2h0bWxfYXN0JztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge01lc3NhZ2UsIGlkfSBmcm9tICcuL21lc3NhZ2UnO1xuaW1wb3J0IHtcbiAgSTE4bkVycm9yLFxuICBQYXJ0LFxuICBJMThOX0FUVFJfUFJFRklYLFxuICBwYXJ0aXRpb24sXG4gIG1lYW5pbmcsXG4gIGRlc2NyaXB0aW9uLFxuICBzdHJpbmdpZnlOb2RlcyxcbiAgbWVzc2FnZUZyb21BdHRyaWJ1dGVcbn0gZnJvbSAnLi9zaGFyZWQnO1xuXG4vKipcbiAqIEFsbCBtZXNzYWdlcyBleHRyYWN0ZWQgZnJvbSBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgY2xhc3MgRXh0cmFjdGlvblJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtZXNzYWdlczogTWVzc2FnZVtdLCBwdWJsaWMgZXJyb3JzOiBQYXJzZUVycm9yW10pIHt9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBkdXBsaWNhdGUgbWVzc2FnZXMuXG4gKlxuICogRS5nLlxuICpcbiAqIGBgYFxuICogIHZhciBtID0gW25ldyBNZXNzYWdlKFwibWVzc2FnZVwiLCBcIm1lYW5pbmdcIiwgXCJkZXNjMVwiKSwgbmV3IE1lc3NhZ2UoXCJtZXNzYWdlXCIsIFwibWVhbmluZ1wiLFxuICogXCJkZXNjMlwiKV07XG4gKiAgZXhwZWN0KHJlbW92ZUR1cGxpY2F0ZXMobSkpLnRvRXF1YWwoW25ldyBNZXNzYWdlKFwibWVzc2FnZVwiLCBcIm1lYW5pbmdcIiwgXCJkZXNjMVwiKV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVEdXBsaWNhdGVzKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiBNZXNzYWdlW10ge1xuICBsZXQgdW5pcToge1trZXk6IHN0cmluZ106IE1lc3NhZ2V9ID0ge307XG4gIG1lc3NhZ2VzLmZvckVhY2gobSA9PiB7XG4gICAgaWYgKCFTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHVuaXEsIGlkKG0pKSkge1xuICAgICAgdW5pcVtpZChtKV0gPSBtO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLnZhbHVlcyh1bmlxKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBhbGwgbWVzc2FnZXMgZnJvbSBhIHRlbXBsYXRlLlxuICpcbiAqIEFsZ29yaXRobTpcbiAqXG4gKiBUbyB1bmRlcnN0YW5kIHRoZSBhbGdvcml0aG0sIHlvdSBuZWVkIHRvIGtub3cgaG93IHBhcnRpdGlvbmluZyB3b3Jrcy5cbiAqIFBhcnRpdGlvbmluZyBpcyByZXF1aXJlZCBhcyB3ZSBjYW4gdXNlIHR3byBpMThuIGNvbW1lbnRzIHRvIGdyb3VwIG5vZGUgc2libGluZ3MgdG9nZXRoZXIuXG4gKiBUaGF0IGlzIHdoeSB3ZSBjYW5ub3QganVzdCB1c2Ugbm9kZXMuXG4gKlxuICogUGFydGl0aW9uaW5nIHRyYW5zZm9ybXMgYW4gYXJyYXkgb2YgSHRtbEFzdCBpbnRvIGFuIGFycmF5IG9mIFBhcnQuXG4gKiBBIHBhcnQgY2FuIG9wdGlvbmFsbHkgY29udGFpbiBhIHJvb3QgZWxlbWVudCBvciBhIHJvb3QgdGV4dCBub2RlLiBBbmQgaXQgY2FuIGFsc28gY29udGFpblxuICogY2hpbGRyZW4uXG4gKiBBIHBhcnQgY2FuIGNvbnRhaW4gaTE4biBwcm9wZXJ0eSwgaW4gd2hpY2ggY2FzZSBpdCBuZWVkcyB0byBiZSBleHRyYWN0ZWQuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGFycmF5IG9mIG5vZGVzIHdpbGwgYmUgc3BsaXQgaW50byBmb3VyIHBhcnRzOlxuICpcbiAqIGBgYFxuICogPGE+QTwvYT5cbiAqIDxiIGkxOG4+QjwvYj5cbiAqIDwhLS0gaTE4biAtLT5cbiAqIDxjPkM8L2M+XG4gKiBEXG4gKiA8IS0tIC9pMThuIC0tPlxuICogRVxuICogYGBgXG4gKlxuICogUGFydCAxIGNvbnRhaW5pbmcgdGhlIGEgdGFnLiBJdCBzaG91bGQgbm90IGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDIgY29udGFpbmluZyB0aGUgYiB0YWcuIEl0IHNob3VsZCBiZSB0cmFuc2xhdGVkLlxuICogUGFydCAzIGNvbnRhaW5pbmcgdGhlIGMgdGFnIGFuZCB0aGUgRCB0ZXh0IG5vZGUuIEl0IHNob3VsZCBiZSB0cmFuc2xhdGVkLlxuICogUGFydCA0IGNvbnRhaW5pbmcgdGhlIEUgdGV4dCBub2RlLiBJdCBzaG91bGQgbm90IGJlIHRyYW5zbGF0ZWQuLlxuICpcbiAqIEl0IGlzIGFsc28gaW1wb3J0YW50IHRvIHVuZGVyc3RhbmQgaG93IHdlIHN0cmluZ2lmeSBub2RlcyB0byBjcmVhdGUgYSBtZXNzYWdlLlxuICpcbiAqIFdlIHdhbGsgdGhlIHRyZWUgYW5kIHJlcGxhY2UgZXZlcnkgZWxlbWVudCBub2RlIHdpdGggYSBwbGFjZWhvbGRlci4gV2UgYWxzbyByZXBsYWNlXG4gKiBhbGwgZXhwcmVzc2lvbnMgaW4gaW50ZXJwb2xhdGlvbiB3aXRoIHBsYWNlaG9sZGVycy4gV2UgYWxzbyBpbnNlcnQgYSBwbGFjZWhvbGRlciBlbGVtZW50XG4gKiB0byB3cmFwIGEgdGV4dCBub2RlIGNvbnRhaW5pbmcgaW50ZXJwb2xhdGlvbi5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgdHJlZTpcbiAqXG4gKiBgYGBcbiAqIDxhPkF7e0l9fTwvYT48Yj5CPC9iPlxuICogYGBgXG4gKlxuICogd2lsbCBiZSBzdHJpbmdpZmllZCBpbnRvOlxuICogYGBgXG4gKiA8cGggbmFtZT1cImUwXCI+PHBoIG5hbWU9XCJ0MVwiPkE8cGggbmFtZT1cIjBcIi8+PC9waD48L3BoPjxwaCBuYW1lPVwiZTJcIj5CPC9waD5cbiAqIGBgYFxuICpcbiAqIFRoaXMgaXMgd2hhdCB0aGUgYWxnb3JpdGhtIGRvZXM6XG4gKlxuICogMS4gVXNlIHRoZSBwcm92aWRlZCBodG1sIHBhcnNlciB0byBnZXQgdGhlIGh0bWwgQVNUIG9mIHRoZSB0ZW1wbGF0ZS5cbiAqIDIuIFBhcnRpdGlvbiB0aGUgcm9vdCBub2RlcywgYW5kIHByb2Nlc3MgZWFjaCBwYXJ0IHNlcGFyYXRlbHkuXG4gKiAzLiBJZiBhIHBhcnQgZG9lcyBub3QgaGF2ZSB0aGUgaTE4biBhdHRyaWJ1dGUsIHJlY3Vyc2UgdG8gcHJvY2VzcyBjaGlsZHJlbiBhbmQgYXR0cmlidXRlcy5cbiAqIDQuIElmIGEgcGFydCBoYXMgdGhlIGkxOG4gYXR0cmlidXRlLCBzdHJpbmdpZnkgdGhlIG5vZGVzIHRvIGNyZWF0ZSBhIE1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXNzYWdlRXh0cmFjdG9yIHtcbiAgbWVzc2FnZXM6IE1lc3NhZ2VbXTtcbiAgZXJyb3JzOiBQYXJzZUVycm9yW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlciwgcHJpdmF0ZSBfcGFyc2VyOiBQYXJzZXIpIHt9XG5cbiAgZXh0cmFjdCh0ZW1wbGF0ZTogc3RyaW5nLCBzb3VyY2VVcmw6IHN0cmluZyk6IEV4dHJhY3Rpb25SZXN1bHQge1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLmVycm9ycyA9IFtdO1xuXG4gICAgbGV0IHJlcyA9IHRoaXMuX2h0bWxQYXJzZXIucGFyc2UodGVtcGxhdGUsIHNvdXJjZVVybCk7XG4gICAgaWYgKHJlcy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyBFeHRyYWN0aW9uUmVzdWx0KFtdLCByZXMuZXJyb3JzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVjdXJzZShyZXMucm9vdE5vZGVzKTtcbiAgICAgIHJldHVybiBuZXcgRXh0cmFjdGlvblJlc3VsdCh0aGlzLm1lc3NhZ2VzLCB0aGlzLmVycm9ycyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdE1lc3NhZ2VzRnJvbVBhcnQocDogUGFydCk6IHZvaWQge1xuICAgIGlmIChwLmhhc0kxOG4pIHtcbiAgICAgIHRoaXMubWVzc2FnZXMucHVzaChwLmNyZWF0ZU1lc3NhZ2UodGhpcy5fcGFyc2VyKSk7XG4gICAgICB0aGlzLl9yZWN1cnNlVG9FeHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhwLmNoaWxkcmVuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVjdXJzZShwLmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHAucm9vdEVsZW1lbnQpKSB7XG4gICAgICB0aGlzLl9leHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhwLnJvb3RFbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWN1cnNlKG5vZGVzOiBIdG1sQXN0W10pOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KG5vZGVzKSkge1xuICAgICAgbGV0IHBzID0gcGFydGl0aW9uKG5vZGVzLCB0aGlzLmVycm9ycyk7XG4gICAgICBwcy5mb3JFYWNoKHAgPT4gdGhpcy5fZXh0cmFjdE1lc3NhZ2VzRnJvbVBhcnQocCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlY3Vyc2VUb0V4dHJhY3RNZXNzYWdlc0Zyb21BdHRyaWJ1dGVzKG5vZGVzOiBIdG1sQXN0W10pOiB2b2lkIHtcbiAgICBub2Rlcy5mb3JFYWNoKG4gPT4ge1xuICAgICAgaWYgKG4gaW5zdGFuY2VvZiBIdG1sRWxlbWVudEFzdCkge1xuICAgICAgICB0aGlzLl9leHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhuKTtcbiAgICAgICAgdGhpcy5fcmVjdXJzZVRvRXh0cmFjdE1lc3NhZ2VzRnJvbUF0dHJpYnV0ZXMobi5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9leHRyYWN0TWVzc2FnZXNGcm9tQXR0cmlidXRlcyhwOiBIdG1sRWxlbWVudEFzdCk6IHZvaWQge1xuICAgIHAuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGlmIChhdHRyLm5hbWUuc3RhcnRzV2l0aChJMThOX0FUVFJfUFJFRklYKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMubWVzc2FnZXMucHVzaChtZXNzYWdlRnJvbUF0dHJpYnV0ZSh0aGlzLl9wYXJzZXIsIHAsIGF0dHIpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgSTE4bkVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59Il19