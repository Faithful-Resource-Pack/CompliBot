import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { media } from "@helpers/infoembed";
import { Message, EmbedBuilder, ChatInputCommandInteraction, Client } from "@client";
import axios from "axios";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("media")
		.setDescription("Displays all sites for the given resource pack.")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Name of the resource pack you want to see the sites of.")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Faithful 64x", value: "faithful_64x" },
					{ name: "Classic Faithful 32x Jappa", value: "classic_faithful_32x" },
					{ name: "Classic Faithful 32x Programmer Art", value: "classic_faithful_32x_progart" },
					{ name: "Classic Faithful 64x", value: "classic_faithful_64x" },
					{ name: "All", value: "default" },
				),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const key = interaction.options.getString("name", false) ?? "default";

		// you can't import images directly in infoembed.ts so you have to do it here (blame TS)
		const images: { [name: string]: string } = (
			await axios.get(`${(interaction.client as Client).tokens.apiUrl}settings/images`)
		).data;

		if (key === "default") {
			if (!interaction.hasPermission("manager")) return;
			interaction
				.reply({ content: "** **", fetchReply: true })
				.then((message: Message) => message.delete());

			return await interaction.channel.send({
				embeds: Object.entries(media).map(([key, mediaInfo]) =>
					new EmbedBuilder()
						.setTitle(mediaInfo.title)
						.setDescription(mediaInfo.description)
						.setColor(mediaInfo.color)
						.setThumbnail(images[key]),
				),
			});
		}

		const embed = new EmbedBuilder()
			.setTitle(media[key].title)
			.setDescription(media[key].description)
			.setColor(media[key].color)
			.setThumbnail(images[key]);

		interaction
			.reply({ embeds: [embed], fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
