/* eslint-env mocha */
import assert from 'assert';
import nodeFs from 'fs';
import nodePath from 'path';
import { Convertor } from './../src/convertor';

const output = `'body': {
    'fontFamily': ''Roboto', sans-serif'
  },
  'nav': {
    'position': 'absolute',
    'top': [{ 'unit': 'px', 'value': 0 }],
    'left': [{ 'unit': 'px', 'value': 0 }],
    'width': [{ 'unit': '%H', 'value': 1 }],
    'margin': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'padding': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'height': [{ 'unit': 'px', 'value': 50 }],
    'backgroundColor': '#303f44',
    'borderBottom': [{ 'unit': 'px', 'value': 3 }, { 'unit': 'string', 'value': 'solid' }, { 'unit': 'string', 'value': '#6a7d84' }],
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 5 }, { 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'rgba(0, 0, 0, 0.2)' }]
  },
  'nav divlogo': {
    'width': [{ 'unit': 'px', 'value': 70 }],
    'height': [{ 'unit': 'px', 'value': 50 }],
    'float': 'left',
    'paddingTop': [{ 'unit': 'px', 'value': 1 }]
  },
  'nav divlogo img': {
    'width': [{ 'unit': 'px', 'value': 44 }]
  },
  'nav ul': {
    'float': 'left',
    'margin': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'padding': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }],
    'listStyle': 'none'
  },
  'nav li': {
    'cursor': 'pointer',
    'display': 'inline-block'
  },
  'nav li divlabel': {
    'borderBottom': [{ 'unit': 'px', 'value': 3 }, { 'unit': 'string', 'value': 'solid' }, { 'unit': 'string', 'value': 'rgba(255, 255, 255, 0)' }],
    'width': [{ 'unit': 'px', 'value': 110 }],
    'float': 'left',
    'overflow': 'hidden',
    'height': [{ 'unit': 'px', 'value': 50 }],
    'textAlign': 'center'
  },
  'nav li divlabel:hover': {
    'borderBottom': [{ 'unit': 'px', 'value': 3 }, { 'unit': 'string', 'value': 'solid' }, { 'unit': 'string', 'value': '#2fcf41' }]
  },
  'nav li divlabel spanlabel': {
    'padding': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 10 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 10 }],
    'fontWeight': '400',
    'color': '#ffffff',
    'fontSize': [{ 'unit': 'px', 'value': 15 }],
    'WebkitFontSmoothing': 'antialiased',
    'display': 'inline-block',
    'verticalAlign': 'middle',
    'lineHeight': [{ 'unit': 'px', 'value': 65 }],
    'textShadow': [{ 'unit': 'px', 'value': 1 }, { 'unit': 'px', 'value': 1 }, { 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'rgba(150, 150, 150, 0.29)' }]
  },
  'nav li divlabel spanlabel:hover': {
    'color': '#2fcf41'
  },
  'nav li divicon': {
    'paddingTop': [{ 'unit': 'px', 'value': 10 }],
    'float': 'left',
    'overflow': 'hidden',
    'height': [{ 'unit': 'px', 'value': 50 }],
    'fontSize': [{ 'unit': 'px', 'value': 35 }],
    'marginLeft': [{ 'unit': 'px', 'value': -105 }]
  },
  'nav li imenu': {
    'marginTop': [{ 'unit': 'px', 'value': 4 }],
    'opacity': '0.1',
    'color': '#93c4ff'
  },
  'nav a': {
    'display': 'block',
    'padding': [{ 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 12 }, { 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 12 }],
    'textDecoration': 'none'
  },
  'nav divuser': {
    'float': 'right',
    'width': [{ 'unit': 'px', 'value': 250 }],
    'height': [{ 'unit': 'px', 'value': 50 }],
    'color': '#ffffff',
    'fontSize': [{ 'unit': 'em', 'value': 1 }],
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400'
  },
  'nav divuser divusername': {
    'paddingLeft': [{ 'unit': 'px', 'value': 10 }],
    'paddingRight': [{ 'unit': 'px', 'value': 10 }],
    'float': 'left',
    'lineHeight': [{ 'unit': 'px', 'value': 60 }]
  },
  'nav divuser divbadge-type-one': {
    'cursor': 'pointer',
    'margin': [{ 'unit': 'px', 'value': 17 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 17 }, { 'unit': 'px', 'value': 2 }],
    'padding': [{ 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 10 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 10 }],
    'float': 'left',
    'fontSize': [{ 'unit': 'em', 'value': 0.8 }],
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400',
    'backgroundColor': '#CC2A41',
    'borderRadius': '10px',
    'height': [{ 'unit': 'px', 'value': 16 }]
  },
  'nav divuser divbadge-type-two': {
    'cursor': 'pointer',
    'margin': [{ 'unit': 'px', 'value': 17 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 17 }, { 'unit': 'px', 'value': 2 }],
    'padding': [{ 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 10 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 10 }],
    'float': 'left',
    'fontSize': [{ 'unit': 'em', 'value': 0.8 }],
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400',
    'backgroundColor': '#30a043',
    'borderRadius': '10px',
    'height': [{ 'unit': 'px', 'value': 16 }]
  },
  'buttonsave': {
    'border': [{ 'unit': 'string', 'value': 'none' }],
    'color': 'white',
    'padding': [{ 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 12 }, { 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 12 }],
    'textAlign': 'center',
    'textTransform': 'uppercase',
    'display': 'inline-block',
    'fontSize': [{ 'unit': 'em', 'value': 0.8 }],
    'cursor': 'pointer',
    'borderRadius': '3px',
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400',
    'backgroundColor': '#26ADE4',
    'width': [{ 'unit': 'px', 'value': 200 }],
    'marginLeft': [{ 'unit': 'px', 'value': 25 }],
    'marginTop': [{ 'unit': 'px', 'value': 10 }],
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 3 }, { 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'string', 'value': 'rgba(0, 0, 0, 0.2)' }]
  },
  'buttoncancel': {
    'border': [{ 'unit': 'string', 'value': 'none' }],
    'color': 'white',
    'padding': [{ 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 12 }, { 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 12 }],
    'textAlign': 'center',
    'textTransform': 'uppercase',
    'display': 'inline-block',
    'fontSize': [{ 'unit': 'em', 'value': 0.8 }],
    'cursor': 'pointer',
    'borderRadius': '3px',
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400',
    'backgroundColor': '#CC2A41',
    'width': [{ 'unit': 'px', 'value': 200 }],
    'marginLeft': [{ 'unit': 'px', 'value': 25 }],
    'marginTop': [{ 'unit': 'px', 'value': 10 }],
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 3 }, { 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'string', 'value': 'rgba(0, 0, 0, 0.2)' }]
  },
  'buttondisabled': {
    'border': [{ 'unit': 'string', 'value': 'none' }],
    'color': 'white',
    'padding': [{ 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 12 }, { 'unit': 'px', 'value': 8 }, { 'unit': 'px', 'value': 12 }],
    'textAlign': 'center',
    'textTransform': 'uppercase',
    'display': 'inline-block',
    'fontSize': [{ 'unit': 'em', 'value': 0.8 }],
    'cursor': 'not-allowed',
    'borderRadius': '3px',
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400',
    'backgroundColor': '#CACACA',
    'width': [{ 'unit': 'px', 'value': 200 }],
    'marginLeft': [{ 'unit': 'px', 'value': 25 }],
    'marginTop': [{ 'unit': 'px', 'value': 10 }],
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 3 }, { 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'string', 'value': 'rgba(0, 0, 0, 0.2)' }]
  },
  'h1': {
    'fontFamily': ''roboto', sans-serif',
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400'
  },
  'input::-webkit-input-placeholder': {
    'fontFamily': ''roboto', sans-serif',
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400'
  },
  'button': {
    'fontFamily': ''roboto', sans-serif',
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400'
  },
  'label': {
    'fontFamily': ''roboto', sans-serif',
    'WebkitFontSmoothing': 'antialiased',
    'fontWeight': '400'
  },
  'h1': {
    'height': [{ 'unit': 'px', 'value': 50 }],
    'width': [{ 'unit': '%H', 'value': 1 }],
    'fontSize': [{ 'unit': 'px', 'value': 18 }],
    'background': '#1ba3da',
    'color': 'white',
    'lineHeight': [{ 'unit': '%V', 'value': 1.5 }],
    'borderRadius': '3px 3px 0 0',
    'boxShadow': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 5 }, { 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'rgba(0, 0, 0, 0.2)' }]
  },
  'form': {
    'boxSizing': 'border-box',
    'width': [{ 'unit': 'px', 'value': 260 }],
    'margin': [{ 'unit': 'px', 'value': 100 }, { 'unit': 'string', 'value': 'auto' }, { 'unit': 'px', 'value': 0 }, { 'unit': 'string', 'value': 'auto' }],
    'boxShadow': [{ 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 5 }, { 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'rgba(0, 0, 0, 0.2)' }],
    'paddingBottom': [{ 'unit': 'px', 'value': 40 }],
    'borderRadius': '3px'
  },
  'form h1': {
    'boxSizing': 'border-box',
    'padding': [{ 'unit': 'px', 'value': 12 }, { 'unit': 'px', 'value': 12 }, { 'unit': 'px', 'value': 12 }, { 'unit': 'px', 'value': 12 }]
  },
  'label': {
    'color': '#5f5d5d',
    'margin': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 25 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 25 }],
    'width': [{ 'unit': 'px', 'value': 200 }],
    'display': 'block',
    'border': [{ 'unit': 'string', 'value': 'none' }],
    'padding': [{ 'unit': 'px', 'value': 10 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 10 }, { 'unit': 'px', 'value': 0 }]
  },
  'input': {
    'fontSize': [{ 'unit': 'px', 'value': 14 }],
    'margin': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 25 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 25 }],
    'width': [{ 'unit': 'px', 'value': 200 }],
    'display': 'block',
    'border': [{ 'unit': 'string', 'value': 'none' }],
    'padding': [{ 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 0 }],
    'borderBottom': [{ 'unit': 'string', 'value': 'solid' }, { 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': '#26ADE4' }],
    'color': '#5f5d5d'
  },
  'input:focus': {
    'boxShadow': [{ 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }],
    'outline': 'none'
  },
  'input:valid': {
    'boxShadow': [{ 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }],
    'outline': 'none'
  },
  'input:focus::-webkit-input-placeholder': {
    'color': '#26ADE4',
    'visibility': 'visible !important'
  },
  'input:valid::-webkit-input-placeholder': {
    'color': '#26ADE4',
    'visibility': 'visible !important'
  },
  'labelcheckbox': {
    'float': 'left',
    'color': '#5f5d5d',
    'margin': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 25 }],
    'width': [{ 'unit': 'px', 'value': 150 }],
    'display': 'block',
    'border': [{ 'unit': 'string', 'value': 'none' }],
    'padding': [{ 'unit': 'px', 'value': 10 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 10 }, { 'unit': 'px', 'value': 0 }]
  },
  'inputcheckbox': {
    'float': 'left',
    'fontSize': [{ 'unit': 'px', 'value': 14 }],
    'margin': [{ 'unit': 'px', 'value': 14 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 25 }],
    'width': [{ 'unit': 'px', 'value': 50 }],
    'display': 'block',
    'border': [{ 'unit': 'string', 'value': 'none' }],
    'padding': [{ 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 2 }, { 'unit': 'px', 'value': 0 }],
    'borderBottom': [{ 'unit': 'string', 'value': 'solid' }, { 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': '#26ADE4' }],
    'color': '#126d92'
  },
  'inputcheckbox:focus': {
    'boxShadow': [{ 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }],
    'outline': 'none'
  },
  'inputcheckbox:valid': {
    'boxShadow': [{ 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }, { 'unit': 'string', 'value': 'none' }],
    'outline': 'none'
  },
  'inputcheckbox:focus::-webkit-input-placeholder': {
    'color': '#26ADE4',
    'visibility': 'visible !important'
  },
  'inputcheckbox:valid::-webkit-input-placeholder': {
    'color': '#26ADE4',
    'visibility': 'visible !important'
  }
});
`;

