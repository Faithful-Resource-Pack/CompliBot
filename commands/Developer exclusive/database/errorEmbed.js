const Discord = require('discord.js')
const settings = require('../../../resources/settings.json')

async function errorEmbed(err) {
  return new Discord.MessageEmbed().setColor(settings.colors.red).setDescription(err)
}

module.exports = {
  errorEmbed
}