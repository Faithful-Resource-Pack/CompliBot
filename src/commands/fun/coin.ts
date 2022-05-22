import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, MessageEmbed } from '@client';
import { colors } from '@helpers/colors';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('Flip a coin. Will it be heads? Will it be tails? Who knows?'),
  execute: async (interaction: CommandInteraction) => {
    const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places;

    const embed = new MessageEmbed()
      .setColor(colors.coin);

    if (res !== 0.5) {
      embed
        .setTitle(await interaction.getEphemeralString({ string: res > 0.5 ? 'Command.Coin.Heads' : 'Command.Coin.Tails' }))
        .setThumbnail(res > 0.5 ? 'https://database.faithfulpack.net/images/bot/coin_heads.png' : 'https://database.faithfulpack.net/images/bot/coin_tails.png');
    } else {
      embed
        .setTitle(await interaction.getEphemeralString({ string: 'Command.Coin.Edge' }))
        .setThumbnail('https://database.faithfulpack.net/images/bot/coin_edge.png');
    }

    interaction
      .reply({
        embeds: [embed],
        fetchReply: true,
      })
      .then((message: Message) => message.deleteButton());
  },
};

export default command;
