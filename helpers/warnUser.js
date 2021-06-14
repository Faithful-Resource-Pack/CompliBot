const Discord  = require('discord.js')
const settings = require('../ressources/settings')
const colors   = require('../ressources/colors')
const strings  = require('../ressources/strings')

/**
 * Reply to a user with an embed, use to warn a user
 * @author Juknum
 * @param {Discord.Message} message 
 * @param {String} text 
 */
async function warnUser(message, text) {
	var embed = new Discord.MessageEmbed()
		.setColor(colors.RED)
		.setTitle(strings.BOT_ERROR)
		.setDescription(text)
		.setFooter('Type /help to get more information about commands', settings.BOT_IMG)

	let embedMessage
	if(message.deleted)
		embedMessage = await message.channel.send(embed)
	else
		embedMessage = await message.inlineReply(embed)
	
	if (message.channel.type !== 'dm') await embedMessage.react('🗑️')

	const filter = (reaction, user) => {
		return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id
	}

	embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
		.then(async collected => {
			const reaction = collected.first()
			if (reaction.emoji.name === '🗑️') {
				await embedMessage.delete()
				if (!message.deleted && message.channel.type !== 'dm') await message.delete()
			}
		})
		.catch(async () => {
			if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove()
		})
}

exports.warnUser = warnUser
