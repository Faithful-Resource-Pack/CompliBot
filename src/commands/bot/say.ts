import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Client, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setDefaultPermission(false)
		.setName("say")
		.setDescription("Say something with the bot")
		.addStringOption((option) =>
			option.setName("sentence").setDescription("The funny thing you want the bot to say.").setRequired(true),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		if (
			await interaction.perms({
				users: ["207471947662098432", "173336582265241601", "601501288978448411", "473860522710794250"],
			})
		)
			return;

		interaction.reply({ content: ".", fetchReply: true }).then((message: Message) => message.delete());

		interaction.channel.send({ content: interaction.options.getString("sentence", true) });
		return;
	},
};
