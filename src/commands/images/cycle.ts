import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";
import { cycleComparison } from "@images/cycle";
import parseTextureName from "@functions/parseTextureName";
import { textureChoiceEmbed } from "@helpers/choiceEmbed";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("cycle")
		.setDescription("Cycle through each resolution of a given texture as a GIF.")
		.addStringOption((option) =>
			option
				.setName("texture")
				.setDescription("Name or ID of the texture you want to cycle through.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("packs")
				.setDescription("Which set of packs you want to display.")
				.addChoices(
					{ name: "Faithful", value: "faithful" },
					{ name: "Classic Faithful Jappa", value: "cfjappa" },
					{ name: "Classic Faithful Programmer Art", value: "cfpa" },
				)
				.setRequired(true),
		)
		.addNumberOption((option) =>
			option
				.setName("framerate")
				.setDescription("Seconds between each frame (default is 1).")
				.setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const display = interaction.options.getString("packs", true);
		const name = interaction.options.getString("texture", true);
		const framerate = interaction.options.getNumber("framerate", false) ?? 1;

		// sometimes it takes too long otherwise
		await interaction.deferReply();
		const results = await parseTextureName(name, interaction);

		// no results or invalid search
		if (!results) return;

		// only one result
		if (results.length === 1) {
			const replyOptions = await cycleComparison(
				interaction.client,
				results[0].id,
				display,
				framerate,
			);

			return interaction.editReply(replyOptions).then((message: Message) => message.deleteButton());
		}

		// multiple results
		return await textureChoiceEmbed(
			interaction,
			"cycleSelect",
			results,
			`${display}__${framerate}`, // storing multiple things in value
		);
	},
};
