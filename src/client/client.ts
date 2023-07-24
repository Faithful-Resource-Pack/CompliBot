import {
	ButtonInteraction,
	Client,
	ClientOptions,
	Collection,
	CommandInteraction,
	Guild,
	SelectMenuInteraction,
	TextChannel,
	VoiceChannel,
} from "discord.js";
import { Message, GuildMember, EmittingCollection, Automation } from "@client";
import {
	Command,
	Event,
	Config,
	Tokens,
	Button,
	SelectMenu,
	SlashCommand,
	AsyncSlashCommandBuilder,
} from "@interfaces";
import { getData } from "@functions/getDataFromJSON";
import { setData } from "@functions/setDataToJSON";
import { errorHandler } from "@functions/errorHandler";
import { err, info, success } from "@helpers/logger";
import { Poll } from "@class/poll";
import { User } from "@helpers/interfaces/moderation";

import { readdirSync } from "fs";
import { REST } from "@discordjs/rest";
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v10";

import path from "path";
import chalk from "chalk";
import { StartClient } from "index";

const JSON_PATH = path.join(__dirname, "../../json/dynamic"); // json folder at root
const POLLS_FILENAME = "polls.json";
const COMMANDS_PROCESSED_FILENAME = "commandsProcessed.json";
const MODERATION_FILENAME = "moderation.json";

export type ActionsStr =
	| "message"
	| "slashCommand"
	| "button"
	| "selectMenu"
	| "guildMemberUpdate"
	| "guildJoined";
export type Actions =
	| Message
	| GuildMember
	| Guild
	| ButtonInteraction
	| SelectMenuInteraction
	| CommandInteraction;
export type Log = {
	type: ActionsStr;
	data: any;
};

class ExtendedClient extends Client {
	public verbose: boolean = false;
	public cs: boolean = true; //cold start
	public config: Config;
	public tokens: Tokens;
	public automation: Automation = new Automation(this);

	private logs: Array<Log> = [];
	private maxLogs: number = 50;
	private lastLogIndex: number = 0;

	public menus: Collection<string, SelectMenu> = new Collection();
	public buttons: Collection<string, Button> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public aliases: Collection<string, Command> = new Collection();
	public slashCommands: Collection<string, SlashCommand> = new Collection();

	public polls: EmittingCollection<string, Poll> = new EmittingCollection();
	public commandsProcessed: EmittingCollection<string, number> = new EmittingCollection();
	public moderationUsers: EmittingCollection<string, User> = new EmittingCollection();

	constructor(
		data: ClientOptions & { verbose: boolean; config: Config; tokens: Tokens },
		coldStart: boolean = true,
	) {
		super(data);
		this.verbose = data.verbose;
		this.config = data.config;
		this.tokens = data.tokens;
		this.cs = coldStart;
	}

	public async restart(interaction?: CommandInteraction): Promise<void> {
		console.log(`${info}Restarting bot...`);
		await this.destroy();
		await StartClient(false, interaction);
	}

	//prettier-ignore
	private asciiArt() {
		const darkColor = this.tokens.maintenance === false ? "#0026ff" : "#ff8400";
		const lightColor = this.tokens.maintenance === false ? "#0066ff" : "#ffc400";

		console.log(chalk.hex(darkColor)("\n .d8888b.                                  888 d8b ")     + chalk.hex(lightColor)("888888b.            888"));
		console.log(chalk.hex(darkColor)("d88P  Y88b                                 888 Y8P ")       + chalk.hex(lightColor)("888  \"88b           888"));
		console.log(chalk.hex(darkColor)("888    888                                 888     ")       + chalk.hex(lightColor)("888  .88P           888"));
		console.log(chalk.hex(darkColor)("888         .d88b.  88888b.d88b.  88888b.  888 888 ")       + chalk.hex(lightColor)("8888888K.   .d88b.  888888 "));
		console.log(chalk.hex(darkColor)("888        d88\"\"88b 888 \"888 \"88b 888 \"88b 888 888 ")  + chalk.hex(lightColor)("888  \"Y88b d88\"\"88b 888"));
		console.log(chalk.hex(darkColor)("888    888 888  888 888  888  888 888  888 888 888 ")       + chalk.hex(lightColor)("888    888 888  888 888"));
		console.log(chalk.hex(darkColor)("Y88b  d88P Y88..88P 888  888  888 888 d88P 888 888 ")       + chalk.hex(lightColor)("888   d88P Y88..88P Y88b."));
		console.log(chalk.hex(darkColor)("\"Y8888P\"    \"Y88P\"  888  888  888 88888P\"  888 888 ")  + chalk.hex(lightColor)("8888888P\"   \"Y88P\"   \"Y888"));
		console.log(chalk.hex(darkColor)("                                  888"));
		console.log(chalk.hex(darkColor)("                                  888                   ")  + chalk.white.bold("Faithful Devs. 2023"));
		console.log(chalk.hex(darkColor)("                                  888                ")  + chalk.gray.italic(this.tokens.maintenance === false ? "~ Made lovingly with pain\n" : "    Maintenance mode!\n"));
	}

