const admin = require('firebase-admin')
const firestore = require('./database')

/**
 * @typedef {Object} User
 * @property {Number} userID
 * @property {String} username
 * @property {String[]} type
 * @property {Object} muted
 * @property {Number?} muted.start
 * @property {Number?} muted.end
 * @property {Number} timeout
 * @property {String[]} warns
 */

/** @type {User} */
const USER_DEFAULT = {
  username: "",
  type: ['member'],
  warns: [],
  muted: {},
  timeout: 0
}

const COLLECTION_NAME = 'users'

module.exports = {
  /**
   * @param {String|Number} id Discord user ID
   * @returns {Promise<User>} Query result
   */
  get: function(id) {
    if(typeof(id) == 'string')
      id = parseInt(id)
    return new Promise((resolve, reject) => {
      firestore.collection(COLLECTION_NAME).where('id', '==', id).limit(1).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          resolve(Object.assign({}, USER_DEFAULT, doc.data()))
        })

        reject(new Error('No user found for ID: ' + id))
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  /**
   * @param {String|Number} id Discord user ID
   * @param {Object} content User content provided
   * @returns {Promise<WriteResult>}
   */
  set: function(id, content) {
    return firestore.collection(COLLECTION_NAME).doc("" + id).set(content)
  },

  /**
   * @param {String|Number} id Discord user ID
   * @param {String} field Field to change
   * @param {any} value Field value
   * @param {any?} defaultValue Default value
   * @returns {Promise<WriteResult>}
   */
  setField: function(id, field, value, defaultValue = undefined) {
    const obj = {}
    obj[field] = value || defaultValue

    return firestore.collection(COLLECTION_NAME).doc("" + id).update(obj)
  },

  deleteField: function(id, field) {
    const obj = {}
    obj[field] = admin.firestore.FieldValue.delete()
    return firestore.collection(COLLECTION_NAME).doc("" + id).update(obj)
  },

  /**
   * @param {String|Number} id Discord user ID
   * @returns {Promise<WriteResult>}
   */
  delete: function(id) {
    return firestore.collection(COLLECTION_NAME).doc("" + id).delete()
  },

  /**
   * @param {String|Number} id  Discord user ID
   * @param {String} reason Warn reason
   * @returns {Promise<WriteResult>}
   */
  addWarn: function(id, reason) {
    return firestore.collection(COLLECTION_NAME).doc("" + id).update({
      warns: admin.firestore.FieldValue.arrayUnion(reason) // append to array
    })
  },

  /**
   * @param {String|Number} id Discord user ID
   * @param {Number} durationMs Mute duration ms
   * @returns {Promise<WriteResult>}
   */
  mute: function(id, durationMs) {
    const start = new Date().getTime()
    return firestore.collection(COLLECTION_NAME).doc("" + id).update({
      muted: {
        start: start,
        end: start + durationMs
      }
    })
  },

  /**
   * @param {String|number} id Discord user ID
   * @returns {Promise<WriteResult>}
   */
  unmute: function(id) {
    return firestore.collection(COLLECTION_NAME).doc("" + id).update({
      muted: {}
    })
  },

  /**
   * @param {String|Number} id  Discord user ID
   * @param {String} type User type
   * @returns {Promise<WriteResult>}
   */
   addType: function(id, type) {
    return firestore.collection(COLLECTION_NAME).doc("" + id).update({
      type: admin.firestore.FieldValue.arrayUnion(type) // append to array
    })
  },

  /**
   * @param {String|Number} id  Discord user ID
   * @param {String} type User type
   * @returns {Promise<WriteResult>}
   */
   removeType: function(id, type) {
    return firestore.collection(COLLECTION_NAME).doc("" + id).update({
      type: admin.firestore.FieldValue.arrayRemove(type) // append to array
    })
  }
}