const Discord = require('discord.js')
const colors = require('../../../resources/colors')

async function errorEmbed(err) {
  return new Discord.MessageEmbed().setColor(colors.RED).setDescription(err)
}

module.exports = {
  errorEmbed
}