import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { Client, Message } from "@client";
import { PermissionFlagsBits } from "discord-api-types/v10";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("reply")
		.setDescription("Say something with the bot")
		.addStringOption((option) =>
			option
				.setName("sentence")
				.setDescription("The funny thing you want the bot to say.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("message").setDescription("Message ID to reply to").setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
		if (!interaction.hasPermission("dev")) return;

		let msg: Message;
		try {
			msg = (await interaction.channel.messages.fetch(
				interaction.options.getString("message"),
			)) as Message;
		} catch {
			return interaction.reply({ content: "Message can't be fetched!", ephemeral: true });
		} // message can't be fetched

		interaction
			.reply({ content: "** **", fetchReply: true })
			.then((message: Message) => message.delete());

		msg.reply({ content: interaction.options.getString("sentence", true) });
	},
};
