const firestorm = require('.')
const contributions = require('./contributions')
const texture_use = require('./texture_use')

require('./firestorm_config')() 

/**
 * @typedef {Object} Texture
 * @property {String} name Texture friendly name
 * @property {Function} uses All texture uses
 * @property {Function} contributions All contributions for this texture
 * @property {Function} lastContribution Last contribution for this texture
 */

module.exports = firestorm.collection('textures', el => {
  /** @returns {Promise<import('./texture_use').TextureUse[]> */
  el.uses = function() {
    return texture_use.search([{
      field: 'textureID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }])
  }
  
  /** @returns {Promise<import('./contributions').Contribution[]>} */
  el.contributions = function() {
    return contributions.search([{
      field: 'textureID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }])
  }

  /** @returns {Promise<import('./contributions').Contribution>} */
  el.lastContribution = function() {
    return new Promise((resolve, reject) => {
      el.contributions()
      .then(res => {
        const contro = Object.values(res).map(ctr => ctr.date).sort()
        if(contro.length) {
          const objres = {}
          objres[contro[contro.length - 1]] = res[contro[contro.length - 1]]

          resolve(objres)
        }

        resolve(undefined)
      })
      .catch(res => {
        reject(res)
      })
    })
    
  }

  return el
})