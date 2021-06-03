const Discord = require('discord.js')
const colors  = require('../../../ressources/colors')

async function errorEmbed(err) {
  return new Discord.MessageEmbed().setColor(colors.RED).setDescription(err)
}

module.exports = {
  errorEmbed
}