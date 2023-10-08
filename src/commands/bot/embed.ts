import { SlashCommand } from "@interfaces";
import { ChatInputCommandInteraction, EmbedBuilder, Message } from "@client";
import { ColorResolvable, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { colors } from "@helpers/colors";

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
				.setName("color")
				.setDescription("Set the color on the side of the embed.")
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
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.options.getString("title") && !interaction.options.getString("description")) {
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().command.embed.not_enough_arguments)
						.setDescription(interaction.strings().command.embed.need_more_info)
						.setColor(colors.red),
				],
				ephemeral: true,
			});
		}

		// complete interaction so there's no status errors on the client end
		interaction
			.reply({ content: "** **", fetchReply: true })
			.then((message: Message) => message.delete());

		const embed = new EmbedBuilder();

		// a lot of copy/paste but this is the best djs can do lol
		const title = interaction.options.getString("title", false);
		const description = interaction.options.getString("description", false);
		const color = interaction.options.getString("color", false);
		const footer = interaction.options.getString("footer", false);
		const image = interaction.options.getAttachment("image", false)?.url;
		const thumbnail = interaction.options.getAttachment("thumbnail", false)?.url;

		if (title) embed.setTitle(title);
		if (description) embed.setDescription(description);
		if (color) embed.setColor(color as ColorResolvable);
		if (footer) embed.setFooter({ text: footer });
		if (image) embed.setImage(image);
		if (thumbnail) embed.setThumbnail(thumbnail);

		return await interaction.channel.send({ embeds: [embed] });
	},
};
