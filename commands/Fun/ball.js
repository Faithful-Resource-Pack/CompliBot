const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings')
const colors = require('../../resources/colors')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'ball',
  description: strings.HELP_DESC_BALL,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  category: 'Fun',
  syntax: `${prefix}ball <question>`,
  example: `${prefix}ball Is Compliance the best resource pack?`,
  async execute(_client, message, args) {
    if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)

    const question = args.join(' ')

    const randomIndex = Math.floor(Math.random() * strings.BALL_RESPONSES.length)
    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.username + ' asked: ' + question, message.author.displayAvatarURL())
      .setTitle('**' + strings.BALL_RESPONSES[randomIndex] + '**')
      .setColor(colors.BLUED)
    return message.reply({ embeds: [embed] })
  }
}
