"use strict";
var map_1 = require('./map');
/**
 * Retrieves the value of a specified nested property from all elements in
 * the Observable sequence. If a property can't be resolved, it will return
 * `undefined` for that value.
 *
 * @param {...args} properties the nested properties to pluck
 * @returns {Observable} Returns a new Observable sequence of property values
 */
function pluck() {
    var properties = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        properties[_i - 0] = arguments[_i];
    }
    var length = properties.length;
    if (length === 0) {
        throw new Error('List of properties cannot be empty.');
    }
    return map_1.map.call(this, plucker(properties, length));
}
exports.pluck = pluck;
function plucker(props, length) {
    var mapper = function (x) {
        var currentProp = x;
        for (var i = 0; i < length; i++) {
            var p = currentProp[props[i]];
            if (typeof p !== 'undefined') {
                currentProp = p;
            }
            else {
                return undefined;
            }
        }
        return currentProp;
    };
    return mapper;
}
//# sourceMappingURL=pluck.js.map