const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')
const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'love',
  description: strings.command.description.love,
  category: 'Fun',
  guildOnly: true,
  uses: strings.command.use.anyone,
  syntax: `${prefix}love <@user1> <@user2>`,
  example: `${prefix}love @Juknum @TheRolf\n${prefix}love Juknum TheRolf`,
  /** @param {Discord.Message} message */
  async execute(_client, message, args) {
    if (args.length !== 2) return warnUser(message, strings.command.args.none_given)

    const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.username === args[0] || m.displayName === args[0])
    const member2 = (message.mentions.members.size == 2 ? message.mentions.members.values().next().next().value : message.mentions.members.first()) || message.guild.members.cache.find(m => m.username === args[1] || m.displayName === args[1])

    if (!member || !member2) return warnUser(message, strings.command.love.two_users)

    const love_amount = Math.round(Math.random() * 100)

    const embed = new MessageEmbed()
      .setTitle(`${member.displayName} :heart: ${member2.displayName}`)
      .setDescription(love_amount + '%')
      .setColor(settings.colors.blue)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
