const firestorm = require('.')
const animations = require('./animations')
const texture = require('./texture')
const texture_paths = require('./texture_paths')

require('./firestorm_config')()

/**
 * @typedef {Object} TextureUse
 * @property {Number} textureID // texture ID
 * @property {String} textureUseName // texture use human name
 * @property {Function} texture // get the texture associated for this use
 * @property {String[]} editions // editions for this use
 * @property {Function} paths // get the paths for this texture
 * @property {Function} animation // get the animation for this texture
 */

module.exports = firestorm.collection('uses', el => {
  /** @returns {Promise<Texture>} */
  el.texture = function () {
    return texture.get(el.textureID)
  }

  /** @returns {Promise<TexturePath[]>} */
  el.paths = function () {
    return texture_paths.search([{
      field: 'useID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }])
  }

  el.animation = function () {
    return animations.get(el[firestorm.ID_FIELD])
  }

  return el
})