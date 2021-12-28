import { MessageEmbed, version as djsVersion } from 'discord.js';
import { duration } from 'moment';
import { get as getCommandsProcessed } from '~/functions/commandProcess';
import { Command } from '~/Interfaces';
import os from 'os';

export const command: Command = {
	name: 'stats',
	description: 'Returns statistics of the bot.',
	usage: ['stats'],
	aliases: ['statistics'],
	run: async (client, message, args) => {
		let sumMembers = 0;
		let version;

		client.guilds.cache.each((guild) => {
			sumMembers += guild.memberCount;
		});

		const number = await getCommandsProcessed();

		// I have no clue if this actually works
		// a little bit taken from https://github.com/sindresorhus/os-name/blob/main/index.js#L37

		/**
		 * @author nick
		 * i know what it does, its a stupid regex.
		 *
		 * \d+ (any digit repeated any ammount of times)
		 * ^ (start of string)
		 * \. (period)
		 *
		 * if the platfor is linux and the release starts with \d+.\d+ (e.g 69.420)
		 * then use replace it and everything following it with '$1' (i.e fist capture group (which is the version thing) )
		 *
		 * example:
		 *  1.0.0-beta trolling version => 1.0
		 */

		if (os.platform() === 'linux') version = 'Linux' + os.release().replace(/^(\d+\.\d+).*/, '$1');
		else version = os.version();

		var embed = new MessageEmbed()
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

				{ name: 'Operating System', value: version },
			)
			.setFooter('Bot made with love', 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/0/06/Heart_(icon).png');

		await message.channel.send({ embeds: [embed] });
		// not implementend yet
		// await addDeleteReact(embedMessage, message, true);
	},
};
