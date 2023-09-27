import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("license")
		.setDescription("Shows the license for the Faithful Resource Pack."),
	async execute(interaction: ChatInputCommandInteraction) {
		interaction
			.reply({ content: "https://www.faithfulpack.net/license", fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
