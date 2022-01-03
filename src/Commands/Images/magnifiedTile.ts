import { MessageEmbed } from 'discord.js';
import { magnifyAttachment } from '~/Functions/canvas/magnify';
import { tileCanvas } from '~/Functions/canvas/tile';
import { Command } from '~/Interfaces';

export const command: Command = {
	name: 'tileAndMagnify',
	description: 'Magnifies and tiles an image',
	usage: ['magnify (image attachment|reply to message with image attachment)', 'magnify (image url)'],
	aliases: ['tm', 'tz'],
	run: async (client, message, args) => {
		let attachmentUrl: string;

		if (message.type == 'REPLY' && message.channel.type == 'GUILD_TEXT') {
			if ((await message.channel.messages.fetch(message.reference.messageId)).attachments.size > 0) {
				attachmentUrl = (await message.channel.messages.fetch(message.reference.messageId)).attachments.first().url;
			}
		}

		if (args.length != 0) attachmentUrl = args[0];
		if (message.attachments.size == 1) attachmentUrl = message.attachments.first().url;

		if (attachmentUrl == undefined) {
			let messages = await message.channel.messages.fetch({ limit: 10 });

			//gets last message with at least one attachment and no embeds and is a message sent by a bot
			const lastMessage = messages
				.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
				.filter((m) => m.attachments.size > 0 && m.embeds.length == 0)
				.first();

			/**
			 * bacically checks if the attachment url ends with an image extension
			 * explanation:
			 * wierd regex trolling, returns true if it contains .jpeg, .jpg or .png and a string termination ($)
			 */
			if (lastMessage == undefined) return message.warn('Nothing to tile and magnify in the last 10 messages!');
			if (lastMessage.attachments.first().url.match(/\.(jpeg|jpg|png)$/)) attachmentUrl = lastMessage.attachments.first().url;
		}

		if (attachmentUrl != undefined) {
			message.reply({ files: [await magnifyAttachment(await tileCanvas(attachmentUrl))] }).catch(() => {
				message.warn('Output exeeds the maximum of 512 x 512px²!');
			});
		} else message.warn('Nothing to tile and magnify in the last 10 messages!');
	},
};
