const prefix = process.env.PREFIX
const Discord = require('discord.js')

const colors = require('../../resources/colors')

const { string } = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
  name: 'namesearch',
  description: string('command.description.namesearch'),
  category: 'Fun',
  guildOnly: true,
  uses: string('command.use.anyone'),
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
      .setColor(colors.BLUE)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}