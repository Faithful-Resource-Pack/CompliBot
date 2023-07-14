import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "@client";
import guidelineJSON from "@json/guidelines.json";
import { colors } from "@helpers/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("discord")
		.setDescription("Shows a Faithful discord.")
		.addStringOption((option) =>
			option
				.setName("server")
				.setDescription("Which server you want to view.")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32x" },
					{ name: "Classic Faithful 32x", value: "classic_faithful_32x" },
					{ name: "All", value: "all" },
				)
				.setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		const choice = interaction.options.getString("server", true);
		let contents: string;
		switch (choice) {
			case "faithful_32x":
				contents = "https://discord.gg/sN9YRQbBv7";
				break;
			case "classic_faithful_32x":
				contents = "https://discord.gg/KSEhCVtg4J";
				break;
			case "all":
				if (await interaction.perms({ type: "manager" })) return;
				await interaction.reply({ content: "** **", ephemeral: true });
				return await interaction.channel.send({
					content: `### Faithful:\nhttps://discord.gg/sN9YRQbBv7\n### Classic Faithful:\nhttps://discord.gg/KSEhCVtg4J\n### Minecraft:\nhttps://discord.gg/minecraft`,
				});
		}

		await interaction.reply({ content: contents });
	},
};