describe('Complex conversions', () => {
  it('Converts a border', () => {
    const c = new Convertor();

    c.convert('.test { border: 1em dashed rgba(255, 255, 255, 0.1); }', 'css', 'javascript').then((ret) => {
      assert.equal(ret.errors.length, 0);
      assert.equal(ret.formatted, `
{
  'test': {
    'border': [{ 'unit': 'em', 'value': 1 }, { 'unit': 'string', 'value': 'dashed' }, { 'unit': 'string', 'value': 'rgba(255, 255, 255, 0.1)' }]
  }
};`.trim());
    });
  });

  it('Converts margin', () => {
    const c = new Convertor();

    c.convert('.test { margin: 1em 5px 10% .2rem; }', 'css', 'javascript').then((ret) => {
      assert.equal(ret.errors.length, 0);
      assert.equal(ret.formatted, `
{
  'test': {
    'margin': [{ 'unit': 'em', 'value': 1 }, { 'unit': 'px', 'value': 5 }, { 'unit': '%V', 'value': 0.1 }, { 'unit': 'rem', 'value': 0.2 }]
  }
};`.trim());
    });
  });

  it('Converts padding with missing elements', () => {
    const c = new Convertor();

    c.convert('.test { padding: 1% 5%; }', 'css', 'javascript').then((ret) => {
      assert.equal(ret.errors.length, 0);
      assert.equal(ret.formatted, `
{
  'test': {
    'padding': [{ 'unit': '%V', 'value': 0.01 }, { 'unit': '%H', 'value': 0.05 }, { 'unit': '%V', 'value': 0.01 }, { 'unit': '%H', 'value': 0.05 }]
  }
};`.trim());
    });
  });

  it('Converts padding with unitless and missing elements', () => {
    const c = new Convertor();

    c.convert('.test { padding: 10% 0 0; }', 'css', 'javascript').then((ret) => {
      assert.equal(ret.errors.length, 0);
      assert.equal(ret.formatted, `
{
  'test': {
    'padding': [{ 'unit': '%V', 'value': 0.1 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 0 }]
  }
};`.trim());
    });
  });

  it('Converts box-shadow', () => {
    const c = new Convertor();

    c.convert('.test { box-shadow: 0% 2% 5px 1px rgba(0,0,0,0.2); }', 'css', 'javascript').then((ret) => {
      assert.equal(ret.errors.length, 0);
      assert.equal(ret.formatted, `
{
  'test': {
    'boxShadow': [{ 'unit': '%H', 'value': 0 }, { 'unit': '%V', 'value': 0.02 }, { 'unit': 'px', 'value': 5 }, { 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'rgba(0,0,0,0.2)' }]
  }
};`.trim());
    });
  });

  it('Conversion of a full example', () => {
    const c = new Convertor();
    let err = null;
    let input;

    // Add font-awesome paths
    c.setIncludePath([__dirname]);

    try {
      input = nodeFs.readFileSync(nodePath.join(__dirname, './complex_mock.scss'));
    } catch (e) {
      err = e;
    }

    // Make sure we have input
    assert.equal(err, null);

    c.convert(input, 'scss', 'react_file').then((ret) => {
      // No conversion errors
      assert.equal(ret.errors.length, 0);
      assert.equal(ret.formatted.slice(ret.formatted.indexOf('\'body\': {')), output);
    });
  });
});
