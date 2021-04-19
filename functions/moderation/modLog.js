const Discord  = require('discord.js')
const colors   = require('../../res/colors')
const settings = require('../../settings.js')

/**
 * Send a embed message in the logChannel
 * @param {Discord} client Discord Client
 * @param {Discord} message Discord Message
 * @param {String} member member name
 * @param {String} reason reason
 * @param {String} time time (in seconds)
 * @param {String} type
 */
async function modLog(client, message, member, reason, time, type) {
	var logChannel = undefined

	if (message.guild.id == settings.C32_ID) logChannel = client.channels.cache.get(settings.C32_MOD_LOGS)
	if (logChannel == undefined) return

	var embed = new Discord.MessageEmbed()
		.setAuthor(`${message.author.tag} ${type} someone`)
		.setColor(colors.YELLOW)
		.setThumbnail(message.author.displayAvatarURL())
		.setDescription(`[Jump to message](${message.url})\n\n**Channel**: <#${message.channel.id}>\n**${type} user**: ${member}\n**Reason**: \`${reason}\`\n**Time**: \`${time}s\`\n**Date**: \`${message.createdAt.toLocaleString()}\``)
		.setTimestamp()

	await logChannel.send(embed)
}

exports.modLog = modLog 