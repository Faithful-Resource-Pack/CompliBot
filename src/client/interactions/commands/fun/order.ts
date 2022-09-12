import { ICommand } from '@interfaces';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';
import { AttachmentBuilder } from 'discord.js';

/**
 * Warning: key value cannot be longer than a certain value (I didn't search how much it is)
 * :: values used in SlashCommandBuilder must be defined before the bot construct it
 *
 * ! extension needs to be provided
 * !! .webp extension aren't rendering inside Discord
 */
const options: { name: string, value: string }[] = [
  {
    name: 'pizza',
    value: 'https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif',
  },
  {
    name: 'soup',
    value: 'https://c.tenor.com/45SSoTETymIAAAAS/sopita-de-fideo-noodle.gif',
  },
  {
    name: 'burger',
    value: 'https://c.tenor.com/tdFqDJemKpUAAAAC/mcdonalds-big-mac.gif',
  },
  {
    name: 'poop',
    value: 'https://c.tenor.com/-Rv2hPlRKA0AAAAC/i-see-what-you-did-there-steve-carell.gif',
  },
  {
    name: '66',
    value: 'https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif',
  },
  {
    name: 'help',
    value: 'https://c.tenor.com/yi5btxWVAwwAAAAS/help-shouting.gif',
  },
  {
    name: 'ice',
    value: 'https://c.tenor.com/ySPd8qwdV7QAAAAC/frozen-ice.gif',
  },
  {
    name: 'fire',
    value: 'https://i.giphy.com/media/Qre4feuyNhiYIzD7hC/200.gif',
  },
  {
    name: 'popcorn',
    value: 'https://c.tenor.com/yinQBUPPd_IAAAAC/michael-jackson-popcorn.gif',
  },
];

export default {
  config: () => ({
    ...JSON.configLoad('commands/order.json'),
  }),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('order_command_name'))
    .setDescriptions(String.getAll('order_command_description'))
    .addStringOptionLocalized((option) => option
      .addChoices(...options)
      .setRequired(true), {
      names: String.getAll('order_command_argument_order_name'),
      descriptions: String.getAll('order_command_argument_order_description'),
    }),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const value: string = interaction.options.getString(String.get('order_command_argument_order_name'), true);
    const found: { value: string, name: string } = options.find((option) => option.value === value)!;

    let advice: string | null = null;
    switch (found.name) {
      case 'soup':
        advice = 'Gutten Appetit';
        break;
      case 'pizza':
        advice = 'Buon Appetito!';
        break;
      case 'poop':
        advice = ':eyes:';
        break;
      default:
        break;
    }

    const gif = new AttachmentBuilder(found.value);
    interaction.replyDeletable({ content: advice, files: [gif] });
  },

} as ICommand;
