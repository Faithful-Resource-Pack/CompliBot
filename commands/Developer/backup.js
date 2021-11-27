const prefix = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const { saveDB } = require('../../functions/saveDB')
const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

module.exports = {
  name: 'backup',
  aliases: ['bdb'],
  description: 'Backup the database to the [JSON repository](https://github.com/Compliance-Resource-Pack/JSON)',
  category: 'Developer',
  guildOnly: false,
  uses: strings.command.use.devs,
  syntax: `${prefix}backup`,
  example: `${prefix}bdb`,
  async execute(_client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

      await saveDB(`Manual backup executed by: ${message.author.username}`)
      await message.react(settings.emojis.upvote)
    }
  }
}