import { MessageEmbed } from 'discord.js';
import { getUsage } from '~/Functions/commandProcess';
import { Command } from '~/Interfaces';

export const command: Command = {
	name: 'cstats',
	description: 'Gets a commands usage',
	usage: ['cstats'],
	aliases: ['commandstats'],
	run: async (client, message, args) => {
		if (args.length != 1) return message.warn('Please provide a command or alias!');

		let isValid: Boolean = false;
		let name: string;

		client.commands.forEach((command) => {
			if (args[0] == command.name) {
				name = args[0];
				return (isValid = true);
			}
			if (command.aliases != undefined) {
				command.aliases.forEach((alias) => {
					if (args[0] == alias) {
						name = command.name;
						return (isValid = true);
					}
				});
			}
		});

		if (isValid != true) return message.warn('Please provide a valid command or alias!');

		var embed = new MessageEmbed()
			.setTitle(`\`${client.config.prefix + name}\` has been used \`${getUsage(args[0]) ?? '0'}\` times`)
			.setColor('BLURPLE');

		const res = await message.reply({ embeds: [embed] });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true })
	},
};
