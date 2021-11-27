const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')
const { warnUser } = require('../../helpers/warnUser')
const { addDeleteReact } = require('../../helpers/addDeleteReact');

module.exports = {
  name: 'ball',
  description: strings.command.description.ball,
  category: 'Fun',
  guildOnly: false,
  uses: strings.command.use.anyone,
  syntax: `${prefix}ball <question>`,
  example: `${prefix}ball Is Compliance the best resource pack?`,
  async execute(_client, message, args) {
    if (!args.length) return warnUser(message, strings.command.args.none_given)

    const question = args.join(' ')

    const randomIndex = Math.floor(Math.random() * Object.values(strings.command.ball.responses).length)
    const embed = new MessageEmbed()
      .setAuthor(message.author.username + ' asked: ' + question, message.author.displayAvatarURL())
      .setTitle('**' + Object.values(strings.command.ball.responses)[randomIndex] + '**')
      .setColor(settings.colors.blue)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
