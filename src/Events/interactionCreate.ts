import { Interaction } from 'discord.js';
import { Event } from '~/Interfaces';

export const event: Event = {
	name: 'interactionCreate',
	run: async (client, interaction: Interaction) => {
		if (interaction.isCommand()) {
			const { commandName } = interaction

			if (!client.slashCommands.has(commandName)) return;
			const command = client.slashCommands.get(commandName);

			try { await command.execute(interaction, client) } catch (err) { console.error(err); }
		}


		else if (interaction.isButton()) {
			switch (interaction.customId) {
				case 'vote-yes-submission':
					break;
				case 'vote-no-submission':
					break;
				case 'more-submission':
					break;
			}
		} else if (interaction.isSelectMenu()) {
			switch (interaction.values[0]) {
				case 'magnify':
					break;
				case 'palette':
					break;
				case 'tile':
					break;
			}
		}
	},
};
