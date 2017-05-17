/*jslint node: true */

var listify = function listify(list) {
	"use strict";

	if (!Array.isArray(list)) {
		throw new TypeError('requires an array');
	}

	var options = arguments.length > 1 ? arguments[1] : null;
	if (!options) {
		options = {};
	}
	var separator = options.hasOwnProperty('separator') ? options.separator : ', ';
	var finalWord = options.hasOwnProperty('finalWord') ? options.finalWord : 'and';
	if (finalWord.length > 0) {
		finalWord += ' ';
	}

	var trimmed = list.filter(function (item) { return String(item).trim(); });
	var str;
	if (trimmed.length === 2 && finalWord.length > 0) {
		str = trimmed.join(' ' + finalWord);
	} else if (trimmed.length < 3) {
		str = trimmed.join(separator);
	} else {
		str = trimmed.slice(0, -1).concat(finalWord + trimmed[trimmed.length - 1]).join(separator);
	}
	return str;
};

module.exports = listify;

