const firestorm = require('.')
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
    const texture_use = require('./texture_use')

    return texture_use.search([{
      field: 'textureID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }])
  }
  
  /** @returns {Promise<import('./contributions').Contribution[]>} */
  el.contributions = function(res = undefined) {
    const contributions = require('./contributions')

    const s = [{
      field: 'textureID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }]
    
    if (res) s.push({
      field: 'res',
      criteria: '==',
      value: res
    })

    return contributions.search(s)
  }

  /** @returns {Promise<import('./contributions').Contribution>} */
  el.lastContribution = function(res) {
    return new Promise((resolve, reject) => {
      el.contributions(res)
      .then(res => {
        const contro = res.sort((a, b) => b.date - a.date)
        if(contro.length) {
          let objres = contro[0]
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