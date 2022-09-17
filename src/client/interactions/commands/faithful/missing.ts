import { Client } from 'discord.js';
import { MCeditions, MCversions } from '@api';
import { packs } from '@static';
import { Images, Logger } from '@utils';
import { Pack } from '@interfaces';
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from '@overrides';

interface IMissingEmbedStatus {
  completion: number,
  edition: string,
  pack: string,
  version: string,
}

interface TMissingCommandResult {
  buffer: Buffer | null,
  steps: Array<string>,
  status: IMissingEmbedStatus,
}

interface IMissingCommandResults extends Array<TMissingCommandResult> {}

export default {
  config: () => ({
    ...JSON.configLoad('commands/missing.json'),
    packs: {},
  }),
  data: async () => {
    const versionChoices = await MCversions()
      .then((__versions) => __versions.map((version) => ({ name: version, value: version })));

    const editionChoices = await MCeditions()
      .then((__editions) => __editions.map((edition) => ({ name: edition.capitalize(), value: edition })));

    editionChoices.push({ name: 'Java & Bedrock', value: 'all' });

    return new SlashCommandBuilder()
      .setNames(String.getAll('missing_command_name'))
      .setDescriptions(String.getAll('missing_command_description'))
      .addLocalizedStringOption((option) => option
        .setRequired(true)
        .addChoices(...packs), {
        names: String.getAll('missing_command_option_pack_name'),
        descriptions: String.getAll('missing_command_option_pack_description'),
      })
      .addLocalizedStringOption((option) => option
        .setRequired(true)
        .addChoices(...editionChoices), {
        names: String.getAll('missing_command_option_edition_name'),
        descriptions: String.getAll('missing_command_option_edition_description'),
      })
      .addLocalizedStringOption(
        (option) => option
          .addChoices(...versionChoices),
        {
          names: String.getAll('missing_command_option_version_name'),
          descriptions: String.getAll('missing_command_option_version_description'),
        },
      );
  },
  handler: async (interaction: ChatInputCommandInteraction, client: Client) => {
    const pack: string = interaction.options.getString(String.get('missing_command_option_pack_name'), true);
    const edition: string = interaction.options.getString(String.get('missing_command_option_edition_name'), true);
    const version: string = interaction.options.getString(String.get('missing_command_option_version_name')) || 'latest';

    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle(String.get('missing_command_embed_title_step_1'))
      .setDescription(String.get('missing_command_embed_description_step_1'))
      .setThumbnail(Images.getAsEmbedThumbnail('bot/loading.gif'))
      .addFields({ name: String.get('missing_command_embed_field_steps'), value: '\u200b' });

    await interaction.reply({ embeds: [embed] });

    let steps: Array<string> = [];
    const results: IMissingCommandResults = [];

    const stepsCallback = async (step: string) => {
      if (step.length === 0) steps = [String.get('missing_command_embed_step_generic')];
      else {
        if (steps.length === 1 && steps[0] === String.get('missing_command_embed_step_generic')) steps = [];
        steps.push(step);
      }

      embed.spliceFields(0, 1, {
        name: String.get('missing_command_embed_field_steps'),
        value: steps.join('\n'),
      });

      await interaction.editReply({ embeds: [embed] });
    };

    const errorCallback = (err: string | Error, options: IMissingEmbedStatus): TMissingCommandResult => {
      Logger.log('error', err.toString(), err);
      return {
        buffer: null,
        steps: [err.toString()],
        status: options,
      };
    };

    const compute = (client: Client, pack: Pack['value'], edition: string, version: string, callback: typeof stepsCallback) => {

    };

    switch (edition) {
      case 'java':
        break;

      case 'bedrock':
        break;

      case 'all':
      default:
        break;
    }
  },
};
