const Discord = require('discord.js')
const colors  = require('../../ressources/colors')

/**
 * Send an embed message when triggered
 * @param {Discord} client Discord Client
 * @param {Discord} message Discord Message
 */
async function inviteDetection(client, message) {
	var embed = new Discord.MessageEmbed()
		.setAuthor(`${message.author.tag} may have advertised a discord server`, message.author.displayAvatarURL())
		.setColor(colors.RED)
		.setDescription(`[Jump to message](${message.url})\n\n**Channel**: <#${message.channel.id}>\n**Server**: \`${message.guild}\`\n**User ID**: \`${message.author.id}\`\n**Date**: \`${message.createdAt.toLocaleString()}\`\n\n\`\`\`${message.content}\`\`\``)
		.setTimestamp()

	client.channels.cache.get('829047608781176853').send(embed)
}

exports.inviteDetection = inviteDetection