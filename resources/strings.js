const strings = require('../json/database/langs.json') || { bot: { en_US: {} } }

/**
 * TO ADD/MODIFY DELETE USE THE /LANG COMMAND
 * > this allow us to manage strings without making a commit nor restarting the bot :)
 * @author Juknum
 */

module.exports = {
  /**
   * Get the given string from the given key
   * @param {String} key filter
   * @returns {String} string
   */
  string: (key) => {
    return strings.bot.en_US[key] == undefined ? '?? string not found ??' : strings.bot.en_US[key]
  },
  /**
   * Get all strings starting with the given string key
   * @param {String} str 
   * @returns {String}
   */
  stringsStartsWith: (str) => {
    const res = []

    for (const key in strings.bot.en_US) {
      if (key.startsWith(str)) res.push(strings.bot.en_US[key])
    }

    return res.length < 1 ? ['??? strings not found ???'] : res
  }
}