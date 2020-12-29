const Discord = require('discord.js');
const settings  = require('../../settings');

const { countReact }  = require('../countReact');
const { getMessages } = require('../getMessages');

async function textureSubmission(client, inputID, outputID, offset) {
	var texture = false;
	let outputChannel = client.channels.cache.get(outputID);
	let limitDate = new Date();
	let messages = await getMessages(client,inputID);

	limitDate.setDate(limitDate.getDate() - offset);
	
	for (var i in messages) {
		let message         = messages[i];
		let messageDate     = new Date(message.createdTimestamp);
		let messageUpvote   = countReact(message,'⬆️');
		let messageDownvote = countReact(message,'⬇️');

		if (
			messageUpvote >= messageDownvote &&
			message.attachments.size > 0 &&
			messageDate.getDate() == limitDate.getDate() &&
			messageDate.getMonth() == limitDate.getMonth()
		) {
			texture = true;

			var description = 'No description';
			var folder = 'None';
			var name = 'None';

			if (message.content.includes('(')) description = message.content.split('(').pop().split(')')[0];
			if (message.content.includes('[')) folder      = message.content.split('[').pop().split(']')[0];
			var name = message.content.replace('('+description+')', '').replace('['+folder+']', '').replace(' ','');
			
			description = description.charAt(0).toUpperCase() + description.slice(1);

			if (name === undefined || name == '') name = 'Not Provided';

			var embed = new Discord.MessageEmbed()
				.setColor(settings.COLOR_COUNCIL)
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setDescription(description)
				.addFields(
					{ name: 'Name:', value: name, inline: true },
					{ name: 'Folder:', value: folder, inline: true }
				)
				.setFooter('CompliBot', settings.BOT_IMG);

			var file = message.attachments.first().url;
			if (file.endsWith('.zip') || file.endsWith('.rar') || file.endsWith('.7zip')) {
				embed.setDescription('**Archive file provided.**️\n'+description);
				embed.setTitle('Archive File').setURL(file);
			}
			else embed.setImage(file);

			await outputChannel.send(embed)
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

	if (texture) await outputChannel.send('<@&'+settings.C32_COUNCIL_ID+'> There are new textures to vote for!');
	else await outputChannel.send('No textures today!');
}

exports.textureSubmission = textureSubmission;