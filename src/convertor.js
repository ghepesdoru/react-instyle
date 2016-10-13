import CSS from 'css';
import nodeFs from 'fs';
import nodePath from 'path';
import nodeBuffer from 'buffer';
import SASS from 'sass.js';
import { Promise } from 'bluebird';
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

  // Convertor unknown source (used in conjuction with errors to signify that the caller should be the one fitting the actual file in question there)
  static UNKNOWN_SOURCE = 'stdin';

  // Validation hash for dimensional properties string values
  static validStringUnits = {
    auto: true,
    inherit: true
  };

  static propertiesCategories = {
    // TODO: Add animation related support also
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
      border: true,

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
    combined: {
      // Combined sizes (vertical and horizontal alike)
      padding: true,
      margin: true,
      boxshadow: true,
      textshadow: true
    },
    combinedDirections: {
      padding: ['v', 'h', 'v', 'h'],
      margin: ['v', 'h', 'v', 'h'],
      boxshadow: ['h', 'v'],
      textshadow: ['h', 'v']
    }
  };

  // URL testing regexp
  static URL_REGEXP = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;

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

        case 'keyframes':
          // TODO: Implement
          break;

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
      const numericValue = parseFloat(value);

      // Check for string values
      if (numericValue !== numericValue || Convertor.validStringUnits[value.toLowerCase()]) { // eslint-disable-line no-self-compare
        unit = 'string';
        v = value;
      } else {
        v = numericValue;
      }
    }

    return {
      unit,
      value: v
    };
  }

  // Generates objectual representation of a directory and all it's files and subfolders
  static readDirSync(d) {
    const paths = {};
    let aux = [];

    try {
      aux = nodeFs.readdirSync(d);
    } catch (e) {
      // Ingore the error
    }

    aux.forEach((p) => {
      const childPath = `${nodePath.join(d, p)}`;

      if (nodeFs.lstatSync(childPath).isDirectory()) {
        paths[p] = Convertor.readDirSync(childPath);
      } else {
        paths[p] = true;
      }
    });

    return paths;
  }

  constructor() {
    this.includePaths = [];
    this.indentation = 2;
    this.setStringDelimiter('\'');
    this.forceEscapeProperty = true;

    // Configure sass.js
    SASS.options({
      style: SASS.style.expanded
    });
  }

  // Allow usage of specified indentation for the output code
  setIndentation(indent) {
    this.indentation = Number(indent) || 2;
  }

  // Allow usage of custom string delimiters (to allow ' and ")
  setStringDelimiter(delimiter) {
    this.stringDelimiter = delimiter;

    // Redefine output formats
    this.outputFormats = {
      javascript_file: {
        prefix: 'module.exports = ',
        suffix: ';\n'
      },
      react_file: {
        prefix: ['import { StyleSheet } from ', this.delimitString('react-native'), ';\n\nexport default StyleSheet.create('].join(''),
        suffix: ');\n'
      },
      javascript: {
        prefix: '',
        suffix: ';'
      },
      react: {
        prefix: '',
        suffix: ';'
      }
    };
  }

  alwaysEscapeProperties(status) {
    this.forceEscapeProperty = !!status;
  }

  // Allow setting the include paths array for all SASS/SCSS @import definitions
  setIncludePath(paths) {
    let changed = false;
    const cachedPaths = {};

    if (paths && paths.forEach) {
      const sanitizedPaths = paths.filter(p => p && p.toLowerCase && p.trim().length).map(p => p.trim());

      if (sanitizedPaths.length) {
        sanitizedPaths.forEach((p) => {
          if (this.includePaths.indexOf(p) === -1) {
            this.includePaths.push(p);
          }
        });

        changed = true;
      }
    } else if (paths && paths.toLowerCase) {
      const p = paths.trim();

      if (p.length > 0) {
        this.includePaths.push(p);
        changed = true;
      }
    }

    if (changed) {
      // Recursivelly generate a map of all files and subfolders for each include path
      this.includePaths.forEach((p) => {
        cachedPaths[p] = Convertor.readDirSync(p);
      });

      // Configure sass.js importer function
      const dependencyCache = {};
      const includePaths = this.includePaths;
      const REGEXP = Convertor.URL_REGEXP;

      SASS.importer(function resolveFileImports(request, done) { // eslint-disable-line prefer-arrow-callback
        const nodeFs = require('fs'); // eslint-disable-line global-require, no-shadow
        const nodePath = require('path'); // eslint-disable-line global-require, no-shadow

        // Search for the specified file in all include path locations
        const filePath = request.current;

        if (request.path || !request.current) {
          // Sass.js already found a file,
          // we probably want to just load that
          done();
        } else if (filePath.search(REGEXP) > -1) {
          // Check for url requires and don't try to resolve them
          done();
        } else if (request.current) {
          // Return the cached version of the file
          if (dependencyCache[filePath]) {
            done(dependencyCache[filePath]);
          } else {
            // Grab the file before returning
            const len = includePaths.length;
            let prefixSegments;
            let possibleFile;
            const fileName = nodePath.basename(filePath).split('.')[0];
            let found;
            let cache;

            if (request.previous === 'stdin') {
              prefixSegments = nodePath.dirname(filePath).split(nodePath.sep).filter(v => v !== '.' && v !== '..');
            } else {
              prefixSegments = nodePath.dirname(request.previous).split(nodePath.sep);
            }

            for (let i = 0; i < len; i += 1) {
              cache = cachedPaths[includePaths[i]];

              // Check for path existence
              prefixSegments.forEach((p) => { // eslint-disable-line no-loop-func
                if (cache && cache[p]) {
                  cache = cache[p];
                } else {
                  cache = null;
                }
              });

              // If the path at least existed
              if (cache) {
                possibleFile = [
                  nodePath.join(`${fileName}.sass`),  // SASS normal file
                  nodePath.join(`${fileName}.scss`),  // SCSS normal file
                  nodePath.join(`${fileName}.css`),   // CSS normal file
                  nodePath.join(`_${fileName}.sass`), // SASS import only segment
                  nodePath.join(`_${fileName}.scss`), // SCSS import only segment
                  nodePath.join(`_${fileName}.css`)   // CSS import only segment
                ].filter(p => cache[p])[0]; // eslint-disable-line no-loop-func

                if (possibleFile) {
                  found = dependencyCache[filePath] = {
                    content: nodeFs.readFileSync(`${nodePath.join(includePaths[i], prefixSegments.join(nodePath.sep), possibleFile)}`, { encoding: 'UTF-8' })
                  };
                }
              }

              // Return the found version of the file
              if (found) {
                done(found);
                break;
              } else {
                // Let the parser error
                done();
                break;
              }
            }
          }
        }
      });
    }

    return changed;
  }

  // Delimits a string with specified notation
  delimitString(s) {
    return this.stringDelimiter + s + this.stringDelimiter;
  }

  delimitProperty(p) {
    if (this.forceEscapeProperty) {
      return this.delimitString(p);
    }

    const prop = p.trim();
    if (prop.indexOf(' ') === -1) {
      return prop;
    }

    return this.delimitString(prop);
  }

  // Converts input data to one of supported formats (plain object or react stylesheet)
  convert(data, inputFormat, outputFormat) {
    const errors = [];

    // Normalize output format
    const how = Convertor.normalizeString(outputFormat);
    if (how === undefined || !this.outputFormats[how]) {
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
      return new Promise((resolve) => {
        SASS.compile(input, (result) => {
          if (result.status === 0) {
            resolve(this.convert(result.text || '', 'css', how));
          } else {
            errors.push({
              type: `${format} conversion`,
              file: result.file,
              line: result.line,
              column: result.column,
              message: result.message
            });

            resolve({
              formatted: '',
              errors
            });
          }
        });
      });
    }

    // Parse CSS into a rule set
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
    const list = Convertor.transform(parsed);

    return Promise.resolve({
      formatted: errors.length === 0 ? `${this.outputFormats[how].prefix}${this.to(list)}${this.outputFormats[how].suffix}` : '',
      errors
    });
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
          output.push(`${this.delimitProperty(f.key())}: ${this.manageProp(f.key(), f.value())}`);
          break;

        case Item.TYPE_LIST:
          output.push(`${this.delimitProperty(f.key())}: ${this.to(f.value(), indent + this.indentation)}`);
          break;

        case Item.TYPE_FONT_FACE:
          output.push(`${this.delimitProperty('fontFace')}: ${this.to(f.value(), indent + this.indentation)}`);
          break;

        case Item.TYPE_IMPORT:
          output.push(`${this.delimitProperty('import')}: ${this.delimitString(f.value())}`);
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
    const unitProp = this.delimitProperty('unit');
    const valueProp = this.delimitProperty('value');

    switch (parsedVal.unit) {
      case Convertor.UNIT_EM:
      case Convertor.UNIT_REM:
      case Convertor.UNIT_VH:
      case Convertor.UNIT_VW:
        return `{ ${unitProp}: ${this.delimitString(parsedVal.unit)}, ${valueProp}: ${parsedVal.value} }`;

      case Convertor.UNIT_PERCENTAGE:
        return `{ ${unitProp}: ${this.delimitString(parsedVal.unit + prefix)}, ${valueProp}: ${parsedVal.value / 100} }`;

      case Convertor.UNIT_STRING:
        return `{ ${unitProp}: ${this.delimitString('string')}, ${valueProp}: ${this.delimitString(parsedVal.value)} }`;

      default:
        // Return pixel values as is
        return `{ ${unitProp}: ${this.delimitString('px')}, ${valueProp}: ${parsedVal.value} }`;
    }
  }

  // Given a string input extracts all units out of the string, adapts them using adaptSize and returns the resulting array
  toAdaptableSize(value, direction, propType) {
    const parts = [];
    let part = [];
    const len = value.length;
    let lastOpen = -1;
    let nrOfOpen = 0;

    for (let i = 0; i < len; i += 1) {
      if (value[i] === ' ' && lastOpen === -1) {
        parts.push(part.join(''));
        part = [];
      } else if (value[i] === '(') {
        if (nrOfOpen === 0) {
          lastOpen = i;
        }

        nrOfOpen += 1;
        part.push(value[i]);
      } else if (value[i] === ')') {
        nrOfOpen -= 1;

        if (nrOfOpen === 0) {
          lastOpen = -1;

          part.push(value[i]);
          parts.push(part.join(''));
        } else {
          part.push(value[i]);
        }
      } else {
        part.push(value[i]);
      }

      if (i === len - 1) {
        if (parts[parts.length - 1] !== part.join('')) {
          parts.push(part.join(''));
        }
      }
    }

    if (direction === 'c') {
      // Normalize the number of parts
      const partsLen = parts.length;

      if (partsLen === 1) {
        parts[1] = parts[2] = parts[3] = parts[0];
      } else if (partsLen === 2) {
        parts[2] = parts[0];
        parts[3] = parts[1];
      } else if (partsLen === 3) {
        parts[3] = parts[1];
      }

      const directions = Convertor.propertiesCategories.combinedDirections[propType];
      return `[${parts.map((p, i) => this.adaptSize(p, directions[i] || 'h')).join(', ')}]`;
    }

    return `[${parts.map(p => this.adaptSize(p, direction)).join(', ')}]`;
  }

  // Given the type of a property it takes care of it's value conversion to output string
  manageProp(type, value) {
    const all = Convertor.propertiesCategories;
    const t = type.toLowerCase();

    const direction = (all.vertical[t] && 'v') || (all.horizontal[t] && 'h') || (all.combined[t] && 'c') || null;

    // Adapt properties requiring conversion
    if (direction) {
      return this.toAdaptableSize(value, direction, t);
    }

    // No transformation required? Return the quoted string
    return this.delimitString(value);
  }
}

export default Convertor;
