import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { Command } from '../../Interfaces';

export const command: Command = {
	name: 'ping',
	description: 'Gets latency',
	usage: 'ping',
	aliases: [],
	run: async (client, message, args) => {
		message.channel.send(`Pong! bot latency is **${client.ws.ping}ms**`);
	},
};
