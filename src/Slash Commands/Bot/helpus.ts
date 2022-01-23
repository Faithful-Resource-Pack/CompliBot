import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("help-us")
		.setDescription("Command to get infos on how to help the developers of CompliBot."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		const embed = new MessageEmbed()
			.setTitle("Do you want to help or support us in the CompliBot development?")
			.setDescription(
				"You love this project and you want to help the developers?\nPlease contact one of the developers below to be invited to the development servers:\n<@!473860522710794250>, <@!207471947662098432>, <@!173336582265241601>, <@!601501288978448411>\n\nYou can also check us out on GitHub:\n> https://github.com/Compliance-Resource-Pack/Discord-Bot",
			)
			.setThumbnail(client.config.images + "question_mark.png");

		interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
