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
    ]
  },
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Say something with the bot")
    .addStringOption((option) => 
			option
				.setName("sentence")
				.setDescription("The funny thing you want the bot to say.")
				.setRequired(true),
    )
    ,
  execute: async (interaction: CommandInteraction, client: Client) => {
    interaction.reply({ content: '.', fetchReply: true }).then((message: Message) => message.delete())

    interaction.channel.send({ content: interaction.options.getString("sentence", true) });
    return;
  }
}