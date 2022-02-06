import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@src/Extended Discord";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("guidelines")
		.setDescription("Shows the guidelines for the Compliance Resource Pack."),
	execute: async (interaction: CommandInteraction) => {
		interaction
			.reply({ content: "https://docs.compliancepack.net/pages/textures/texturing-guidelines", fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
