import { SlashCommandI } from "@interfaces/commands";
import { Submissions } from "@interfaces/firestorm";
import { Collection } from "discord.js";
import { Event } from "@interfaces/events";
import { Client, ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { colors } from "@utility/colors";
import axios from "axios";

export default {
	name: "slashCommandUsed",
	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		client.storeAction("slashCommand", interaction);
		const packs: Submissions = (await axios.get(`${client.tokens.apiUrl}settings/submission.packs`))
			.data;

		const submissionChannels = Object.values(packs).map((pack) => pack.channels.submit);

		// disable commands
		if (submissionChannels.includes(interaction.channel.id))
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().command.in_submission.title)
						.setDescription(interaction.strings().command.in_submission.description)
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
		const count = client.commandsProcessed.get((command.data as SlashCommandI).name) + 1;
		client.commandsProcessed.set((command.data as SlashCommandI).name, isNaN(count) ? 1 : count);
	},
} as Event;
