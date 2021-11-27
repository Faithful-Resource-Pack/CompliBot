const settings = require('../../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

async function errorEmbed(err) {
  return new MessageEmbed().setColor(settings.colors.red).setDescription(err)
}

module.exports = {
  errorEmbed
}