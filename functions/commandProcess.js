const path = require('path')
const { existsSync } = require('fs')
const fs   = require('fs/promises')

// eslint-disable-next-line no-undef
const COUNTER_FOLDER = path.resolve(__dirname, '..', 'json')
const COUNTER_FILE_PATH = path.resolve(COUNTER_FOLDER, 'commandsProcessed.txt')
const SAVE_EVERY = 20 // save file every n messages sent

let number = undefined

/**
 * @returns {Promise<number>}
 */
const __loadNumber = function() {
  let prom
  if(number === undefined) {
    prom = fs.readFile(COUNTER_FILE_PATH)
    .catch(() => {
      return '0'
    })
    .then(content => {
      number = parseInt(content.toString())

      return number
    })
  } else {
    prom = Promise.resolve(number)
  }

  return prom
}

module.exports = {
  increase: function() {
    return __loadNumber().then(() => {
      number = number + 1

      if(number === 1 || number % SAVE_EVERY === 0) {
        const folderCreate = existsSync(COUNTER_FOLDER) ? Promise.resolve() : fs.mkdir(COUNTER_FOLDER, { recursive: true })
        return folderCreate.then(() => fs.writeFile(COUNTER_FILE_PATH, '' + number)).catch(e => {
          console.error(e)
        })
      }
    })
  },
  get: function() {
    return __loadNumber()
  }
}