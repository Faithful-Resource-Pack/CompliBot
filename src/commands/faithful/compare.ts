import type { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";
import { Message } from "@client";
import compareTexture from "@functions/compareTexture";
import parseTextureName from "@functions/parseTextureName";
import { textureChoiceEmbed } from "@helpers/choiceEmbed";
import { imageTooBig } from "@helpers/warnUser";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("compare")
		.setDescription("Compare a given texture.")
		.addStringOption((option) =>
			option.setName("texture").setDescription("Texture name or ID to compare.").setRequired(true),
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
	async execute(interaction) {
		const display = interaction.options.getString("display", false) ?? "All";
		const name = interaction.options.getString("texture", true);

		// sometimes it takes too long otherwise
		await interaction.deferReply();
		const results = await parseTextureName(name, interaction);

		// no results or invalid search
		if (!results) return;

		// only one result
		if (results.length === 1) {
			const replyOptions = await compareTexture(interaction.client, results[0].id, display);
			if (!replyOptions) return imageTooBig(interaction);

			return interaction.editReply(replyOptions).then((message) => message.deleteButton());
		}

		// multiple results
		return textureChoiceEmbed(interaction, "compareSelect", results, display);
	},
};
