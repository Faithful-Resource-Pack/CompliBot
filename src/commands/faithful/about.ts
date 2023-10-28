import { SlashCommand } from "@interfaces";
import { Message, EmbedBuilder, ChatInputCommandInteraction } from "@client";
import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import axios from "axios";
import formatName from "@utility/formatName";
import { Contribution, Texture } from "@interfaces";

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
	async execute(interaction: ChatInputCommandInteraction) {
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
				.setTitle(`${user.displayName} has no contributions!`)
				.setDescription(
					"No database profile was found for this user. If this data looks incorrect, register at https://webapp.faithfulpack.net.",
				);

			return await interaction.editReply({ embeds: [finalEmbed] });
		}

		contributionData.sort((a: Contribution, b: Contribution) => b.date - a.date);
		const textureData: Texture[] = (
			await Promise.all(
				contributionData
					// convert to ids
					.map((texture: Contribution) => texture.texture)
					// convert to 30-long nested arrays
					.reduce((acc: string[][], cur: string, index: number) => {
						if (index % 30 === 0) {
							acc.push([]);
						}
						acc.at(-1).push(cur);
						return acc;
					}, [])
					.map(async (ids: string[]) => {
						// optimize array search by deleting double
						let data: any[];
						try {
							data = (
								await axios.get(
									`${interaction.client.tokens.apiUrl}textures/${ids
										.filter((v, i, a) => a.indexOf(v) === i)
										.join(",")}`,
								)
							).data;
						} catch {}
						if (data) return data;
					}),
			)
		).flat();

		// merge the two objects by id
		const finalData = contributionData.map((contribution: Contribution) => ({
			...contribution,
			...textureData.find((val) => val?.id == contribution.texture),
		}));

		let packCount = {};
		let files: AttachmentBuilder[] | undefined;
		if (finalData.length) {
			const textBuf = Buffer.from(
				finalData
					.map((data: Contribution & Texture) => {
						const packName = formatName(data.pack)[0];
						packCount[packName] = (packCount[packName] ?? 0) + 1;
						return `${packName}: [#${data.texture}] ${data.name}`;
					})
					.join("\n"),
			);
			files = [new AttachmentBuilder(textBuf, { name: "about.txt" })];
		}

		const finalEmbed = new EmbedBuilder()
			.setTitle(
				`${user.displayName} has ${finalData.length} ${
					finalData.length == 1 ? "contribution" : "contributions"
				}!`,
			)
			.setDescription(
				Object.entries(packCount)
					.map((i) => i.join(": "))
					.join("\n"),
			);

		await interaction.editReply({ embeds: [finalEmbed], files: files });
	},
};
