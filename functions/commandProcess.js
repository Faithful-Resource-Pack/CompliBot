const path = require('path')
const fs   = require('fs/promises')

// eslint-disable-next-line no-undef
const COUNTER_FILE_PATH = path.resolve(__dirname, '..', 'json', 'commandsProcessed.txt')
const SAVE_EVERY = 20 // save every n increases

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
        return fs.writeFile(COUNTER_FILE_PATH, '' + number)
      }
    })
  },
  get: function() {
    return __loadNumber()
  }
}