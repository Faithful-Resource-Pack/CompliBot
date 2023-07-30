import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageEmbed, CommandInteraction, Client } from "@client";
import { MessageAttachment } from "discord.js";
import axios from "axios";
import settings from "@json/dynamic/settings.json";
import { formatName } from "@helpers/sorter";

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
	execute: async (interaction: CommandInteraction) => {
		await interaction.deferReply();
		// used for loading times
		const baseDescription = "This can take some time, please wait...";

		const loadingEmbed = new MessageEmbed()
			.setTitle("Searching for contributions...")
			.setDescription(baseDescription)
			.setThumbnail(settings.images.loading);

		await interaction
			.editReply({ embeds: [loadingEmbed] })
			.then((message: Message) => message.deleteButton());

		// if nobody to search up is provided, defaults to the person who asked
		const user = interaction.options.getUser("user") ?? interaction.user;
		let userData: any;
		try {
			userData = (
				await axios.get(
					`${(interaction.client as Client).tokens.apiUrl}users/${user.id}/contributions`,
				)
			).data;
		} catch {
			const finalEmbed = new MessageEmbed()
				.setTitle(`${user.username} has no contributions!`)
				.setDescription(
					"No database profile was found for this user. If this data looks incorrect, register at https://webapp.faithfulpack.net.",
				);

			return await interaction.editReply({ embeds: [finalEmbed] });
		}

		let textureData = [];
		let i = 0;
		for (let data of Object.values(userData)) {
			try {
				const response = (
					await axios.get(
						`${(interaction.client as Client).tokens.apiUrl}textures/${(data as any).texture}`,
					)
				).data;
				textureData.push([data, response]);
				if (i % 10 == 0)
					// so it's not spamming message edits
					await interaction.editReply({
						embeds: [
							loadingEmbed.setDescription(
								`${baseDescription}\n${i} textures searched of ${userData.length} total.`,
							),
						],
					});
			} catch {
				/* texture doesn't exist so just skip it */
			}
			++i;
		}

		let packCount = {};
		let files: MessageAttachment[] | undefined;
		if (textureData.length) {
			const textBuf = Buffer.from(
				textureData
					.map((data) => {
						const packName = formatName(data[0].pack)[0];
						packCount[packName] = (packCount[packName] ?? 0) + 1;
						return `${packName}: [#${data[1].id}] ${data[1].name}`;
					})
					.join("\n"),
			);
			files = [new MessageAttachment(textBuf, "about.txt")];
		}

		const finalEmbed = new MessageEmbed()
			.setTitle(
				`${user.username} has ${userData.length} ${
					userData.length == 1 ? "contribution" : "contributions"
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