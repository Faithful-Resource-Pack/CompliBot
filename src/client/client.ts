import {
	ActivityType,
	Client,
	ClientOptions,
	Collection,
	Guild,
	RESTPostAPIApplicationCommandsJSONBody,
	Routes,
	REST,
} from "discord.js";
import {
	Message,
	Automation,
	StringSelectMenuInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
} from "@client";
import { Tokens } from "@interfaces/tokens";
import { Component } from "@interfaces/components";
import { AnyInteraction, SlashCommand } from "@interfaces/interactions";
import { Event } from "@interfaces/events";
import { EmittingCollection } from "@helpers/emittingCollection";
import { setData, getData } from "@utility/handleJSON";
import { errorHandler } from "@functions/errorHandler";
import { err, info, success } from "@helpers/logger";
import { Poll } from "@helpers/poll";

import { join } from "path";
import chalk from "chalk";
import startClient from "index";
import walkSync from "@helpers/walkSync";
import axios from "axios";

const POLLS_FILENAME = "polls.json";
const COMMANDS_PROCESSED_FILENAME = "commandsProcessed.json";

export const paths = {
	json: join(process.cwd(), "json", "dynamic"), // json folder at root
	slashCommands: join(__dirname, "..", "commands"),
	events: join(__dirname, "..", "events"),
	components: {
		buttons: join(__dirname, "..", "components", "buttons"),
		menus: join(__dirname, "..", "components", "menus"),
		modals: join(__dirname, "..", "components", "modals"),
	},
};

export const restarts = ["SIGUSR1", "SIGUSR2", "SIGTERM"];
export const errors = {
	disconnect: "Disconnect",
	unhandledRejection: "Unhandled Rejection",
	uncaughtException: "Uncaught Exception",
};

export type LogAction =
	| "message"
	| "slashCommand"
	| "button"
	| "selectMenu"
	| "modal"
	| "guildMemberUpdate"
	| "guildJoined";

export type LogData = Message | Guild | AnyInteraction;

export type Log = {
	type: LogAction;
	data: any; // technically LogData but TS breaks without this
};

export interface FaithfulGuild {
	id: string;
	invite?: string;
	member_log?: string;
}

/**
 * Extend client class to add message component collections, tokens, and slash commands directly
 * @author Nick, Evorp, Juknum
 * @template Ready so interfaces don't complain about overriding classes wrong
 */
export class ExtendedClient<Ready extends boolean = boolean> extends Client<Ready> {
	public verbose = false;
	public firstStart = true; // used for prettier restarting in dev mode
	public readonly tokens: Tokens;
	public readonly automation = new Automation(this);

	private readonly _logs: Log[] = [];
	private maxLogs = 50;
	private lastLogIndex = 0;

	public readonly menus = new Collection<string, Component<StringSelectMenuInteraction>>();
	public readonly buttons = new Collection<string, Component<ButtonInteraction>>();
	public readonly modals = new Collection<string, Component<ModalSubmitInteraction>>();
	public readonly slashCommands = new Collection<string, SlashCommand>();

	public polls = new EmittingCollection<string, Poll>();
	public commandsProcessed = new EmittingCollection<string, number>();

	constructor(data: ClientOptions & { tokens: Tokens }, firstStart = true) {
		super(data);
		this.verbose = data.tokens.verbose;
		this.tokens = data.tokens;
		this.firstStart = firstStart;
	}

	public init(interaction?: AnyInteraction) {
		// pretty stuff so it doesnt print the logo upon restart
		if (!this.firstStart) {
			console.log(`${success}Restarted`);
			if (interaction) interaction.editReply({ content: "Reboot succeeded!" });
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

				this.loadComponents();
				this.loadEvents();
				this.loadCollections();

				this.automation.start();
			});

		// all possible restart events (might depend on OS?)
		restarts.forEach((event) => process.on(event, () => this.restart()));

		// all error types
		Object.entries(errors).forEach(([err, errDisplay]) =>
			process.on(err, (reason) => {
				if (reason) errorHandler(this, reason, errDisplay);
			}),
		);

