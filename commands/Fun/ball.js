const prefix = process.env.PREFIX
const Discord = require('discord.js')

const { string, stringsStartsWith } = require('../../resources/strings')
const colors = require('../../resources/colors')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'ball',
  description: string('command.description.ball'),
  guildOnly: false,
  uses: string('command.use.anyone'),
  category: 'Fun',
  syntax: `${prefix}ball <question>`,
  example: `${prefix}ball Is Compliance the best resource pack?`,
  async execute(_client, message, args) {
    if (!args.length) return warnUser(message, string('command.args.none_given'))

    const question = args.join(' ')

    const randomIndex = Math.floor(Math.random() * stringsStartsWith('command.ball.responses.').length)
    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.username + ' asked: ' + question, message.author.displayAvatarURL())
      .setTitle('**' + stringsStartsWith('command.ball.responses.')[randomIndex] + '**')
      .setColor(colors.BLUE)
    return message.reply({ embeds: [embed] })
  }
}
