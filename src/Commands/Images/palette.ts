import { Command } from '~/Interfaces';
import { magnifyAttachment } from '~/functions/canvas/magnify';
import { paletteEmbed } from '~/functions/canvas/palette';

export const command: Command = {
	name: 'palette',
	description: 'Shows colours of an image.',
	usage: ['palette (image attachment)', 'palette (image url)'],
	aliases: ['p', 'colors', 'colours'],
	run: async (client, message, args) => {
		let attach: string;

		if (message.type == 'REPLY' && message.channel.type == 'GUILD_TEXT') {
			if ((await message.channel.messages.fetch(message.reference.messageId)).attachments.size > 0) {
				attach = (await message.channel.messages.fetch(message.reference.messageId)).attachments.first().url;
			}
		}

		if (args.length != 0) attach = args[0];
		if (message.attachments.size == 1) attach = message.attachments.first().url;

		if (attach == undefined) {
			let messages = await message.channel.messages.fetch({ limit: 10 });

			//gets last message with at least one attachment and no embeds and ist a message sent by a bot
			const lastMessage = messages
				.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
				.filter((m) => m.attachments.size > 0 && m.embeds.length == 0 && !m.author.bot)
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
			message.reply({ embeds: [await paletteEmbed(attach, client.config.colors.blue)] }).catch(() => {
				message.reply('Output exeeds the maximum of 512 x 512px²!');
			});
		} else {
			message.reply({ embeds: [await paletteEmbed(attach, client.config.colors.blue)] });
		}
	},
};