		return this;
	}

	public async restart(interaction?: AnyInteraction) {
		console.log(`${info}Restarting bot...`);
		this.destroy();
		startClient(false, interaction);
	}

	//prettier-ignore
	private asciiArt() {
		const darkColor = chalk.hex(this.tokens.maintenance === false ? "#0026ff" : "#ff8400");
		const lightColor = chalk.hex(this.tokens.maintenance === false ? "#0066ff" : "#ffc400");

		console.log("\n\n")
		console.log(darkColor` .d8888b.                                  888 d8b ` + lightColor`888888b.            888`);
		console.log(darkColor`d88P  Y88b                                 888 Y8P ` + lightColor`888  "88b           888`);
		console.log(darkColor`888    888                                 888     ` + lightColor`888  .88P           888`);
		console.log(darkColor`888         .d88b.  88888b.d88b.  88888b.  888 888 ` + lightColor`8888888K.   .d88b.  888888`);
		console.log(darkColor`888        d88""88b 888 "888 "88b 888 "88b 888 888 ` + lightColor`888  "Y88b d88""88b 888`);
		console.log(darkColor`888    888 888  888 888  888  888 888  888 888 888 ` + lightColor`888    888 888  888 888`);
		console.log(darkColor`Y88b  d88P Y88..88P 888  888  888 888 d88P 888 888 ` + lightColor`888   d88P Y88..88P Y88b.`);
		console.log(darkColor` "Y8888P"   "Y88P"  888  888  888 88888P"  888 888 ` + lightColor`8888888P"   "Y88P"   "Y888`);
		console.log(darkColor`                                  888`);
		console.log(darkColor`                                  888                   ` + chalk.white.bold`Faithful Devs. ${new Date().getFullYear()}`);
		console.log(darkColor`                                  888                ` + chalk.gray.italic(this.tokens.maintenance === false ? "~ Made lovingly with pain\n" : "    Maintenance mode!\n"));
	}

	private loadCollections() {
		this.loadCollection(this.polls, POLLS_FILENAME, paths.json);
		this.loadCollection(this.commandsProcessed, COMMANDS_PROCESSED_FILENAME, paths.json);
		if (this.verbose) console.log(`${info}Loaded collection data`);
	}

	/**
	 * Read and load data from a JSON file into emitting collection with events
	 * @author Nick, Juknum
	 * @param collection collection to load into
	 * @param filename
	 * @param relativePath
	 */
	private loadCollection<V>(
		collection: EmittingCollection<string, V>,
		filename: string,
		relativePath: string,
	) {
		const obj: Record<string, V> = getData({ filename, relativePath });
		Object.entries(obj).forEach(([k, v]) => collection.set(k, v));

		collection.events.on("dataSet", () =>
			this.saveEmittingCollection(collection, filename, relativePath),
		);

		collection.events.on("dataDeleted", () =>
			this.saveEmittingCollection(collection, filename, relativePath),
		);
	}

	/**
	 * Save an emitting collection into a JSON file
	 * @author Nick, Juknum
	 * @param collection
	 * @param filename
	 * @param relativePath
	 */
	private saveEmittingCollection<V>(
		collection: EmittingCollection<string, V>,
		filename: string,
		relativePath: string,
	) {
		let data = {};
		[...collection.keys()].forEach((k) => {
			data[k] = collection.get(k);
		});

		setData({ filename, relativePath, data: JSON.parse(JSON.stringify(data)) });
	}

	/**
	 * Remove slash commands from the menu
	 * @author Nick
	 */
	public async deleteGlobalSlashCommands() {
		console.log(`${success}deleting slash commands`);

		const rest = new REST({ version: "10" }).setToken(this.tokens.token);
		const commands = (await rest.get(Routes.applicationCommands(this.user.id))) as any[];
		await Promise.all(
			commands.map((command) =>
				rest.delete(`${Routes.applicationCommands(this.user.id)}/${command.id}`),
			),
		);
		console.log(`${success}Delete complete`);
	}

	/**
	 * Load slash commands
	 * @author Nick, Juknum
	 */
	public async loadSlashCommands() {
		const commandsArr: {
			servers: string[];
			command: RESTPostAPIApplicationCommandsJSONBody;
		}[] = [];

		const commands = walkSync(paths.slashCommands).filter((file) => file.endsWith(".ts"));
		for (const file of commands) {
			const command: SlashCommand = require(file).command;

			if (command.data instanceof Function) {
				// for dynamic data (e.g. /missing)
				const data = await command.data(this);
				this.slashCommands.set(data.name, command);
				commandsArr.push({
					servers: command.servers,
					command: data.toJSON(),
				});
			} else {
				// regular data
				this.slashCommands.set(command.data.name, command);
				commandsArr.push({ servers: command.servers, command: command.data.toJSON() });
			}
		}

		const rest = new REST({ version: "10" }).setToken(this.tokens.token);
		const allGuilds: Record<string, FaithfulGuild> = (
			await axios.get(`${this.tokens.apiUrl}settings/discord.guilds`)
		).data;

		// lock all commands to dev server
		if (this.tokens.dev)
			commandsArr.forEach((el) => {
				el.servers = ["dev"];
			});

		const guilds: Record<string, RESTPostAPIApplicationCommandsJSONBody[]> = { global: [] };
		for (const cmd of commandsArr) {
			if (cmd.servers) {
				cmd.servers.forEach((server) => {
					if (!guilds[server]) guilds[server] = [];
					guilds[server].push(cmd.command);
				});
				continue;
			}
			guilds.global.push(cmd.command);
		}

		for (const [name, { id }] of Object.entries(allGuilds)) {
			// if the client isn't in the guild, skip it
			if (!this.guilds.cache.get(id)) continue;
			// add guild-specific commands (e.g. /eval)
			await rest
				.put(Routes.applicationGuildCommands(this.user.id, id), {
					body: guilds[name],
				})
				.then(() => console.log(`${success}Successfully added slash commands to server: ${name}`))
				.catch((err) => console.error(err));
		}

		// we add global commands to all guilds (only if not in dev mode)
		if (!this.tokens.dev) {
			await rest.put(Routes.applicationCommands(this.user.id), { body: guilds.global });
			console.log(`${success}Successfully added global slash commands`);
		}
	}

	/**
	 * Load client events
	 * @author Nick
	 */
	private loadEvents() {
		if (this.tokens.maintenance)
			return this.on("ready", async () => {
				this.user.setPresence({
					activities: [{ name: "under maintenance", type: ActivityType.Playing }],
					status: "idle",
				});
				this.user.setStatus("idle");
			});

		const events = walkSync(paths.events).filter((file) => file.endsWith(".ts"));
		for (const file of events) {
			const event: Event = require(file).default;
			// bind is just for adding ExtendedClient as the first argument always
			this.on(event.name as string, event.execute.bind(null, this));
		}
	}

	/**
	 * Convenience method to load all components at once
	 * @author Evorp
	 */
	private loadComponents() {
		for (const [key, path] of Object.entries(paths.components)) this.loadComponent(this[key], path);
		if (this.verbose) console.log(`${info}Loaded Discord components`);
	}

	/**
	 * Read given directory and add them to needed collection
	 * @author Evorp
	 * @param collection collection to load into
	 * @param path filepath to read and load component data from
	 */
	private loadComponent(collection: Collection<string, Component>, path: string) {
		const components = walkSync(path).filter((file) => file.endsWith(".ts"));
		for (const file of components) {
			const component: Component = require(file).default;
			collection.set(component.id, component);
		}
		return collection;
	}

	/**
	 * Store any kind of action the bot does
	 * @author Juknum
	 * @param type
	 * @param data
	 */
	public storeAction(type: LogAction, data: LogData): void {
		this.logs[this.lastLogIndex++ % this.maxLogs] = { type, data };
	}

	public get logs() {
		return this._logs;
	}
}
