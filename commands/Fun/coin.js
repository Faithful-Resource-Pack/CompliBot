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

    const res = Math.random()
    const embed = new Discord.MessageEmbed()
      .setTitle(res > .5 ? 'Tails' : (res < .5 ? 'Heads' : 'Edge'))
      .setThumbnail(res > .5 ? settings.images.coin_tails : (res < .5 ? settings.images.coin_heads : settings.images.coin_edge))
      .setColor(settings.colors.blue)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
