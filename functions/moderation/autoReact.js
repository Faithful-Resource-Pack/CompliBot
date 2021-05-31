const Discord  = require('discord.js')
const settings = require('../../ressources/settings')
const colors   = require('../../ressources/colors')
const strings  = require('../../ressources/strings')

/**
 * Add given reactions if condition are met
 * @author Juknum
 * @param {DiscordMessage} message message to be react
 * @param {Array} emojis Array of String, has to be valid Discord Emoji
 * @param {String} defaultErrorMsg Message if no file is attached
 * @param {String} specificErrorMsg Message if one or more string from 'specific' can not be found
 * @param {Array} specific Array of String
 */
async function autoReact(message, emojis, defaultErrorMsg, specificErrorMsg = undefined, specific = undefined) {

	if (message.attachments.size > 0) {

		let specificResult = true

		if (specific) {
			let i = 0
			while (specific[i]) {
				if (!message.content.includes(specific[i])) {
					specificResult = false
					break
				}
				i++
			}

		}
		else specificResult = true

		if (specificResult == true) {
			for (var i = 0; i < emojis.length; i++){
				try {
					await message.react(emojis[i])
				} catch (error) {
					console.error('Error: emoji n°'+i+' failed to react'+error)
				}
			}
		} else return sendError(true)
	}
	else return sendError(false)

	async function sendError(specificError) {

		if (
			(
				message.member.hasPermission('ADMINISTRATOR')
			) && specificError == false
		) return

		else {
			try {
				var embed = new Discord.MessageEmbed()
					.setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setColor(colors.RED)
					.setTitle(strings.BOT_AUTOREACT_ERROR)
					.setFooter('Submission will be removed in 30 seconds, please re-submit', settings.BOT_IMG)

				if (specificError) embed.setDescription(specificErrorMsg)
				else embed.setDescription(defaultErrorMsg)

				const msg = await message.channel.send(embed)
				if (!msg.deleted) await msg.delete({timeout: 30000})
				if (!message.deleted) await message.delete({timeout: 10})
			} catch (error) {
					console.error(error)
			}
		}
	}
}

exports.autoReact = autoReact