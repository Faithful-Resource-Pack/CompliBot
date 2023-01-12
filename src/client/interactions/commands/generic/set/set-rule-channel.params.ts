import { IGuilds, IRule } from '@interfaces';
import { EmbedBuilder } from '@overrides';
import { ChatInputCommandInteraction, time } from 'discord.js';

export default async (interaction: ChatInputCommandInteraction) => {
  const channelId = interaction.options.getChannel(String.get('set_subcommand_rule_channel_channel_argument_name'), true).id;
  const changelog = interaction.options.getString(String.get('set_subcommand_rule_channel_changelog_argument_name'), false);
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  let { rules } = guilds.guilds[guildId];
  const { color } = guilds.guilds[guildId];

  if (rules === undefined) rules = { channel: channelId };
  else rules.channel = channelId;

  guilds.guilds[guildId].rules = rules;
  JSON.configSave('guilds.json', guilds);

  const channel = interaction.guild?.channels.cache.get(channelId);

  // Re-check if the channel exist (cache can be outdated)
  if (channel === undefined) {
    interaction.reply({ content: String.get('errors_channel_not_found', interaction.guildLocale, { keys: { CHANNEL: `\`${channelId}\`` } }), ephemeral: true });
    return;
  }

  // Check if the channel is a text channel & not DMs
  if (!channel.isTextBased() || channel.isDMBased()) {
    interaction.reply({ content: String.get('errors_channel_not_text_channel', interaction.guildLocale, { keys: { CHANNEL: `\`${channelId}\`` } }), ephemeral: true });
    return;
  }
  // Check if we can send messages in the channel
  if (!channel.permissionsFor(channel.guild.members.me!).has('SendMessages', false)) {
    interaction.reply({ content: String.get('errors_channel_no_send_messages_permission', interaction.guildLocale, { keys: { CHANNEL: `\`${channelId}\`` } }), ephemeral: true });
    return;
  }

  if (rules.header !== undefined) {
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(rules.header.title)
          .setDescription(rules.header.description)
          .setColor(color ?? null)
          .setThumbnail(rules.header.thumbnail ?? null)
          .setFooter(null),
      ],
    });
  }

  Object.keys(rules).sort().forEach((key) => {
    const index: number = parseInt(key, 10);
    if (Number.isNaN(index)) return;

    const rule: IRule = rules![index];

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${rule.index}. ${rule.title}`)
          .setColor(color ?? null)
          .setDescription(rule.description)
          .setFooter(null),
      ],
    });
  });

  if (rules.footer !== undefined) {
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(rules.footer.title)
          .setDescription(rules.footer.description)
          .setColor(color ?? null)
          .setFooter(rules.footer.footer ? { text: rules.footer.footer.text, iconURL: rules.footer.footer.icon ?? undefined } : null),
      ],
    });
  }

  channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Last Update: ${time(new Date())}`)
        .setColor(color ?? null)
        .setFooter(null)
        .setDescription(changelog),
    ],
  });

  interaction.reply({ content: String.get('set_subcommand_rule_channel_success', interaction.guildLocale, { keys: { CHANNEL: `\`${channel.name}\`` } }), ephemeral: true });
};
