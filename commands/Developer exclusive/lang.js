const prefix = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidT = process.env.UIDT

const { langs } = require("../../helpers/firestorm/all");
const { warnUser } = require("../../helpers/warnUser");
const strings = require("../../resources/strings");

module.exports = {
  name: 'lang',
  aliases: ['dict'],
  description: 'Edit global strings without restarting the bot :)',
  category: 'Developer exclusive',
  guildOnly: false,
  uses: strings.command.use.devs,
  syntax: `
${prefix}lang see <collection> <lang> <name>
${prefix}lang add|edit <collection> <lang> <name> <string>
${prefix}lang delete|remove <collection> <lang> <name>

lang: en_US, fr_FR, de_DE...
collection: bot, webapp`,
  async execute(_client, message, args) {
    if (message.author.id !== uidR && message.author.id !== uidJ && message.author.id !== uidT) return warnUser(message, strings.command.no_permission)

    const operation = args[0]
    const collection = args[1]
    const lang = args[2]
    const name = args[3]
    const string = args[4] ? (args.filter((el, index) => { if (index > 3) return el })).join(' ') : null
    let lang_ = {}

    switch (operation) {
      case 'see':
        try {
          lang_ = await langs.get(collection)
        } catch (error) { return warnUser(message, `${error}\nValue: ${collection}`) }

        message.reply({ content: lang_[lang][name] == undefined ? 'undefined' : lang_[lang][name] })

        break

      case 'edit':
      case 'add':
        try {
          lang_ = await langs.get(collection)
        } catch (error) { return warnUser(message, `${error}\nValue: ${collection}`) }

        lang_[lang][name] = string

        try {
          await langs.set(collection, lang_)
        } catch (error) { return warnUser(message, `${error}`) }

        break

      case 'delete':
      case 'remove':
        try {
          lang_ = await langs.get(collection)
        } catch (error) { return warnUser(message, `${error}\nValue: ${collection}`) }

        delete lang_[lang][name]

        try {
          await langs.set(collection, lang_)
        } catch (error) { return warnUser(message, `${error}`) }

        break

      default:
        warnUser(message, `${operation} is not an existing operation!`)
    }

  }
}