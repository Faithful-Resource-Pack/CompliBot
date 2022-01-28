import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import ExtendedCmdInteraction from "@src/Client/commandInteraction";
import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";
import { string } from "@functions/string";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("help-us")
		.setDescription("Command to get infos on how to help the developers of CompliBot."),
	execute: async (interaction: ExtendedCmdInteraction, client: Client) => {
		const embed = new MessageEmbed()
			.setTitle(await string(interaction.locale, "Command.HelpUs.Title"))
			.setDescription(await string(interaction.locale, "Command.HelpUs.Description"))
			.setThumbnail(client.config.images + "question_mark.png");

		interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
