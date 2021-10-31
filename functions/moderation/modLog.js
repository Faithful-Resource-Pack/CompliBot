const Discord = require('discord.js')
const settings = require('../../resources/settings.json')

/**
 * Send a embed message in the logChannel
 * @param {Discord} client Discord Client
 * @param {Discord} message Discord Message
 * @param {String} memberID member ID
 * @param {String} reason reason
 * @param {String} time time (in seconds)
 * @param {String} type
 */
async function modLog(client, message, memberID, reason, time, type) {
	var logChannel = undefined

	if (message.guild.id == settings.guilds.c32.id || message.guild.id == settings.guilds.c64.id || message.guild.id == settings.guilds.cextras.id) logChannel = client.channels.cache.get(settings.C32_MOD_LOGS)
	if (logChannel == undefined) return

	var embed = new Discord.MessageEmbed()
		.setAuthor(`${message.author.tag} ${type} someone`)
		.setColor(settings.colors.yellow)
		.setThumbnail(message.author.displayAvatarURL())
		.setDescription(`[Jump to message](${message.url})\n\n**Channel**: <#${message.channel.id}>\n**${type} user**: <@!${memberID}>\n**Reason**: \`${reason}\`\n**Time**: \`${time}\`\n**Date**: \`${message.createdAt.toLocaleString()}\``)
		.setTimestamp()

	await logChannel.send({ embeds: [embed] })
}

exports.modLog = modLog