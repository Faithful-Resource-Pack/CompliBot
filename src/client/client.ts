import { ButtonInteraction, Client, ClientOptions, Collection, CommandInteraction, Guild, SelectMenuInteraction, TextChannel, VoiceChannel } from "discord.js";
import { Message, GuildMember, EmittingCollection, Automation } from "@client";
import { Command, Event, Config, Tokens, Button, SelectMenu, SlashCommand, AsyncSlashCommandBuilder } from "@interfaces";
import { getData } from "@functions/getDataFromJSON";
import { setData } from "@functions/setDataToJSON";
import { errorHandler } from "@functions/errorHandler";
import { err, info, success } from "@helpers/logger";
import { Submission } from "@class/submissions";
import { Poll } from "@class/poll";

import { readdirSync } from "fs";
import { REST } from "@discordjs/rest";
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import { loadJavaVersions, updateJavaVersions } from "@functions/MCupdates/java";

import path from "path";
import chalk from "chalk";

const JSON_PATH = path.join(__dirname, "../../json/dynamic"); // json folder at root
const POLLS_FILENAME = "polls.json";
const SUBMISSIONS_FILENAME = "submissions.json";
const COMMANDS_PROCESSED_FILENAME = "commandsProcessed.json";

export type ActionsStr = "message" | "slashCommand" | "button" | "selectMenu" | "guildMemberUpdate" | "textureSubmitted" | "guildJoined";
export type Actions = Message | GuildMember | Guild | ButtonInteraction | SelectMenuInteraction | CommandInteraction;
export type Log = {
	type: ActionsStr,
	data: any
}

class ExtendedClient extends Client {
	public verbose: boolean = false;
	public config: Config;
	public tokens: Tokens;
	public automation: Automation = new Automation(this);

	private logs: Array<Log> = [];
	private maxLogs: number = 200;
	private lastLogIndex: number = 0;

	public menus: Collection<string, SelectMenu> = new Collection();
	public buttons: Collection<string, Button> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public aliases: Collection<string, Command> = new Collection();
	public commands: Collection<string, Command> = new Collection();
	public slashCommands: Collection<string, SlashCommand> = new Collection();

	public submissions: EmittingCollection<string, Submission> = new EmittingCollection();
	public polls: EmittingCollection<string, Poll> = new EmittingCollection();
	public commandsProcessed: EmittingCollection<string, number> = new EmittingCollection();

	constructor(data: ClientOptions & { verbose: boolean; config: Config; tokens: Tokens }) {
		super(data);
		this.verbose = data.verbose;
		this.config = data.config;
		this.tokens = data.tokens;
	}

	public async restart(int?: CommandInteraction): Promise<void> {
		console.log(`${info}restarting bot...`);
		this.destroy();
		await this.init();

		if (int) {int.editReply({ content: "reboot succeeded" })}
	}

	//prettier-ignore
	private asciiArt() {
		console.log(chalk.hex("0026ff")("\n .d8888b.                                  888 d8b ")     + chalk.hex("#0066ff")("888888b.            888"));
		console.log(chalk.hex("0026ff")("d88P  Y88b                                 888 Y8P ")       + chalk.hex("#0066ff")("888  \"88b           888"));
		console.log(chalk.hex("0026ff")("888    888                                 888     ")       + chalk.hex("#0066ff")("888  .88P           888"));
		console.log(chalk.hex("0026ff")("888         .d88b.  88888b.d88b.  88888b.  888 888 ")       + chalk.hex("#0066ff")("8888888K.   .d88b.  888888 "));
		console.log(chalk.hex("0026ff")("888        d88\"\"88b 888 \"888 \"88b 888 \"88b 888 888 ")  + chalk.hex("#0066ff")("888  \"Y88b d88\"\"88b 888"));
		console.log(chalk.hex("0026ff")("888    888 888  888 888  888  888 888  888 888 888 ")       + chalk.hex("#0066ff")("888    888 888  888 888"));
		console.log(chalk.hex("0026ff")("Y88b  d88P Y88..88P 888  888  888 888 d88P 888 888 ")       + chalk.hex("#0066ff")("888   d88P Y88..88P Y88b."));
		console.log(chalk.hex("0026ff")("\"Y8888P\"    \"Y88P\"  888  888  888 88888P\"  888 888 ")  + chalk.hex("#0066ff")("8888888P\"   \"Y88P\"   \"Y888"));
		console.log(chalk.hex("0026ff")("                                  888"));
		console.log(chalk.hex("0026ff")("                                  888                   ")  + chalk.white.bold("Compliance Devs. 2022"));
		console.log(chalk.hex("0026ff")("                                  888                ")  + chalk.gray.italic("~ Made lovingly With pain\n"));
	}

