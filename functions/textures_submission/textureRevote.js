const Discord  = require('discord.js');
const settings = require('../../settings');
const speech   = require('../../messages');

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
			(message.attachments.size > 0 || message.embeds !== undefined) &&
			messageDate.getDate() == limitDate.getDate() &&
			messageDate.getMonth() == limitDate.getMonth()
		) {

			// REMOVE WHEN MIGRATION IS DONE:
			//////////////////////////////////////////////////////////////////////////////////////
			if (message.embeds[0] === undefined && message.attachments.size > 0){
				await outputChannel.send(`This texture has passed community voting and thus will be added into the pack.\n> With a percentage of ${upvotePercentage}% Upvotes (>66%).\n` + message.content.replace(revoteSentence,''), {files: [message.attachments.first().url]})
				.then(async message => {
					try {
						await message.react('✅');
					} catch (error) {
						console.error(error);
					}
				});
			}

			else {
			//////////////////////////////////////////////////////////////////////////////////////

			embed = new Discord.MessageEmbed()
				.setColor(settings.COLOR_GREEN)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(speech.TEXTURE_WIN_REVOTE)
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

			} // remove this bracket after migration
		} else if (
			(message.attachments.size > 0 || message.embeds !== undefined) &&
			messageDate.getDate() == limitDate.getDate() &&
			messageDate.getMonth() == limitDate.getMonth()
		) {

			// REMOVE WHEN MIGRATION IS DONE:
			//////////////////////////////////////////////////////////////////////////////////////
			if (message.embeds[0] === undefined && message.attachments.size > 0){
				await outputChannel.send(`This texture has not passed council and community voting (${upvotePercentage}% of upvotes), and thus will not be added into the pack.\n` + message.content.replace(revoteSentence,''), {files: [message.attachments.first().url]})
				.then(async message => {
					try {
						await message.react('❌');
					}	catch (error) {
						console.error(error);
					}
				});
			}
			else if (message.embeds[0]) {
			//////////////////////////////////////////////////////////////////////////////////////

			embed = new Discord.MessageEmbed()
				.setColor(settings.COLOR_RED)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(speech.TEXTURE_DEFEAT_REVOTE)
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

			} // remove this bracket after migragtion
		}
	}
}

exports.textureRevote = textureRevote;
