const admin           = require('firebase-admin')
const firestore       = require('./database')
const COLLECTION_NAME = 'animations'

/**
 * @typedef {Object} TextureAnimation
 * @property {Number} useID
 * @property {Object} mcmeta
 * @property {String} edition
 */

const DEFAULT = {
  mcmeta: {}
}

module.exports = {
  /**
   * @param {String|Number} useID Texture use ID
   * @returns {Promise<TextureAnimation>} Possible animation
   */
  get: function(useID) {
    if(typeof(id) == 'string')
    useID = parseInt(useID)
    return new Promise((resolve, reject) => {
      firestore.collection(COLLECTION_NAME).doc("" + useID).get()
      .then(doc => {
        if(doc.exists) {
          resolve(Object.assign({}, DEFAULT, doc.data()))
        }

        reject(new Error('No animation found for useID: ' + useID))
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  /**
   * @param {String|Number} useID Texture use ID
   * @param {String} field Field to change
   * @param {any} value Field value
   * @param {any?} defaultValue Default value
   * @returns {Promise<WriteResult>}
   */
  setField: function(useID, field, value, defaultValue = undefined) {
    const obj = {}
    obj[field] = value || defaultValue

    return firestore.collection(COLLECTION_NAME).doc("" + useID).update(obj)
  },

  /**
   * @param {String|Number} useID Texture use ID
   * @param {String} field Field to removes
   * @returns {Promise<WriteResult>}
   */
  deleteField: function(useID, field) {
    const obj = {}
    obj[field] = admin.firestore.FieldValue.delete()
    return firestore.collection(COLLECTION_NAME).doc("" + useID).update(obj)
  },

  /**
   * @param {String|Number} useID Discord user ID
   * @returns {Promise<WriteResult>}
   */
  delete: function(useID) {
    return firestore.collection(COLLECTION_NAME).doc("" + useID).delete()
  },

  /**
   * @param {String|Number} useID Discord user ID
   * @param {Object} content User content provided
   * @returns {Promise<WriteResult>}
   */
  set: function(useID, content) {
    return firestore.collection(COLLECTION_NAME).doc("" + useID).set(content)
  },
}