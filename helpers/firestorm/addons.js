const firestorm = require(".");

require("./firestorm_config")();

/**
 * @typedef {Object} Addons
 * @property {String} title Name of the Add-on
 * @property {String} description Description of the Add-on
 * @property {String[]} authors Discords IDs of all authors
 * @property {String} status Add-ons status (pending, approved, hidden)
 * @property {Boolean} comments Adds Disqus discussion on faithfulpack.net
 * @property {String} id Add-on ID (based from the title)
 * @property {Object} images contains all information about addons images
 * @property {Base64} images.header Main image used for header on faithfulpack.net
 * @property {Base64[]} images.carousel List of all secondary images of the Add-on
 * @property {Boolean} optifine true if the Add-on require Optifine
 * @property {String[]} type Add-on tags (Java, 32x, 64x, Bedrock...)
 * @property {Object} downloads download_name: [link1, link2, ...] (how should I explain that?)
 */

module.exports = firestorm.collection("addons");
