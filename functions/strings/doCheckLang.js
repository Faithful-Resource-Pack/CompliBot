const fs = require('fs')
const path = require('path')
const allCollection = require('../../helpers/firestorm/all')
const { merge } = require('../../helpers/merge.js')

/**
 * Fetch distant bot lang file into a formated local one
 * @author Juknum
 */
const doCheckLang = async () => {

  let data = (await allCollection.langs.get("bot")).en_US
  let output = {}

  // split key into their own objects
  for (const item in data) {
    let tempObject = {}
    let container = tempObject
    item.split('.').map((k, i, values) => {
      container = (container[k] = (i == values.length - 1 ? data[item] : {}))
    })

    output = merge(output, [tempObject])
  }

  fs.writeFileSync(
    path.join(path.join(process.cwd(), 'resources/'), 'strings.json'),
    JSON.stringify(output, null, 0),
    { flag: 'w', encoding: 'utf-8' }
  )
}

exports.doCheckLang = doCheckLang