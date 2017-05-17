'use strict';var lang_1 = require('angular2/src/facade/lang');
/**
 * A message extracted from a template.
 *
 * The identity of a message is comprised of `content` and `meaning`.
 *
 * `description` is additional information provided to the translator.
 */
var Message = (function () {
    function Message(content, meaning, description) {
        if (description === void 0) { description = null; }
        this.content = content;
        this.meaning = meaning;
        this.description = description;
    }
    return Message;
})();
exports.Message = Message;
/**
 * Computes the id of a message
 */
function id(m) {
    var meaning = lang_1.isPresent(m.meaning) ? m.meaning : "";
    var content = lang_1.isPresent(m.content) ? m.content : "";
    return lang_1.escape("$ng|" + meaning + "|" + content);
}
exports.id = id;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9pMThuL21lc3NhZ2UudHMiXSwibmFtZXMiOlsiTWVzc2FnZSIsIk1lc3NhZ2UuY29uc3RydWN0b3IiLCJpZCJdLCJtYXBwaW5ncyI6IkFBQUEscUJBQWdDLDBCQUEwQixDQUFDLENBQUE7QUFFM0Q7Ozs7OztHQU1HO0FBQ0g7SUFDRUEsaUJBQW1CQSxPQUFlQSxFQUFTQSxPQUFlQSxFQUFTQSxXQUEwQkE7UUFBakNDLDJCQUFpQ0EsR0FBakNBLGtCQUFpQ0E7UUFBMUVBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBQVNBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBQVNBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFlQTtJQUFHQSxDQUFDQTtJQUNuR0QsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxJQUVDO0FBRlksZUFBTyxVQUVuQixDQUFBO0FBRUQ7O0dBRUc7QUFDSCxZQUFtQixDQUFVO0lBQzNCRSxJQUFJQSxPQUFPQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDcERBLElBQUlBLE9BQU9BLEdBQUdBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxPQUFPQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUNwREEsTUFBTUEsQ0FBQ0EsYUFBTUEsQ0FBQ0EsU0FBT0EsT0FBT0EsU0FBSUEsT0FBU0EsQ0FBQ0EsQ0FBQ0E7QUFDN0NBLENBQUNBO0FBSmUsVUFBRSxLQUlqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGVzY2FwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBBIG1lc3NhZ2UgZXh0cmFjdGVkIGZyb20gYSB0ZW1wbGF0ZS5cbiAqXG4gKiBUaGUgaWRlbnRpdHkgb2YgYSBtZXNzYWdlIGlzIGNvbXByaXNlZCBvZiBgY29udGVudGAgYW5kIGBtZWFuaW5nYC5cbiAqXG4gKiBgZGVzY3JpcHRpb25gIGlzIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gcHJvdmlkZWQgdG8gdGhlIHRyYW5zbGF0b3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXNzYWdlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRlbnQ6IHN0cmluZywgcHVibGljIG1lYW5pbmc6IHN0cmluZywgcHVibGljIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBudWxsKSB7fVxufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBpZCBvZiBhIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkKG06IE1lc3NhZ2UpOiBzdHJpbmcge1xuICBsZXQgbWVhbmluZyA9IGlzUHJlc2VudChtLm1lYW5pbmcpID8gbS5tZWFuaW5nIDogXCJcIjtcbiAgbGV0IGNvbnRlbnQgPSBpc1ByZXNlbnQobS5jb250ZW50KSA/IG0uY29udGVudCA6IFwiXCI7XG4gIHJldHVybiBlc2NhcGUoYCRuZ3wke21lYW5pbmd9fCR7Y29udGVudH1gKTtcbn0iXX0=