const firestorm = require('.')
const contributions = require('./contributions')

require('./firestorm_config')() 

/**
 * @typedef {Object} User
 * @property {Number} userID Discord ID
 * @property {String?} username Minecraft userbame
 * @property {String[]} type User type on server
 * @property {String} uuid User minecraft id
 * @property {Object} muted Object if user muted on server
 * @property {Number?} muted.start
 * @property {Number?} muted.end
 * @property {Number} timeout Number if user muted on server
 * @property {String[]} warns List of all reasons warns
 * @property {Function} contributions Gets all contributions of the user
 */

 module.exports = firestorm.collection('users', el => {
  el.contributions = function() {
    return contributions.search([{
      field: 'contributors',
      criteria: 'array-contains',
      value: el[firestorm.ID_FIELD]
    }])
  }
  return el
})


