import { SlashCommand } from "@helpers/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("license")
		.setDescription("Shows the license for Compliance Resources Packs."),
	execute: async (interaction: CommandInteraction) => {
		interaction
			.reply({ content: "https://www.compliancepack.net/license", fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
