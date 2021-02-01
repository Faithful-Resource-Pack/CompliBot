const Discord = require('discord.js');
const settings  = require('../../settings');
const colors   = require('../../res/colors');

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

			var description = '';
			var folder = 'None';
			var name   = 'None';
			var type   = 'None';

			if (message.content.includes('(')) description = message.content.split('(').pop().split(')')[0];
			if (message.content.includes('[')) folder      = message.content.split('[').pop().split(']')[0];
			name = message.content.replace('('+description+')', '').replace('['+folder+']', '').replace(' ','');

			if (message.channel.id === settings.C32_SUBMIT_1 || message.channel.id === settings.C64_SUBMIT_1) type = 'java';
			else if (message.channel.id === settings.C32_SUBMIT_1B || message.channel.id === settings.C64_SUBMIT_1B) type = 'bedrock';

			description = description.charAt(0).toUpperCase() + description.slice(1);
			if (name === undefined || name == '') name = 'Not Provided';

			var embed = new Discord.MessageEmbed()
				.setColor(colors.COUNCIL)
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.addFields(
					{ name: 'Name:',   value: name,   inline: true },
					{ name: 'Folder:', value: folder, inline: true },
					{ name: 'Type:',   value: type,   inline: true }
				)
				.setFooter('CompliBot', settings.BOT_IMG);

			if (description != '') {
				embed.setDescription(description);
			}

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
	
	if (inputID == settings.C32_SUBMIT_1) {
		if (texture) await outputChannel.send('<@&'+settings.C32_COUNCIL_ID+'> There are new Java textures to vote for!');
		else await outputChannel.send('No Java textures today!');
	}

	if (inputID == settings.C32_SUBMIT_1B) {
		if (texture) await outputChannel.send('<@&'+settings.C32_COUNCIL_ID+'> There are new Bedrock textures to vote for!');
		else await outputChannel.send('No Bedrock textures today!');
	}

	if (inputID == settings.C64_SUBMIT_1) {
		if (texture) await outputChannel.send('<@&'+settings.C64_COUNCIL_ID+'> There are new Java textures to vote for!');
		else await outputChannel.send('No Java textures today!');
	}

	if (inputID == settings.C64_SUBMIT_1B) {
		if (texture) await outputChannel.send('<@&'+settings.C64_COUNCIL_ID+'> There are new Bedrock textures to vote for!');
		else await outputChannel.send('No Bedrock textures today!');
	}
	
}

exports.textureSubmission = textureSubmission;
