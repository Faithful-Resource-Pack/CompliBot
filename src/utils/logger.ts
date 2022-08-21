import settings from '@config/settings.json';
import chalk from 'chalk';
import {
  Client,
  Log,
  LogEvent,
} from '@client';
import {
  AttachmentBuilder,
  ButtonInteraction,
  CommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  Message,
  messageLink,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextBasedChannel,
} from 'discord.js';
import { Colors } from '@enums';
import { templateLoad } from './templates';
import { Strings } from './strings';
import { Images } from './images';

/** Level of the log, defines how it is displayed */
export type LoggerLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  /**
   * Logs a message to the console.
   * @param message The message to log.
   */
  public static log(level: LoggerLevel, message: string, error?: any): void {
    switch (level) {
      case 'info':
        console.log(`[${chalk.blue('INFO')}] ${message}`);
        break;

      case 'error':
        console.log(`[${chalk.red('ERROR')}] ${message}`);
        console.error(error);
        break;

      case 'debug':
      case 'warn':
        if (!settings.verbose) break;
        console.log(`[${chalk.yellow(level.toUpperCase())}] ${message}`);
        break;

      default:
        console.log(message);
        break;
    }
  }

  /**
   * Prints the bot's name and version to the console.
   */
  public static printHeader() {
    const darkColor = settings.inDev === false ? '#0026ff' : '#ff8400';
    const lightColor = settings.inDev === false ? '#0066ff' : '#ffc400';

    console.log(chalk.hex(darkColor)('\n .d8888b.                                  888 d8b ') + chalk.hex(lightColor)('888888b.            888'));
    console.log(chalk.hex(darkColor)('d88P  Y88b                                 888 Y8P ') + chalk.hex(lightColor)('888  "88b           888'));
    console.log(chalk.hex(darkColor)('888    888                                 888     ') + chalk.hex(lightColor)('888  .88P           888'));
    console.log(chalk.hex(darkColor)('888         .d88b.  88888b.d88b.  88888b.  888 888 ') + chalk.hex(lightColor)('8888888K.   .d88b.  888888 '));
    console.log(chalk.hex(darkColor)('888        d88""88b 888 "888 "88b 888 "88b 888 888 ') + chalk.hex(lightColor)('888  "Y88b d88""88b 888'));
    console.log(chalk.hex(darkColor)('888    888 888  888 888  888  888 888  888 888 888 ') + chalk.hex(lightColor)('888    888 888  888 888'));
    console.log(chalk.hex(darkColor)('Y88b  d88P Y88..88P 888  888  888 888 d88P 888 888 ') + chalk.hex(lightColor)('888   d88P Y88..88P Y88b.'));
    console.log(chalk.hex(darkColor)('"Y8888P"    "Y88P"  888  888  888 88888P"  888 888 ') + chalk.hex(lightColor)('8888888P"   "Y88P"   "Y888'));
    console.log(chalk.hex(darkColor)('                                  888'));
    console.log(chalk.hex(darkColor)('                                  888                   ') + chalk.white.bold(`Faithful Devs. ${new Date().getFullYear()}`));
    console.log(chalk.hex(darkColor)('                                  888                ') + chalk.gray.italic('This is the v3!'));
  }

  /**
   * Build the message attachment for the sendLog() method.
   * @param {Client} client - The bot client instance.
   * @param error - The error.
   * @returns {AttachmentBuilder} - The attachment builder of the log file.
   */
  public static buildLogFile(client: Client, error: any = { stack: 'This has been requested' }): AttachmentBuilder {
    const template: string = templateLoad('errors.log');
    const [, messageTemplate] = template.match(/%templateStart%([\s\S]*?)%templateEnd/)!;

    const randomSentences = Strings.get('logger_message_random_sentence');
    const randomSentence = randomSentences[Math.floor(Math.random() * randomSentences.length)];

    // replace head values
    let message = template
      .replace('%date%', new Date().toUTCString())
      .replace('%stack%', error.stack || JSON.stringify(error))
      .replace('%randomSentence%', randomSentence)
      .replace('%randomSentenceUnderline%', '-'.repeat(randomSentence.length));

    // remove message template from the message
    [message] = message.split('%templateStart%');

    // fetch stored logs from the client
    const len: number = client.logs.length;
    const logs: Array<Log> = client.logs.sort((a: Log, b: Log) => b.timestamp - a.timestamp);

    logs.forEach((log: Log, index: number) => {
      let tmp = messageTemplate;

      if (Object.prototype.hasOwnProperty.call(log.data, 'createdTimestamp')) {
        log.data = log.data as Exclude<LogEvent, GuildMember>; // Cast to exclude GuildMember

        tmp = tmp
          .replace(
            '%templateCreatedTimestamp%',
            `${log.data.createdTimestamp} | ${new Date(log.data.createdTimestamp).toLocaleDateString('en-UK', {
              timeZone: 'UTC',
            })} ${new Date(log.data.createdTimestamp).toLocaleTimeString('en-UK', {
              timeZone: 'UTC',
            })} (UTC)`,
          );
      }

      switch (log.type) {
        case 'modal':
          log.data = log.data as ModalSubmitInteraction; // Cast to exclude GuildMember
          tmp = tmp.replace('%templateType%', 'Modal');
          break;

        case 'guildJoined':
          log.data = log.data as Guild;
          tmp = tmp.replace('%templateType%', 'Guild Joined');
          break;

        case 'guildMemberUpdate':
          log.data = log.data as GuildMember;
          tmp = tmp.replace('%templateType%', `Guild Member Update (${log.data.user.username} ${log.data.guild.name})`);
          break;

        case 'textureSubmitted':
        case 'message':
          log.data = log.data as Message;

          if (log.type === 'message') {
            tmp = tmp
              .replace('%templateType%', `Message (${log.data.author ? log.data.author.username : 'N/A'}, ${log.data.author ? log.data.author.id : '??'} ${log.data.author && log.data.author.bot ? 'BOT' : 'USER'})`);
          } else tmp = tmp.replace('%templateType%', `Texture Submitted (${log.data.author.username}, ${log.data.author.id})`);

          tmp = tmp
            .replace('%templateURL%', messageLink(log.data.channelId, log.data.id, log.data.guildId ?? '@me'))
            .replace('%templateEmbeds%', log.data.embeds?.length > 0 ? `${JSON.stringify(log.data.embeds)}` : 'N/A')
            .replace('%templateComponents%', log.data.components?.length > 0 ? `${JSON.stringify(log.data.components)}` : 'N/A')
            .replace('%templateContent%', log.data.content)
            .replace('%templateChannelType%', `${log.data.channel?.type ?? 'N/A'}`);
          break;

        case 'selectMenu':
          log.data = log.data as SelectMenuInteraction;
          tmp = tmp
            .replace('%templateType%', 'Select Menu')
            .replace('%templateURL%', (log.data.message as Message).url)
            .replace('%templateChannelType%', `${log.data.channel?.type ?? 'N/A'}`);
          break;

        case 'button':
          log.data = log.data as ButtonInteraction;
          tmp = tmp
            .replace('%templateType%', 'Button')
            .replace('%templateURL%', (log.data.message as Message).url)
            .replace('%templateChannelType%', `${log.data.channel?.type ?? 'N/A'}`);
          break;

        case 'command':
          log.data = log.data as CommandInteraction;
          tmp = tmp
            .replace('%templateType%', `Slash Command (/${log.data.commandName})`)
            .replace('%templateURL%', messageLink(log.data.channelId, log.data.id, log.data.guildId ?? '@me')) // there is no message attached as the message could not exist yet
            // eslint-disable-next-line no-underscore-dangle
            .replace('%templateParameters%', JSON.stringify((log.data.options as any)._hoistedOptions)) // small tricks to get all parameter
            .replace('%templateChannelType%', `${log.data.channel?.type ?? 'N/A'}`);
          break;

        default:
          break;
      }

      // clean up
      message += tmp
        .replace('%templateURL%', 'N/A')
        .replace('%templateChannelType%', 'N/A')
        .replace('%templateParameters%', 'N/A')
        .replace('%templateContent%', 'N/A')
        .replace('%templateEmbeds%', 'N/A')
        .replace('%templateComponents%', 'N/A')
        .replace('%templateCreatedTimestamp%', 'N/A')
        .replace('%templateIndex%', (len - index).toString())
        .replace('%templateTimestampLogged%', `${log.timestamp} | ${new Date(log.timestamp)
          .toLocaleDateString('en-UK', { timeZone: 'UTC' })} ${new Date(log.timestamp)
          .toLocaleTimeString('en-UK', { timeZone: 'UTC' })} (UTC)`);
    });

    const buffer = Buffer.from(message, 'utf-8');
    return new AttachmentBuilder(buffer, { name: 'log.txt' });
  }

  /**
   * Methods that sends recent logs to the debug channel on the dev server.
   * @param {Client} client - The bot client instance.
   * @param error - The error that was thrown.
   * @param type - The type of error that was thrown.
   */
  public static async sendLog(client: Client, error: any, type: string): Promise<void> {
    await (async () => {
      Logger.log('error', 'An error has occurred', error);

      const channel = client.channels.cache.get(settings.debugChannel);

      // if no channel is found, do nothing (avoid infinite loop)
      if (!channel) return;

      // the channel needs to be a text based if we wants to send a message
      if (channel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setAuthor({ name: type, iconURL: Images.get('error') })
        .setColor(Colors.RED)
        .setDescription(`\`\`\`bash\n${error.stack || JSON.stringify(error)}\n\`\`\``)
        .setFooter({ text: client.user!.username, iconURL: client.user?.avatarURL() ?? undefined })
        .setTimestamp();

      // send the embed first
      await (channel as TextBasedChannel)
        .send({ embeds: [embed] })
        .catch(console.error);

      // send the log file afterwards
      // (otherwise they are swapped in when attached to the message embed)
      await (channel as TextBasedChannel)
        .send({ files: [Logger.buildLogFile(client, error)] })
        .catch(console.error);
    })().catch(console.error);
  }
}
