import type { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";
import { Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("guidelines")
		.setDescription("Shows various Faithful texturing guidelines.")
		.addStringOption((option) =>
			option
				.setName("pack")
				.setDescription("The guidelines you want to view")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Faithful 64x", value: "faithful_64x" },
					{ name: "Classic Faithful 32x", value: "classic_faithful_32x" },
				)
				.setRequired(true),
		),
	async execute(interaction) {
		const pack = interaction.options.getString("pack");

		const guidelines = {
			faithful_32x: "https://docs.faithfulpack.net/pages/textures/f32-texturing-guidelines",
			faithful_64x: "https://docs.faithfulpack.net/pages/textures/f64-texturing-guidelines",
			classic_faithful_32x:
				"https://docs.faithfulpack.net/pages/textures/cf32-texturing-guidelines",
		};

		interaction
			.reply({ content: guidelines[pack], fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
