import settings from '@config/settings.json';
import tokens from '@config/tokens.json';

import {
  ButtonInteraction,
  Client,
  ClientOptions,
  Collection,
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  SelectMenuInteraction,
} from 'discord.js';

import {
  ITokens,
  ISettings,
  IEvent,
  ICommand,
  IAsyncData,
} from '@interfaces';

import { getFileNames, Logger } from '@utils';
import path from 'path';

export { ExClient as Client };

export type LogEvent = Message
| CommandInteraction
| ButtonInteraction
| Guild
| GuildMember
| SelectMenuInteraction;

export type LogStr = 'message'
| 'guild'
| 'button'
| 'selectMenu'
| 'guildMemberUpdate'
| 'guildJoined'
| 'textureSubmitted'
| 'command';

export type Log = {
  type: LogStr;
  timestamp: number;
  data: LogEvent;
};

class ExClient extends Client {
  readonly tokens: ITokens;
  readonly settings: ISettings;

  public events: Collection<string, IEvent> = new Collection();
  public commands: Collection<string, ICommand> = new Collection();

  private storedLogs: Array<Log> = [];
  private latestLogIndex: number = -1;
  private maxLogsStored: number = 100;

  constructor(options: ClientOptions) {
    super(options);
    this.tokens = tokens;
    this.settings = settings;
  }

  /**
   * Start the client & load all the modules.
   */
  public start(): void {
    this.login(tokens.bot)
      .catch((error) => Logger.log('error', 'You did not specify the client token in the tokens.json file.', error))
      .then(() => this.loadEvents())
      .then(() => this.loadCommands())
      .finally(() => Logger.log('debug', '[3/3] Client successfully started'));

    // catches 'kill pid' (nodemon restart)
    process.on('SIGUSR1', () => this.restart());
    process.on('SIGUSR2', () => this.restart());

    process.on('disconnect', (code: number) => Logger.sendLog(this, code, 'disconnect'));
    process.on('uncaughtException', (error) => Logger.sendLog(this, error, 'uncaughtException'));
    process.on('unhandledRejection', (error) => Logger.sendLog(this, error, 'unhandledRejection'));
  }

  /**
   * Properly restart the client.
   */
  public restart(): void {
    this.destroy();
    this.start();
  }

  /**
   * Load & associate all events from the ./events directory.
   */
  private loadEvents() {
    const filepath = path.join(__dirname, 'events');

    getFileNames(filepath, true)
      .filter((file) => file.endsWith('.ts' || '.js'))
      .forEach((file) => {
        import(file)
          .then((module) => {
            const event: IEvent = module.default;
            this.events.set(event.name, event);
            this.on(event.name, (...args) => event.run(this, ...args));
          });
      });

    Logger.log('debug', '[1/3] Loaded events');
  }

  /**
   * Load & update slash commands from the ./commands/** directory.
   */
  private async loadCommands() {
    const filepath = path.join(__dirname, 'commands');
    const commandsGlobal: Array<RESTPostAPIApplicationCommandsJSONBody> = [];
    const commandsPrivate: Array<RESTPostAPIApplicationCommandsJSONBody> = [];

    const files = getFileNames(filepath, true)
      .filter((file) => file.endsWith('.ts' || '.js'));

    for (let i = 0; i < files.length; i += 1) {
      const { default: command } = await import(`${files[i]}`);

      // if command data is async, then we need to wait for it to be loaded
      if (command.data instanceof Function) {
        const json = (await (command.data as IAsyncData)(this)).toJSON();
        if (command.config().devOnly) commandsPrivate.push(json);
        else commandsGlobal.push(json);

        this.commands.set(json.name, command);
      } else {
        if (command.config().devOnly) commandsPrivate.push(command.data.toJSON());
        else commandsGlobal.push(command.data.toJSON());

        this.commands.set(command.data.name, command);
      }
    }

    const rest = new REST({ version: '10' }).setToken(this.tokens.bot);

    try {
      Logger.log('info', 'Started refreshing application (/) commands');

      if (commandsPrivate.length > 0) {
        await rest.put(Routes.applicationGuildCommands(this.settings.clientId, this.settings.devGuildId), { body: [...commandsGlobal, ...commandsPrivate] });
        Logger.log('debug', 'Successfully refreshed devs commands');
      }
      if (commandsGlobal.length > 0) {
        const guildIds = this.guilds.cache.map((guild) => guild.id);
        for (let i = 0; i < guildIds.length; i += 1) {
          if (this.settings.devGuildId !== guildIds[i]) {
            await rest.put(Routes.applicationGuildCommands(this.settings.clientId, guildIds[i]), { body: commandsGlobal });
            Logger.log('debug', `Successfully refreshed publics commands for ${guildIds[i]}`);
          }
        }
      }

      Logger.log('info', 'Successfully reloaded application (/) commands.');
    } catch (error) {
      Logger.log('error', 'refreshApplicationCommands', error);
    }

    Logger.log('debug', '[2/3] Loaded commands');
  }

  /**
   * Update the settings file in the config directory.
   * @param {keyof ISettings} key - The key of the setting to update.
   * @param value - The value to update the setting to.
   * @returns {Client}
   */
  public setSettings(key: keyof ISettings, value: any): this {
    const json = JSON.load(path.join(__dirname, '../..', 'config', 'settings.json'));
    json[key] = value;

    JSON.save(path.join(__dirname, '../..', 'config', 'settings.json'), json);
    return this;
  }

  /**
   * Log the event to the logs file.
   * @param {LogStr} type - The type of log to log.
   * @param {LogEvent} data - The data to log.
   */
  public log(type: LogStr, data: LogEvent): void {
    this.storedLogs[(this.latestLogIndex += 1) % this.maxLogsStored] = {
      type, data, timestamp: Date.now(),
    };
  }

  /**
   * Get the latest logs.
   */
  public get logs(): Array<Log> {
    return this.storedLogs;
  }
}
