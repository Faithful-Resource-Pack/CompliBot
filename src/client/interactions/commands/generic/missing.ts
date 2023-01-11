/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client } from '@client';
import { MCeditions, MCversions, MCversionsFromEdition } from '@api';
import { ignoredTextures, packs } from '@static';
import { getFileNames, Images } from '@utils';
import { IPack, TEditions } from '@interfaces';
import { normalize } from 'path';
import { AttachmentBuilder } from 'discord.js';
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from '@overrides';

interface IMissingCommandResult {
  buffer: Buffer | null,
  files: Array<string>,
  completion: number | null,
}

interface IMissingCommandResults extends Array<IMissingCommandResult> {}

export default {
  config: () => ({
    ...JSON.configLoad('commands/missing.json'),
  }),
  data: async () => {
    const packChoices = packs.map((pack) => ({ name: pack.name, value: pack.value }));

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
        .addChoices(...packChoices), {
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
    const pack: IPack['value'] = interaction.options.getString(String.get('missing_command_option_pack_name'), true) as IPack['value'];
    const packName: IPack['name'] = packs.find((p) => p.value === pack)?.name ?? '???';
    const edition: TEditions | 'all' = interaction.options.getString(String.get('missing_command_option_edition_name'), true) as (TEditions | 'all');
    const version: string = interaction.options.getString(String.get('missing_command_option_version_name')) || 'latest';

    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle(String.get('missing_command_embed_title_searching'))
      .setDescription(String.get('missing_command_embed_description_searching'))
      .setThumbnail(Images.getAsEmbedThumbnail('bot/loading.gif'))
      .addFields({ name: String.get('missing_command_embed_field_steps'), value: '\u200b' });

    await interaction.reply({ embeds: [embed] });

    const steps: Array<string> = [];

    const stepsCallback = async (step: string) => {
      if (step.length === 0) steps.clear().push(String.get('missing_command_embed_step_generic'));
      else {
        if (steps.length === 1 && steps[0] === String.get('missing_command_embed_step_generic')) steps.clear();
        steps.push(step);
      }

      embed.spliceFields(0, 1, {
        name: String.get('missing_command_embed_field_steps'),
        value: steps.join('\n'),
      });

      await interaction.editReply({ embeds: [embed] });
    };

    const compute = async (ed: TEditions): Promise<IMissingCommandResult> => {
      const packRepository = client.repositories.find((repository) => repository.pack === pack && repository.edition === ed);
      const defaultRepository = client.repositories.find((repository) => repository.pack === 'default' && repository.edition === ed);
      const versions = await MCversionsFromEdition(ed);
      let verifiedVersion = version;

      if (!versions.includes(version)) {
        [verifiedVersion] = versions;
      }

      // Edition isn't supported
      if (!packRepository || !defaultRepository) {
        return {
          buffer: null,
          files: [],
          completion: null,
        };
      }

      try {
        stepsCallback(String.get('missing_command_embed_step_switching_branch', 'en-US', { keys: { branch: version } }));
        await defaultRepository.checkout(verifiedVersion);
        await packRepository.checkout(verifiedVersion);
      } catch (err) {
        console.error(err);
      }

      try {
        stepsCallback(String.get('missing_command_embed_step_updating', 'en-US', { keys: { resource_pack: packName } }));
        await defaultRepository.update();
        await packRepository.update();
      } catch (err) {
        console.error(err);
      }

      stepsCallback(String.get('missing_command_embed_step_looking_for_differences', 'en-US', { keys: { resource_pack: packName } }));
      const normalizeFiles = (files: Array<string>, path: string) => files
        .map((file) => normalize(file)
          .replace(normalize(path), '')
          .replaceAll('\\', '/')
          .replaceAll('/assets/', ''));

      const packFiles = normalizeFiles(getFileNames(packRepository.localPath, true), packRepository.localPath);
      const defaultFiles = normalizeFiles(getFileNames(defaultRepository.localPath, true), defaultRepository.localPath);

      const check: { [key: string]: boolean } = defaultFiles.map((file) => ({ [file]: packFiles.includes(file) })).reduce((acc, cur) => ({ ...acc, ...cur }), {});
      const missingTextures = Object.keys(check)
        .filter((key) => !check[key]) // ignore found textures
        .filter((key) => !ignoredTextures.global[ed].find((texture) => key.includes(texture))) // ignored textures
        .filter((key) => !ignoredTextures.global[ed].find((texture) => (texture.endsWith('*') ? key.includes(texture.slice(0, -1)) : false))); // ignored directories

      const completion = Math.round(10000 - (missingTextures.length / defaultFiles.length) * 10000) / 100;

      return {
        buffer: Buffer.from(missingTextures.join('\n'), 'utf-8'),
        files: missingTextures,
        completion,
      };
    };

    switch (edition) {
      case 'all':
        Promise.all([compute('java'), compute('bedrock')])
          .then((results) => {
            interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .addFields(
                    {
                      name: String.get('missing_command_embed_field_title_success', 'en-US', { keys: { edition: 'Java', pack: packName, version: version.capitalize() } }),
                      value: results[0].completion === null
                        ? String.get('missing_command_embed_step_not_supported', 'en-US', { keys: { edition: 'Java', resource_pack: packName } })
                        : String.get('missing_command_embed_field_value_success', 'en-US', { keys: { completion: results[0].completion.toString(), count: results[0].files.length.toString() } }),
                    },
                    {
                      name: String.get('missing_command_embed_field_title_success', 'en-US', { keys: { edition: 'Bedrock', pack: packName, version: version.capitalize() } }),
                      value: results[1].completion === null
                        ? String.get('missing_command_embed_step_not_supported', 'en-US', { keys: { edition: 'Bedrock', resource_pack: packName } })
                        : String.get('missing_command_embed_field_value_success', 'en-US', { keys: { completion: results[1].completion.toString(), count: results[1].files.length.toString() } }),
                    },
                  ),
              ],
              files: results
                .filter((res) => res.buffer !== null)
                .map((res) => new AttachmentBuilder(res.buffer!, { name: `missing-textures-${pack.replaceAll('_', '-')}-${edition}-${version}.txt` })),
            });
          });

        break;

      default:
        compute(edition)
          .then((result) => {
            interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .addFields({
                    name: String.get('missing_command_embed_field_title_success', 'en-US', { keys: { edition: edition.capitalize(), pack: packName, version: version.capitalize() } }),
                    value: result.completion === null
                      ? String.get('missing_command_embed_step_not_supported', 'en-US', { keys: { edition: edition.capitalize(), resource_pack: packName } })
                      : String.get('missing_command_embed_field_value_success', 'en-US', { keys: { completion: result.completion.toString(), count: result.files.length.toString() } }),
                  }),
              ],
              files: result.buffer ? [
                new AttachmentBuilder(result.buffer, { name: `missing-textures-${pack.replaceAll('_', '-')}-${edition}-${version}.txt` }),
              ] : [],
            });
          });
        break;
    }
  },
};
