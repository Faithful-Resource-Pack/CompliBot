import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "@src/Client/interaction";
import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("help-us")
		.setDescription("Command to get infos on how to help the developers of CompliBot."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const embed = new MessageEmbed()
			.setTitle(await interaction.text({ string: "Command.HelpUs.Title" }))
			.setDescription(await interaction.text({ string: "Command.HelpUs.Description" }))
			.setThumbnail(client.config.images + "question_mark.png");

		interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
