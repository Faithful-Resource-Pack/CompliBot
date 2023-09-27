import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message, EmbedBuilder } from "@client";

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
	async execute(interaction: ChatInputCommandInteraction) {
		const choice = interaction.options.getString("server", true);
		let contents: string;
		switch (choice) {
			case "faithful":
				contents = "https://discord.gg/sN9YRQbBv7";
				break;
			case "classic_faithful":
				contents = "https://discord.gg/KSEhCVtg4J";
				break;
			case "all":
				if (!interaction.hasPermission("manager")) return;
				await interaction
					.reply({ content: "** **", fetchReply: true })
					.then((message: Message) => message.delete());

				return await interaction.channel.send({
					content: `### Faithful:\nhttps://discord.gg/sN9YRQbBv7\n### Classic Faithful:\nhttps://discord.gg/KSEhCVtg4J\n### Minecraft:\nhttps://discord.gg/minecraft`,
				});
		}

		await interaction.reply({ content: contents });
	},
};
