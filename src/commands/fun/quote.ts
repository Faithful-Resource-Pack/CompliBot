import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, Message } from '@client';
import axios from 'axios';

const command: SlashCommand = {
  data: new SlashCommandBuilder().setName('quote').setDescription('Truly inspiring.'),
  execute: async (interaction: CommandInteraction) => {
    const image = await axios.get('https://inspirobot.me/api?generate=true');
    const embed = new MessageEmbed();
    embed.setImage(image.data);

    interaction
      .reply({
        embeds: [embed],
        fetchReply: true,
      })
      .then((message: Message) => message.deleteButton());
  },
};

export default command;
