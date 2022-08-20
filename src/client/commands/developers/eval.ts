import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

import { Strings } from '@utils';
import { Client } from '@client/index';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(Strings.get('eval_command_name'))
    .setDescription(Strings.get('eval_command_description'))
    .addStringOption((option) => option
      .setName(Strings.get('eval_command_option_code_name'))
      .setDescription(Strings.get('eval_command_option_code_description'))
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
        .replaceAll(/`/g, `\`${String.fromCharCode(8203)}`)
        .replaceAll(/@/g, `@${String.fromCharCode(8203)}`);
    };

    // Variables that might be used with the command
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { channel, client } = interaction;

    // eslint-disable-next-line no-eval
    const evaluated = await eval(`(async () => { try { return await (async () => {${code.includes('return') ? code : `return ${code}`}})() } catch (e) { return e } })()`);

    const embed = new EmbedBuilder()
      .setDescription(`\`\`\`js\n${(await clean(evaluated, c)).slice(0, 1000)}\`\`\``);

    interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  },
};
