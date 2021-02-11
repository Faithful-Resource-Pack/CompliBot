const Discord  = require('discord.js');
const settings = require('../settings');
const colors   = require('../res/colors');

async function logs(client, guildID, oldMessage, newMessage, deleted) {

	var channel = undefined;
	if (guildID == settings.C64_ID) channel = client.channels.cache.get(settings.C64_LOGS);
	if (guildID == settings.C32_ID) channel = client.channels.cache.get(settings.C32_LOGS);

	if (oldMessage == newMessage) return
	if (oldMessage != undefined && channel != undefined && deleted == false) {
		var embed = new Discord.MessageEmbed()
			.setAuthor(`Edited by ${newMessage.author.tag}`)
			.setColor(colors.YELLOW)
			.setThumbnail(newMessage.author.displayAvatarURL())
			.setDescription(`[Jump to message](${newMessage.url})\n\n**Channel**: <#${newMessage.channel.id}>\n**User ID**: \`${newMessage.author.id}\`\n**Message ID**: \`${newMessage.id}\`\n**Message Sent**: \`${newMessage.createdAt}\``)
			.setTimestamp()

			if (newMessage.content != '' && oldMessage.content != '') embed.addFields({ name: 'Before:', value: '```' + oldMessage.content + '```' },{ name: 'After: ', value: '```' + newMessage.content + '```' });
			if (newMessage.content == '' && oldMessage.content != '') embed.addFields({ name: 'Before:', value: '```' + oldMessage.content + '```' },{ name: 'After: ', value: '```EMPTY MESSAGE```' });
			if (newMessage.content != '' && oldMessage.content == '') embed.addFields({ name: 'Before:', value: '```EMPTY MESSAGE```' },{ name: 'After: ', value: '```' + newMessage.content + '```' });

		await channel.send(embed);
	}

	if (oldMessage == undefined && channel != undefined && deleted == true) {
		var embed = new Discord.MessageEmbed()
			.setAuthor(`Deleted by ${newMessage.author.tag}`)
			.setColor(colors.RED)
			.setThumbnail(newMessage.author.displayAvatarURL())
			.setDescription(`[Jump to location](${newMessage.url})\n\n**Channel**: <#${newMessage.channel.id}>\n**User ID**: \`${newMessage.author.id}\`\n**Message ID**: \`${newMessage.id}\`\n**Message Sent**: \`${newMessage.createdAt}\``)
			.setTimestamp()

			if (newMessage.content != '') {
				embed.addFields({ name: 'Content: ', value: '```' + newMessage.content + '```' });
			} else embed.addFields({name: 'Content: ', value: '```EMPTY MESSAGE```' });

		await channel.send(embed);
	}

}

exports.logs = logs;