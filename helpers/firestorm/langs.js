const firestorm = require(".");

require("./firestorm_config")();

/**
 * @typedef {Object} Lang
 * @property {Object} string string
 */

module.exports = firestorm.collection("langs");
