import { MessageEmbed } from 'discord.js';
import { Command } from '~/Interfaces';

export const command: Command = {
	name: 'coin',
	description: 'flip a coin. will it be heads? will it be tails? who knows?',
	usage: ['coin'],
	aliases: ['cf', 'coinflip'],
	run: async (client, message, args) => {
		let result = Math.round(Math.random() * 100) / 100; //rounds to 2 decimal places.

		/**
		 * i rounded so we dont get a one 1 in 18,446,744,073,709,551,616 of landing edge
		 * now it should be 1 in 100, much more realistic
		 */
		message.reply(result > 0.5 ? 'Heads!' : result < 0.5 ? 'Tails!' : 'Edge???!!!');
	},
};
