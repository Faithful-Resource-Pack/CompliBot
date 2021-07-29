const Discord  = require('discord.js')
const settings = require('../resources/settings')
const colors   = require('../resources/colors')
const strings  = require('../resources/strings')

const { addDeleteReact } = require('./addDeleteReact')

/**
 * Reply to a user with an embed, use to warn a user
 * @author Juknum
 * @param {Discord.Message} message 
 * @param {String} text 
 */
async function warnUser(message, text) {
	var embed = new Discord.MessageEmbed()
		.setColor(colors.RED)
		.setThumbnail(settings.WARNING_IMG)
		.setTitle(strings.BOT_ERROR)
		.setDescription(text)
		.setFooter('Type /help to get more information about commands', settings.BOT_IMG)
		
	let embedMessage
	if (message.deleted) embedMessage = await message.channel.send(embed)
	else embedMessage = await message.reply({embeds: [embed]})
	
	addDeleteReact(embedMessage, message, true)
}

exports.warnUser = warnUser
