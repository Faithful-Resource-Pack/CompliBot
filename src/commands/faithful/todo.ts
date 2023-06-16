import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("todo")
		.setDescription("Shows the to-do list for Faithful 32x."),
	execute: async (interaction: CommandInteraction) => {
		interaction
			.reply({ content: "https://docs.google.com/document/d/1OXGHKiYJej0qvNgZWfFuYauyL1OjpL31usgK4dwuIkI/", fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
