import { SlashCommand } from "@interfaces/commands";
import { FaithfulPack } from "@interfaces/firestorm";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";
import { getTexture } from "@functions/getTexture";
import parseTextureName from "@functions/parseTextureName";
import { textureChoiceEmbed } from "@helpers/choiceEmbed";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("texture")
		.setDescription("Displays a specified texture from either vanilla Minecraft or Faithful.")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Name or ID of the texture you are searching for.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("Resource pack of the texture you are searching for.")
				.addChoices(
					{ name: "Default Jappa", value: "default" },
					{ name: "Default Programmer Art", value: "progart" },
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Faithful 64x", value: "faithful_64x" },
					{ name: "Classic Faithful 32x Jappa", value: "classic_faithful_32x" },
					{ name: "Classic Faithful 32x Programmer Art", value: "classic_faithful_32x_progart" },
					{ name: "Classic Faithful 64x", value: "classic_faithful_64x" },
				)
				.setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const name = interaction.options.getString("name");

		// fetching takes too long for big results
		await interaction.deferReply();
		const results = await parseTextureName(name, interaction);

		// no results or invalid search
		if (!results) return;

		// only one result
		if (results.length === 1) {
			const replyOptions = await getTexture(
				interaction,
				results[0],
				interaction.options.getString("pack", true) as FaithfulPack,
			);

			// no results found
			if (!replyOptions.files) return interaction.ephemeralReply(replyOptions);

			return interaction.editReply(replyOptions).then((message: Message) => message.deleteButton());
		}

		// multiple results
		return textureChoiceEmbed(
			interaction,
			"textureSelect",
			results,
			interaction.options.getString("pack", true),
		);
	},
};