	public async init() {
		this.asciiArt();

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

				/*loadJavaVersions()
				.then(() => {
					updateJavaVersions(this);
				})*/

				this.loadCollections();
				this.automation.start();
				if (this.verbose) console.log(info + `Started automated functions`);
				if (this.verbose) console.log(info + `Init complete`);
			});

		const errorEvents = ["uncaughtException", "unhandledRejection"];
		const events = ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "SIGTERM"];

		[...errorEvents, ...events].forEach((eventType) => {
			process.on(eventType, (...args) => {
				if (errorEvents.includes(eventType)) errorHandler(this, args[0], eventType);
			});
		});
	}

	private loadCollections = () => {
		this.loadCollection(this.polls, POLLS_FILENAME, JSON_PATH);
		this.loadCollection(this.submissions, SUBMISSIONS_FILENAME, JSON_PATH);
		this.loadCollection(this.commandsProcessed, COMMANDS_PROCESSED_FILENAME, JSON_PATH);
		if (this.verbose) console.log(info + `Loaded collections data`);
	};

	/**
	 * Read & Load data from json file into emitting collection & setup events handler
	 * @param collection {EmittingCollection}
	 * @param filename {string}
	 * @param relative_path {string}
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
	 * @param filename {string}
	 * @param relative_path {string}
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
	 * SLASH COMMANDS PERMS
	 */
	private loadSlashCommandsPerms = async () => {
		if (!this.application.owner) await this.application.fetch();

		this.guilds.cache.forEach(async (guild: Guild) => {
			const fullPermissions = [];
			const guildSlashCommands = await guild.commands.fetch();

			this.slashCommands.forEach(async (slashCommand: SlashCommand) => {
				if (slashCommand.permissions === undefined) return; // no permission to be checked

				const command = guildSlashCommands.find((cmd) => cmd.name === (slashCommand.data as SlashCommandBuilder).name);
				if (command === undefined) return; // happens when settings perms of private commands to all perms

				const p = {
					id: command.id,
					permissions: [],
				};

				if (slashCommand.permissions.roles !== undefined)
					for (const id of slashCommand.permissions.roles)
						p.permissions.push({ id: id, type: "ROLE", permission: true });

				if (slashCommand.permissions.users !== undefined)
					for (const id of slashCommand.permissions.users)
						p.permissions.push({ id: id, type: "USER", permission: true });

				fullPermissions.push(p);
			});

			await guild.commands.permissions.set({ fullPermissions });
			if (this.verbose) console.log(success + `Loaded slash command perms`);
		});
	};

	/**
	 * SLASH COMMANDS DELETION
	 */
	public deleteGlobalSlashCommands = () => {
		const rest = new REST({ version: "9" }).setToken(this.tokens.token);
		rest.get(Routes.applicationCommands(this.tokens.appID)).then((data: any) => {
			const promises = [];
			for (const command of data)
				promises.push(rest.delete(`${Routes.applicationCommands(this.tokens.appID)}/${command.id}`));
			return Promise.all(promises).then(() => console.log(`${success}delete succeed`));
		});
	};

	/**
	 * SLASH COMMANDS HANDLER
	 */
	private async loadSlashCommands(): Promise<void> {
		const slashCommandsPath = path.join(__dirname, "..", "commands");
		const commandsArr: Array<{ servers: Array<string>; command: RESTPostAPIApplicationCommandsJSONBody }> = [];

		const paths: Array<string> = readdirSync(slashCommandsPath);
		// use a classic for loops to force async functions to be fulfilled
		for (let i = 0; i < paths.length; i++) {
			const dir: string = paths[i];

			const commands = readdirSync(`${slashCommandsPath}/${dir}`).filter((file) => file.endsWith(".ts"));
			for (const file of commands) {
				const { command } = require(`${slashCommandsPath}/${dir}/${file}`);

				if (command.data instanceof Function) {
					this.slashCommands.set((await (command.data as AsyncSlashCommandBuilder)(this)).name, command); // AsyncSlashCommandBuilder
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
		const devID = this.config.discords.filter((s) => s.name === "dev")[0].id;

		// deploy commands only for dev discord when in dev mode
		if (this.tokens.dev)
			commandsArr.forEach((el) => {
				el.servers = ["dev"];
			});

		const guilds = {};
		commandsArr.forEach((el) => {
			if (el.servers === null || el.servers === undefined) {
				if (guilds["global"] === undefined) guilds["global"] = [];
				guilds["global"].push(el.command);
			} else
				el.servers.forEach((server) => {
					if (guilds[server] === undefined) guilds[server] = [];
					guilds[server].push(el.command);
				});
		});

		Promise.all(
			Object.keys(guilds).map((server: string) => {
				if (server === "global")
					return rest.put(Routes.applicationCommands(this.tokens.appID), { body: guilds["global"] });
				return rest.put(
					Routes.applicationGuildCommands(
						this.tokens.appID,
						this.config.discords.filter((d) => d.name === server)[0].id,
					),
					{ body: guilds[server] },
				);
			}),
		)
			.then(() => {
				console.log(`${success}Successfully added slash commands: ${Object.keys(guilds).join(", ")}`);
				this.loadSlashCommandsPerms();
			})
			.catch(console.error);
	}

	/**
	 * Read "Events" directory and add them as events
	 * !! broke if dir doesn't exist
	 */
	private loadEvents = (): void => {
		const eventPath = path.join(__dirname, "..", "events");

		readdirSync(eventPath)
			.filter((file) => file.endsWith(".ts"))
			.forEach(async (file) => {
				const { event } = await import(`${eventPath}/${file}`);
				this.events.set(event.name, event);
				this.on(event.name, event.run.bind(null, this));
			});
	};

	/**
	 * Read "Buttons" directory and add them to the buttons collection
	 * !! broke if dir doesn't exist
	 */
	private loadButtons = (): void => {
		const buttonPath = path.join(__dirname, "..", "buttons");

		readdirSync(buttonPath).forEach(async (dir) => {
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

	/**
	 * Update Guild Member when used
	 * @author Juknum
	 * @param guildID guild ID to be updated
	 * @param channelID channel ID from the fetched guild ID to be updated
	 */
	public async updateMembers(guildID: string, channelID: string): Promise<void> {
		if (this.tokens.dev) return; // disabled for devs instances
		if (!guildID || !channelID) return;

		let guild: Guild;
		let channel: TextChannel | VoiceChannel;

		try {
			guild = await this.guilds.fetch(guildID);
			channel = (await guild.channels.fetch(channelID)) as any;
		} catch {
			return;
		}

		/**
		 * DISCLAIMER:
		 * - Discord API limits bots to modify channels name only twice each 10 minutes
		 * > this below won't fails nor return any errors, the operation is only delayed (not if client is restarted)
		 */
		switch (channel.type) {
			case "GUILD_VOICE":
				await channel.setName(`Members: ${guild.memberCount}`);
				break;
			case "GUILD_TEXT":
			default:
				await channel.setName(`members-${guild.memberCount}`);
				break;
		}
	}
}

export { ExtendedClient };
