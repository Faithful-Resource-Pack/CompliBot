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

		const loading: string = (
			await axios.get(`${interaction.client.tokens.apiUrl}settings/images.loading`)
		).data;

		const loadingEmbed = new EmbedBuilder()
			.setTitle("Searching for contributions...")
			.setDescription("This can take some time, please wait...")
			.setThumbnail(loading);

		await interaction
			.editReply({ embeds: [loadingEmbed] })
			.then((message: Message) => message.deleteButton());

		// if nobody to search up is provided, defaults to the person who asked
		const user = interaction.options.getUser("user") ?? interaction.user;
		let contributionData: Contribution[] = [];
		try {
			contributionData = (
				await axios.get(`${interaction.client.tokens.apiUrl}users/${user.id}/contributions`)
			).data;
		} catch {
			const finalEmbed = new EmbedBuilder()
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
				.setColor(colors.red);

			return interaction.ephemeralReply({ embeds: [finalEmbed] });
		}

		// group ids into 30-long nested arrays
		const groupedIDs = contributionData
			.map((contribution) => contribution.texture)
			.filter((v, i, a) => a.indexOf(v) === i) // remove duplicates
			.reduce((acc: string[][], cur, index) => {
				if (index % 30 === 0) acc.push([]);
				acc.at(-1).push(cur);
				return acc;
			}, []);

		const textureData: Texture[] =
			// faster to resolve all promises at once than to wait for each one to finish
			(
				await Promise.all(
					groupedIDs.map((ids: string[]) =>
						// get texture data in batches of 30
						axios
							.get(`${interaction.client.tokens.apiUrl}textures/${ids.join(",")}`)
							.catch(() => ({ data: null })),
					),
				)
			)
				.map((res) => res.data)
				.flat();

		// merge the two objects by id
		const finalData: (Contribution & Texture)[] = contributionData.map(
			(contribution: Contribution) => ({
				...contribution,
				...textureData.find((texture) => texture.id == contribution.texture),
			}),
		);

		const packCount = {};
		let files: AttachmentBuilder[] | undefined;
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

		const finalEmbed = new EmbedBuilder().setTitle(
			`${user.displayName} has ${finalData.length} ${
				finalData.length == 1 ? "contribution" : "contributions"
			}!`,
		);

		const finalPackData = Object.entries(packCount)
			.map((i) => i.join(": "))
			.join("\n");

		if (finalPackData) finalEmbed.setDescription(finalPackData);

		await interaction.editReply({ embeds: [finalEmbed], files }).catch(() => {});
	},
};
