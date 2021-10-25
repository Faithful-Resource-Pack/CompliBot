const prefix = process.env.PREFIX
const Discord = require('discord.js')

const { string } = require('../../resources/strings')
const colors = require('../../resources/colors')

const { warnUser } = require('../../helpers/warnUser')

const spongebobify = require('spongebobify')

module.exports = {
  name: 'bob',
  description: string('command.description.bob'),
  guildOnly: false,
  uses: string('command.use.anyone'),
  category: 'Fun',
  syntax: `${prefix}bob DEVS BAD`,
  async execute(_client, message, args) {
    if (!args.length) return warnUser(message, string('command.args.none_given'))

    const embed = new Discord.MessageEmbed()
      .setTitle(spongebobify(args.join(' ')))
      .setImage('https://media.giphy.com/media/QUXYcgCwvCm4cKcrI3/giphy.gif')
      .setColor(colors.BLUED)
    return message.reply({ embeds: [embed] })
  }
}
