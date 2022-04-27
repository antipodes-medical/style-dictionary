const StyleDictionary = require('style-dictionary');

/**
 * RoundTo
 * ------------------------------------------------------------------------
 * roundTo()
 * @version 1.0 | April 18th 2013
 * @author  Beau Charman | @beaucharman | http://www.beaucharman.me
 * @link    https://gist.github.com/beaucharman/5401683
 * @param   {float}   n   | the subject number we are rounding
 * @param   {integer} d   | the number to decimal places to round to
 * @param   {string}  dir | 'round', 'floor' or 'ceil'
 * @param   {integer} t   | the number to decimal places to transpose to
 * @return  {float}
 *
 * A JavaScript function that returns a float to a given number
 * of decimal places, can also transpose the decimal place if needed.
 * ------------------------------------------------------------------------ */
var roundTo = function (n, d, dir, t) {
  'use strict';
  if (!n || (
    typeof n !== 'number'
  )) {
    return false;
  }
  var r, e;
  d = d || 2;
  t = (
        !t
      ) ? d : d - t;
  d = Math.pow(10, d);
  t = Math.pow(10, t);
  e = n * d;
  r = (
    function () {
      return Math.round(e);
    }()
  );
  return r / t;
};

const toKebabCase = str =>
  str &&
  str
  .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
  .map(x => x.toLowerCase())
  .join('-');

StyleDictionary.registerFormat({
  name: `css/variables/typography`,
  formatter: function ({dictionary}) {
    let output = `/**
* Do not edit directly
*/

:root {\n`;

    output += dictionary.allTokens.map(token => {
      let line = '';
      let cssVars = [];

      for (const [key, value] of Object.entries(token.value)) {
        cssVars[toKebabCase(key)] = value;
      }

      for (let [key, value] of Object.entries(cssVars)) {
        let doNotOutput = false;

        // Text case change name
        if (key === 'text-case') {
          key = 'text-transform';
        }

        // Letter spacing
        if (key === 'letter-spacing') {
          if (value.includes('%')) {
            //@formatter:off
            value = `${(value.replace('%', '')) / 100}em`;
            //@formatter:on
          }
        }

        // Text decoration useless
        if (key === 'text-decoration') {
          doNotOutput = true;
        }

        // Font families value change.
        if (key === 'font-family') {
          value = `'${value}', sans-serif`;
        }

        // Font sizes value change.
        if (key === 'font-size') {
          if (value.includes('roundTo')) {
            value = eval(value);
          }
          value = `${value / 16}rem`;
        }

        // Line height value change.
        if (key === 'line-height') {
          if (value.includes('%')) {
            //@formatter:off
            value = `${(value.replace('%', '')) / 100}`;
            //@formatter:on
          }
          if (value === 'AUTO') {
            value = 1;
          }
        }

        // Font weights value change.
        if (key === 'font-weight') {
          switch (value) {
            case 'Black':
              value = 900;
              break;
            case 'Extra-bold':
              value = 800;
              break;
            case 'Bold':
              value = 700;
              break;
            case 'Semi-bold':
              value = 600;
              break;
            case 'Medium':
              value = 500;
              break;
            case 'Regular':
              value = 400;
              break;
            case 'Light':
              value = 300;
              break;
            case 'Extra-light':
              value = 200;
              break;
          }
        }

        if (!doNotOutput) {
          line += `  --${token.name}-${key}: ${value};\n`;
        }
      }

      return line;
    }).join(`\n`);

    output += `\n}\n`;
    return output;
  }
});

StyleDictionary.registerFormat({
  name: `css/variables/other`,
  formatter: function ({dictionary}) {
    let output = `/**
* Do not edit directly
*/

:root {\n`;

    output += dictionary.allTokens.map(token => {
      let line = '';

      const isFont = token.original.value.includes('typography');

      if (isFont) {
        const values = [
          'font-family',
          'font-weight',
          'line-height',
          'font-size',
          'letter-spacing',
          'paragraph-spacing',
          'text-transform'
        ];
        const originalFont = `--token-${toKebabCase(token.original.value.substring(1, token.original.value.length - 1))}`;

        values.forEach(value => {
          line += `  --${token.name}-${value}: var(${originalFont}-${value});\n`;
        });
      }

      return line;
    }).join(`\n`);

    output += `\n}\n`;
    return output;
  }
});


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

module.exports = StyleDictionary.extend({
  source: ['resources/figma-tokens/**/*.tokens.json'],
  platforms: {
    scss: {
      transformGroup: 'scss',
      transforms: [
        'spacer/rem',
        'attribute/cti',
        'name/cti/kebab',
        'time/seconds',
        'content/icon',
        'size/rem',
        'color/css'
      ],
      buildPath: 'resources/style-dictionary/',
      prefix: 'token',
      files: [
        {
          destination: '_colors.scss',
          format: 'css/variables',
          filter: {
            type: 'color'
          },
          options: {
            outputReferences: true
          }
        },
        {
          destination: '_typography.scss',
          format: 'css/variables/typography',
          filter: {
            type: 'typography'
          },
          options: {
            outputReferences: true
          }
        },
        {
          destination: '_spacers.scss',
          format: 'css/variables',
          filter: {
            type: 'spacing'
          },
          options: {
            outputReferences: true
          }
        },
        {
          destination: '_other.scss',
          format: 'css/variables/other',
          filter: {
            type: 'other'
          }
        }
      ]
    }
  }
});