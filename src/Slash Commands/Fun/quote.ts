import { SlashCommand } from "~/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import MessageEmbed from '~/Client/embed';
import Client from '~/Client';
import get from 'axios';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Truely inspiring.")
  ,
  execute: async (interaction: CommandInteraction, client: Client) => {
    let image = await get('https://inspirobot.me/api?generate=true');
    let embed = new MessageEmbed()
    embed.setImage(image.data);

    interaction.reply({ embeds: [embed] });
  }
}