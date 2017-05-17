export const matrix = {
	chrome: {
		    48: 0b1001111011111100111110101111101,
		    49: 0b1001111111111100111111111111111,
		    50: 0b1011111111111100111111111111111
	},
	firefox: {
		    43: 0b1000111111101100000110111011101,
		    44: 0b1000111111101100000110111011101,
		    45: 0b1000111111101100000110111011101
	},
	safari: {
		     8: 0b1000000000000000000000000000000,
		     9: 0b1001111001101100000011101011110
	},
	ie: {
		     8: 0b0000000000000000000000000000000,
		     9: 0b1000000000000000000000000000000,
		    10: 0b1000000000000000000000000000000,
		    11: 0b1000000000000000111000001100000
	},
	edge: {
		    12: 0b1011110110111100011010001011101,
		    13: 0b1011111110111100011111001011111
	},
	node: {
		'0.10': 0b1000000000101000000000001000000,
		'0.12': 0b1000001000101000000010001000100,
		     4: 0b1001111000111100111111001111111,
		     5: 0b1001111000111100111111001111111,
		     6: 0b1011111111111100111111111111111
	}
};

export const features = [
	'arrow',
	'classes',
	'collections',
	'computedProperty',
	'conciseMethodProperty',
	'constLoop',
	'constRedef',
	'defaultParameter',
	'destructuring',
	'extendNatives',
	'forOf',
	'generator',
	'letConst',
	'letLoop',
	'letLoopScope',
	'moduleExport',
	'moduleImport',
	'numericLiteral',
	'objectProto',
	'objectSuper',
	'oldOctalLiteral',
	'parameterDestructuring',
	'spreadRest',
	'stickyRegExp',
	'symbol',
	'templateString',
	'unicodeEscape',
	'unicodeIdentifier',
	'unicodeRegExp',

	// ES2016
	'exponentiation',

	// additional transforms, not from
	// https://featuretests.io
	'reservedProperties'
];
