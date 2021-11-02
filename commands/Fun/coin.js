const prefix = process.env.PREFIX
const Discord = require('discord.js')

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const { addDeleteReact } = require('../../helpers/addDeleteReact');

module.exports = {
  name: 'coin',
  aliases: ['coinflip'],
  description: strings.command.description.coin,
  category: 'Fun',
  guildOnly: false,
  uses: strings.command.use.anyone,
  syntax: `${prefix}coin`,
  async execute(_client, message) {
    const isTails = Math.random() > 0.5
    const embed = new Discord.MessageEmbed()
      .setTitle(isTails ? 'Tails' : 'Heads')
      // TODO : implements settings.images.coin_edge with a probability of 0.001%
      .setThumbnail(isTails ? settings.images.coin_tails : settings.images.coin_heads)
      .setColor(settings.colors.blue)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
