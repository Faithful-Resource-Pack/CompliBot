import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("todo")
		.setDescription("Shows various project to-do lists.")
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("The to-do list you want to view")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Classic Faithful 32x Jappa", value: "classic_faithful_32x" },
				)
				.setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		let contents: string;
		const pack = interaction.options.getString("pack", true);
		switch (pack) {
			case "faithful_32x":
				contents =
					"https://docs.google.com/document/d/1OXGHKiYJej0qvNgZWfFuYauyL1OjpL31usgK4dwuIkI/";
				break;
			case "classic_faithful_32x":
				contents =
					"https://docs.google.com/document/d/1lw5EvJhVbubNPm3ZiOXAr8Aos9gCkmz-rh03uIMuqY0/";
				break;
		}

		interaction
			.reply({ content: contents, fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
