const settings = require('../ressources/settings')

const URL_START = {
  java: {
    c64: settings.COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA,
    c32: settings.COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA,
    default: settings.DEFAULT_MC_JAVA_REPOSITORY
  },
  bedrock: {
    c64: settings.COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA,
    c32: settings.COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA,
    default: settings.DEFAULT_MC_BEDROCK_REPOSITORY
  }
}

/**
 * Get the right URL using given information
 * @param {String} edition texture edition
 * @param {String} version minecraft version
 * @param {String} path texture path
 * @param {String} res texture resolution
 * @returns {String} URL
 */
function textureURL(edition, version, path, res) {
  return `${URL_START[edition][res ? res : "default"]}${version}/${path}`
}

exports.textureURL = textureURL