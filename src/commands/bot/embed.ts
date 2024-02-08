import type { SlashCommand } from "@interfaces/interactions";
import { EmbedBuilder } from "@client";
import { ColorResolvable, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("embed")
		.setDescription(`Create a one-time custom embed.`)
		.addStringOption((o) =>
			o.setName("title").setDescription("What title the embed should have.").setRequired(false),
		)
		.addStringOption((o) =>
			o
				.setName("description")
				.setDescription("What description the embed should have.")
				.setRequired(false),
		)
		.addStringOption((o) =>
			o
				.setName("colour")
				.setNameLocalization("en-US", "color")
				.setDescription("Set the colour on the side of the embed.")
				.setDescriptionLocalization("en-US", "Set the color on the side of the embed.")
				.setRequired(false),
		)
		.addStringOption((o) =>
			o.setName("footer").setDescription("Adds a footer to the embed").setRequired(false),
		)
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("Adds a main image to the embed").setRequired(false),
		)
		.addAttachmentOption((o) =>
			o
				.setName("thumbnail")
				.setDescription("Add a thumbnail to the top right corner of the embed")
				.setRequired(false),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction) {
		if (!interaction.options.getString("title") && !interaction.options.getString("description")) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().command.embed.not_enough_arguments)
						.setDescription(interaction.strings().command.embed.need_more_info)
						.setColor(colors.red),
				],
				ephemeral: true,
			});
		}

		await interaction.complete();

		const embed = new EmbedBuilder();

		// a lot of copy/paste but this is the best djs can do lol
		const title = interaction.options.getString("title", false);
		const description = interaction.options.getString("description", false);
		const baseColor = interaction.options.getString("color", false);
		const footer = interaction.options.getString("footer", false);
		const image = interaction.options.getAttachment("image", false)?.url;
		const thumbnail = interaction.options.getAttachment("thumbnail", false)?.url;

		if (title) embed.setTitle(title);
		if (description) embed.setDescription(description);
		if (baseColor) {
			let color = baseColor;
			if (!baseColor.startsWith("#")) embed.setColor(`#${color}`);
			embed.setColor(color as ColorResolvable);
		}
		if (footer) embed.setFooter({ text: footer });
		if (image) embed.setImage(image);
		if (thumbnail) embed.setThumbnail(thumbnail);

		return interaction.channel.send({ embeds: [embed] });
	},
};
