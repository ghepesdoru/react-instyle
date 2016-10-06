import { Item } from './item';

// Items buffer constructor
export class List {
  constructor() {
    this.store = {
      idx: 0,
      idxAdded: 0,
      list: {}
    };
  }

  // Adds a new Item to the list of items in the store
  add(item) {
    let aux;

    if (!(item instanceof Item)) {
      throw new Error(`Invalid item in add function. Item expected, ${typeof item} received.`);
    } else if (item.type() === Item.TYPE_CHARSET) {
      // Reposition the newly added charset as the first element of current list (to give it a chance to get applied for outer lists)

      aux = this.store.idxAdded;

      while (aux > -1) {
        this.store.list[aux + 1] = this.store.list[aux];
        aux -= 1;
      }

      this.store.idxAdded += 1;
      this.store.list[0] = item;
    } else {
      // Add normal list elements
      this.store.list[this.store.idxAdded] = item;
      this.store.idxAdded += 1;
    }

    return true;
  }

  // Searches the list for the first item with the specified key
  searchByKey(k) {
    let ret;

    this.forEach((aux) => {
      if (k === aux.key()) {
        ret = aux;
        return true;
      }

      return false;
    });

    return ret;
  }

  // Iterates over the list items calling a 3rd party function on each item
  forEach(f) {
    let aux;
    if (!f || !f.call) return;

    this.resetIterator();
    aux = this.next();

    while (aux) {
      if (f(aux, this.store.idx)) {
        break;
      }

      aux = this.next();
    }

    this.resetIterator();
  }

  // Next item getter
  next() {
    this.store.idx += 1;
    return this.store.list[this.store.idx - 1];
  }

  // Returns the last item in the list
  last() {
    return this.store.list[this.store.idxAdded - 1];
  }

  // Reset currently iterator index
  resetIterator() {
    this.store.idx = 0;
  }

  reset() {
    this.store = {
      idx: 0,
      idxAdded: 0,
      list: {}
    };
  }
}

export default List;
