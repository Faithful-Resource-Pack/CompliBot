const Discord   = require('discord.js');
const settings  = require('../../settings');
const speech    = require('../../messages');

const { countReact }  = require('../countReact');
const { getMessages } = require('../getMessages');

async function textureCouncil(client, inputID, outputFalseID, outputTrueID, offset) {
	// remove this when migration is done
	const trueSentence  = 'The following texture has passed council voting and will be added into the pack in a future version.\n';
	const falseSentence = 'The following texture has not passed council voting and thus is up for revote:\n';

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
			(message.attachments.size > 0 || message.embeds !== undefined) && //remove attachments size after migration
			messageDate.getDate() == limitDate.getDate() && 
			messageDate.getMonth() == limitDate.getMonth()
		) {

			// REMOVE WHEN MIGRATION IS DONE:
			//////////////////////////////////////////////////////////////////////////////////////
			if (message.embeds[0] === undefined && message.attachments.size > 0){
				await resultChannel.send(trueSentence + message.content, {files: [message.attachments.first().url]})
				.then(async message => {
					try {
						await message.react('✅');
					} catch (error)	{
						console.error(error);
					}
				});
			}

			else if (message.embeds[0] !== undefined) {
			//////////////////////////////////////////////////////////////////////////////////////
			
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

			await resultChannel.send(embed)

			} // remove this bracket when migration is done

		} else if (
			(message.attachments.size > 0 || message.embeds !== undefined) && 
			messageDate.getDate() == limitDate.getDate() && 
			messageDate.getMonth() == limitDate.getMonth()
		) {
			
			// REMOVE WHEN MIGRATION IS DONE:
			//////////////////////////////////////////////////////////////////////////////////////
			if (message.embeds[0] === undefined && message.attachments.size > 0){
				await revoteChannel.send(falseSentence + message.content, {files: [message.attachments.first().url]})
				.then(async message => {
					try {
						await message.react('⬆️');
						await message.react('⬇️');
					} catch (error) {
						console.error(error);
					}
				});
			}

			else if (message.embeds[0] !== undefined) {
			//////////////////////////////////////////////////////////////////////////////////////

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

			} // remove this bracket when migration is done
		}
	}
}

exports.textureCouncil = textureCouncil;