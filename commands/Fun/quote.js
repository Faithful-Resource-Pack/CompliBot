const prefix = process.env.PREFIX
const Discord = require('discord.js')
const axios = require('axios').default

const strings = require('../../resources/strings')
const colors = require('../../resources/colors')

module.exports = {
  name: 'quote',
  description: strings.HELP_DESC_QUOTE,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  category: 'Fun',
  syntax: `${prefix}quote`,
  async execute(_client, message) {
    const image = await axios.get('https://inspirobot.me/api?generate=true')

    const embed = new Discord.MessageEmbed()
      .setImage(image.data)
      .setColor(colors.BLUED)
    return message.reply({ embeds: [embed] })
  }
}
