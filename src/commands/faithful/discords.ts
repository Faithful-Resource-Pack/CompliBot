import { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, Message } from "@client";
import axios from "axios";
import { colors } from "@utility/colors";
import { FaithfulGuild } from "client/client";
import { toTitleCase } from "@utility/methods";

export const command: SlashCommand = {
	async data(client) {
		const guilds: Record<string, FaithfulGuild> = (
			await axios.get(`${client.tokens.apiUrl}settings/discord.guilds`)
		).data;
		return new SlashCommandBuilder()
			.setName("discord")
			.setDescription("Shows a Faithful discord.")
			.addStringOption((option) =>
				option
					.setName("server")
					.setDescription("Which server you want to view.")
					.addChoices(
						{ name: "All", value: "all" },
						...Object.entries(guilds)
							.filter((g) => g[1].invite)
							.map(([k, v]) => ({ name: toTitleCase(k), value: v.invite })),
					)
					.setRequired(true),
			);
	},
	async execute(interaction) {
		const content = interaction.options.getString("server", true);
		if (content == "all") {
			if (!interaction.hasPermission("manager")) return;
			await interaction.complete();

			return interaction.channel.send({
				content: `### Faithful:\nhttps://discord.gg/sN9YRQbBv7\n### Classic Faithful:\nhttps://discord.gg/KSEhCVtg4J\n### Minecraft:\nhttps://discord.gg/minecraft`,
			});
		}
		return interaction
			.reply({ content, fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
