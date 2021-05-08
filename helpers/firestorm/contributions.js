const firestorm = require('.')
const texture = require('./texture')
const users = require('./users')

require('./firestorm_config')()

/**
 * @typedef {Object} Contribution
 * @property {String} date // date of contribution
 * @property {Number} textureID // texture's id modified
 * @property {Number} contributorID // author of the contribution
 * @property {String} res // res of contribution (c32, c64)
 * @property {Function} contributor // user assiocated to this contribution
 * @property {Function} texture // texture assiocated to this contribution
 */

module.exports = firestorm.collection('contributions', el => {
  /** @returns {Promise<import('./texture').Texture>} */
  el.contributor = function() {
    return users.get(el.contributorID)
  }
  
  /** @returns {Promise<import('./texture').Texture>} */
  el.texture = function() {
    return texture.get(el.textureID)
  }

  return el
})