	public async init(interaction?: CommandInteraction) {
		// pretty stuff so it doesnt print the logo upon restart
		if (!this.cs) {
			console.clear();
			console.log(`\n\n${success}Restarted`);
			if (interaction) interaction.editReply("Reboot suceeded");
		} else this.asciiArt();

		// login client
		this.login(this.tokens.token)
			.catch((e) => {
				// Allows for showing different errors like missing privileged gateway intents, this caused me so much pain >:(
				console.log(`${err}${e}`);
				process.exit(1);
			})
			.then(() => {
				this.loadSlashCommands();

				this.loadEvents();
				this.loadButtons();
				this.loadSelectMenus();

				this.loadCollections();
				this.automation.start();
				if (this.verbose) console.log(info + `Started automated functions`);
				if (this.verbose) console.log(info + `Init complete`);
			});

		// catches "kill pid" (for example: nodemon restart)
		process.on("SIGUSR1", () => this.restart());
		process.on("SIGUSR2", () => this.restart());

		process.on("disconnect", (code: number) => {
			if (code !== undefined) errorHandler(this, code, "disconnect");
		});
		process.on("uncaughtException", (error, origin) => {
			if (error) errorHandler(this, error, "uncaughtException", origin);
		});
		process.on("unhandledRejection", (reason, promise) => {
			// fixes weird error when you occasionally restart the bot
			if (reason) errorHandler(this, reason, "unhandledRejection");
		});
	}

	private loadCollections = () => {
		this.loadCollection(this.polls, POLLS_FILENAME, JSON_PATH);
		this.loadCollection(this.commandsProcessed, COMMANDS_PROCESSED_FILENAME, JSON_PATH);
		this.loadCollection(this.moderationUsers, MODERATION_FILENAME, JSON_PATH);
		if (this.verbose) console.log(info + `Loaded collection data`);
	};

	/**
	 * Read & Load data from json file into emitting collection & setup events handler
	 * @param collection {EmittingCollection}
	 * @param filename {String}
	 * @param relative_path {String}
	 */
	private loadCollection = (
		collection: EmittingCollection<any, any>,
		filename: string,
		relative_path: string,
	): void => {
		const obj = getData({ filename, relative_path });
		Object.keys(obj).forEach((key: string) => {
			collection.set(key, obj[key]);
		});

		collection.events.on("dataSet", (key: string, value: any) => {
			this.saveEmittingCollection(collection, filename, relative_path);
		});
		collection.events.on("dataDeleted", (key: string) => {
			this.saveEmittingCollection(collection, filename, relative_path);
		});
	};

	/**
	 * Save an emitting collection into a JSON file
	 * @param collection {EmittingCollection}
	 * @param filename {String}
	 * @param relative_path {String}
	 */
	private saveEmittingCollection = (
		collection: EmittingCollection<any, any>,
		filename: string,
		relative_path: string,
	): void => {
		let data = {};
		[...collection.keys()].forEach((k: string) => {
			data[k] = collection.get(k);
		});
		setData({ filename, relative_path, data: JSON.parse(JSON.stringify(data)) });
	};

	/**
	 * SLASH COMMANDS DELETION
	 */
	public deleteGlobalSlashCommands = () => {
		console.log(`${success}deleting / commands`);

		const rest = new REST({ version: "9" }).setToken(this.tokens.token);
		rest.get(Routes.applicationCommands(this.tokens.appID)).then((data: any) => {
			const promises = [];
			for (const command of data)
				promises.push(
					rest.delete(`${Routes.applicationCommands(this.tokens.appID)}/${command.id}`),
				);
			return Promise.all(promises).then(() => console.log(`${success}delete succeed`));
		});
	};

