/* eslint-env mocha */
import assert from 'assert';
import CSS from 'css';
import { Buffer } from 'buffer';
import { Item } from './../src/item';
import { Convertor } from './../src/convertor';

describe('SASS/SCSS/CSS Convertor', () => {
  describe('Class level functionality', () => {
    describe('Method: normalizeString(v)', () => {
      describe('Ignores non strings', () => {
        [undefined, null, NaN, {}].forEach((v) => {
          it(`${v}`, () => {
            assert.equal(Convertor.normalizeString(v), undefined);
          });
        });
      });

      describe('Returns strings as lowercase', () => {
        assert.equal(Convertor.normalizeString('RANDOM'), 'random');
      });
    });

    describe('Method: indentation(n)', () => {
      it('Indents twice', () => {
        const indented = Convertor.indentation(2);
        assert.equal(indented.length, 2);
        assert.equal(indented.trim(), '');
      });

      it('Indents 0 times', () => {
        assert.equal(Convertor.indentation(0), '');
      });
    });

    describe('Method: normalizeSelector(selector)', () => {
      it('Replaces multiple spaces with a single space', () => {
        assert.equal(Convertor.normalizeSelector('container  element  modifier'), 'container element modifier');
      });

      it('Removes class dot annotation', () => {
        assert.equal(Convertor.normalizeSelector('.container  .element  .modifier'), 'container element modifier');
      });
    });

    describe('Method: normalizePropertyName(property)', () => {
      it('Does not modify single word properties', () => {
        ['width', 'height', 'zIndex', 'border'].forEach((property) => {
          assert.equal(Convertor.normalizePropertyName(property), property);
        });
      });

      it('Does normalize multiple word properties', () => {
        const validation = {
          'border-left': 'borderLeft',
          'padding-left': 'paddingLeft',
          'background-color': 'backgroundColor',
          'font-size': 'fontSize'
        };

        Object.keys(validation).forEach((property) => {
          assert.equal(Convertor.normalizePropertyName(property), validation[property]);
        });
      });
    });

    describe('Method: parseMediaSegment(m)', () => {
      describe('Parses all type of single conditions', () => {
        it('<w', () => {
          assert.equal(Convertor.parseMediaSegment('max-width: 1200px'), '<w1200');
        });

        it('>w', () => {
          assert.equal(Convertor.parseMediaSegment('(min-width: 1200px)'), '>w1200');
        });

        it('=w', () => {
          assert.equal(Convertor.parseMediaSegment('(width: 1200px)'), '=w1200');
        });

        it('<h', () => {
          assert.equal(Convertor.parseMediaSegment('max-height: 1200px'), '<h1200');
        });

        it('>h', () => {
          assert.equal(Convertor.parseMediaSegment('(min-height: 1200px)'), '>h1200');
        });

        it('=h', () => {
          assert.equal(Convertor.parseMediaSegment('(height: 1200px)'), '=h1200');
        });
      });

      describe('Parses multiple conditions', () => {
        it('screen && <w', () => {
          assert.equal(Convertor.parseMediaQuery('screen and (max-width:2000px)'), 'screen&&<w2000');
        });

        it('(screen && >h) || (print && >w)', () => {
          assert.equal(Convertor.parseMediaQuery('(screen and (min-height:1000px)), (print and (min-width: 1000px))'), 'screen&&>h1000||print&&>w1000');
        });

        it('complex media query', () => {
          assert.equal(Convertor.parseMediaQuery('(screen and (min-width: 1200px and (max-width: 2000px and (max-height: 1000px)))), (print and (min-width: 2000px))'), 'screen&&>w1200&&<w2000&&<h1000||print&&>w2000');
        });
      });
    });

    describe('Method: transform(css)', () => {
      it('Returns an empty list on empty input', () => {
        assert.equal(Convertor.transform().next(), undefined);
      });

      it('Returns a non empty list for a valid rule', () => {
        const input = `
        .random {
          color: red;
        }
        `;
        const parsed = CSS.parse(input, { silent: true });
        const r = Convertor.transform(parsed);

        const c = r.next();
        assert.equal(c.key(), 'random');
        assert.equal(c.value().next().key(), 'color');
      });
    });

    describe('Method: transformItem(item, resultStorage)', () => {
      const input = `
      @charset: "UTF-8";

      /* Default font to be used in the entire document */
      @font-face {
          font-family: myFirstFont;
          src: url(sansation_light.woff);
      }

      @import https://developer.mozilla.org/en/docs/Web/CSS/@import;

      .random {
        color: red;
      }

      @media screen and (min-width: 300px) {
        .random {
          background-color: blue;
        }
      }
      `;
      const parsed = CSS.parse(input, { silent: true }).stylesheet.rules;

      it('charset', () => {
        const r = Convertor.transform(parsed[0]);

        const charset = r.next();
        assert.equal(charset.type(), Item.TYPE_CHARSET);
        assert.equal(charset.key(), '');
        assert.equal(charset.value(), 'UTF-8');
      });

      it('comment', () => {
        const r = Convertor.transform(parsed[1]);

        const comment = r.next();
        assert.equal(comment.type(), Item.TYPE_COMMENT);
        assert.equal(comment.key(), '');
        assert.equal(comment.value(), 'Default font to be used in the entire document');
      });

      it('font-face', () => {
        const r = Convertor.transform(parsed[2]);

        const ff = r.next();
        assert.equal(ff.type(), Item.TYPE_FONT_FACE);
        assert.equal(ff.key(), 'myFirstFont');
      });

      it('import', () => {
        const r = Convertor.transform(parsed[3]);

        const ff = r.next();
        assert.equal(ff.type(), Item.TYPE_IMPORT);
        assert.equal(ff.key(), '');
        assert.equal(ff.value(), 'https://developer.mozilla.org/en/docs/Web/CSS/@import');
      });

      it('property', () => {
        const r = Convertor.transform(parsed[4]);

        const c = r.next();
        assert.equal(c.key(), 'random');
        assert.equal(c.value().next().key(), 'color');
      });

      it('property modified by media query', () => {
        const r = Convertor.transform([parsed[4], parsed[5]]);

        const c = r.next();
        assert.equal(c.key(), 'random');
        const p = c.value();
        assert.equal(p.next().key(), 'color');
        assert.equal(p.next().key(), 'screen&&>w300');
      });

      it('throws on unsupported properties', () => {
        const failureInput = '@namespace: random_component_context;';
        const parsedFailure = CSS.parse(failureInput, { silent: true }).stylesheet.rules;
        let err;

        try {
          Convertor.transform(parsedFailure);
        } catch (e) {
          err = e;
        }

        assert.equal(err.toString(), 'Error: No implemented transformation for type: "namespace".');
      });

      it('font face without a font family will fallback on Unnamed', () => {
        const r = Convertor.transform(CSS.parse(`@font-face {
            src: url(sansation_light.woff);
        }`, { silent: true }));

        const c = r.next();
        assert.equal(c.key(), 'Unnamed');
      });
    });

    describe('Method: asRelativeDescriptor(value)', () => {
      describe('Supports:', () => {
        const values = {
          px: {
            in: '11px',
            unit: 'px',
            value: 11
          },
          em: {
            in: '11em',
            unit: 'em',
            value: 11
          },
          rem: {
            in: '11rem',
            unit: 'rem',
            value: 11
          },
          '%': {
            in: '11%',
            unit: '%',
            value: 11
          },
          vh: {
            in: '11vh',
            unit: 'vh',
            value: 11
          },
          vw: {
            in: '11vw',
            unit: 'vw',
            value: 11
          },
          string: {
            in: 'auto',
            unit: 'string',
            value: 'auto'
          },
          unitless: {
            in: '11',
            unit: null,
            value: 11
          },
          unitless_fallback_to_string: {
            in: 'abc',
            unit: 'string',
            value: 'abc'
          }
        };

        Object.keys(values).forEach((t) => {
          it(t, () => {
            const v = Convertor.asRelativeDescriptor(values[t].in);
            assert.equal(v.unit, values[t].unit);
            assert.equal(v.value, values[t].value);
          });
        });
      });
    });
  });

  describe('Instance level functionality', () => {
    it('Instantiates', () => {
      const c = new Convertor();
      assert.equal(c.constructor, Convertor);
    });

    describe('Property name/value delimiters', () => {
      const c = new Convertor();

      it('Uses \' as default delimiter', () => {
        assert.equal(c.delimitString('random'), '\'random\'');
      });

      it('Supports changing the delimiter and uses it', () => {
        c.setStringDelimiter('"');
        assert.equal(c.delimitString('random'), '"random"');
      });
    });

    describe('Indentation', () => {
      const c = new Convertor();
      const r = Convertor.transform(CSS.parse(`.block {
          color: red;
      }`, { silent: true }));

      it('Uses 2 spaces by default', () => {
        assert.equal(c.to(r), '{\n  \'block\': {\n    \'color\': \'red\'\n  }\n}');
      });

      it('Supports other spacing variants, like 5', () => {
        c.setIndentation(5);
        assert.equal(c.to(r), '{\n     \'block\': {\n          \'color\': \'red\'\n     }\n}');
      });
    });

    describe('Size adaptation', () => {
      const c = new Convertor();

      ['px', 'em', 'rem', 'vh', 'vw'].forEach((t) => {
        it('em', () => {
          assert.equal(c.adaptSize(`11${t}`, 'v'), `{ 'unit': '${t}', 'value': ${11} }`);
        });
      });

      it('% vertically', () => {
        assert.equal(c.adaptSize('11%', 'v'), '{ \'unit\': \'%V\', \'value\': 0.11 }');
      });

      it('% horizontally', () => {
        assert.equal(c.adaptSize('11%', 'h'), '{ \'unit\': \'%H\', \'value\': 0.11 }');
      });

      it('string units - auto', () => {
        assert.equal(c.adaptSize('auto', ''), '{ \'unit\': \'string\', \'value\': \'auto\' }');
      });

      it('defaults to px', () => {
        assert.equal(c.adaptSize('11', 'h'), '{ \'unit\': \'px\', \'value\': 11 }');
      });
    });

    describe('Conversion', () => {
      const input = `
      @charset: "UTF-8";

      /* Default font to be used in the entire document */
      @font-face {
          font-family: myFirstFont;
          src: url(sansation_light.woff);
      }

      @import https://developer.mozilla.org/en/docs/Web/CSS/@import;

      .random {
        color: red;
        width: 12em;
      }

      @media screen and (min-width: 300px) {
        .random {
          background-color: blue;
          width: 50%;
        }
      }
      `;
      const inputSCSS = `
        $defaultFont: randomFontInUse;

        .random {
          color: red;
          width: 12em;
          font-family: $defaultFont;
        }
      `;
      const inputSCSSImport = `
        @import "include/defaults";
        $defaultFont: randomFontInUse;

        .random {
          color: $baseColor;
          width: 12em;
          font-family: $defaultFont;
        }
      `;
      const output = `
  charset: 'UTF-8',
  // Default font to be used in the entire document
  'fontFace': {
    'fontFamily': 'myFirstFont',
    'src': 'url(sansation_light.woff)'
  },
  'import': 'https://developer.mozilla.org/en/docs/Web/CSS/@import',
  'random': {
    'color': 'red',
    'width': [{ \'unit\': 'em', \'value\': 12 }],
    'screen&&>w300': {
      'backgroundColor': 'blue',
      'width': [{ \'unit\': '%H', \'value\': 0.5 }]
    }
  }
`;
      const outputSCSS = `
  'random': {
    'color': 'red',
    'width': [{ \'unit\': 'em', \'value\': 12 }],
    'fontFamily': 'randomFontInUse'
  }
`;

      const c = new Convertor();

      it('Converts CSS to JS file', () => {
        const converted = c.convert(input, 'css', 'javascript_file');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 0);
          assert.equal(conv.formatted, `module.exports = {${output}};`);
        });
      });

      it('Converts CSS to JS', () => {
        const converted = c.convert(input, 'css', 'javascript');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 0);
          assert.equal(conv.formatted, `{${output}};`);
        });
      });

      it('Converts CSS to React file', () => {
        const converted = c.convert(input, 'css', 'react_file');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 0);
          assert.equal(conv.formatted, `import { StyleSheet } from 'react-native';

export default StyleSheet.create({${output}});`);
        });
      });

      it('Converts CSS to React', () => {
        const converted = c.convert(input, 'css', 'react');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 0);
          assert.equal(conv.formatted, `{${output}};`);
        });
      });

      it('Converts Buffer to JS', () => {
        const converted = c.convert(new Buffer(input), 'css', 'javascript');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 0);
          assert.equal(conv.formatted, `{${output}};`);
        });
      });

      it('Converts SCSS to JS', () => {
        const converted = c.convert(inputSCSS, 'scss', 'javascript');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 0);
          assert.equal(conv.formatted, `{${outputSCSS}};`);
        });
      });

      it('Converts SCSS to JS taking imports into account - without specified include path', () => {
        const converted = c.convert(inputSCSSImport.replace('include/defaults', 'defaults'), 'scss', 'javascript');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 1);
          assert.equal(conv.formatted, '');
          assert.deepEqual(conv.errors[0], {
            type: 'scss conversion',
            file: Convertor.UNKNOWN_SOURCE,
            line: 2,
            column: 9,
            message: 'File to import not found or unreadable: defaults\nParent style sheet: stdin'
          });
        });
      });

      it('Converts SCSS to JS taking imports into account - specified include path', () => {
        const addedIncludePath = c.setIncludePath([__dirname]);
        assert.equal(addedIncludePath, true);

        const converted = c.convert(inputSCSSImport, 'scss', 'javascript');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 0);
          assert.equal(conv.formatted, `{${outputSCSS}};`);
        });
      });

      it('Does not convert without a valid input type', () => {
        let err;

        try {
          c.convert(input, 'random', 'javascript');
        } catch (e) {
          err = e;
        }

        assert.equal(err.toString(), 'Error: Invalid input format "random".');
      });

      it('Does not convert without a valid output type', () => {
        let err;

        try {
          c.convert(input, 'css', 'random');
        } catch (e) {
          err = e;
        }

        assert.equal(err.toString(), 'Error: Invalid output format "random".');
      });

      it('Does not convert without a valid input source', () => {
        let err;

        try {
          c.convert({}, 'css', 'javascript');
        } catch (e) {
          err = e;
        }

        assert.equal(err.toString(), 'Error: Invalid input data, Buffer or string expected.');
      });

      it('Does catch CSS parsing errors', () => {
        const converted = c.convert('.random{\\}', 'css', 'javascript');
        converted.then((conv) => {
          assert.equal(conv.errors.length, 1);
          assert.equal(conv.formatted, '');
          assert.deepEqual(conv.errors[0], {
            type: 'css conversion',
            file: Convertor.UNKNOWN_SOURCE,
            line: 1,
            column: 10,
            message: 'property missing \':\': }'
          });
        });
      });
    });
  });
});
