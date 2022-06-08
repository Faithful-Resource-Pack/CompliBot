import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton } from 'discord.js';
import { ids, parseId } from '@helpers/emojis';
import { MessageEmbed, CommandInteraction } from '@client';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Submits bot feedback to the developers.')
    .addStringOption((option) => option.setName('message').setDescription('The message you wish to send').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const embedPreview = new MessageEmbed()
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.avatarURL(),
      })
      .setTitle(await interaction.getString({ string: 'Command.Feedback.Preview' }))
      .setDescription(interaction.options.getString('message'))
      .setTimestamp()
      .setFooter({ text: await interaction.getString({ string: 'Command.Feedback.ConfirmPrompt' }) });

    const btnCancel = new MessageButton()
      .setStyle('DANGER')
      .setEmoji(parseId(ids.delete))
      .setCustomId('feedbackCancel');

    const btnBug = new MessageButton()
      .setLabel(await interaction.getString({ string: 'Command.Feedback.Bug' }))
      .setStyle('PRIMARY')
      .setEmoji(parseId(ids.bug))
      .setCustomId('feedbackBug');

    const btnSuggestion = new MessageButton()
      .setLabel(await interaction.getString({ string: 'Command.Feedback.Suggestion' }))
      .setStyle('PRIMARY')
      .setEmoji(parseId(ids.suggestion))
      .setCustomId('feedbackSuggestion');

    const buttons = new MessageActionRow().addComponents([btnCancel, btnBug, btnSuggestion]);

    return interaction.reply({
      components: [buttons],
      embeds: [embedPreview],
    });
  },
};

export default command;
