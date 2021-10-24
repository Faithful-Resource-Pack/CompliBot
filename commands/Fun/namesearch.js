const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings')
const colors = require('../../resources/colors')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'namesearch',
  description: strings.HELP_DESC_NAMESEARCH,
  guildOnly: true,
  uses: strings.COMMAND_USES_ANYONE,
  category: 'Fun',
  syntax: `${prefix}namesearch juk`,
  /** @param {Discord.Message} message */
  async execute(_client, message, args) {
    if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)

    const search = args.join(' ').toLowerCase()

    const results = (await message.guild.members.fetch().catch(e => {
      console.error(e)
      return new Map()
    })).filter(m => {
      return m.user && m.user.username.toLowerCase().includes(search)
    })

    const embed = new Discord.MessageEmbed()
      .setTitle(`Members with \`\`${search}\`\` in their name`)
      .setDescription(results.size > 0 ? results.map(e => `<@!${e.id}>`).join(' ') : '*No user found*')
      .setColor(colors.BLUED)
    return message.reply({ embeds: [embed] })
  }
}