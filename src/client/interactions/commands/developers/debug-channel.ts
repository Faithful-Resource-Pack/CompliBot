import { Client } from '@client';
import { ICommand } from '@interfaces';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';
import {
  ChannelType,
  channelMention,
  TextChannel,
} from 'discord.js';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('debug_channel_command_name'))
    .setDescriptions(String.getAll('debug_channel_command_description'))
    .addLocalizedChannelOption((channel) => channel
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true), {
      names: String.getAll('debug_channel_command_channel_argument_name'),
      descriptions: String.getAll('debug_channel_command_channel_argument_description'),
    }),
  handler: async (interaction: ChatInputCommandInteraction, client: Client) => {
    const channel = interaction.options.getChannel('channel', true) as TextChannel;
    client.setSettings('debugChannel', channel.id);

    interaction.replyDeletable({ content: String.get('debug_channel_command_set_success', interaction.locale, { keys: { CHANNEL: channelMention(channel.id) } }), ephemeral: true });
    return Promise.resolve();
  },
} as ICommand;
