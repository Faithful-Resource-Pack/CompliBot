const firestore = require('./database')

/**
 * @typedef {Object} TexturePath
 * @property {String} edition
 * @property {String} path
 * @property {Number} useID
 * @property {String[]} versions
 */

/**
 * @typedef {Object} PathSearch
 * @property {String?} edition
 * @property {String?} path
 * @property {Number?} useID
 * @property {String[]?} versions
 */

const COLLECTION_NAME = 'paths'

module.exports = {
  /**
   * @param {PathSearch} search // search object
   * @returns {Promise<TexturePath[]>}
   */
  search: function(search) {
  return new Promise((resolve, reject) => {
    let req = firestore.collection(COLLECTION_NAME)
    
    if(search.edition) req = req.where("edition", "==", search.edition)
    if(search.path) req = req.where("path", "==", search.path)
    if(search.useID) req = req.where("useID", "==", search.useID)
    if(search.versions) req = req.where("versions", "array-contains-any", search.versions)

    req.get().then(querySnapshot => {
      const results = []
      querySnapshot.forEach(doc => {
        results.push(Object.assign({}, { docID: doc.id }, doc.data()))
      })

      // if results then resolve
      if(results.length > 0)
        return resolve(results)

      // if no result reject
      return reject(new Error('No Path found for search', search))
    })
    .catch(err => {
      reject(err)
    })
  })
  },

  /**
   * @param {TexturePath} path Texture path object
   * @returns {Promise<WriteResult>}
   */
  add: function(path) {
    return firestore.collection(COLLECTION_NAME).add(path)
  },

  /**
   * @param {String} path Texture path to be deleted
   * @returns {Promise<WriteResult>}
   */
  remove: function(path) {
    return new Promise((resolve, reject) => {
      this.search({
        path: path
      })
      .then(results => {
        console.log(results)
        const deletePromises = results.map(res => firestore.collection(COLLECTION_NAME)?.doc(res.docID)?.delete())

        Promise.all(deletePromises)
        .then(() => resolve())
        .catch(err => reject(err))
      })
      .catch(err => reject(err))
    })
  }
}
