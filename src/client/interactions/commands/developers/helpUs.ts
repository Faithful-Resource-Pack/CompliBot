import { ICommand } from '@interfaces';
import { Images, Strings } from '@utils';
import { EmbedBuilder } from '@overrides';
import {
  SlashCommandBuilder, ChatInputCommandInteraction, CacheType, userMention,
} from 'discord.js';

export default {
  config: () => ({
    ...JSON.configLoad('commands/help-us.json'),
  }),
  data: new SlashCommandBuilder()
    .setName(Strings.get('help_us_command_name'))
    .setDescription(Strings.get('help_us_command_description')),
  handler: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const embed = new EmbedBuilder()
      .setTitle(Strings.get('help_us_embed_title', interaction.locale))
      .setDescription(Strings.get('help_us_embed_description', interaction.locale, {
        keys: {
          ROBERT: userMention('473860522710794250'),
          JUKNUM: userMention('207471947662098432'),
          THEROLF: userMention('173336582265241601'),
          NICK: userMention('601501288978448411'),
          REPO_URL: 'https://github.com/Faithful-Resource-Pack/Discord-Bot',
        },
      }))
      .setThumbnail(Images.get('bot/question_mark.png'));

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
} as ICommand;
