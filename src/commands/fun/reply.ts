import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("reply")
		.setDescription("Say something with the bot")
		.addStringOption((option) =>
			option
				.setName("message")
				.setDescription("The funny thing you want the bot to say.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("reply").setDescription("Message ID to reply to").setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.hasPermission("dev")) return;

		let msg: Message;
		try {
			msg = await interaction.channel.messages.fetch(interaction.options.getString("reply"));
		} catch {
			return interaction.reply({
				content: interaction.strings().error.not_found.replace("%THING%", "Message"),
				ephemeral: true,
			});
		} // message can't be fetched

		await interaction.complete();

		msg.reply({ content: interaction.options.getString("message", true) });
	},
};
