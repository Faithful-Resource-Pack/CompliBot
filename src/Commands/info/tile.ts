import { Command } from '../../Interfaces';
import { Message, MessageAttachment } from 'discord.js';
import { tileAttachment } from '../../functions/canvas/tile';

export const command: Command = {
	name: 'tile',
	description: 'Tiles an image around a 3x3 plane',
	usage: ['tile (image attachment)', 'tile (image url)'],
	aliases: ['tessellate', 'repeat'],
	run: async (client, message, args) => {
		let attach: string;

		if (args.length != 0) attach = args[0];
		if (message.attachments.size == 1) attach = message.attachments.first().url;

		if (attach == undefined) {
			let messages = await message.channel.messages.fetch({ limit: 10 });

			//gets last message with at least one attachment and no embeds and ist a message sent by the bot
			const lastMessage = messages
				.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
				.filter((m) => m.attachments.size > 0 && m.embeds.length == 0 && m.author.id != client.user.id)
				.first();

			/**
			 * bacically checks if the attachment url ends with an image extension
			 * explanation:
			 * wierd regex trolling, returns true if it contains .jpeg, .jpg or .png and a string termination ($)
			 */
			if (lastMessage == undefined) {
				return message.reply('Nothing to tile in the last 10 messages!');
			}
			if (lastMessage.attachments.first().url.match(/\.(jpeg|jpg|png)$/)) attach = lastMessage.attachments.first().url;
		}

		if (attach != undefined) {
			message.reply({ files: [await tileAttachment(attach)] }).catch(() => {
				message.reply('Output exeeds the maximum of 512 x 512px²!');
			});
		} else {
			message.reply('Nothing to tile in the last 10 messages!');
		}
	},
};
