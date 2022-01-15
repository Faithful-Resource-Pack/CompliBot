import { MessageActionRow, MessageButton, MessageComponent } from 'discord.js';
import MessageEmbed from '~/Client/embed';
import { key, string } from '~/Functions/string';
import { parseColor } from '~/Functions/parseColor';
import { ids, parseId } from '~/Helpers/emojis';
import { Command } from '~/Interfaces';

export const command: Command = {
	name: 'langtest',
	description: 'haha lang go brr',
	usage: ['langtest'],
	aliases: ['lt'],
	run: async (client, message, args) => {
		if (args.length != 2) return message.warn(string('en', 'InsufficientArgs'));
		if (string(args[0], args[1] as key) == undefined) {
			message.warn(string('en', 'Error.NotFound').replace('%THING%', args[1]));
		}

		message.channel.send(string(args[0], args[1] as key));
	},
};
