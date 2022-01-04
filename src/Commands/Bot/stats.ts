import { MessageEmbed, ReplyMessageOptions, version as djsVersion } from 'discord.js';
import { duration } from 'moment';
import { Command } from '~/Interfaces';
import os from 'os';
import { total } from '~/Functions/commandProcess';

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

		const number = total() + 1;

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
		 * if the platform is linux and the release starts with \d+.\d+ (e.g 69.420)
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
			.addFields(
				{ name: 'Prefix', value: client.tokens.prefix, inline: true },
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
			.setFooter({ text: 'Bot made with love', iconURL: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/0/06/Heart_(icon).png' });

		const res = await message.reply({ embeds: [embed] });

		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true });
	},
};
