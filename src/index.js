const StyleDictionary = require('style-dictionary');

/**
 * Transform spacer to rem.
 */
StyleDictionary.registerTransform({
	name: 'spacer/rem',
	type: 'value',
	matcher: function (prop) {
		return prop.type === 'spacing';
	},
	transformer: function (prop) {
		//@formatter:off
		return `${(parseInt(prop.original.value) / 16).toString()}rem`;
		//@formatter:on
	}
});

/**
 * Transform font weights string to number.
 */
StyleDictionary.registerTransform({
	name: 'font-weights/number',
	type: 'value',
	matcher: function (prop) {
		return prop.type === 'fontWeights';
	},
	transformer: function (prop) {
		switch (prop.original.value) {
		case 'Regular':
			return 400;
		case 'Bold':
			return 700;
		}
	}
});

/**
 * Register filter to filter typography.
 */
StyleDictionary.registerFilter({
	name: 'filter-typography',
	matcher: function (prop) {
		return [
			'fontFamilies',
			'fontWeights',
			'fontSizes',
			'letterSpacing',
			'lineHeights'
		].includes(prop.attributes.category);
	}
});

StyleDictionary.extend({
	source: ['resources/figma-tokens/**/*.tokens.json'],
	platforms: {
		scss: {
			transformGroup: 'scss',
			transforms: [
				'spacer/rem',
				'font-weights/number',
				'attribute/cti',
				'name/cti/kebab',
				'time/seconds',
				'content/icon',
				'size/rem',
				'color/css'
			],
			buildPath: 'resources/styles/style-dictionary/',
			prefix: 'token',
			files: [
				{
					destination: '_colors.scss',
					format: 'css/variables',
					filter: {
						type: 'color'
					}
				},
				{
					destination: '_typography.scss',
					format: 'css/variables',
					filter: 'filter-typography'
				},
				{
					destination: '_spacers.scss',
					format: 'css/variables',
					filter: {
						type: 'spacing'
					}
				}
			]
		}
	}
});

export default StyleDictionary;