import CSS from 'css';
import SASS from 'node-sass';
import nodeBuffer from 'buffer';
import { Item } from './item';
import { List } from './list';


// SCSS/SASS/CSS to JS convertor constructor
export class Convertor {
  // Units definitions
  static UNIT_PX = 'px';
  static UNIT_EM = 'em';
  static UNIT_REM = 'rem';
  static UNIT_PERCENTAGE = '%';
  static UNIT_VW = 'vw';
  static UNIT_VH = 'vh';
  static UNIT_STRING = 'string';
  static UNITS = [
    Convertor.UNIT_PX, Convertor.UNIT_EM, Convertor.UNIT_REM,
    Convertor.UNIT_PERCENTAGE, Convertor.UNIT_VW, Convertor.UNIT_VH
  ];

  // Convertor input formats
  static supportedFormats = {
    scss: true,
    sass: true,
    css: true,
    transformation: {
      // The subset of input formats requiring preprocessing before conversion
      scss: true,
      sass: true
    }
  };

  // Convertor output formats
  static OUTPUT_FORMAT_JS_FILE = 'javascript_file';
  static outputFormats = {
    javascript_file: {
      prefix: 'module.exports = ',
      suffix: ';'
    },
    react_file: {
      prefix: `import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";\n\nexport default StyleSheet.create(`,
      suffix: ')'
    },
    javascript: {
      prefix: '',
      suffix: ';'
    },
    react: {
      prefix: '',
      suffix: ';'
    }
  }

  // Convertor unknown source (used in conjuction with errors to signify that the caller should be the one fitting the actual file in question there)
  static UNKNOWN_SOURCE = 'stdin';

  // Validation hash for dimensional properties string values
  static validStringUnits = {
    auto: true,
    inherit: true
  };

  static propertiesCategories = {
    // TODO: Add animation related support also
    dimensional: {
      top: true,
      bottom: true,
      left: true,
      right: true,

      width: true,
      minwidth: true,
      maxwidth: true,
      height: true,
      minheight: true,
      maxheight: true,

      padding: true,
      paddingtop: true,
      paddingright: true,
      paddingbottom: true,
      paddingleft: true,

      margintop: true,
      marginright: true,
      marginbottom: true,
      marginleft: true,

      border: true,
      boderwidth: true,
      borderbottom: true,
      borderbottomwidth: true,
      borderleft: true,
      borderleftwidth: true,
      bordertop: true,
      bordertopwidth: true,
      borderright: true,
      borderrightwidth: true,

      outline: true,
      outlineoffset: true,
      outlinewidth: true,

      font: true,
      fontsize: true,

      lineheight: true,
      letterspacing: true,

      columngap: true,
      columnrulewidth: true,
      columnwidth: true
    },
    vertical: {
      top: true,
      bottom: true,

      height: true,
      minheight: true,
      maxheight: true,

      paddingtop: true,
      paddingbottom: true,

      margintop: true,
      marginbottom: true,

      borderleft: true,
      borderleftwidth: true,
      borderright: true,
      borderrightwidth: true,

      font: true,
      fontsize: true,

      lineheight: true
    },
    horizontal: {
      left: true,
      right: true,

      width: true,
      minwidth: true,
      maxwidth: true,

      paddingright: true,
      paddingleft: true,

      marginright: true,
      marginleft: true,

      borderbottom: true,
      borderbottomwidth: true,
      bordertop: true,
      bordertopwidth: true,

      letterspacing: true,

      columngap: true,
      columnrulewidth: true,
      columnwidth: true
    },
    boxModelShorthand: {
      margin: true,
      padding: true
    },
    border: {
      border: true,
      boderwidth: true,
      borderbottom: true,
      borderbottomwidth: true,
      borderleft: true,
      borderleftwidth: true,
      bordertop: true,
      bordertopwidth: true,
      borderright: true,
      borderrightwidth: true
    }
  };

  // Normalize string parameters as string or undefined
  static normalizeString(v) {
    // v !== v means: NaN !== NaN (the only type in js that is not equal to itself)
    if (v === undefined || v === null || v !== v) { // eslint-disable-line no-self-compare
      return undefined;
    } else if (!v.toLowerCase) {
      return undefined;
    }

    return v.toLowerCase();
  }

