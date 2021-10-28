const prefix = process.env.PREFIX
const Discord = require('discord.js')
const axios = require('axios').default

const { string } = require('../../resources/strings')
const colors = require('../../resources/colors')

module.exports = {
  name: 'quote',
  description: string('command.description.quote'),
  guildOnly: false,
  uses: string('command.use.anyone'),
  category: 'Fun',
  syntax: `${prefix}quote`,
  async execute(_client, message) {
    const image = await axios.get('https://inspirobot.me/api?generate=true')

    const embed = new Discord.MessageEmbed()
      .setImage(image.data)
      .setColor(colors.BLUE)
    return message.reply({ embeds: [embed] })
  }
}
