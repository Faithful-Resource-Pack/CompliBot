declare global {
  interface Array<T> {
    /**
     * Remove the given value from the array.
     * @param {T} item the item to be removed.
     * @return {Array<T>} the array without the item.
     * @example [1, 2, 3].remove(2) // [1, 3]
     */
    remove(item: T): Array<T>;

    /**
     * Remove all occurrences of an item from the array.
     * @param {T} item the item to be removed.
     * @return {Array<T>} the array with all corresponding item removed.
     * @example [1, 2, 3, 2].removeAll(2) // [1, 3]
     */
    removeAll(item: T): Array<T>;

    /**
     * Empty the array.
     */
    clear(): Array<T>;

    /**
     * Check if none of the items in the array match the given value.
     * **Note:** This is the opposite of `Array#includes`.
     */
    none(value: T): boolean;
  }
}

if (!Array.prototype.remove) {
  Object.defineProperty(Array.prototype, 'remove', {
    value: function remove<T>(item: T) {
      return this.indexOf(item) !== -1
        ? this.splice(this.indexOf(item), 1)
        : this;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!Array.prototype.removeAll) {
  Object.defineProperty(Array.prototype, 'removeAll', {
    value: function removeAll<T>(item: T) {
      let i = this.length;
      while (i >= 0) {
        if (this[i] === item) this.splice(this.indexOf(item), 1);
        i -= 1;
      }
      return this;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!Array.prototype.clear) {
  Object.defineProperty(Array.prototype, 'clear', {
    value: function clear() {
      this.length = 0;
      return this;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export {};
