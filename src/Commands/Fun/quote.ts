import { MessageEmbed } from 'discord.js';
import { Command } from '~/Interfaces';
import get from 'axios';

export const command: Command = {
	name: 'quote',
	description: 'not implemented yet',
	usage: ['quote'],
	run: async (client, message, args) => {
		var image = await get('https://inspirobot.me/api?generate=true');

		var embed = new MessageEmbed()
		  .setImage(image.data)
		  .setColor(client.config.colors.blue);

		var embedMessage = await message.reply({ embeds: [embed] });
		// not implemented yet
		// await addDeleteReact(embedMessage, message, true);
	},
};
