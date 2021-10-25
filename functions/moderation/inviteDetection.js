const Discord = require('discord.js')
const colors = require('../../resources/colors')
const settings = require('../../resources/settings')

/**
 * Send an embed message when triggered
 * @param {Discord} client Discord Client
 * @param {Discord} message Discord Message
 */
async function inviteDetection(client, message) {
	if (!message.member) return
	if (message.member.permissions.has("MANAGE_MESSAGES")) return
	if (!message.content) return

	// ignore EM server
	if (message.guild.id === '814198513847631944') return

	let isAd = false

	// currently only discord servers, can be expanded with more links later
	const advertising = [
		'discord.gg'
	]

	const whitelist = [
		'discord.gg/compliance32x',
		'discord.gg/sN9YRQbBv7',
		'discord.gg/Tqtwtgh',
		'discord.gg/qVeDfZw',
		'discord.gg/rFBbYJYC2N',
		'discord.gg/KSEhCVtg4J',
		'discord.gg/rpCyfKV',
		'discord.gg/minecraft',
		'discord.gg/minecraftdungeons',
		'discord.gg/OptiFine'
	]

	if (advertising.some(a => message.content.includes(a))) isAd = true;

	if (isAd && !whitelist.some(w => message.content.includes(w))) {
		var embed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} may have advertised a discord server`, message.author.displayAvatarURL())
			.setColor(colors.RED)
			.setDescription(`[Jump to message](${message.url})\n\n**Channel**: <#${message.channel.id}>\n**Server**: \`${message.guild}\`\n**User ID**: \`${message.author.id}\`\n**Date**: \`${message.createdAt.toLocaleString()}\`\n\n\`\`\`${message.content}\`\`\``)
			.setTimestamp()

		client.channels.cache.get(settings.C32_LOGS).send({ embeds: [embed] })
	}
}

exports.inviteDetection = inviteDetection