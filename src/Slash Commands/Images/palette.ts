import { SlashCommand } from "@interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { generalSlashCommandImage } from "@functions/slashCommandImage";
import { MessageEmbed } from "@src/Extended Discord";
import { paletteAttachment } from "@functions/canvas/palette";

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("palette")
    .setDescription("Get colors palette of an image"),
  execute: async (interaction: CommandInteraction) => {
    generalSlashCommandImage(interaction, paletteAttachment, {
      factor: interaction.options.getNumber("factor"),
      name: "magnified.png",
      embed: new MessageEmbed()
        .setTitle("Magnified")
        .setImage("attachment://magnified.png")
    })
  }
}