import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("help-us")
		.setDescription("Get information on how to help the developers of CompliBot."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const embed = new MessageEmbed()
			.setTitle(await interaction.getEphemeralString({ string: "Command.HelpUs.Title" }))
			.setDescription(
				await interaction.getEphemeralString({ string: "Command.HelpUs.Description" }),
			)
			.setThumbnail(client.config.images + "bot/question_mark.png");

		interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
