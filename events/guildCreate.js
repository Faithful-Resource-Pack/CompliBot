const client = require('../index').Client
const Discord = require('discord.js')

const PREFIX = process.env.PREFIX
const DEV = (process.env.DEV.toLowerCase() == 'true')

const colors = require('../resources/colors')
const settings = require('../resources/settings')

module.exports = {
  name: 'guildCreate',
  async execute(guild) {

    if (DEV) return
    var embed = new Discord.MessageEmbed()
      .setTitle(`Thanks for adding me to ${guild.name}!`)
      .addFields(
        { name: 'Commands', value: `My prefix is: \`${PREFIX}\` \nUse \`${PREFIX}help\` to see a list of all my commands!` },
        { name: 'Feedback', value: `If you have a suggestion or want to report a bug, then please use the command \`${PREFIX}feedback [your message]\`` },
        { name: 'Personalisation', value: 'soon:tm:' },
      )
      .setColor(colors.BLUE)
      .setThumbnail(settings.BOT_IMG)
      .setFooter(client.user.username, settings.BOT_IMG);

    var channel = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES']))
    await channel.send({ embeds: [embed] })
  }
}