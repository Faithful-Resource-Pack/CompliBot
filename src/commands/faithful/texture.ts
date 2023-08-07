import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, Message } from "@client";
import { MessageSelectOptionData } from "discord.js";
import { getTextureMessageOptions } from "@functions/getTexture";
import { minecraftSorter } from "@helpers/sorter";
import parseTextureName from "@functions/parseTextureName";
import { colors } from "@helpers/colors";
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
	execute: async (interaction: CommandInteraction) => {
		const name = interaction.options.getString("name");

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
						new MessageEmbed()
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

		// only 1 result
		if (results.length === 1) {
			const replyOptions = await getTextureMessageOptions({
				texture: results[0],
				pack: interaction.options.getString("pack", true),
				guild: interaction.guild,
			});
			return interaction.editReply(replyOptions).then((message: Message) => message.deleteButton());
		}

		// multiple results
		return await textureChoiceEmbed(
			interaction,
			"textureSelect",
			results,
			interaction.options.getString("pack"),
		);
	},
};
