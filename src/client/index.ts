import settings from '@config/settings.json';
import tokens from '@config/tokens.json';

import {
  Client,
  ClientOptions,
  Collection,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';

import {
  ITokens,
  ISettings,
  IEvent,
  ICommand,
  IAsyncData,
} from '@interfaces';

import { Logger } from '@utils';
import path from 'path';
import fs from 'fs';

export { ExClient as Client };

class ExClient extends Client {
  readonly tokens: ITokens;
  readonly settings: ISettings;

  public events: Collection<string, IEvent> = new Collection();
  public commands: Collection<string, ICommand> = new Collection();

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
      .catch(() => Logger.log('error', 'You did not specify the client token in the tokens.json file.'))
      .then(async () => {
        /** await */ this.loadEvents();
        await this.loadCommands();
        // this.loadCollections();
        // this.startProcesses();
      })
      .finally(() => Logger.log('info', '[4/4] Client successfully started'));

    process.on('unhandledRejection', (error) => Logger.sendError(this, error, 'unhandledRejection'));
    process.on('uncaughtException', (error) => Logger.sendError(this, error, 'uncaughtException'));
  }

  /**
   * Properly restart the client.
   */
  public restart(): void {
    this.destroy();
    this.start();
  }

  loadEvents() {
    Logger.log('info', '[1/4] Loading events');

    const filepath = path.join(__dirname, 'events');

    fs.readdirSync(filepath)
      .filter((file) => file.endsWith('.ts' || '.js'))
      .forEach((file) => {
        import(`${filepath}/${file}`)
          .then((module) => {
            const event: IEvent = module.default;
            this.events.set(event.name, event);
            this.on(event.name, (...args) => event.run(this, ...args));
          });
      });
  }

  private async loadCommands() {
    Logger.log('info', '[2/4] Loading commands');

    const filepath = path.join(__dirname, 'commands');
    const commandsGlobal: Array<RESTPostAPIApplicationCommandsJSONBody> = [];
    const commandsPrivate: Array<RESTPostAPIApplicationCommandsJSONBody> = [];

    const files = fs.readdirSync(filepath).filter((file) => file.endsWith('.ts' || '.js'));
    for (let i = 0; i < files.length; i += 1) {
      const { default: command } = await import(`${filepath}/${files[i]}`);

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

      if (commandsPrivate.length > 0) await rest.put(Routes.applicationGuildCommands(this.settings.clientId, this.settings.devGuildId), { body: commandsPrivate });
      if (commandsGlobal.length > 0) {
        const guildIds = this.guilds.cache.map((guild) => guild.id);
        for (let i = 0; i < guildIds.length; i += 1) {
          await rest.put(Routes.applicationGuildCommands(this.settings.clientId, guildIds[i]), { body: commandsGlobal });
        }
      }

      Logger.log('info', 'Successfully reloaded application (/) commands.');
    } catch (error) {
      Logger.log('error', 'refreshApplicationCommands', error);
    }
  }

  public setSettings(key: keyof ISettings, value: unknown): this {
    const json = JSON.load(path.join(__dirname, '../..', 'config', 'settings.json'));
    json[key] = value;

    JSON.save(path.join(__dirname, '../..', 'config', 'settings.json'), json);
    return this;
  }
}
