import { SlashCommand } from "@helpers/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "@client";
import fs from "fs";
import { MessageAttachment } from "discord.js";
import { Log } from "client/client";
import path from "path";
import { logConstructor } from "@functions/errorHandler";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("logs").setDescription("Get logs of the bot."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		if (
			await interaction.perms({
				type: "dev",
			})
		)
			return;

		await interaction.reply({ files: [logConstructor(client)] }).catch(console.error);
	},
};
