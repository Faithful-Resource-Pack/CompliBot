import { SlashCommandI } from "@interfaces/interactions";
import { Collection } from "discord.js";
import { Event } from "@interfaces/events";
import { Client, ChatInputCommandInteraction } from "@client";

export default {
	name: "slashCommandUsed",
	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		client.storeAction("slashCommand", interaction);

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
			(command.execute as Collection<string, SlashCommandI>).get(
				interaction.options.getSubcommand(),
			)(interaction);
		} catch (_err) {
			// not a subcommand
			try {
				// execute command
				(command.execute as SlashCommandI)(interaction);
			} catch (err) {
				console.trace(err);
				return interaction.reply({
					content: `${
						interaction.strings().error.command
					}\nError for the developers:\n\`\`\`${err}\`\`\``,
					ephemeral: true,
				});
			}
		}

		// increase uses of that command
		const count = client.commandsProcessed.get(command.data.name) + 1;
		client.commandsProcessed.set(command.data.name, isNaN(count) ? 1 : count);
	},
} as Event;
