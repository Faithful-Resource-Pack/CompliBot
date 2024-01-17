import { SlashCommand } from "@interfaces/commands";
import { Pack } from "@interfaces/firestorm";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message, Client } from "@client";
import { getTexture } from "@functions/getTexture";
import parseTextureName from "@functions/parseTextureName";
import { textureChoiceEmbed } from "@helpers/choiceEmbed";
import axios from "axios";

export const command: SlashCommand = {
	async data(client: Client) {
		const packs: Record<string, Pack> = (await axios.get(`${client.tokens.apiUrl}packs/raw`)).data;
		return new SlashCommandBuilder()
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
					.addChoices(...Object.values(packs).map((v) => ({ name: v.name, value: v.id })))
					.setRequired(true),
			);
	},
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
				interaction.options.getString("pack", true),
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
