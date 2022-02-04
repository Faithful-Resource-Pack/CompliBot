import { increase } from "@src/Functions/commandProcess";
import { SlashCommandI } from "@src/Interfaces/slashCommand";
import { Collection } from "discord.js";
import { Event } from "@src/Interfaces";
import Client from "@src/Client";
import { CommandInteraction } from "@src/Client/interaction";

export const event: Event = {
	name: "slashCommandUsed",
	run: async (client: Client, interaction: CommandInteraction) => {
		// get command name
		const { commandName } = interaction;

		// test if client has this command registered
		if (!client.slashCommands.has(commandName)) return;

		// get this command
		const command = client.slashCommands.get(commandName);

		try {
			// try if there is a subcommand
			interaction.options.getSubcommand();
			// execute it if so
			(command.execute as Collection<string, SlashCommandI>).get(interaction.options.getSubcommand())(
				interaction,
				client,
			);
		} catch (_err) {
			// not a subcommand
			try {
				// execute command
				(command.execute as SlashCommandI)(interaction as CommandInteraction, client);
			} catch (err) {
				console.error(err);
				return interaction.reply({ content: "There were an error with command!", ephemeral: true });
			}
		}

		// increase uses of that command
		increase((command.data as SlashCommandI).name);
	},
};
