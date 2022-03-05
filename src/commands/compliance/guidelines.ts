import { SlashCommand } from "@helpers/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("guidelines")
		.setDescription("Shows the guidelines for the Compliance Resource Pack."),
	execute: async (interaction: CommandInteraction) => {
		interaction
			.reply({ content: "https://docs.compliancepack.net/pages/textures/texturing-guidelines", fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
