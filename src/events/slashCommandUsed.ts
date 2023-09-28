import { SlashCommandI } from "@interfaces";
import { Collection } from "discord.js";
import { Event } from "@interfaces";
import { Client, ChatInputCommandInteraction, EmbedBuilder } from "@client";
import settings from "@json/dynamic/settings.json";
import { colors } from "@helpers/colors";

export default {
	name: "slashCommandUsed",
	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		client.storeAction("slashCommand", interaction);
		const submissionChannels = Object.values(settings.submission.packs).map(
			(pack) => pack.channels.submit,
		);

		// disable commands
		if (submissionChannels.includes(interaction.channel.id))
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("You cannot run slash commands in a submission channel!")
						.setDescription("Please use the appropriate bot command channel instead.")
						.setColor(colors.red),
				],
				ephemeral: true,
			});

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
				(command.execute as SlashCommandI)(interaction as ChatInputCommandInteraction);
			} catch (err) {
				console.error(err);
				return interaction.reply({
					content: "There was an error with this command!",
					ephemeral: true,
				});
			}
		}

		// increase uses of that command
		const count: number = client.commandsProcessed.get((command.data as SlashCommandI).name) + 1;
		client.commandsProcessed.set((command.data as SlashCommandI).name, isNaN(count) ? 1 : count);
	},
} as Event;
