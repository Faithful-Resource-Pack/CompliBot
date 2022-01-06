const fs = require('fs')
const allCollection = require('../helpers/firestorm/all')

const { pushToGitHub } = require('../functions/pushToGitHub')
const { join } = require('path')

/**
 * Save the Database distant files to local, then push them to the JSON repository (using allCollection as base)
 * @author Juknum
 * @param {String} commitMessage
 */
async function saveDB(commitMessage) {
  const folderPath = join(
    process.cwd(),
    'json/database/'
  )

  fs.mkdirSync(folderPath,
    { recursive: true }
  )

  for (const [key, collection] of Object.entries(allCollection)) {
    let text = JSON.stringify(await collection.read_raw(), null, 0)
    fs.writeFileSync(
      join(folderPath, key + '.json'),
      text,
      { flag: 'w+', encoding: 'utf-8' }
    )
  }

  pushToGitHub('Compliance-Resource-Pack', 'Database', 'main', commitMessage, './json/')
}

exports.saveDB = saveDB