import MessageEmbed from '~/Client/embed';
import { Command } from '~/Interfaces';

export const command: Command = {
	name: 'guidelines',
	description: 'Shows the guidelines for compliance',
	usage: ['guidelines'],
	run: async (client, message, args) => {
		const res = await message.reply({ content: 'https://docs.compliancepack.net/pages/textures/texturing-guidelines' });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true });
	},
};