  // Indentation
  static indentation(n) {
    const s = [];

    for (let i = 0; i < n; i += 1) {
      s.push(' ');
    }

    return s.join('');
  }

  // Normalize selector name
  static normalizeSelector(selector) {
    return selector
      .replace(/\s\s+/g, ' ')
      .replace(/[.]/g, '');
  }

  // Normalize property name
  static normalizePropertyName(property) {
    return property.split('-').map((p, i) => {
      if (i > 0) {
        return p.slice(0, 1).toUpperCase() + p.slice(1);
      }

      return p;
    }).join('');
  }

  // if (i.media.indexOf('and') > -1) {
  //   aux = i.media.split('and').map(m => Convertor.parseMediaSegment(m)).join('&&');
  // } else if (i.media.indexOf('), ') > -1) {
  //   aux = i.media.split('), ').map(m => Convertor.parseMediaSegment(m)).join('||');
  // } else {
  //   aux = Convertor.parseMediaSegment(i.media);
  // }

  static parseMediaQuery(m) {
    let i;
    let j;
    const n = m.length;
    const groups = {};

    // Break the string based on ( and )
    for (i = 0; i < n; i += 1) {
      if (m[i] === ')') {
        // End of a groups, look for it's start as the first ( right before this )
        for (j = i; j > -1; j -= 1) {
          if (m[j] === '(' && !groups[j]) {
            // Found the start of the group
            groups[j] = {
              start: j,
              end: i,
              isChild: false
            };

            break;
          }
        }
      }
    }

    // Group media query groups based on parent-child relationship
    const groupStartKeys = Object.keys(groups).map(v => parseInt(v, 10)).sort();
    const groupsLen = groupStartKeys.length;
    for (i = groupsLen - 1; i > -1; i -= 1) {
      const current = groups[groupStartKeys[i]];

      // Check if this group is a child of any other groups
      for (j = i + 1; j < groupsLen; j += 1) {
        const next = groups[groupStartKeys[j]];

        // Found a child relationship?
        if (current.start < next.start && current.end > next.end && !next.isChild) {
          current.children = current.children || {};
          current.children[groupStartKeys[j]] = next;
          next.isChild = true;
        }
      }
    }

    // Remove all children references to delimit depth
    for (i = 0; i < groupsLen; i += 1) {
      const current = groups[groupStartKeys[i]];

      if (current.isChild) {
        delete groups[groupStartKeys[i]];
      }
    }

    // Parse each group
    const result = [];
    const groupKeys = Object.keys(groups);
    const keysLen = groupKeys.length - 1;
    for (i = 0; i <= keysLen; i += 1) {
      const prev = groups[groupKeys[i - 1]];
      const current = groups[groupKeys[i]];
      const next = groups[groupKeys[i + 1]];

      if (!prev) {
        result.push(m.slice(0, current.start));
      } else {
        result.push(m.slice(prev.end, current.start));
      }

      result.push(Convertor.parseMediaGroup(current, m));

      if (!next) {
        result.push(m.slice(current.end));
      }
    }

    return Convertor.parseMediaSegment(result.join(''));
  }

  // Parse media group
  static parseMediaGroup(g, m) {
    if (!g.children) {
      return Convertor.parseMediaSegment(m.slice(g.start, g.end));
    }

    const childKeys = Object.keys(g.children);
    const childLen = childKeys.length - 1;
    const content = [];

    for (let i = 0; i <= childLen; i += 1) {
      const current = g.children[childKeys[i]];
      const prev = g.children[childKeys[i - 1]];

      if (i === 0) {
        content.push(m.slice(g.start, current.start));
      } else if (prev) {
        // Add any non parsed string parts between the last group and the current group
        content.push(m.slice(prev.end, current.start));
      }

      content.push(Convertor.parseMediaGroup(current, m));

      // Add any remaining characters after the last group
      if (i === childLen) {
        content.push(m.slice(current.end, g.end));
      }
    }

    return Convertor.parseMediaSegment(content.join(''));
  }

