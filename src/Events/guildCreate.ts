import { Guild, MessageEmbed } from 'discord.js';
import { Event } from '@src/Interfaces';

export const event: Event = {
	name: 'guildCreate',
	run: async (client, guild: Guild) => {
		await client.loadSlashCommands(); // load slash command for that new guild!
		await client.loadSlashCommandsPerms(); // setup perms for it
		await client.restart();

		const embed = new MessageEmbed().setTitle('Thanks for Inviting me').setDescription(`To get started, try run \`/help\`!`);

		guild.systemChannel?.send({ embeds: [embed] });
		console.log('I was added to a guild, now im in: ' + client.guilds.cache.size);
	},
};
