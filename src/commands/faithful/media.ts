import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder } from "discord.js";
import { media } from "@utility/infoembed";
import { Message, EmbedBuilder, ChatInputCommandInteraction } from "@client";
import axios from "axios";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("media")
		.setDescription("Displays all listings for the given resource pack or generally useful links.")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Name of the resource pack you want to see the listings of.")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Faithful 64x", value: "faithful_64x" },
					{ name: "Classic Faithful 32x Jappa", value: "classic_faithful_32x" },
					{ name: "Classic Faithful 32x Programmer Art", value: "classic_faithful_32x_progart" },
					{ name: "Classic Faithful 64x", value: "classic_faithful_64x" },
					{ name: "All", value: "all" },
				),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const key = interaction.options.getString("name", false) ?? "default";

		// you can't import images directly in infoembed.ts so you have to do it here (blame TS)
		const images: Record<string, string> = (
			await axios.get(`${interaction.client.tokens.apiUrl}settings/images`)
		).data;

		if (key === "all") {
			if (!interaction.hasPermission("manager")) return;
			await interaction.complete();

			return interaction.channel.send({
				embeds: Object.entries(media).map(
					([key, mediaInfo]) =>
						new EmbedBuilder()
							.setTitle(mediaInfo.title)
							.setDescription(mediaInfo.description)
							.setColor(colors[key] ?? colors.brand)
							.setThumbnail(images[key == "default" ? "plain" : key]), // "default" is already used
				),
			});
		}

		const embed = new EmbedBuilder()
			.setTitle(media[key].title)
			.setDescription(media[key].description)
			.setColor(colors[key] ?? colors.brand)
			.setThumbnail(images[key == "default" ? "plain" : key]);

		interaction
			.reply({ embeds: [embed], fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
