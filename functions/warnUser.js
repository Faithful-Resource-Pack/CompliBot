const Discord  = require('discord.js')
const settings = require('../settings.js')
const colors   = require('../res/colors')
const strings  = require('../res/strings')

/**
 * Reply to a user with an embed, use to warn a user
 * @param {DiscordMessage} message 
 * @param {String} text 
 */
async function warnUser(message, text) {
	var embed = new Discord.MessageEmbed()
		.setColor(colors.RED)
		.setTitle(strings.BOT_ERROR)
		.setDescription(text)
		.setFooter('Type /help to get more information about commands', settings.BOT_IMG)

	const embedMessage = await message.inlineReply(embed)
	if (message.channel.type !== 'dm') await embedMessage.react('🗑️')

	const filter = (reaction, user) => {
		return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id
	}

	embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
		.then(async collected => {
			const reaction = collected.first()
			if (reaction.emoji.name === '🗑️') {
				if (!embedMessage.deleted) await embedMessage.delete()
				if (!message.deleted) await message.delete()
			}
		})
		.catch(async () => {
			if (message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove()
		})
}

exports.warnUser = warnUser
