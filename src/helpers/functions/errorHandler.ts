import {
  ButtonInteraction,
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  MessageAttachment,
  MessageEmbed,
  SelectMenuInteraction,
  TextChannel,
} from 'discord.js';
import { Client } from '@client';
import { err } from '@helpers/logger';
import { colors } from '@helpers/colors';
import { Log } from 'client/client';
import fs from 'fs';
import path from 'path';

const randomSentences: Array<string> = [
  'Oh no, not again!',
  "Well, it's unexpected...",
  'OOPS, sorry, my bad!',
  'I thought TS > JS was true...',
  'This one is going to be a nightmare to solve!',
  "Please, don't blame me, I try my best. Each day.",
  'Like humans, I have some errors',
  "Don't be sad, have a hug <3",
  'oh.',
  'Another one! DJ Khaleeeeed!',
  "I just don't know what went wrong :(",
  'My bad.',
  'Hold my beer.',
  "I'm so sorry, I'm just a bot :(",
  "Unfortunately I was coded in a way that I can't handle this error",
  'Would you like a cupcake?',
  'Why did you do that?',
  "Don't be sad. I'll do better next time, I promise!",
  'somebody set up us the error',
  "I'm sorry, Dave.",
  "Hi. I'm CompliBot, and I'm a erroraholic.",
  'Ooh. Shiny.',
  'But it works on my machine.',
  'Oops.',
  'On the bright side, I bought you a teddy bear!',
  'Shall we play a game?',
  'Surprise! Haha. Well, this is awkward.',
  "This doesn't make any sense!",
  'Why is it breaking :(',
  "Don't do that.",
  'Ouch. That hurt :(',
];

const lastReasons = [];
const loopLimit = 3; // how many times the same error needs to be made to trigger a loop

export const logConstructor: Function = (
  client: Client,
  reason: any = {
    stack: 'You requested it with /logs ¯\\_(ツ)_/¯',
  },
): MessageAttachment => {
  const logTemplate = fs.readFileSync(path.join(`${__dirname}/errorHandler.log`).replace('dist\\', ''), { encoding: 'utf-8' });
  const template = logTemplate.match(/%templateStart%([\s\S]*?)%templateEnd/)[1]; // get message template

  const t = Math.floor(Math.random() * randomSentences.length);
  let logText = logTemplate
    .replace('%date%', new Date().toUTCString())
    .replace('%stack%', reason.stack || JSON.stringify(reason))
    .replace('%randomSentence%', randomSentences[t])
    .replace('%randomSentenceUnderline%', '-'.repeat(randomSentences[t].length));

  [logText] = logText.split('%templateStart%'); // remove message template

  const len: number = client.getActions().length;
  const actions: Log[] = client.getActions().sort((a: Log, b: Log) => (a.timestamp > b.timestamp ? -1 : 1));

  actions.forEach((log: Log, index) => {
    let tmp: string = template;

    tmp = tmp
      .replace('%templateIndex%', (len - index).toString())
      .replace(
        '%templateTimestampLogged%',
        `${log.timestamp} | ${new Date(log.timestamp).toLocaleDateString('en-UK', {
          timeZone: 'UTC',
        })} ${new Date(log.data.createdTimestamp).toLocaleTimeString('en-US', {
          timeZone: 'UTC',
        })} (UTC)`,
      )
      .replace(
        '%templateCreatedTimestamp%',
        `${log.data.createdTimestamp} | ${new Date(log.data.createdTimestamp).toLocaleDateString('en-UK', {
          timeZone: 'UTC',
        })} ${new Date(log.data.createdTimestamp).toLocaleTimeString('en-US', {
          timeZone: 'UTC',
        })} (UTC)`,
      );

    switch (log.type) {
      case 'guildJoined':
        log.data = log.data as Guild;
        tmp = tmp.replace('%templateType%', 'Guild Joined');
        break;

      case 'guildMemberUpdate':
        log.data = log.data as GuildMember;
        tmp = tmp.replace(
          '%templateType%',
          `Guild Member Update (${log.data.user.username} ${log.data.reason === 'added' ? 'joined' : 'left'} ${
            log.data.guild.name
          })`,
        );
        break;

      case 'message':
        log.data = log.data as Message;
        tmp = tmp
          .replace(
            '%templateType%',
            `Message (${log.data.author ? log.data.author.username : '???'}, ${log.data.author ? log.data.author.id : '??'} ${log.data.author && log.data.author.bot ? 'BOT' : 'USER'}, ${log.data.isDeleted ? `deleted by ${log.data.whoDeleted.username}` : 'posted'})`,
          )
          .replace(
            '%templateURL%',
            `https://discord.com/channels/${log.data.guildId}/${log.data.channelId}/${log.data.id}`,
          )
          .replace('%templateEmbeds%', log.data.embeds?.length > 0 ? `${JSON.stringify(log.data.embeds)}` : 'None')
          .replace(
            '%templateComponents%',
            log.data.components?.length > 0 ? `${JSON.stringify(log.data.components)}` : 'None',
          )
          .replace('%templateContent%', log.data.content)
          .replace('%templateChannelType%', client.channels.cache.get(log.data.channelId)?.type || 'Unknown');
        break;

      case 'textureSubmitted':
        log.data = log.data as Message;
        tmp = tmp
          .replace('%templateType%', `Texture Submitted (${log.data.author.username}, ${log.data.author.id})`)
          .replace(
            '%templateURL%',
            `https://discord.com/channels/${log.data.guildId}/${log.data.channelId}/${log.data.id}`,
          )
          .replace('%templateEmbeds%', log.data.embeds?.length > 0 ? `${JSON.stringify(log.data.embeds)}` : 'None')
          .replace(
            '%templateComponents%',
            log.data.components?.length > 0 ? `${JSON.stringify(log.data.components)}` : 'None',
          )
          .replace('%templateContent%', log.data.content)
          .replace('%templateChannelType%', client.channels.cache.get(log.data.channelId)?.type || 'Unknown');
        break;

      case 'selectMenu':
        log.data = log.data as SelectMenuInteraction;
        tmp = tmp
          .replace('%templateType%', 'Select Menu')
          .replace('%templateURL%', (log.data.message as Message).url)
          .replace('%templateChannelType%', log.data.channel ? log.data.channel.type : 'Not relevant');
        break;

      case 'button':
        log.data = log.data as ButtonInteraction;
        tmp = tmp
          .replace('%templateType%', 'Button')
          .replace('%templateURL%', (log.data.message as Message).url)
          .replace('%templateChannelType%', log.data.channel ? log.data.channel.type : 'Not relevant');
        break;

      case 'slashCommand':
        log.data = log.data as CommandInteraction;
        tmp = tmp
          .replace('%templateType%', `Slash Command (/${log.data.commandName})`)
          .replace('%templateURL%', `https://discord.com/channels/${log.data.guildId}/${log.data.channelId}`) // there is no message attached as the message could not exist yet
          // eslint-disable-next-line no-underscore-dangle
          .replace('%templateParameters%', JSON.stringify((log.data.options as any)._hoistedOptions)) // small tricks to get all parameter
          .replace('%templateChannelType%', log.data.channel ? log.data.channel.type : 'Not relevant');
        break;

      default:
        break;
    }

    // clean up parts that are not needed
    logText += tmp
      .replace('%templateURL%', 'Not relevant')
      .replace('%templateChannelType%', 'Not relevant')
      .replace('%templateParameters%', 'Not relevant')
      .replace('%templateContent%', 'Not relevant')
      .replace('%templateEmbeds%', 'Not relevant')
      .replace('%templateComponents%', 'Not relevant');
  });

  const buffer = Buffer.from(logText, 'utf8');
  return new MessageAttachment(buffer, 'stack.log');
};

