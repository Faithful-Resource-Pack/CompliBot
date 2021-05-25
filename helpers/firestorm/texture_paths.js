const firestorm = require('.')

require('./firestorm_config')()

/**
 * @typedef {Object} TexturePath
 * @property {Number} useID // use id of this path
 * @property {String} path // path itself
 * @property {String[]} versions // minecraft versions (any edition)
 * @property {Function} use // get the use from the path
 * @property {Function} texture // get the texture from the path
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