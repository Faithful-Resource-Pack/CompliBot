import { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";
import { Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("discord")
		.setDescription("Shows a Faithful discord.")
		.addStringOption((option) =>
			option
				.setName("server")
				.setDescription("Which server you want to view.")
				.addChoices(
					{ name: "Faithful", value: "faithful" },
					{ name: "Classic Faithful", value: "classic_faithful" },
					{ name: "All", value: "all" },
				)
				.setRequired(true),
		),
	async execute(interaction) {
		const choice = interaction.options.getString("server", true);
		let content: string;
		switch (choice) {
			case "faithful":
				content = "https://discord.gg/sN9YRQbBv7";
				break;
			case "classic_faithful":
				content = "https://discord.gg/KSEhCVtg4J";
				break;
			case "all":
				if (!interaction.hasPermission("manager")) return;
				await interaction.complete();

				return interaction.channel.send({
					content: `### Faithful:\nhttps://discord.gg/sN9YRQbBv7\n### Classic Faithful:\nhttps://discord.gg/KSEhCVtg4J\n### Minecraft:\nhttps://discord.gg/minecraft`,
				});
		}

		await interaction.reply({ content });
	},
};
