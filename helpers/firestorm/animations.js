const firestorm   = require('.')
const texture_use = require('./texture_use')

require('./firestorm_config')()

/**
 * @typedef {Object} TextureAnimation
 * @property {Object} mcmeta // mcmeta animation object
 * @property {String} edition // minecraft edition animation
 * @property {Function} use // gets the use of this animation
 */

module.exports = firestorm.collection('animation', el => {
  /** @returns {Promise<import('./texture_use').TextureUse>} */
  el.use = function() {
    return texture_use.get(el.useID)
  }
  return el
})