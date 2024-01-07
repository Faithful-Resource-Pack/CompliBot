import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";
import textureComparison from "@functions/textureComparison";
import parseTextureName from "@functions/parseTextureName";
import { textureChoiceEmbed } from "@helpers/choiceEmbed";
import { imageTooBig } from "@helpers/warnUser";

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
					{ name: "Classic Faithful", value: "Classic Faithful" },
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

		// no results or invalid search
		if (!results) return;

		// only one result
		if (results.length === 1) {
			const replyOptions = await textureComparison(interaction.client, results[0].id, display);
			if (!replyOptions) {
				await interaction.deleteReply();
				return imageTooBig(interaction);
			}

			return interaction.editReply(replyOptions).then((message: Message) => message.deleteButton());
		}

		// multiple results
		return textureChoiceEmbed(interaction, "compareSelect", results, display);
	},
};
