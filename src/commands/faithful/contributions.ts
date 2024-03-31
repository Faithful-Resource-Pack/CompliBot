import type { SlashCommand } from "@interfaces/interactions";
import { Message, EmbedBuilder } from "@client";
import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import axios from "axios";
import formatPack from "@utility/formatPack";
import type { Pack } from "@interfaces/database";
import { colors } from "@utility/colors";
import getContributions from "@functions/getContributions";

export const command: SlashCommand = {
	async data(client) {
		const packs: Pack[] = (await axios.get(`${client.tokens.apiUrl}packs/search?type=submission`))
			.data;
		return new SlashCommandBuilder()
			.setName("contributions")
			.setDescription("Shows a given user's contributions")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("User you want to look up (leave blank if you want to search yourself).")
					.setRequired(false),
			)
			.addStringOption((option) =>
				option
					.setName("pack")
					.setDescription("Filter contributions for a specific pack.")
					.addChoices(...packs.map((pack) => ({ name: pack.name, value: pack.id })))
					.setRequired(false),
			);
	},
	async execute(interaction) {
		await interaction.deferReply();

		// defaults to the person who asked
		const user = interaction.options.getUser("user", false) ?? interaction.user;
		const pack = interaction.options.getString("pack", false);

		const response = await getContributions(interaction.client, user, pack);
		if (!response) {
			interaction.ephemeralReply({
				embeds: [
					new EmbedBuilder()
						.setTitle(
							interaction
								.strings()
								.command.about.missing_profile.title.replace("%USER%", user.displayName),
						)
						.setDescription(
							// only tell user to register if they actually can register
							interaction.strings().command.about.missing_profile[
								user.id === interaction.user.id ? "register" : "description"
							],
						)
						.setColor(colors.red),
				],
			});
		}

		const files: AttachmentBuilder[] = [];
		const embed = new EmbedBuilder();

		// nested ternaries were getting really ugly here
		let embedTitle = `${user.displayName} has ${response.results.length} `;
		embedTitle += response.results.length === 1 ? "contribution" : "contributions";
		if (pack) embedTitle += ` in ${formatPack(pack).name}`;
		embedTitle += "!";
		embed.setTitle(embedTitle);

		if (response.count && !pack) embed.setDescription(response.count);

		if (response.results.length)
			files.push(new AttachmentBuilder(response.file, { name: "about.txt" }));

		await interaction
			.editReply({ embeds: [embed], files })
			.then((message: Message) => message.deleteButton());
	},
};
