import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
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
					{ name: "Faithful", value: "faithful" },
					{ name: "Classic Faithful Jappa", value: "cfjappa" },
					{ name: "Classic Faithful Programmer Art", value: "cfpa" },
					{ name: "Jappa", value: "jappa" },
					{ name: "All", value: "all" },
				)
				.setRequired(false),
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const display = interaction.options.getString("display", false) ?? "all";
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
								await interaction.getEphemeralString({
									string: "Command.Texture.NotFound",
									placeholders: { TEXTURENAME: `\`${name}\`` },
								}),
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
