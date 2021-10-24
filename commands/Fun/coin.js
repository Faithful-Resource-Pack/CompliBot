const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings')
const colors = require('../../resources/colors')

module.exports = {
  name: 'coin',
  description: strings.HELP_DESC_COIN,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  category: 'Fun',
  syntax: `${prefix}coin`,
  async execute(_client, message) {
    const isTails = Math.random() > 0.5
    const embed = new Discord.MessageEmbed()
      .setTitle(isTails ? 'Tails' : 'Heads')
      .setThumbnail(isTails ? 'https://www.cjoint.com/doc/21_10/KJyoaQ8CqnR_euro-tails.png' : 'https://www.cjoint.com/doc/21_10/KJyohzpOqDR_euro-heads.png')
      .setColor(colors.BLUED)
    return message.reply({ embeds: [embed] })
  }
}
