export class Item {
  // Define all types
  static TYPE_PROPERTY = 'property';
  static TYPE_COMMENT = 'comment';
  static TYPE_LIST = 'list';
  static TYPE_CHARSET = 'charset';
  static TYPE_FONT_FACE = 'font_face';
  static TYPE_CUSTOM_MEDIA = 'custom_media';
  static TYPE_DOCUMENT = 'document';
  static TYPE_IMPORT = 'import';
  static TYPE_MEDIA_QUERY = 'media_query';

  static supportedTypes = {}

  // Return a string representation for valid values or empty string
  static validOrEmpty(v) {
    if (v === undefined || v === null || v === '') {
      return '';
    } else if (v.toLowerCase) {
      return v;
    }

    return String(v);
  }

  constructor(type, key, value) {
    this.t = Item.supportedTypes[type] ? type : null;

    switch (type) {
      case Item.TYPE_PROPERTY:
        this.k = Item.validOrEmpty(key);
        this.v = Item.validOrEmpty(value);
        break;

      case Item.TYPE_COMMENT:
        this.k = '';
        this.v = Item.validOrEmpty(value);
        break;

      case Item.TYPE_IMPORT:
        this.k = '';
        this.v = Item.validOrEmpty(value);
        break;

      case Item.TYPE_LIST:
        this.k = Item.validOrEmpty(key);

        if (!value || !value.next) {
          this.k = '';
          this.v = '';

          throw new Error(`Invalid Item of type list initialization value. List expected, ${typeof value} received.`);
        } else {
          this.v = value;
        }
        break;

      case Item.TYPE_CHARSET:
        this.k = '';
        this.v = Item.validOrEmpty(value);
        break;

      case Item.TYPE_FONT_FACE:
        this.k = Item.validOrEmpty(key);
        if (!value || !value.next) {
          this.k = '';
          this.v = '';

          throw new Error(`Invalid Item of type font-face initialization value. List expected, ${typeof value} received.`);
        } else {
          this.v = value;
        }
        break;

      case Item.TYPE_CUSTOM_MEDIA:
        this.k = Item.validOrEmpty(key);
        this.v = Item.validOrEmpty(value);
        break;

      case Item.TYPE_DOCUMENT:
        this.k = Item.validOrEmpty(key);
        break;

      case Item.TYPE_MEDIA_QUERY:
        this.k = Item.validOrEmpty(key);
        this.v = value;
        break;

      default:
        throw new Error(`Unsupported Item type: ${type}.`);
    }
  }

  // Key getter
  key() {
    return this.k;
  }

  // Value getter
  value() {
    return this.v;
  }

  // Type getter
  type() {
    return this.t;
  }

}

export default Item;

// Cnstruct the type lookup map
Object.keys(Item).forEach((t) => {
  if (t.indexOf('TYPE_') === 0) {
    Item.supportedTypes[t.slice(5).toLowerCase()] = true;
  }
});
