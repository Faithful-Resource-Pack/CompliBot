import { string, stringKey } from '@src/Functions/string';
import { Command } from '@src/Interfaces';

export const command: Command = {
	name: 'langtest',
	description: 'haha lang go brr',
	usage: ['langtest'],
	aliases: ['lt'],
	run: async (client, message, args) => {
		if (args.length < 2) return message.warn(await string('en_US', 'Args.Insufficient'));

		if (string(args[0], args[1] as stringKey) == undefined) {
			message.warn((await string('en_US', 'Error.NotFound')).replace('%THING%', args[1]));
		}

		message.channel.send(await string(args[0], args[1] as stringKey, { pog: args[3] }));
	},
};
