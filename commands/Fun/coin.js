const prefix = process.env.PREFIX
const Discord = require('discord.js')

const colors = require('../../resources/colors')

const { string } = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact');

module.exports = {
  name: 'coin',
  aliases: ['coinflip'],
  description: string('command.description.coin'),
  category: 'Fun',
  guildOnly: false,
  uses: string('command.use.anyone'),
  syntax: `${prefix}coin`,
  async execute(_client, message) {
    const isTails = Math.random() > 0.5
    const embed = new Discord.MessageEmbed()
      .setTitle(isTails ? 'Tails' : 'Heads')
      .setThumbnail(isTails ? 'https://www.cjoint.com/doc/21_10/KJyoaQ8CqnR_euro-tails.png' : 'https://www.cjoint.com/doc/21_10/KJyohzpOqDR_euro-heads.png')
      .setColor(colors.BLUE)
    const embedMessage = await message.reply({ embeds: [embed] })
    await addDeleteReact(embedMessage, message, true);
  }
}
