import { SlashCommand } from "@helpers/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "@client";
import fs from "fs";
import { MessageAttachment } from "discord.js";
import { Log } from "client/client";
import path from "path";

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
    const logTemplate = fs.readFileSync(path.join(__dirname + "../../../helpers/functions/errorHandler.log"), { encoding: "utf-8" });
    const template = logTemplate.match(new RegExp(/\%templateStart%([\s\S]*?)%templateEnd/))[1]; // get message template
    let logText = "";

    client.getAction().forEach((log: Log, index) => {
      logText += template
        .replace("%templateIndex%", index.toString())
        .replace("%templateType%", log.type)
        .replace("%templateCreatedTimestamp%", log.data.createdTimestamp.toString())
        .replace("%templateURL%", 
          log.data.url 
          || log.data.message?.url // interaction
          || "Unknown"
        )

        .replace("%templateChannelType%", log.data.channel.type)
        .replace("%templateContent%",
          log.data.content
          || log.data.customId // button
          || JSON.stringify(log.data.options._hoistedOptions) // interaction
          || "Unknown"
        )

    });

    const buffer = Buffer.from(logText, "utf8");
    const attachment = new MessageAttachment(buffer, "stack.log");

    await interaction.reply({ files: [attachment] }).catch(console.error);
  }
}