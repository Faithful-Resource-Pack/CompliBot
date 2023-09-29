import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { Client, ChatInputCommandInteraction, EmbedBuilder, Message } from "@client";
import textureComparison from "@functions/textureComparison";
import parseTextureName from "@functions/parseTextureName";
import { colors } from "@helpers/colors";
import { textureChoiceEmbed } from "@helpers/choiceEmbed";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("compare")
		.setDescription("Compare a given texture.")
		.addStringOption((option) =>
			option
				.setName("texture")
				.setDescription("Name or ID of the texture you want to compare.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("display")
				.setDescription("Which set of packs you want to display (default is everything).")
				.addChoices(
					{ name: "Faithful", value: "Faithful" },
					{ name: "Classic Faithful Jappa", value: "Classic Faithful Jappa" },
					{ name: "Classic Faithful Programmer Art", value: "Classic Faithful PA" },
					{ name: "Jappa", value: "Jappa" },
					{ name: "All", value: "All" },
				)
				.setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const display = interaction.options.getString("display", false) ?? "All";
		const name = interaction.options.getString("texture", true);

		// sometimes it takes too long otherwise
		await interaction.deferReply();
		const results = await parseTextureName(name, interaction);

		// returned early in parseTextureName()
		if (!results) return;

		if (!results.length) {
			// no results
			return interaction
				.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle("No results found!")
							.setDescription(
								interaction
									.strings()
									.Command.Texture.NotFound.replace("%TEXTURENAME%", `\`${name}\``),
							)
							.setColor(colors.red),
					],
				})
				.then((message: Message) => message.deleteButton());
		}

		// only one result
		if (results.length === 1) {
			const replyOptions = await textureComparison(
				interaction.client as Client,
				results[0].id,
				display,
			);

			return interaction.editReply(replyOptions).then((message: Message) => message.deleteButton());
		}

		// multiple results
		return await textureChoiceEmbed(interaction, "compareSelect", results, display);
	},
};
