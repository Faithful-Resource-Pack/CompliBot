import { Guild } from 'discord.js';
import { Event } from '~/Interfaces';

export const event: Event = {
	name: 'ready',
	run: async (client) => {
		console.log(`${client.user.tag} is online.`);

		client.guilds.cache.each((guild: Guild) => client.updateMembers(guild.id, client.config.discords.filter(s => s.id === guild.id)[0].updateMember));
		client.user.setActivity(`${client.tokens.prefix}help`, { type: 'LISTENING' });
	},
};
