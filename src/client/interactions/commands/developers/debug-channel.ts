import { Client } from '@client';
import { ICommand } from '@interfaces';
import { ChatInputCommandInteraction } from '@overrides';
import {
  SlashCommandBuilder,
  ChannelType,
  channelMention,
  TextChannel,
} from 'discord.js';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('debug_channel_command_name'))
    .setDescription(String.get('debug_channel_command_description'))
    .addChannelOption((channel) => channel
      .setName(String.get('debug_channel_command_channel_argument_name'))
      .setDescription(String.get('debug_channel_command_channel_argument_description'))
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)),
  handler: async (interaction: ChatInputCommandInteraction, client: Client) => {
    const channel = interaction.options.getChannel('channel', true) as TextChannel;
    client.setSettings('debugChannel', channel.id);

    interaction.replyDeletable({ content: String.get('debug_channel_command_set_success', interaction.locale, { keys: { CHANNEL: channelMention(channel.id) } }), ephemeral: true });
    return Promise.resolve();
  },
} as ICommand;
