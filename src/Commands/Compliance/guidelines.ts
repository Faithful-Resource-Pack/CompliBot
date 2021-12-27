import { MessageEmbed } from 'discord.js';
import { Command } from '~/Interfaces';

export const command: Command = {
	name: 'guidelines',
	description: 'not implemented yet',
	usage: ['guidelines'],
	run: async (client, message, args) => {
		var embedMessage = await message.reply({ content: 'https://docs.compliancepack.net/pages/textures/texturing-guidelines' });
		// not implemented yet
		// await addDeleteReact(embedMessage, message, true);
	},
};
