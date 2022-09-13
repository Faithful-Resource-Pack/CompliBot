import { Client } from '@client/index';
import { Colors } from '@enums';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from '@overrides';
import { ICommand } from '@interfaces';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('eval_command_name'))
    .setDescriptions(String.getAll('eval_command_description'))
    .addLocalizedStringOption((option) => option
      .setRequired(true), {
      names: String.getAll('eval_command_option_code_name'),
      descriptions: String.getAll('eval_command_option_code_description'),
    }),
  handler: async (interaction: ChatInputCommandInteraction, c: Client) => {
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

    interaction.replyDeletable({
      ephemeral: true,
      embeds: [embed],
    });
  },
} as ICommand;
