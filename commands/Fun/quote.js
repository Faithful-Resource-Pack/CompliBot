const prefix = process.env.PREFIX
const Discord = require('discord.js')
const axios = require('axios').default

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const { addDeleteReact } = require('../../helpers/addDeleteReact');

module.exports = {
  name: 'quote',
  description: strings.command.description.quote,
  category: 'Fun',
  guildOnly: false,
  uses: strings.command.use.anyone,
  syntax: `${prefix}quote`,
  async execute(_client, message) {
    const image = await axios.get('https://inspirobot.me/api?generate=true')

    const embed = new Discord.MessageEmbed()
      .setImage(image.data)
      .setColor(settings.colors.blue)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