  // Parse an entire rule segment at a time
  static parseMediaSegment(m) {
    const len = m.length - 1;
    let parts = [];
    let lastAdded = 0;

    for (let i = 0; i <= len; i += 1) {
      if (m[i] === ',') {
        parts.push(m.slice(lastAdded, i), '||');
        lastAdded = i + 1;
      } else if (`${m[i]}${m[i + 1]}${m[i + 2]}` === 'and') {
        parts.push(m.slice(lastAdded, i), '&&');
        i += 2;
        lastAdded = i + 1;
      }
    }

    parts.push(m.slice(lastAdded, len));
    parts = parts.map(p => Convertor.parseMediaValue(p));

    return parts.join('');
  }

  // Parse media query value
  static parseMediaValue(m) {
    let sign;
    const mq = m.replace(/[\(\)]/g, '').trim().split(':');

    switch (mq[0]) {
      case 'min-width':
        sign = '>w';
        break;

      case 'max-width':
        sign = '<w';
        break;

      case 'width':
        sign = '=w';
        break;

      case 'min-height':
        sign = '>h';
        break;

      case 'max-height':
        sign = '<h';
        break;

      case 'height':
        sign = '=h';
        break;

      default:
        break;
    }

    if (sign) {
      return `${sign}${parseFloat(mq[1])}`;
    }

    return mq.join('');
  }


  // Transform stylesheet rules to an actual representation
  static transform(css) {
    const result = new List();

    if (css) {
      Convertor.transformItem(css, result);
    }

    return result;
  }

  // Transforms each item reursivelly
  static transformItem(i, result) {
    if (i && i.map) {
      i.forEach((r) => {
        Convertor.transformItem(r, result);
      });
    } else {
      let currentResult;
      let aux;

      // Handle by type
      switch (i.type) {
        case 'stylesheet':
          Convertor.transformItem(i.stylesheet.rules, result);
          break;

        case 'rule':
          // Take into account all rule declarations
          currentResult = new List();

          i.declarations.forEach((d) => {
            Convertor.transformItem(d, currentResult);
          });

          // Define the created declarations set for all specified selectors
          i.selectors.forEach((s) => {
            result.add(new Item(Item.TYPE_LIST, Convertor.normalizeSelector(s.trim()), currentResult));
          });

          break;

        case 'declaration':
          result.add(new Item(Item.TYPE_PROPERTY, Convertor.normalizePropertyName(i.property.trim()), i.value));
          break;

        case 'comment':
          result.add(new Item(Item.TYPE_COMMENT, '', i.comment.trim()));
          break;

        case 'charset':
          result.add(new Item(Item.TYPE_CHARSET, '', i.charset.replace(/[^a-zA-Z0-9\-]/g, '')));
          break;

        // Safe to ignore for now
        // case 'custom-media':
        //   /*
        //     WD MQ L4 26 January 2016
        //     ex: @custom-media --narrow-window (max-width: 30em);
        //   */
        //   result.add(new Item(Item.TYPE_CUSTOM_MEDIA, i.name, i.media));
        //   break;

        // Safe to ignore for now
        // case 'document':
        //   currentResult = new List();
        //
        //   i.rules.forEach((r) => {
        //     Convertor.transformItem(r, currentResult);
        //   });
        //
        //   result.add(new Item(Item.TYPE_DOCUMENT, i.document, currentResult));
        //   break;

        case 'font-face':
          currentResult = new List();

          i.declarations.forEach((d) => {
            Convertor.transformItem(d, currentResult);
            const c = currentResult.last();

            if (c.key() === 'fontFamily') {
              aux = c.value();
            }
          });

          result.add(new Item(Item.TYPE_FONT_FACE, aux || 'Unnamed', currentResult));
          break;

        // Ignored case due to being part of a deprecated standard (virtual dom v.0)
        // case 'host':
        //   break;

        case 'import':
          result.add(new Item(Item.TYPE_IMPORT, undefined, i.import));
          break;

        // Not yet supported
        // case 'keyframes':
        //   break;

        // Not yet supported
        // case 'keyframe':
        //   break;

        case 'media':
          // Extract all rules for the current media query
          currentResult = new List();

          i.rules.forEach((r) => {
            Convertor.transformItem(r, currentResult);
          });

          currentResult.forEach((r) => {
            const prop = result.searchByKey(r.key());
            if (prop) {
              prop.value().add(
                new Item(
                  Item.TYPE_LIST,
                  Convertor.parseMediaQuery(i.media),
                  r.value()
                )
              );
              return true;
            }

            return false;
          });
          break;

        // Not yet supported
        // case 'namespace':
        //   break;

        // Not yet supported
        // case 'page':
        //   break;

        // Not yet supported
        // case 'supports':
        //   break;

        default:
          throw new Error(`No implemented transformation for type: "${i.type}".`);
      }
    }
  }

