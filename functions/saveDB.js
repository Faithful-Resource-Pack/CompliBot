const fs = require('fs')
const { githubPush } = require('../functions/push')
const allCollection  = require('../helpers/firestorm/all')
const { dirname, normalize, join } = require('path')

/**
 * Save the Database disant files to local, then push them to the JSON repository
 * @author Juknum
 * @param {String} commitMessage
 */
async function saveDB(commitMessage) {
  let animations = JSON.stringify(await allCollection.animations.read_raw(), null, 2)
  let contributions = JSON.stringify(await allCollection.contributions.read_raw(), null, 2)
  let texture = JSON.stringify(await allCollection.texture.read_raw(), null, 2)
  let texture_path = JSON.stringify(await allCollection.texture_path.read_raw(), null, 2)
  let texture_uses = JSON.stringify(await allCollection.texture_use.read_raw(), null, 2)
  let users = JSON.stringify(await allCollection.users.read_raw(), null, 2)

  fs.mkdirSync(dirname('json/database/'), { recursive: true })

  fs.writeFileSync(join(process.cwd(), normalize('json/database/animations.json')), animations, { flag: 'w', encoding: 'utf-8' })
  fs.writeFileSync(join(process.cwd(), normalize('json/database/contributions.json')), contributions, { flag: 'w', encoding: 'utf-8' })
  fs.writeFileSync(join(process.cwd(), normalize('json/database/texture.json')), texture, { flag: 'w', encoding: 'utf-8' })
  fs.writeFileSync(join(process.cwd(), normalize('json/database/texture_path.json')), texture_path, { flag: 'w', encoding: 'utf-8' })
  fs.writeFileSync(join(process.cwd(), normalize('json/database/texture_uses.json')), texture_uses, { flag: 'w', encoding: 'utf-8' })
  fs.writeFileSync(join(process.cwd(), normalize('json/database/users.json')), users, { flag: 'w', encoding: 'utf-8' })

  await githubPush('Compliance-Resource-Pack', 'JSON', 'main', commitMessage, './json/database/')
}

exports.saveDB = saveDB