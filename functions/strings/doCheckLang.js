const fs = require('fs')
const langs = require('../../helpers/firestorm/langs')
const { join } = require('path')

/**
 * Fetch distant lang file into the local one
 * @author Juknum
 */
async function doCheckLang() {
  const path = join(process.cwd(), 'json/database/')

  fs.mkdirSync(path, { recursive: true })

  let text = JSON.stringify(await langs.read_raw(), null, 0)
  fs.writeFileSync(
    join(path, 'langs.json'),
    text,
    { flag: 'w', encoding: 'utf-8' }
  )
}

exports.doCheckLang = doCheckLang