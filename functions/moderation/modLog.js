const Discord = require('discord.js')
let settings = require('../../resources/settings.json')
const { doCheckSettings } = require('../settings/doCheckSettings')

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

	let autoReportChannelID // = undefined
	try {
		autoReportChannelID = settings.channels.auto_report.c32 // if already loaded
	} catch (_error) {
		// else the settings aren't updated

		settings = await doCheckSettings() // update them

		// then try again to get them
		autoReportChannelID = settings.channels.auto_report.c32
	}

	if (message.guild.id == settings.guilds.c32.id || message.guild.id == settings.guilds.c64.id || message.guild.id == settings.guilds.cextras.id) logChannel = client.channels.cache.get(autoReportChannelID)
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