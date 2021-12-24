import { Guild, MessageEmbed } from 'discord.js';
import { Event } from '../Interfaces';

export const event: Event = {
	name: 'guildCreate',
	run: async (client, guild: Guild) => {
		const embed = new MessageEmbed().setTitle('Thanks for Inviting me').setDescription(`To get started, try run \`/help\`!`);

		guild.systemChannel.send({ embeds: [embed] });
		console.log('I was added to a guild, now im in: ' + client.guilds.cache.size);
	},
};
