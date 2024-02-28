import type { SlashCommand } from "@interfaces/interactions";
import { Message, EmbedBuilder } from "@client";
import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import axios from "axios";
import formatPack from "@utility/formatPack";
import type { Contribution, Texture } from "@interfaces/database";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("about")
		.setDescription("Shows a given user's contributions")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("User you want to look up (leave blank if you want to search yourself).")
				.setRequired(false),
		),
	async execute(interaction) {
		await interaction.deferReply();

		// if nobody to search up is provided, defaults to the person who asked
		const user = interaction.options.getUser("user") ?? interaction.user;
		let contributionData: Contribution[] = [];
		try {
			contributionData = (
				await axios.get(`${interaction.client.tokens.apiUrl}users/${user.id}/contributions`)
			).data;
		} catch {
			return interaction.ephemeralReply({
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

		const textures = (await axios.get(`${interaction.client.tokens.apiUrl}textures/raw`)).data;

		// merge the two objects by id (faster than fetching individually)
		const finalData: (Contribution & Texture)[] = contributionData.map((contribution) => ({
			...contribution,
			...textures[contribution.texture],
		}));

		const packCount = {};
		let files: AttachmentBuilder[];
		if (finalData.length) {
			const textBuf = Buffer.from(
				finalData
					.sort((a, b) => b.date - a.date) // most recent on top
					.map((data) => {
						const packName = formatPack(data.pack).name;
						packCount[packName] = (packCount[packName] ?? 0) + 1;
						return `${packName}: [#${data.texture}] ${data.name}`;
					})
					.join("\n"),
			);
			files = [new AttachmentBuilder(textBuf, { name: "about.txt" })];
		}

		const embed = new EmbedBuilder().setTitle(
			`${user.displayName} has ${finalData.length} ${
				finalData.length == 1 ? "contribution" : "contributions"
			}!`,
		);

		const finalPackData = Object.entries(packCount)
			.map((i) => i.join(": "))
			.join("\n");

		if (finalPackData) embed.setDescription(finalPackData);

		await interaction
			.editReply({ embeds: [embed], files })
			.then((message: Message) => message.deleteButton());
	},
};
