const fs = require('fs')
const path = require('path')
const allCollection = require('../../helpers/firestorm/all')

/**
 * Fetch distant settings file into the local one
 * @author Juknum
 */
const doCheckSettings = async () => {
  fs.writeFileSync(
    path.join(path.join(process.cwd(), 'resources/'), 'settings.json'),
    JSON.stringify(await allCollection.settings.read_raw(), null, 0),
    { flag: 'w', encoding: 'utf-8' }
  )
}

exports.doCheckSettings = doCheckSettings