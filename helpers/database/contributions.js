const firestore = require('./database')

/**
 * @typedef {Object} Contribution
 * @property {Number} id
 * @property {String} res
 * @property {String} date
 * @property {Number} textureID
 * @property {Number} contributorID
 * @property {String} res
 */

const COLLECTION_NAME = 'contributions'

module.exports = {
  /**
   * @param {String|Number} contributorID Contributor Discord ID
   * @returns {Promise<Contribution[]>}
   */
  getForContributor: function(contributorID) {
    return new Promise((resolve, reject) => {
      firestore
      .collection(COLLECTION_NAME)
      .where("contributorID", ">=", '' + contributorID)
      .get().then(querySnapshot => {
        const results = []
        querySnapshot.forEach(doc => {
          results.push(doc.data())
        })

        if(results.length > 0)
          return resolve(results)

        reject(new Error('No contribution found for contributor #' + contributorID))
      })
      .catch(err => {
        reject(err)
      })
    })
  },
  /**
   * @param {Number} textureID Texture ID
   * @returns {Promise<Contribution[]>}
   */
  getForTexture: function(textureID) {
    return new Promise((resolve, reject) => {
      firestore
      .collection(COLLECTION_NAME)
      .where("textureID", "==", textureID)
      .get().then(querySnapshot => {
        const results = []
        querySnapshot.forEach(doc => {
          results.push(doc.data())
        })

        if(results.length > 0)
          return resolve(results)

        reject(new Error('No contribution found for contributor #' + textureID))
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  /**
   * 
   * @param {Contribution} contribution you want to add
   * @returns {Promise<Number>} The last id attributed
   */
  add: function(contribution) {
    let lastId = 0
    return new Promise((resolve, reject) => {
      // get the last id
      firestore.collection(COLLECTION_NAME).orderBy("id", "desc").limit(1).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          lastId = doc.data().id
        })

        return lastId
      })
      .then(lastId => {
        contribution.id = lastId
        return firestore.collection(COLLECTION_NAME).doc("" + lastId).set(contribution)
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
   * @param {String|Number} contributionID Contribution ID to delete
   * @returns {Promise<WriteResult>}
   */
  removeContribution: function(contributionID) {
    return firestore.collection(COLLECTION_NAME).doc('' + contributionID).delete()
  }
}