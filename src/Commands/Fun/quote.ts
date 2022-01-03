import { MessageEmbed } from 'discord.js';
import { Command } from '~/Interfaces';
import get from 'axios';

export const command: Command = {
	name: 'quote',
	description: 'Truely inspiring',
	usage: ['quote'],
	run: async (client, message, args) => {
		var image = await get('https://inspirobot.me/api?generate=true');

		var embed = new MessageEmbed()
			.setImage(image.data)
			.setColor('BLURPLE');

		var embedMessage = await message.reply({ embeds: [embed] });
		// todo: await addDeleteReact(embedMessage, message, true);
	},
};