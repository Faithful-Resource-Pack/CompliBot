import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { Client } from '@client/index';
import { Colors } from '@enums';
import { EmbedBuilder } from '@overrides';
import { ICommand } from '@interfaces';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('eval_command_name'))
    .setDescription(String.get('eval_command_description'))
    .addStringOption((option) => option
      .setName(String.get('eval_command_option_code_name'))
      .setDescription(String.get('eval_command_option_code_description'))
      .setRequired(true)),
  handler: async (interaction: ChatInputCommandInteraction<CacheType>, c: Client) => {
    const code = interaction.options.getString('code', true);
    const clean = async (text: any, client: Client) => {
      if (text && text.constructor.name === 'Promise') text = await text;
      if (typeof text !== 'string') {
        text = (await import('util')).inspect(text, { depth: 1 });
      }

      return text
        .replaceAll(client.tokens.bot, '[BOT_TOKEN]')
        .replaceAll(client.tokens.github, '[GITHUB_TOKEN]')
        .replaceAll(/`/g, `\`${String.fromCharCode(8203)}`)
        .replaceAll(/@/g, `@${String.fromCharCode(8203)}`);
    };

    // Variables that might be used with the command
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { channel, client } = interaction;

    // eslint-disable-next-line no-eval
    const evaluated = await eval(`(async () => { try { return await (async () => {${code.includes('return') ? code : `return ${code}`}})() } catch (e) { return e } })()`);

    const embed = new EmbedBuilder()
      .setColor(Colors.BLUE)
      .setDescription(`\`\`\`js\n${(await clean(evaluated, c)).slice(0, 1000)}\`\`\``);

    interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  },
} as ICommand;
