const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'color',
  aliases: ['color', 'colour', 'c'],
  description: strings.command.description.color,
  category: 'Images',
  guildOnly: false,
  uses: strings.command.use.anyone,
  syntax: `
${prefix}color #123456
${prefix}color rgb([0-255],[0-255],[0-255])
${prefix}color rgba([0-255],[0-255],[0-255],[0-1])
${prefix}color hsl([0-360],[0-100],[0-100])
${prefix}color hsv([0-360],[0-100],[0-100])
${prefix}color cmyk([0-100],[0-100],[0-100],[0-100])`,
  example: `
${prefix}color #fff
${prefix}color #ff8025
${prefix}color rgb(255,128,37)
${prefix}color rgba(255,128,37,1)
${prefix}color hsl(25,100,57)
${prefix}color hsv(25,85,100)
${prefix}color cmyk(0,50,85,0)`,
async execute(client, message, args) {
  const embed = new MessageEmbed()
    .setTitle("This command has been deprecated!")
    .setDescription("Please use the new slash command of <@929066601930706954> instead.")
    .setColor(settings.colors.blue)
    .setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
  return await message.reply({ embeds: [embed] })
}
}
