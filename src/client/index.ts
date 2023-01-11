import SETTINGS from '@config/settings.json';
import TOKENS from '@config/tokens.json';

import {
  ButtonInteraction,
  Client,
  ClientOptions,
  Collection,
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  ModalSubmitInteraction,
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
  IModal,
  IButton,
  TEditions,
  IPack,
} from '@interfaces';

import { getFileNames, Logger, Repository } from '@utils';
import path from 'path';
import fs from 'fs';

export { ExClient as Client };

export type LogEvent = Message
| CommandInteraction
| ButtonInteraction
| Guild
| GuildMember
| ModalSubmitInteraction
| SelectMenuInteraction;

export type LogStr = 'message'
| 'modal'
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

  public buttons: Collection<string, IButton> = new Collection();
  public commands: Collection<string, ICommand> = new Collection();
  public events: Collection<string, IEvent> = new Collection();
  public modals: Collection<string, IModal> = new Collection();

  public repositories: Array<Repository> = [];

  private storedLogs: Array<Log> = [];
  private latestLogIndex: number = -1;
  private maxLogsStored: number = 100;

  constructor(options: ClientOptions) {
    super(options);
    this.tokens = TOKENS;
    this.settings = SETTINGS;
  }

  /**
   * Start the client & load all the modules.
   */
  public start(): void {
    this.login(TOKENS.bot)
      .catch((error) => Logger.log('error', 'You did not specify the client token in the tokens.json file.', error))
      .then(() => this.loadEvents())
      .then(() => this.loadButtons())
      .then(() => this.loadCommands())
      .then(() => this.loadModals())
      .then(() => this.loadRepositories())
      .finally(() => Logger.log('debug', 'Client successfully loaded!'));

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
   * Load submodules as repositories.
   */
  private loadRepositories() {
    const filepath = path.join(__dirname, '../..', '.gitmodules');
    const content: Array<{ git: string, local: string }> = [];
    this.repositories = [];

    fs.readFileSync(filepath, 'utf8')
      .replaceAll('\t', '')
      .replaceAll('\r', '')
      .split('\n')
      .filter((line) => line.length > 0)
      .filter((line) => !line.startsWith('[submodule'))
      .forEach((line: string, index: number) => {
        const i = index % 2 ? index - 1 : index;
        if (!content[i]) content[i] = { git: '', local: '' };

        if (index % 2 === 1) [, content[i].git] = line.split(' = ');
        if (index % 2 === 0) [, content[i].local] = line.split(' = ');
      });

    content.forEach((item) => {
      const [, name, edition] = item.local.split('/');
      this.repositories.push(new Repository(name as IPack['value'], edition as TEditions, item.git, item.local));
    });

    Logger.log('debug', 'Loaded repositories');
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
            this.events.set(event.id, event);
            this.on(event.id, (...args) => event.run(this, ...args));
          });
      });

    Logger.log('debug', 'Loaded events');
  }

  /**
   * Load & update slash commands from the ./interactions/commands/** directory.
   */
  private async loadCommands() {
    const filepath = path.join(__dirname, 'interactions/commands');
    const commandsGlobal: Array<RESTPostAPIApplicationCommandsJSONBody> = [];
    const commandsPrivate: Array<RESTPostAPIApplicationCommandsJSONBody> = [];

    const files = getFileNames(filepath, true)
      .filter((file) => file.endsWith('.ts' || '.js') && !file.includes('.params.'));

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

    Logger.log('debug', 'Loaded commands');
  }

  /**
   * Load & associate all modals from the ./interactions/modals/** directory.
   */
  private loadModals() {
    const filepath = path.join(__dirname, 'interactions/modals');

    getFileNames(filepath, true)
      .filter((file) => file.endsWith('.ts' || '.js'))
      .forEach((file) => {
        import(file)
          .then((module) => {
            const modal: IModal = module.default;
            this.modals.set(modal.id, modal);
          });
      });

    Logger.log('debug', 'Loaded modals');
  }

  /**
   * Load & associate all buttons from the ./interactions/buttons/** directory.
   */
  private loadButtons() {
    const filepath = path.join(__dirname, 'interactions/buttons');

    getFileNames(filepath, true)
      .filter((file) => file.endsWith('.ts' || '.js'))
      .forEach((file) => {
        import(file)
          .then((module) => {
            const button: IButton = module.default;
            this.buttons.set(button.id, button);
          });
      });

    Logger.log('debug', 'Loaded buttons');
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