	/**
	 * SLASH COMMANDS HANDLER
	 */
	public async loadSlashCommands(): Promise<void> {
		const slashCommandsPath = path.join(__dirname, "..", "commands");
		const commandsArr: Array<{
			servers: Array<string>;
			command: RESTPostAPIApplicationCommandsJSONBody;
		}> = [];

		const paths: Array<string> = readdirSync(slashCommandsPath);
		// use a classic for loop to force async functions to be fulfilled
		for (let i = 0; i < paths.length; i++) {
			const dir: string = paths[i];
			if (dir == ".DS_Store") continue;

			const commands = readdirSync(`${slashCommandsPath}/${dir}`).filter((file) =>
				file.endsWith(".ts"),
			);
			for (const file of commands) {
				const { command } = require(`${slashCommandsPath}/${dir}/${file}`);

				if (command.data instanceof Function) {
					this.slashCommands.set(
						(await (command.data as AsyncSlashCommandBuilder)(this)).name,
						command,
					); // AsyncSlashCommandBuilder
					commandsArr.push({
						servers: command.servers,
						command: (await (command.data as AsyncSlashCommandBuilder)(this)).toJSON(),
					});
				} else {
					this.slashCommands.set(command.data.name, command); // SyncSlashCommandBuilder
					commandsArr.push({ servers: command.servers, command: command.data.toJSON() });
				}
			}
		}

		const rest = new REST({ version: "9" }).setToken(this.tokens.token);

		// deploy commands only for dev discord when in dev mode
		if (this.tokens.dev)
			commandsArr.forEach((el) => {
				el.servers = ["dev"];
			});

		const guilds = { global: [] };
		commandsArr.forEach((el) => {
			if (el.servers === null || el.servers === undefined) guilds["global"].push(el.command);
			else
				el.servers.forEach((server) => {
					if (guilds[server] === undefined) guilds[server] = [];
					guilds[server].push(el.command);
				});
		});

		for (let i = 0; i < this.config.discords.length; i++) {
			const d = this.config.discords[i];

			// if the client isn't in the guild, skip it
			if (this.guilds.cache.get(d.id) === undefined) continue;
			else
				try {
					// otherwise we add specific commands to that guild
					await rest.put(Routes.applicationGuildCommands(this.tokens.appID, d.id), {
						body: guilds[d.name],
					});
					console.log(`${success}Successfully added slash commands to: ${d.name}`);
				} catch (err) {
					console.error(err);
				}
		}

		// we add global commands to all guilds (only if not in dev mode)
		if (!this.tokens.dev) {
			await rest.put(Routes.applicationCommands(this.tokens.appID), { body: guilds["global"] });
			console.log(`${success}Successfully added global slash commands`);
		}
	}

	/**
	 * Read "Events" directory and add them as events
	 * !! broke if dir doesn't exist
	 */
	private loadEvents = (): void => {
		if (this.tokens.maintenance) {
			this.on("ready", async () => {
				this.user.setPresence({
					activities: [{ name: "under maintenance", type: "PLAYING" }],
					status: "idle",
				});
				this.user.setStatus("idle");
			});
		} else {
			const eventPath = path.join(__dirname, "..", "events");

			readdirSync(eventPath)
				.filter((file) => file.endsWith(".ts"))
				.forEach(async (file) => {
					const { event } = await import(`${eventPath}/${file}`);
					this.events.set(event.name, event);
					this.on(event.name, event.run.bind(null, this));
				});
		}
	};

	/**
	 * Read "Buttons" directory and add them to the buttons collection
	 * !! broke if dir doesn't exist
	 */
	private loadButtons = (): void => {
		const buttonPath = path.join(__dirname, "..", "buttons");

		readdirSync(buttonPath).forEach(async (dir) => {
			if (dir == ".DS_Store") return;
			const buttons = readdirSync(`${buttonPath}/${dir}`).filter((file) => file.endsWith(".ts"));

			for (const file of buttons) {
				const { button } = await import(`${buttonPath}/${dir}/${file}`);
				this.buttons.set(button.buttonId, button);
			}
		});
	};

	/**
	 * Read "Menus" directory and add them to the menus collection
	 * !! broke if dir doesn't exist
	 */
	private loadSelectMenus = (): void => {
		const menusPath = path.join(__dirname, "..", "menus");

		readdirSync(menusPath).forEach(async (dir) => {
			if (dir == ".DS_Store") return;
			const menus = readdirSync(`${menusPath}/${dir}`).filter((file) => file.endsWith(".ts"));

			for (const file of menus) {
				const { menu } = await import(`${menusPath}/${dir}/${file}`);
				this.menus.set(menu.selectMenuId, menu);
			}
		});
	};

	/**
	 * Store any kind of action the bot does
	 * @param {ActionsStr} type
	 * @param {Actions} data
	 */
	public storeAction(type: ActionsStr, data: Actions): void {
		this.logs[this.lastLogIndex++ % this.maxLogs] = { type, data };
	}

	/**
	 * Get the whole logs
	 * @returns {Array<Log>}
	 */
	public getAction(): Array<Log> {
		return this.logs;
	}
}

export { ExtendedClient };
