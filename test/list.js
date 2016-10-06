/* eslint-env mocha */
import assert from 'assert';
import { Item } from './../src/item';
import { List } from './../src/list';

describe('Convertor List', () => {
  describe('Empty list', () => {
    let list;

    it('Initializes', () => {
      list = new List();
      assert.equal(list.constructor, List);
    });

    it('Is empty', () => {
      assert.equal(list.next(), undefined);
    });

    it('Does not iterate', () => {
      const validation = {};
      list.forEach((i) => {
        validation[i.key()] = true;
      });

      assert.equal(Object.keys(validation).length, 0);
    });

    it('Does returns early if no function for iteration', () => {
      assert.equal(list.forEach(null), undefined);
    });
  });

  describe('List with content', () => {
    const item1 = new Item(Item.TYPE_PROPERTY, 'random', 'value');
    const item2 = new Item(Item.TYPE_COMMENT, undefined, 'value');
    const item3 = new Item(Item.TYPE_CHARSET, undefined, 'utf-8');
    const list = new List();

    it('Allows addition of one property Item', () => {
      const added = list.add(item1);
      assert.equal(added, true);
    });

    it('Finds the new item as the first item by using next', () => {
      assert.equal(list.next(), item1);
    });

    it('Doe not reset the iteration index on another next and finds no item', () => {
      assert.equal(list.next(), undefined);
    });

    it('Resets the iteration index if asked for', () => {
      list.resetIterator();
      assert.equal(list.next(), item1);
    });

    it('Automatically resets the interation index on forEach and leaves the end iteration index at start of list', () => {
      const validation = {};
      list.forEach((i) => {
        validation[i.key()] = true;
      });

      assert.equal(Object.keys(validation).length, 1);
      assert.equal(list.next(), item1);
      assert.equal(list.next(), undefined);
    });

    it('Does clear the list if asked to', () => {
      list.resetIterator();
      list.reset();
      assert.equal(list.next(), undefined);
    });

    it('Does allow addition on resetted list instance', () => {
      assert.equal(list.add(item1), true);
      assert.equal(list.add(item2), true);
    });

    it('Allows breaking iteration when specified but resets the iteration index', () => {
      const validation = {};
      list.forEach((i) => {
        validation[i.key()] = true;
        return true;
      });

      assert.equal(Object.keys(validation).length, 1);
      assert.equal(validation.random, true);
      assert.equal(list.next(), item1);
    });

    it('Disallows addition of non Item', () => {
      let err;

      try {
        list.add(null);
      } catch (e) {
        err = e;
      }

      assert.equal(err.toString(), 'Error: Invalid item in add function. Item expected, object received.');
    });

    it('Reorders items to accomodate chaset Item as first in the list', () => {
      assert.equal(list.add(item3), true);
      list.resetIterator();
      assert.equal(list.next(), item3);
    });

    it('Allows searching for a specified item', () => {
      assert.equal(list.searchByKey('random'), item1);
    });
  });
});
