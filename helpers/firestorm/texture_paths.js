const firestorm = require('.')


require('./firestorm_config')()

/**
 * @typedef {Object} TexturePath
 * @property {Number} useID
 * @property {String} path
 * @property {String} edition
 * @property {String[]} versions
 * @property {Function} use
 * @property {Function} texture
 */

module.exports = firestorm.collection('paths', el => {
  /** @returns {Promise<import('./texture_use').TextureUse>} */
  el.use = function() {
    const texture_use = require('./texture_use')
    
    return texture_use.get(el.useID)
  }

  /** @returns {Promise<import('./texture').Texture>} */
  el.texture = function() {
    return new Promise((resolve, reject) => {
      el.use()
      .then(use => {
        return resolve(use.texture())
      })
      .catch(err => {
        reject(err)
      })
    })
    
  }
  return el
})