export const errorHandler: Function = async (client: Client, reason: any, type: string) => {
  await (async () => {
    console.error(`${err} ${reason.stack || JSON.stringify(reason)}`);

    // get dev log channel
    const channel = client.channels.cache.get(client.tokens.errorChannel) as TextChannel;
    if (channel === undefined) return; // avoid infinite loop when crash is outside of client

    if (lastReasons.length === loopLimit) lastReasons.pop(); // pop removes an item from the end of an array
    lastReasons.push(reason); // push adds one to the start

    // checks if every reasons are the same
    // if (lastReasons.every((v) => v.stack === lastReasons[0].stack) && lastReasons.length === loopLimit) {
    //   if (client.verbose) console.log(`${err}Suspected crash loop detected; Restarting...`);

    //   const embed = new MessageEmbed()
    //     .setTitle('(Probably) Looped, crash encountered!')
    //     .setFooter({ text: `Got the same error ${loopLimit} times in a row. Attempting restart...` })
    //     .setDescription('```bash\n' + reason.stack + '\n```');
    //   await channel.send({ embeds: [embed] });

    //   client.restart();
    // }

    const embed = new MessageEmbed()
      .setAuthor({
        name: type,
        iconURL: `${client.config.images}bot/error.png`,
      }) // much compressed than .title() & .thumbnail()
      .setColor(colors.red)
      .setTimestamp()
      .setDescription(`\`\`\`bash\n${reason.stack || JSON.stringify(reason)}\n\`\`\``)
      .setFooter({
        text: client.user.tag,
        iconURL: client.user.avatarURL(),
      });

    await channel
      .send({
        embeds: [embed],
      })
      .catch(console.error);
    await channel
      .send({
        files: [logConstructor(client, reason)],
      })
      .catch(console.error); // send after because the file is displayed before the embed (embeds are prioritized)
  })()
    .catch((final_err) => {
      // ! NEVER EVER THROW ERROR HERE, ELSE IT LOOPS
      console.error(final_err);
    });
};
