import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Client, Message } from "@client";

export const command: SlashCommand = {
	permissions: {
		users: [
			"207471947662098432", // Juknum
			"173336582265241601", // TheRolf
			"473860522710794250", // RobertR11
			"601501288978448411", // Nick
		],
	},
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
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		return interaction.reply({
			content:
				"This command is temporarily disabled! (complain to Discord for breaking slash command permissions)",
			ephemeral: true,
		});

		let msg: Message;
		try {
			msg = (await interaction.channel.messages.fetch(
				interaction.options.getString("message"),
			)) as Message;
		} catch {
			return interaction.reply({ content: "Message can't be fetched!", ephemeral: true });
		} // message can't be fetched

		interaction
			.reply({ content: ".", fetchReply: true })
			.then((message: Message) => message.delete());
		msg.reply({ content: interaction.options.getString("sentence", true) });
	},
};
