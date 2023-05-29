const fs = require('fs/promises')
const path = require('path')
const allCollection = require('../../helpers/firestorm/all')

const OUT_PATH = path.join(path.join(process.cwd(), 'resources/'), 'settings.json')
const JSON_REPLACER = null
const JSON_SPACE = 0

/**
 * Fetch distant settings file into the local one
 * @author Juknum
 * @returns {Promise<Object>}
 */
const doCheckSettings = () => {
  /* return new Promise((resolve, reject) => {
    let json // = undefined
    allCollection.settings.read_raw()
    .then(res => {
      json = res
      return fs.writeFile(
        OUT_PATH,
        JSON.stringify(res, JSON_REPLACER, JSON_SPACE),
        { flag: 'w', encoding: 'utf-8' }
      )
    })
    .then(() => {
      resolve(json)
    })
    .catch(err => {
      reject(err)
    })
  }) */
}

exports.doCheckSettings = doCheckSettings