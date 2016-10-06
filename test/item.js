/* eslint-env mocha */
import assert from 'assert';
import { Item } from './../src/item';
import { List } from './../src/list';

describe('Convertor Item', () => {
  const key = 'random-key';
  const value = {
    fallback: { value: 'random' },
    document: { value: undefined },
    list: { value: new List() },
    font_face: { value: new List() }
  };
  const keyValidation = {
    comment: { value: '' },
    charset: { value: '' },
    import: { value: '' }
  };

  Object.keys(Item.supportedTypes).forEach((type) => {
    describe(`Item type: ${type}`, () => {
      let item;
      let err;

      const typeValue = value[type] ? value[type].value : value.fallback.value;
      const typeValidationKey = keyValidation[type] ? keyValidation[type].value : key;

      it('initializes', () => {
        try {
          item = new Item(type, key, typeValue);
        } catch (e) {
          err = e;
        }

        assert.equal(err, undefined);
      });

      it('preserves type', () => {
        assert.equal(item.type(), type);
      });

      it('preserves key', () => {
        assert.equal(item.key(), typeValidationKey);
      });

      it('preserves value', () => {
        assert.equal(item.value(), typeValue);
      });
    });
  });

  describe('Empty Item of property type', () => {
    [undefined, null, ''].forEach((k) => {
      it(`Works with ${k}`, () => {
        const item = new Item(Item.TYPE_PROPERTY, k, 'random');
        assert.equal(item.key(), '');
      });
    });

    it('Converts NaN to string in property key', () => {
      const item = new Item(Item.TYPE_PROPERTY, NaN, 'random');
      assert.equal(item.key(), 'NaN');
    });
  });

  describe('Throws on Item type list without a List value', () => {
    let err;
    let item;

    try {
      item = new Item(Item.TYPE_LIST, 'random', null);
    } catch (e) {
      err = e;
    }

    assert.equal(item, undefined);
    assert.equal(err.toString(), 'Error: Invalid Item of type list initialization value. List expected, object received.');
  });

  describe('Throws on Item type font-face without a List value', () => {
    let err;
    let item;

    try {
      item = new Item(Item.TYPE_FONT_FACE, 'random', null);
    } catch (e) {
      err = e;
    }

    assert.equal(item, undefined);
    assert.equal(err.toString(), 'Error: Invalid Item of type font-face initialization value. List expected, object received.');
  });

  describe('Throws on Item with an invalid type', () => {
    let err;
    let item;

    try {
      item = new Item('no_one_knows', 'random', null);
    } catch (e) {
      err = e;
    }

    assert.equal(item, undefined);
    assert.equal(err.toString(), 'Error: Unsupported Item type: no_one_knows.');
  });
});
