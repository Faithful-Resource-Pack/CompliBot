const settings = require('../resources/settings.json')

/**
 * Get the right URL using given information
 * @param {String} edition texture edition
 * @param {String} version minecraft version
 * @param {String} path texture path
 * @param {String} res texture resolution
 * @param {String} branch github branch
 * @returns {String} URL
 */
function textureURL(edition, version, path, res, branch = 'Jappa') {
  return `${settings.repositories.raw[res ? res : 'default'][edition]}${branch}-${version}/${path}`
}

exports.textureURL = textureURL