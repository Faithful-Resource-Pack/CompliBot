import Magnify from '@class/Magnify';
import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from '@client';
import { fetchMessageImage } from '@functions/slashCommandImage';
import { MessageAttachment } from 'discord.js';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('magnify')
    .setDescription('Magnify an image.')
    .addAttachmentOption((o) => o.setName('image').setDescription('The image to magnify').setRequired(false))
    .addNumberOption((num) => num
      .addChoices(
        {
          name: '0.25x',
          value: 0.25,
        },
        {
          name: '0.5x',
          value: 0.5,
        },
        {
          name: '2x',
          value: 2,
        },
        {
          name: '4x',
          value: 4,
        },
        {
          name: '8x',
          value: 8,
        },
        {
          name: '16x',
          value: 16,
        },
        {
          name: '32x',
          value: 32,
        },
      )
      .setName('factor')
      .setDescription('The scale factor the image should be enlarged by.')
      .setRequired(false)),
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();

    const imageURL = interaction.options.getAttachment('image', false)?.url || await fetchMessageImage(interaction, 10, { doInteraction: true, user: interaction.user });
    const attachment: MessageAttachment | string = await (new Magnify({ textureURL: imageURL, factor: interaction.options.getNumber('factor', false) as any })).getAsAttachment();

    if (typeof attachment === 'string') {
      interaction.deleteReply();
      return interaction.followUp({
        content: attachment,
        ephemeral: true,
      });
    }

    return interaction.editReply({
      files: [attachment],
      embeds: [new MessageEmbed().setTitle('Magnified').setImage('attachment://magnified.png')],
    });
  },
};

export default command;