  // Checks if the received value is relative and returns it's type and current value
  static asRelativeDescriptor(value) {
    let unit = null;
    let v = 0;

    if (value && value.indexOf) {
      Convertor.UNITS.forEach((u) => {
        const aux = value.indexOf(u);

        if (aux > -1) {
          unit = u;
          v = parseFloat(value.slice(0, aux));
        }
      });
    }

    if (!unit) {
      if (!Convertor.validStringUnits[value.toLowerCase()]) {
        v = parseFloat(value) || 0;
      } else {
        unit = 'string';
        v = value;
      }
    }

    return {
      unit,
      value: v
    };
  }

  constructor() {
    this.includePaths = [];
    this.indentation = 2;
    this.stringDelimiter = '\'';
  }

  // Allow usage of specified indentation for the output code
  setIndentation(indent) {
    this.indentation = Number(indent) || 2;
  }

  // Allow usage of custom string delimiters (to allow ' and ")
  setStringDelimiter(delimiter) {
    this.stringDelimiter = delimiter;
  }

  // Allow setting the include paths array for all SASS/SCSS @import definitions
  setIncludePath(paths) {
    if (paths && paths.forEach) {
      this.includePaths = paths.filter(p => p && p.toLowerCase && p.length);
    }

    return false;
  }

  // Delimits a string with specified notation
  delimitString(s) {
    return this.stringDelimiter + s + this.stringDelimiter;
  }

  // Converts input data to one of supported formats (plain object or react stylesheet)
  convert(data, inputFormat, outputFormat) {
    const errors = [];
    let list;

    // Normalize output format
    const how = Convertor.normalizeString(outputFormat);
    if (how === undefined || !Convertor.outputFormats[how]) {
      throw new Error(`Invalid output format "${how}".`);
    }

    // Normalize input format
    const format = Convertor.normalizeString(inputFormat);
    if (format === undefined || !Convertor.supportedFormats[format]) {
      throw new Error(`Invalid input format "${format}".`);
    }

    // Normalize input
    let input;
    if (nodeBuffer.Buffer.isBuffer(data)) {
      input = data.toString();
    } else if (data && data.toLowerCase) {
      input = data;
    } else {
      throw new Error('Invalid input data, Buffer or string expected.');
    }

    // Convert SASS/SCSS to CSS
    if (Convertor.supportedFormats.transformation[format]) {
      try {
        const parsed = SASS.renderSync({
          data: input,
          includePaths: this.includePaths,
          outputStyle: 'expanded'
        });

        input = parsed.css.toString();
      } catch (e) {
        errors.push({
          type: `${format} conversion`,
          file: e.file,
          line: e.line,
          column: e.column,
          message: e.message
        });

        input = '';
      }
    }

    // Parse CSS into a rule set
    if (errors.length === 0) {
      const parsed = CSS.parse(input, { silent: true });

      // Add errors if any
      parsed.stylesheet.parsingErrors.forEach((e) => {
        errors.push({
          type: `${format} conversion`,
          file: Convertor.UNKNOWN_SOURCE,
          line: e.line,
          column: e.column,
          message: `${e.reason}: ${e.source}`
        });
      });

      // Extract Fields
      list = Convertor.transform(parsed);
    }

    return {
      formatted: errors.length === 0 ? `${Convertor.outputFormats[how].prefix}${this.to(list)}${Convertor.outputFormats[how].suffix}` : '',
      errors
    };
  }

