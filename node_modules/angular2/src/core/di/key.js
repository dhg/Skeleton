'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var forward_ref_1 = require('./forward_ref');
/**
 * A unique object used for retrieving items from the {@link Injector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by {@link Injector} because its system-wide unique `id` allows the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. {@link Injector} creates keys automatically when resolving
 * providers.
 */
var Key = (function () {
    /**
     * Private
     */
    function Key(token, id) {
        this.token = token;
        this.id = id;
        if (lang_1.isBlank(token)) {
            throw new exceptions_1.BaseException('Token must be defined!');
        }
    }
    Object.defineProperty(Key.prototype, "displayName", {
        /**
         * Returns a stringified token.
         */
        get: function () { return lang_1.stringify(this.token); },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieves a `Key` for a token.
     */
    Key.get = function (token) { return _globalKeyRegistry.get(forward_ref_1.resolveForwardRef(token)); };
    Object.defineProperty(Key, "numberOfKeys", {
        /**
         * @returns the number of keys registered in the system.
         */
        get: function () { return _globalKeyRegistry.numberOfKeys; },
        enumerable: true,
        configurable: true
    });
    return Key;
})();
exports.Key = Key;
/**
 * @internal
 */
var KeyRegistry = (function () {
    function KeyRegistry() {
        this._allKeys = new Map();
    }
    KeyRegistry.prototype.get = function (token) {
        if (token instanceof Key)
            return token;
        if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
        }
        var newKey = new Key(token, Key.numberOfKeys);
        this._allKeys.set(token, newKey);
        return newKey;
    };
    Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
        get: function () { return this._allKeys.size; },
        enumerable: true,
        configurable: true
    });
    return KeyRegistry;
})();
exports.KeyRegistry = KeyRegistry;
var _globalKeyRegistry = new KeyRegistry();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvZGkva2V5LnRzIl0sIm5hbWVzIjpbIktleSIsIktleS5jb25zdHJ1Y3RvciIsIktleS5kaXNwbGF5TmFtZSIsIktleS5nZXQiLCJLZXkubnVtYmVyT2ZLZXlzIiwiS2V5UmVnaXN0cnkiLCJLZXlSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIktleVJlZ2lzdHJ5LmdldCIsIktleVJlZ2lzdHJ5Lm51bWJlck9mS2V5cyJdLCJtYXBwaW5ncyI6IkFBQUEscUJBQThDLDBCQUEwQixDQUFDLENBQUE7QUFDekUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsNEJBQWdDLGVBQWUsQ0FBQyxDQUFBO0FBRWhEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNIO0lBQ0VBOztPQUVHQTtJQUNIQSxhQUFtQkEsS0FBYUEsRUFBU0EsRUFBVUE7UUFBaENDLFVBQUtBLEdBQUxBLEtBQUtBLENBQVFBO1FBQVNBLE9BQUVBLEdBQUZBLEVBQUVBLENBQVFBO1FBQ2pEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLHdCQUF3QkEsQ0FBQ0EsQ0FBQ0E7UUFDcERBLENBQUNBO0lBQ0hBLENBQUNBO0lBS0RELHNCQUFJQSw0QkFBV0E7UUFIZkE7O1dBRUdBO2FBQ0hBLGNBQTRCRSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUUzREE7O09BRUdBO0lBQ0lBLE9BQUdBLEdBQVZBLFVBQVdBLEtBQWFBLElBQVNHLE1BQU1BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsK0JBQWlCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUszRkgsc0JBQVdBLG1CQUFZQTtRQUh2QkE7O1dBRUdBO2FBQ0hBLGNBQW9DSSxNQUFNQSxDQUFDQSxrQkFBa0JBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUo7SUFDL0VBLFVBQUNBO0FBQURBLENBQUNBLEFBeEJELElBd0JDO0FBeEJZLFdBQUcsTUF3QmYsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFBQUs7UUFDVUMsYUFBUUEsR0FBR0EsSUFBSUEsR0FBR0EsRUFBZUEsQ0FBQ0E7SUFlNUNBLENBQUNBO0lBYkNELHlCQUFHQSxHQUFIQSxVQUFJQSxLQUFhQTtRQUNmRSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxZQUFZQSxHQUFHQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUV2Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xDQSxDQUFDQTtRQUVEQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUM5Q0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDakNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVERixzQkFBSUEscUNBQVlBO2FBQWhCQSxjQUE2QkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUMzREEsa0JBQUNBO0FBQURBLENBQUNBLEFBaEJELElBZ0JDO0FBaEJZLG1CQUFXLGNBZ0J2QixDQUFBO0FBRUQsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtzdHJpbmdpZnksIENPTlNULCBUeXBlLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5cbi8qKlxuICogQSB1bmlxdWUgb2JqZWN0IHVzZWQgZm9yIHJldHJpZXZpbmcgaXRlbXMgZnJvbSB0aGUge0BsaW5rIEluamVjdG9yfS5cbiAqXG4gKiBLZXlzIGhhdmU6XG4gKiAtIGEgc3lzdGVtLXdpZGUgdW5pcXVlIGBpZGAuXG4gKiAtIGEgYHRva2VuYC5cbiAqXG4gKiBgS2V5YCBpcyB1c2VkIGludGVybmFsbHkgYnkge0BsaW5rIEluamVjdG9yfSBiZWNhdXNlIGl0cyBzeXN0ZW0td2lkZSB1bmlxdWUgYGlkYCBhbGxvd3MgdGhlXG4gKiBpbmplY3RvciB0byBzdG9yZSBjcmVhdGVkIG9iamVjdHMgaW4gYSBtb3JlIGVmZmljaWVudCB3YXkuXG4gKlxuICogYEtleWAgc2hvdWxkIG5vdCBiZSBjcmVhdGVkIGRpcmVjdGx5LiB7QGxpbmsgSW5qZWN0b3J9IGNyZWF0ZXMga2V5cyBhdXRvbWF0aWNhbGx5IHdoZW4gcmVzb2x2aW5nXG4gKiBwcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXkge1xuICAvKipcbiAgICogUHJpdmF0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuOiBPYmplY3QsIHB1YmxpYyBpZDogbnVtYmVyKSB7XG4gICAgaWYgKGlzQmxhbmsodG9rZW4pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignVG9rZW4gbXVzdCBiZSBkZWZpbmVkIScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5naWZpZWQgdG9rZW4uXG4gICAqL1xuICBnZXQgZGlzcGxheU5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHN0cmluZ2lmeSh0aGlzLnRva2VuKTsgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSBgS2V5YCBmb3IgYSB0b2tlbi5cbiAgICovXG4gIHN0YXRpYyBnZXQodG9rZW46IE9iamVjdCk6IEtleSB7IHJldHVybiBfZ2xvYmFsS2V5UmVnaXN0cnkuZ2V0KHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKSk7IH1cblxuICAvKipcbiAgICogQHJldHVybnMgdGhlIG51bWJlciBvZiBrZXlzIHJlZ2lzdGVyZWQgaW4gdGhlIHN5c3RlbS5cbiAgICovXG4gIHN0YXRpYyBnZXQgbnVtYmVyT2ZLZXlzKCk6IG51bWJlciB7IHJldHVybiBfZ2xvYmFsS2V5UmVnaXN0cnkubnVtYmVyT2ZLZXlzOyB9XG59XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXlSZWdpc3RyeSB7XG4gIHByaXZhdGUgX2FsbEtleXMgPSBuZXcgTWFwPE9iamVjdCwgS2V5PigpO1xuXG4gIGdldCh0b2tlbjogT2JqZWN0KTogS2V5IHtcbiAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXkpIHJldHVybiB0b2tlbjtcblxuICAgIGlmICh0aGlzLl9hbGxLZXlzLmhhcyh0b2tlbikpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hbGxLZXlzLmdldCh0b2tlbik7XG4gICAgfVxuXG4gICAgdmFyIG5ld0tleSA9IG5ldyBLZXkodG9rZW4sIEtleS5udW1iZXJPZktleXMpO1xuICAgIHRoaXMuX2FsbEtleXMuc2V0KHRva2VuLCBuZXdLZXkpO1xuICAgIHJldHVybiBuZXdLZXk7XG4gIH1cblxuICBnZXQgbnVtYmVyT2ZLZXlzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9hbGxLZXlzLnNpemU7IH1cbn1cblxudmFyIF9nbG9iYWxLZXlSZWdpc3RyeSA9IG5ldyBLZXlSZWdpc3RyeSgpO1xuIl19