import settings from '@config/settings.json';
import { Client } from '@client';
import chalk from 'chalk';
import { EmbedBuilder } from 'discord.js';

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
        console.log(`[${chalk.red('ERR')}] ${message}`);
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
    console.log(chalk.hex(darkColor)('                                  888                ') + chalk.gray.italic(settings.inDev === false ? '~ Made lovingly with pain\n' : '    Maintenance mode!\n'));
  }

  public static sendError(client: Client, reason: any, errorType: string) {
    const channel = client.channels.cache.get(settings.debugChannel);
    const embed = new EmbedBuilder()
      .setTitle(`${errorType} Error`)
      .setDescription(`\`\`\`bash\n${reason}\n\`\`\``)
      .setTimestamp();

    try {
      if (channel?.isTextBased()) channel.send({ embeds: [embed] });
    } catch {
      Logger.log('warn', `Could not send error message to channel ${settings.debugChannel}`);
    }

    return console.error(reason);
  }
}
