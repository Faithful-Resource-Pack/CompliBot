import { MessageEmbed, version as djsVersion } from 'discord.js';
import { duration } from 'moment';
import { get as getCommandsProcessed } from '../../functions/commandProcess';
import { Command } from '../../Interfaces';
import { version as osVersion } from 'os';

export const command: Command = {
	name: 'stats',
	description: 'Returns statistics of the bot.',
	usage: ['stats'],
	aliases: ['statistics'],
	run: async (client, message, args) => {
		let sumMembers = 0;

		client.guilds.cache.each((guild) => {
			sumMembers += guild.memberCount;
		});

		const number = await getCommandsProcessed();

		const embed = new MessageEmbed()
			.setTitle(`${client.user.username} Stats`)
			.setThumbnail(client.user.displayAvatarURL())
			.setColor(client.config.colors.blue)
			.addFields(
				{ name: 'Prefix', value: client.config.prefix, inline: true },
				{ name: 'Uptime', value: duration(message.client.uptime).humanize(), inline: true },
				{ name: 'Guild Count', value: client.guilds.cache.size.toString(), inline: true },

				{ name: 'RAM used', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
				{ name: 'Discord Library', value: `discord.js ${djsVersion}`, inline: true },
				{ name: 'Node.js', value: `${process.version}`, inline: true },

				{ name: 'Total\nCommands', value: '' + client.commands.size, inline: true },
				{ name: 'Commands\nProcessed', value: '' + number, inline: true },
				{ name: 'Members\nAcross Guilds', value: '' + sumMembers, inline: true },

				{ name: 'Operating System', value: osVersion() },
			)
			.setFooter('Bot made with love', 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/0/06/Heart_(icon).png');

		message.channel.send({ embeds: [embed] });
	},
};
