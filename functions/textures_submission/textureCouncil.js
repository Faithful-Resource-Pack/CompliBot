const Discord   = require('discord.js');
const settings  = require('../../settings');
const speech    = require('../../messages');

const { countReact }  = require('../countReact');
const { getMessages } = require('../getMessages');

async function textureCouncil(client, inputID, outputFalseID, outputTrueID, offset) {

	let revoteChannel = client.channels.cache.get(outputFalseID);
	let resultChannel = client.channels.cache.get(outputTrueID);
	let limitDate = new Date();
	let messages = await getMessages(client,inputID);
	
	limitDate.setDate(limitDate.getDate() - offset);
	for (var i in messages) {
		let message     = messages[i];
		let messageDate = new Date(message.createdTimestamp);
		let messageUpvote   = countReact(message,'⬆️');
		let messageDownvote = countReact(message,'⬇️');

		if (
			messageUpvote > messageDownvote && 
			message.embeds !== undefined && //remove attachments size after migration
			messageDate.getDate() == limitDate.getDate() && 
			messageDate.getMonth() == limitDate.getMonth()
		) {

			var embed = new Discord.MessageEmbed()
				.setColor(settings.COLOR_GREEN)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(speech.TEXTURE_WIN_COUNCIL)
				.addFields(
					{ name: 'Name:', value: message.embeds[0].fields[0].value, inline: true },
					{ name: 'Folder:', value: message.embeds[0].fields[1].value, inline: true },
					{ name: 'Comment:', value: message.embeds[0].description }
				)
				.setFooter('CompliBot', settings.BOT_IMG);

			if (message.embeds[0].title) {
				embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url);
			}
			else embed.setImage(message.embeds[0].image.url);

			await resultChannel.send(embed);

		} else if (
			(message.attachments.size > 0 || message.embeds !== undefined) && 
			messageDate.getDate() == limitDate.getDate() && 
			messageDate.getMonth() == limitDate.getMonth()
		) {
			
			var embed = new Discord.MessageEmbed()
				.setColor(settings.COLOR_YELLOW)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(speech.TEXTURE_DEFEAT_COUNCIL)
				.addFields(
					{ name: 'Name:', value: message.embeds[0].fields[0].value, inline: true },
					{ name: 'Folder:', value: message.embeds[0].fields[1].value, inline: true },
					{ name: 'Comment:', value: message.embeds[0].description }
				)
				.setFooter('CompliBot', settings.BOT_IMG);

			if (message.embeds[0].title) {
				embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url);
			}
			else embed.setImage(message.embeds[0].image.url);

			await revoteChannel.send(embed)
			.then(async message => {
				try {
					await message.react('⬆️');
					await message.react('⬇️');
				} catch (error) {
					console.error(error);
				}
			});

		}
	}
}

exports.textureCouncil = textureCouncil;