import { Command } from '../../Interfaces';
import { Message, MessageAttachment } from 'discord.js';
import { tileAttachment } from '../../functions/canvas/tile';

export const command: Command = {
	name: 'tile',
	description: 'Tiles an image around a 3x3 plane',
	usage: ['tile (image attachment)', 'tile (image url)'],
	aliases: ['tessalate', ''],
	run: async (client, message, args) => {
		let attach: string;

		if (args.length != 0) attach = args[0];
		if (message.attachments.size == 1) attach = message.attachments.first().url;

		//!shit hits the fan from here onward
		let messages = await message.channel.messages.fetch({ limit: 10 });
		messages.forEach((m) => {
			if (m.attachments.size != 1) return;
			let f = m.attachments.first().url;
			if (f.endsWith('jpg') || f.endsWith('png') || f.endsWith('jpeg')) return (attach = m.attachments.first().url);
		});

		if (attach != undefined) {
			message.reply({ files: [await tileAttachment(attach)] }).catch(() => {
				message.reply('Output exeeds the maximum of 512 x 512px²!');
			});
		} else {
			message.reply('Nothing to tile!');
		}
	},
};
