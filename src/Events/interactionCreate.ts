import { Collection, Interaction } from 'discord.js';
import { increase } from '~/Functions/commandProcess';
import { Event } from '~/Interfaces';
import { SlashCommandI } from '~/Interfaces/slashCommand';

export const event: Event = {
	name: 'interactionCreate',
	run: async (client, interaction: Interaction) => {
		if (interaction.isCommand()) {
			const { commandName } = interaction;

			if (!client.slashCommands.has(commandName)) return;
			const command = client.slashCommands.get(commandName);

			// todo: add verification that execute is instanceof Collection<string, SlashCommandI>

			try {
				// test if it has a subcommand
				interaction.options.getSubcommand();
				await (command.execute as Collection<string, SlashCommandI>).get(interaction.options.getSubcommand())(interaction, client);
				increase((command.data as SlashCommandI).name);
			} catch (err) {

				// not a subcomand
				try {
					await (command.execute as SlashCommandI)(interaction, client);
					increase((command.data as SlashCommandI).name);
				} catch (err) { console.error(err); } // weird stuff happening
			}
		}
	},
};
