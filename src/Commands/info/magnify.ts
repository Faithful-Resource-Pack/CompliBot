import { Command } from '../../Interfaces';
import { magnifyAttachment } from '../../functions/canvas/magnify';
import { Message } from 'discord.js';

export const command: Command = {
	name: 'magnify',
	description: 'Scales an image without smoothing by a factor',
	usage: ['magnify (image attachment)', 'magnify (image url)'],
	aliases: ['m', 'z', 'mag', 'scale', 'zoom'],
	run: async (client, message, args) => {
		if (args.length != 0) return message.reply({ files: [await magnifyAttachment(args[0])] });
		if (message.attachments.size == 1) return message.reply({ files: [await magnifyAttachment(message.attachments.first().url)] });

		//!shit hits the fan from here onward
		let messages = await message.channel.messages.fetch({ limit: 10 });
		let firstReturn: Message;

		messages.forEach((m) => {
			if (m.attachments.size != 1) return;
			let f = m.attachments.first().url;
			if (f.endsWith('jpg') || f.endsWith('png') || f.endsWith('jpeg')) return (firstReturn = m);
		});

		if (firstReturn != undefined) {
			try {
				message.reply({ files: [await magnifyAttachment(firstReturn.attachments.first().url)] });
			} catch (e) {
				message.reply(e);
			}
		}
	},
};