  // Outputs the List portion into the specified format
  to(list, indent = this.indentation) {
    const output = [];
    let requiresComma = false;

    if (!(list instanceof List)) {
      throw new Error('Invalid List instance provided in To transformation.');
    }

    // Add all fields to the output
    list.forEach((f) => {
      if (requiresComma) {
        output.push(',');
      } else {
        requiresComma = true;
      }

      output.push(`\n${Convertor.indentation(indent)}`);

      switch (f.type()) {
        case Item.TYPE_CHARSET:
          output.push(`charset: ${this.delimitString(f.value())}`);
          break;

        case Item.TYPE_COMMENT:
          requiresComma = false;
          output.push(`// ${f.value()}`);
          break;

        case Item.TYPE_PROPERTY:
          output.push(`${this.delimitString(f.key())}: ${this.manageProp(f.key(), f.value())}`);
          break;

        case Item.TYPE_LIST:
          output.push(`${this.delimitString(f.key())}: ${this.to(f.value(), indent + this.indentation)}`);
          break;

        case Item.TYPE_FONT_FACE:
          output.push(`${this.delimitString('fontFace')}: ${this.to(f.value(), indent + this.indentation)}`);
          break;

        case Item.TYPE_IMPORT:
          output.push(`${this.delimitString('import')}: ${this.delimitString(f.value())}`);
          break;

        // case Item.TYPE_CUSTOM_MEDIA:
        //   /*
        //     Ignored for now due to 0 browser support, but will become a huge thing down the road
        //     @custom-media --narrow-window (max-width: 30em)
        //   */
        //   // TODO: Integrate this
        //   break;

        // case Item.TYPE_DOCUMENT:
        //   /*
        //     Ignore for now due to only firefox support, but will be interesting down the road
        //     @document
        //       url(http://css-tricks.com/),
        //       url-prefix(http://css-tricks.com/snippets/),
        //       domain(css-tricks.com),
        //       regexp("https:.*")
        //       {
        //         ...
        //       }
        //   */
        //   // TODO: Integrate this
        //   break;

        default:
          break;
      }
    });

    return `{${output.join('')}\n${Convertor.indentation(indent - this.indentation)}}`;
  }

  // Adapts size to match relative units taking direction into account
  adaptSize(value, direction) {
    const parsedVal = Convertor.asRelativeDescriptor(value);
    const prefix = direction === 'v' ? 'V' : 'H';

    switch (parsedVal.unit) {
      case Convertor.UNIT_EM:
      case Convertor.UNIT_REM:
      case Convertor.UNIT_VH:
      case Convertor.UNIT_VW:
        return `{ unit: ${this.delimitString(parsedVal.unit)}, value: ${parsedVal.value} }`;

      case Convertor.UNIT_PERCENTAGE:
        return `{ unit: ${this.delimitString(parsedVal.unit + prefix)}, value: ${parsedVal.value / 100} }`;

      case Convertor.UNIT_STRING:
        return `{ unit: ${this.delimitString('string')}, value: ${this.delimitString(parsedVal.value)} }`;

      default:
        // Return pixel values as is
        return `{ unit: ${this.delimitString('px')}, value: ${parsedVal.value} }`;
    }
  }

  // Given the type of a property it takes care of it's value conversion to output string
  manageProp(type, value) {
    const all = Convertor.propertiesCategories;
    const t = type.toLowerCase();

    // Check for dimensional adaptation required in the output for dimensional properties
    if (all.dimensional[t]) {
      // Check if it a direct horizonal or vertical based rule
      if (all.vertical[t] || all.horizontal[t]) {
        return this.adaptSize(value, all.vertical[t] && 'v');
      // } else {
        // Special cases go here
        // REVIEW: Review any special cases like border etc.
      }
    }

    // No transformation required? Return the quoted string
    return this.delimitString(value);
  }
}

export default Convertor;
