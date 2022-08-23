import { ICommand } from '@interfaces';
import { Images } from '@utils';
import { ChatInputCommandInteraction, EmbedBuilder } from '@overrides';
import { SlashCommandBuilder, userMention } from 'discord.js';

export default {
  config: () => ({
    ...JSON.configLoad('commands/help-us.json'),
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('help_us_command_name'))
    .setDescription(String.get('help_us_command_description')),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
      .setTitle(String.get('help_us_embed_title', interaction.locale))
      .setDescription(String.get('help_us_embed_description', interaction.locale, {
        keys: {
          ROBERT: userMention('473860522710794250'),
          JUKNUM: userMention('207471947662098432'),
          THEROLF: userMention('173336582265241601'),
          NICK: userMention('601501288978448411'),
          REPO_URL: 'https://github.com/Faithful-Resource-Pack/Discord-Bot',
        },
      }))
      .setThumbnail(Images.getAsEmbedThumbnail('bot/question_mark.png'));

    interaction.replyDeletable({ embeds: [embed], ephemeral: true });
  },
} as ICommand;
