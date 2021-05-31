const prefix  = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const strings = require('../../ressources/strings')

const { saveDB } = require('../../functions/saveDB')

module.exports = {
  name: 'backup',
  aliases: ['bdb'],
  description: 'Backup the database to the [JSON repository](https://github.com/Compliance-Resource-Pack/JSON)',
  guildOnly: false,
  uses: strings.COMMAND_USES_DEVS,
  syntax: `${prefix}backup`,
  args: true,
  example: `${prefix}bdb`,
  async execute(_client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

      await saveDB(`Manual backup executed by: ${message.author.username}`)
      await message.react('✅')
    }
  }
}