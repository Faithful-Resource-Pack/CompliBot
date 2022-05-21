import { SlashCommand } from '@interfaces';
import { Client, CommandInteraction, Message, MessageEmbed } from '@client';
import { SlashCommandBuilder } from '@discordjs/builders';
import { generalSlashCommandImage } from '@functions/slashCommandImage';
import { mcColorsOptions, multiplyAttachment } from '@functions/canvas/multiply';
export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('tint')
    .setDescription(`Tint a grayscale image to a minecraft color`)
    .addStringOption((option) =>
      option
        .setName('color')
        .setDescription('The color to tint the grayscale image to')
        .addChoices(...mcColorsOptions)
        .setRequired(true),
    )
    .addAttachmentOption((o) => o.setName('image').setDescription('The image to tint').setRequired(false)),
  execute: async (interaction: CommandInteraction, client: Client) => {
    generalSlashCommandImage(interaction, multiplyAttachment, {
      color: interaction.options.getString('color'),
      name: 'tinted.png',
      embed: new MessageEmbed().setTitle('Tinted').setImage('attachment://tinted.png'),
    });
  },
};
