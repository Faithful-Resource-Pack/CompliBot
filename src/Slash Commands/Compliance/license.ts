import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@src/Extended Discord";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("license")
		.setDescription("Shows the license for Compliance Resources Packs."),
	execute: async (interaction: CommandInteraction) => {
		interaction
			.reply({ content: "https://www.compliancepack.net/license", fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
