import { SlashCommand } from "@helpers/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "@client";
import fs from "fs";
import { MessageAttachment } from "discord.js";
import { Log } from "client/client";
import path from "path";
import { logConstructor } from "@functions/errorHandler";

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
    .setName("logs")
    .setDescription("Get logs of the bot.")
    .setDefaultPermission(false),
  execute: async (interaction: CommandInteraction, client: Client) => {
    await interaction.reply({ files: [logConstructor(client)] }).catch(console.error);
  }
}