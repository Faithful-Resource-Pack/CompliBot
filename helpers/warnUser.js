const Discord = require('discord.js')
const settings = require('../resources/settings.json')
const strings = require('../resources/strings.json')

const { addDeleteReact } = require('./addDeleteReact')

/**
 * Reply to a user with an embed, use to warn a user
 * @author Juknum
 * @param {Discord.Message} message 
 * @param {String} text 
 */
async function warnUser(message, text) {
	var embed = new Discord.MessageEmbed()
		.setColor(settings.colors.red)
		.setThumbnail(settings.images.warning)
		.setTitle(strings.bot.error)
		.setDescription(text)
		.setFooter('Type /help to get more information about commands', settings.images.bot)

	let embedMessage
	if (message.deleted) embedMessage = await message.channel.send({ embeds: [embed] })
	else embedMessage = await message.reply({ embeds: [embed] })

	addDeleteReact(embedMessage, message, true)
}

exports.warnUser = warnUser
