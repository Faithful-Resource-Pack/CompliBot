import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message } from '@client';

const command: SlashCommand = {
  servers: ['faithful', 'faithful_extra', 'classic_faithful'],
  data: new SlashCommandBuilder()
    .setName('guidelines')
    .setDescription('Shows the guidelines for the Faithful Resource Pack.'),
  execute: async (interaction: CommandInteraction) => {
    interaction
      .reply({
        content: 'https://docs.faithfulpack.net/pages/textures/texturing-guidelines',
        fetchReply: true,
      })
      .then((message: Message) => message.deleteButton());
  },
};

export default command;
