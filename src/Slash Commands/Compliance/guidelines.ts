import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "@src/Client/interaction";
import Message from "@src/Client/message";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("guidelines")
		.setDescription("Shows the guidelines for the Compliance Resource Pack."),
	execute: async (interaction: CommandInteraction) => {
		interaction.reply({ content: "https://docs.compliancepack.net/pages/textures/texturing-guidelines" });
		const message: Message = (await interaction.fetchReply()) as Message;
		message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
	},
};
