import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	servers: ["compliance", "compliance_extra", "classic_faithful"],
	data: new SlashCommandBuilder()
		.setName("license")
		.setDescription("Shows the license for Compliance Resources Packs."),
	execute: async (interaction: CommandInteraction) => {
		interaction
			.reply({ content: "https://www.compliancepack.net/license", fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
