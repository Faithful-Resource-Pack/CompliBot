import { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { EmbedBuilder, Message } from "@client";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("shutdown")
		.setDescription("Shuts down the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction) {
		if (!interaction.hasPermission("dev", false)) {
			return interaction
				.reply({
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: "Member banned",
								iconURL:
									"https://raw.githubusercontent.com/Faithful-Resource-Pack/Branding/main/role%20icons/5%20-%20Moderator.png",
							})
							.setDescription(`<@${interaction.user.id}> has been banned`)
							.addFields({ name: "Reason", value: "trying to stop me lmao" })
							.setColor(colors.red),
					],
					fetchReply: true,
				})
				.then((message: Message) => message.deleteButton());
		}
		await interaction.reply({
			embeds: [new EmbedBuilder().setTitle("Shutting down...")],
		});
		return process.exit();
	},
};
