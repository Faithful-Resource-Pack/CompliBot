import { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, Message } from "@client";
import axios from "axios";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("discord")
		.setDescription("Shows a Faithful discord.")
		.addStringOption((option) =>
			option
				.setName("server")
				.setDescription("Which server you want to view.")
				.addChoices(
					{ name: "Faithful", value: "faithful" },
					{ name: "Classic Faithful", value: "classic_faithful" },
					{ name: "All", value: "all" },
				)
				.setRequired(true),
		),
	async execute(interaction) {
		const choice = interaction.options.getString("server", true);
		if (choice == "all") {
			if (!interaction.hasPermission("manager")) return;
			await interaction.complete();

			return interaction.channel.send({
				content: `### Faithful:\nhttps://discord.gg/sN9YRQbBv7\n### Classic Faithful:\nhttps://discord.gg/KSEhCVtg4J\n### Minecraft:\nhttps://discord.gg/minecraft`,
			});
		}

		const content: string = (
			await axios.get(`${interaction.client.tokens.apiUrl}settings/discord.guilds`)
		).data[choice]?.invite;

		if (content)
			return interaction
				.reply({ content, fetchReply: true })
				.then((message: Message) => message.deleteButton());

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(interaction.strings().command.discord.unknown_invite.title)
					.setDescription(interaction.strings().command.discord.unknown_invite.description)
					.setColor(colors.red),
			],
			ephemeral: true,
		});
	},
};
