const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings')
const colors = require('../../resources/colors')

const { warnUser } = require('../../helpers/warnUser')

const spongebobify = require('spongebobify')

module.exports = {
  name: 'bob',
  description: strings.HELP_DESC_BOB,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  category: 'Fun',
  syntax: `${prefix}bob DEVS BAD`,
  async execute(_client, message, args) {
    if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)
    
    const embed = new Discord.MessageEmbed()
      .setTitle(spongebobify(args.join(' ')))
      .setImage('https://media.giphy.com/media/QUXYcgCwvCm4cKcrI3/giphy.gif')
      .setColor(colors.BLUED)
    return message.reply({ embeds: [embed] })
  }
}
