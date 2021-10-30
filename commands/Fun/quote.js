const prefix = process.env.PREFIX
const Discord = require('discord.js')
const axios = require('axios').default

const colors = require('../../resources/colors')

const { string } = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact');

module.exports = {
  name: 'quote',
  description: string('command.description.quote'),
  category: 'Fun',
  guildOnly: false,
  uses: string('command.use.anyone'),
  syntax: `${prefix}quote`,
  async execute(_client, message) {
    const image = await axios.get('https://inspirobot.me/api?generate=true')

    const embed = new Discord.MessageEmbed()
      .setImage(image.data)
      .setColor(colors.BLUE)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
