import { Event } from '~/Interfaces';

export const event: Event = {
	name: 'ready',
	run: async (client) => {
		console.log(`${client.user.tag} is online.`);
		client.user.setActivity(`${client.tokens.prefix}help`, { type: 'LISTENING' });
	},
};
