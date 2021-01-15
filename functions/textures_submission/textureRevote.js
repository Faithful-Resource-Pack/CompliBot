const Discord  = require('discord.js');
const settings = require('../../settings');
const colors   = require('../../res/colors');
const strings   = require('../../res/strings');

const { countReact }  = require('../countReact');
const { getMessages } = require('../getMessages');

var embed = null;

async function textureRevote(client, inputID, outputID, offset) {
	// remove this after migration
	const revoteSentence = 'The following texture has not passed council voting and thus is up for revote:\n';

	let outputChannel = client.channels.cache.get(outputID);
	let limitDate     = new Date();
	let messages = await getMessages(client,inputID);

	limitDate.setDate(limitDate.getDate() - offset);

	for (var i in messages) {
		let message     = messages[i];
		let messageDate = new Date(message.createdTimestamp);

		let messageUpvote    = countReact(message,'⬆️');
		let messageDownvote  = countReact(message,'⬇️');
		let upvotePercentage = ((messageUpvote * 100) / (messageUpvote + messageDownvote)).toFixed(2);

		if (
			upvotePercentage >= 66.66 &&
			message.embeds[0] !== undefined &&
			messageDate.getDate() == limitDate.getDate() &&
			messageDate.getMonth() == limitDate.getMonth()
		) {

			embed = new Discord.MessageEmbed()
				.setColor(colors.GREEN)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(strings.TEXTURE_WIN_REVOTE)
				.addFields(
					{ name: 'Name:', value: message.embeds[0].fields[0].value, inline: true },
					{ name: 'Folder:', value: message.embeds[0].fields[1].value, inline: true },
					{ name: 'Percentage:', value: upvotePercentage+'% ⬆️', inline: true},
					{ name: 'Comment:', value: message.embeds[0].fields[2].value, inline: false }
				)
				.setFooter('CompliBot', settings.BOT_IMG);

			if (message.embeds[0].title) {
				embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url);
			}
			else embed.setImage(message.embeds[0].image.url);

			await outputChannel.send(embed)

		}
		
		if (
			message.embeds[0] !== undefined &&
			messageDate.getDate() == limitDate.getDate() &&
			messageDate.getMonth() == limitDate.getMonth()
		) {

			embed = new Discord.MessageEmbed()
				.setColor(colors.RED)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(strings.TEXTURE_DEFEAT_REVOTE)
				.addFields(
					{ name: 'Name:', value: message.embeds[0].fields[0].value, inline: true },
					{ name: 'Folder:', value: message.embeds[0].fields[1].value, inline: true },
					{ name: 'Percentage:', value: upvotePercentage+'% ⬆️ (<66.66%)', inline: true},
					{ name: 'Comment:', value: message.embeds[0].fields[2].value, inline: false }
				)
				.setFooter('CompliBot', settings.BOT_IMG);

			if (message.embeds[0].title) {
				embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url);
			}
			else embed.setImage(message.embeds[0].image.url);

			await outputChannel.send(embed)
		}
		
	}
}

exports.textureRevote = textureRevote;
