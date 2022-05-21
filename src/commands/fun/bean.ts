import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Client, MessageEmbed } from '@client';
import { colors } from '@helpers/colors';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('bean')
    .setDescription('Bean him at once!')
    .addUserOption((option) => option.setName('user').setDescription('User you want to bean').setRequired(true)),
  execute: async (interaction: CommandInteraction, client: Client) => {
    if (
      await interaction.perms({
        type: 'mod',
      })
    )
      return;

    const embed = new MessageEmbed()
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.avatarURL(),
      })
      .setDescription(`<@${interaction.options.getUser('user').id}> has bean beaned!`)
      .setColor(colors.red);
    interaction.reply({
      embeds: [embed],
    });
  },
};
