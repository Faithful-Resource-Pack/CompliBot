import { Colors } from '@enums';
import { ICommand } from '@interfaces';
import { EmbedBuilder } from '@overrides';
import { Images } from '@utils';
import { ChatInputCommandInteraction, CacheType, SlashCommandBuilder } from 'discord.js';

export default {
  config: () => ({
    ...JSON.configLoad('commands/coin.json'),
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('coin_command_name'))
    .setDescription(String.get('coin_command_description')),
  handler: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const float: number = Math.round(Math.random() * 100) / 100; // random number between 0 and 1

    const embed = new EmbedBuilder()
      .setColor(Colors.COIN)
      // eslint-disable-next-line no-nested-ternary
      .setTitle(String.get(`coin_command_result_${float === 0.5 ? 'edge' : float > 0.5 ? 'heads' : 'tails'}`, interaction.guildLocale))
      .setThumbnail(float === 0.5 ? 'https://c.tenor.com/y-5nnOLoWlUAAAAC/error-red-notification.gif' : Images.getAsEmbedThumbnail(`bot/coin_${float > 0.5 ? 'heads' : 'tails'}.png`));

    interaction.reply({ embeds: [embed] });
  },
} as ICommand;
