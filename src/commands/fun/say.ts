import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Client, Message } from "@client";
import { PermissionFlagsBits } from "discord-api-types/v10";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("say")
		.setDescription("Say something with the bot")
		.addStringOption((option) =>
			option
				.setName("sentence")
				.setDescription("The funny thing you want the bot to say.")
				.setRequired(true),
		).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: async (interaction: CommandInteraction, client: Client) => {
		if (!interaction.hasPermission("dev")) return;

		interaction
			.reply({ content: "** **", fetchReply: true })
			.then((message: Message) => message.delete());

		interaction.channel.send({ content: interaction.options.getString("sentence", true) });
		return;
	},
};
