const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings')
const colors = require('../../resources/colors')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'love',
  description: strings.HELP_DESC_LOVE,
  guildOnly: true,
  uses: strings.COMMAND_USES_ANYONE,
  category: 'Fun',
  syntax: `${prefix}love <@user1> <@user2>`,
  example: `${prefix}love @Juknum @TheRolf\n${prefix}love Juknum TheRolf`,
  /** @param {Discord.Message} message */
  async execute(_client, message, args) {
		if (args.length !== 2) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)

		const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.username === args[0] || m.displayName === args[0])
		const member2 = (message.mentions.members.size == 2 ? message.mentions.members.values().next().next().value : message.mentions.members.first()) || message.guild.members.cache.find(m => m.username === args[1] || m.displayName === args[1])

		if (!member || !member2) return warnUser(message, strings.LOVE_TWO_USERS)

    const love_amount = Math.round(Math.random() *100)

    const embed = new Discord.MessageEmbed()
      .setTitle(`${member.displayName} :heart: ${member2.displayName}`)
      .setDescription(love_amount + '%')
      .setColor(colors.BLUED)
    return message.reply({ embeds: [embed] })
  }
}
