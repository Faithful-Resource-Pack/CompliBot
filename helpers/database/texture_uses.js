const admin = require('firebase-admin')
const firestore = require('./database')

/**
 * @typedef {Object} TextureUse
 * @property {Number} id // texture ID
 * @property {String} name // texture use human name
 * @property {Number} useID // Auto ID affected by database
 */

const COLLECTION_NAME = 'texture_uses'

module.exports = {
  

  /**
   * @param {TextureUse} textureUse you want to add
   * @returns {Promise<Number>} The last id attributed
   */
   add: function(textureUse) {
    let lastId = 0
    return new Promise((resolve, reject) => {
      // get the last id
      firestore.collection(COLLECTION_NAME).orderBy("useID", "desc").limit(1).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          lastId = doc.data().id
        })

        return lastId
      })
      .then(lastId => {
        textureUse.useID = lastId
        return firestore.collection(COLLECTION_NAME).doc("" + lastId).set(textureUse)
      })
      .then(() => {
        resolve(lastId)
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  /**
   * @param {TextureUse} search Search texture use
   * @returns {Promise<TextureUse[]>}
   */
  search: function(search) {
  return new Promise((resolve, reject) => {
    let req = firestore.collection(COLLECTION_NAME)
    
    if(search.id) req = req.where("id", "==", search.id)
    if(search.name) req = req.where("path", "==", search.name)
    if(search.useID) req = req.where("useID", "==", search.useID)

    req.get().then(querySnapshot => {
      const results = []
      querySnapshot.forEach(doc => {
        results.push(doc.data())
      })

      // if results then resolve
      if(results.length > 0)
        return resolve(results)

      // if no result reject
      return reject(new Error('No results found for search', search))
    })
    .catch(err => {
      reject(err)
    })
  })
  },

  /**
   * @param {Number} textureID // Texture to search
   * @returns {Promise<TextureUse[]>}
   */
  searchByTextureID: function(textureID) {
    textureID = parseInt(textureID)
    return this.search({
      id: textureID
    })
  },

  /**
   * @param {String} name Name to search
   * @returns {Promise<TextureUse[]>}
   */
  searchByName: function(name) {
    return this.search({ name: name })
  },

  /**
   * @param {String|Number} useID Use ID to get
   * @returns {TextureUse}
   */
  get: function(useID) {
    return new Promise((resolve, reject) => {
      firestore.collection(COLLECTION_NAME).doc("" + useID).get()
      .then(doc => {
        if(doc.exists) {
          resolve(doc.data())
        }

        reject(new Error('No Texture use found for useID: ' + useID))
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
}