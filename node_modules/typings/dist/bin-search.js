#!/usr/bin/env node
"use strict";
var columnify = require('columnify');
var typings_core_1 = require('typings-core');
function help() {
    return "\ntypings search [query]\n\nOptions:\n  [--name] <name>     Search for definitions by exact name (E.g. only \"react\")\n  [--source] <source> The registry mirror (E.g. \"npm\", \"bower\", \"env\", \"global\", \"dt\", ...)\n  [--offset] <x>      Skip first \"x\" results (default: 0)\n  [--limit] <x>       Limit to \"x\" results (default: 20, max: 100)\n  [--order] <order>   Direction to sort results (default: \"asc\", enum: \"asc\" or \"desc\")\n  [--sort] <column>   Order results by a column (E.g. \"versions\", \"name\", ...)\n";
}
exports.help = help;
function exec(args, options) {
    var query = args[0];
    var name = options.name, source = options.source, offset = options.offset, limit = options.limit, order = options.order, sort = options.sort;
    return typings_core_1.search({ name: name, source: source, query: query, offset: offset, limit: limit, order: order, sort: sort })
        .then(function (_a) {
        var results = _a.results, total = _a.total;
        if (total === 0) {
            console.log('No results found for search');
            return;
        }
        console.log("Viewing " + results.length + " of " + total);
        console.log('');
        console.log(columnify(results));
    });
}
exports.exec = exec;
//# sourceMappingURL=bin-search.js.map