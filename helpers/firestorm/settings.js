const firestorm = require('.')

require('./firestorm_config')()

/**
 * @typedef {Object} Settings
 * @property {Object} settings settings
 */

module.exports = firestorm.collection('settings')