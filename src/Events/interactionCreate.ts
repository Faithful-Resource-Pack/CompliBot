import Client from '@src/Client';
import { Interaction } from 'discord.js';
import { Event } from '@src/Interfaces';

export const event: Event = {
	name: 'interactionCreate',
	run: async (client: Client, interaction: Interaction) => {
		if (!interaction.inGuild()) return;

		if (interaction.isCommand()) client.emit("slashCommandUsed", (client as Client, interaction));
		if (interaction.isButton()) client.emit("useButton", (client as Client, interaction));
		if (interaction.isSelectMenu()) client.emit("useSelectMenu", (client as Client, interaction));
	},
};
