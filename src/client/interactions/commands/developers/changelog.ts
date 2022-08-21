import { Strings } from '@utils';
import path from 'path';
import fs from 'fs';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedField,
} from 'discord.js';
import { EmbedBuilder } from '@overrides';

const CHANGELOG_PATH = path.join(__dirname, '..', '..', '..', '..', '..', 'CHANGELOG.md');

const changelogOptions = (): Array<{ name: string, value: string }> => fs.readFileSync(CHANGELOG_PATH, 'utf-8').match(/^#{2}(?!#)(.*)/gm)!
  .filter((l, index) => index >= 1)
  .map((line: string) => ({
    name: line.replace(/^#{2}/, '').trim(),
    value: line,
  }));

export default {
  config: () => ({}),
  data: () => new SlashCommandBuilder()
    .setName(Strings.get('changelog_command_name'))
    .setDescription(Strings.get('changelog_command_description'))
    .addStringOption((string) => string
      .addChoices(...changelogOptions())
      .setName(Strings.get('changelog_command_argument_version_name'))
      .setDescription(Strings.get('changelog_command_argument_version_description'))
      .setRequired(true)),
  handler: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const selectedVersion = interaction.options.getString('version', true);
    const changelogs = fs.readFileSync(CHANGELOG_PATH, 'utf-8')
      .replaceAll('\r', '')
      .replaceAll('**Warning**', '**⚠️ Warning**') // discord prefixes these two key terms with emojis and styles
      .replaceAll('**Note**', '**ℹ️ Note**') // them unlike discord so this is adding them back.
      .match(/(?<=#{2} )([^]*?)(?=(\n#{2} )|($))/g)!;

    const versions = changelogOptions();
    const version = versions.find((v) => v.value === selectedVersion);
    const changelog = changelogs.find((c) => c.includes(version!.name))!;

    const subcategories = changelog
      .replaceAll('-', '•')
      // remove the first two lines where the changelog title is
      .split('\n').splice(2).join('\n')
      .split('### ') // split subcategories
      .filter((c) => c.length > 0); // remove empty subcategories

    const fields = subcategories.map<EmbedField>((sub) => {
      const splitted = sub.split(/\n(.*)/s);

      return ({
        name: splitted.shift()!,
        value: splitted.join('\n').length > 1024 ? `${splitted.join('\n').slice(0, 1021)}...` : splitted.join('\n'),
        inline: false,
      });
    });

    const embed = new EmbedBuilder()
      .setTitle(version!.name)
      .addFields(fields)
      .setFooter({ text: `${version!.name.split(' ').join(' • ')}` });

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
