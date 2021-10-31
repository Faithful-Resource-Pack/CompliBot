/**
 * Test if an object is really an object
 * @param {Object} object object to be tested
 * @returns {Boolean}
 */
const isObject = (object) => {
  return (typeof object === 'object' && !Array.isArray(object) && object !== null)
}

exports.isObject = isObject