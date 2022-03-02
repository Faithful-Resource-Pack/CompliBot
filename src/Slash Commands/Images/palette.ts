import { SlashCommand } from "@interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const command: SlashCommand = {
  permissions: undefined,
  data: new SlashCommandBuilder()
    .setName("palette")
    .setDescription("Get colors palette of an image"),
  execute: async (interaction: CommandInteraction) => {
   return;
  }
}