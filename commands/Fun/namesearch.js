const prefix = process.env.PREFIX
const Discord = require('discord.js')

const { string } = require('../../resources/strings')
const colors = require('../../resources/colors')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'namesearch',
  description: string('command.description.namesearch'),
  guildOnly: true,
  uses: string('command.use.anyone'),
  category: 'Fun',
  syntax: `${prefix}namesearch juk`,
  /** @param {Discord.Message} message */
  async execute(_client, message, args) {
    if (!args.length) return warnUser(message, string('command.args.none_given'))

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