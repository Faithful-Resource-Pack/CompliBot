/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event } from '@interfaces';
import { Client, Message, MessageEmbed } from '@client';
import EasterEgg from '@functions/canvas/isEasterEggImg';
import { getSubmissionsChannels } from '@helpers/channels';

const event: Event = {
  name: 'messageCreate',
  run: async (client: Client, message: Message) => {
    //! do not remove, 'force' message to be casted (break if removed)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _ = (message as Message) instanceof Message;

    // loose reference to message: create unique instance of the message for the logger (ask @Juknum)
    client.storeAction('message', { ...message, author: message.author, isDeleted: false } as Message);

    if (message.author.bot) return;

    // TODO: EARLY ALPHA FOR CLASSIC FAITHFUL
    const tmp = [
      '814201529032114226',
      '909503944118648883',
      '814209343502286899',
    ];

    if (tmp.includes(message.channelId)) {
      client.emit('textureSubmitted', (client as Client, message));
      return;
    }

    // // test if message is in submit channel
    // // TODO: remove `&& client.tokens.dev` once dev is finished
    // if (getSubmissionsChannels(client as Client).includes(message.channelId) && client.tokens.dev) {
    //   client.emit('textureSubmitted', (client as Client, message));
    //   return;
    // }

    switch (message.content.toLocaleLowerCase()) {
      case 'engineer gaming':
        try {
          await message.react('👷');
        } catch (err) {
          /* can't react */
        }
        break;
      case 'rip':
      case 'f':
        try {
          await message.react('🇫');
        } catch (err) {
          /* can't react */
        }
        break;
      case 'band':
        ['🎤', '🎸', '🥁', '🪘', '🎺', '🎷', '🎹', '🪗', '🎻'].forEach(async (emoji) => {
          try {
            await message.react(emoji);
          } catch (err) {
            /* can't react */
          }
        });
        break;
      case 'monke': // cases can do this, they can overlap. Very useful
      case 'monkee':
      case 'monkey':
        ['🎷', '🐒'].forEach(async (emoji) => {
          try {
            await message.react(emoji);
          } catch (err) {
            /* can't react */
          }
        });
        break;
      case 'mhhh':
        message
          .reply({
            embeds: [new MessageEmbed().setDescription('```Uh-oh moment```').setFooter({ text: 'Swahili → English' })],
          })
          .then((m) => m.deleteButton(true));
        break;
      case 'hello there':
        message
          .reply('https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif')
          .then((m) => m.deleteButton(true));
        break;
      default:
        break;
    }

    if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
      message.reply({ content: '┬─┬ ノ( ゜-゜ノ) calm down bro' });
      return;
    }

    if (message.attachments.size > 0) {
      if ((await EasterEgg(message.attachments.first().url, 1)) && !client.tokens.dev) {
        const embed = new MessageEmbed()
          .setTitle('"rOtAte tiLinG"')
          .setImage('https://cdn.discordapp.com/attachments/923370825762078720/939476550749913138/tiled.png')
          .setFooter({
            text: 'Nick.#1666',
          })
          .setTimestamp(new Date(1644059063305)); // when the funny moment happened
        message
          .reply({
            embeds: [embed],
          })
          .then((m) => m.deleteButton(true));
      }

      if ((await EasterEgg(message.attachments.first().url, 2)) && !client.tokens.dev) {
        const embed = new MessageEmbed()
          .setTitle('"FlIp tiLinG"')
          .setImage('https://cdn.discordapp.com/attachments/923370825762078720/940676536330223676/tiled.png')
          .setFooter({
            text: 'Nick.#1666 - again',
          })
          .setTimestamp(new Date(1644345162257)); // when the funny moment happened again
        message
          .reply({
            embeds: [embed],
          })
          .then((m) => m.deleteButton(true));
      }
    }
  },
};

export default event;
