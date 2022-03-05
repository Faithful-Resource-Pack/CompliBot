import { Client, ClientOptions, Collection, Guild, TextChannel, VoiceChannel } from "discord.js";
import { Message, EmittingCollection, Automation } from "@client";
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
import { init as initCommands } from "@functions/commandProcess";
import { errorHandler } from "@functions/errorHandler";
import { err, info, success } from "@helpers/logger";
import { Submission } from "@class/submissions";
import { Poll } from "@class/poll";

import { readdirSync } from "fs";
import { REST } from "@discordjs/rest";
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";

import path from "path";
import chalk from "chalk";

const JSON_PATH = path.join(__dirname, "../../json"); // json folder at root
const JSON_FOLDER = path.resolve(__dirname, JSON_PATH);
const POLLS_FILENAME = "polls.json";
const SUBMISSIONS_FILENAME = "submissions.json";
const SUBMISSIONS_FILE_PATH = path.resolve(JSON_FOLDER, SUBMISSIONS_FILENAME);
// const COUNTER_FILE_PATH = path.resolve(JSON_FOLDER, "commandsProcessed.json"); //! NYI

class ExtendedClient extends Client {
	public verbose: boolean = false;
	public config: Config;
	public tokens: Tokens;
	public automation: Automation = new Automation(this);

	private lastMessages = [];
	private lastMessagesIndex = 0;

	public menus: Collection<string, SelectMenu> = new Collection();
	public buttons: Collection<string, Button> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public aliases: Collection<string, Command> = new Collection();
	public commands: Collection<string, Command> = new Collection();
	public slashCommands: Collection<string, SlashCommand> = new Collection();

	public submissions: EmittingCollection<string, Submission> = new EmittingCollection();
	public polls: EmittingCollection<string, Poll> = new EmittingCollection();

	constructor(data: ClientOptions & { verbose: boolean; config: Config; tokens: Tokens }) {
		super(data);
		this.verbose = data.verbose;
		this.config = data.config;
		this.tokens = data.tokens;
	}

	public async restart(): Promise<void> {
		console.log(`${info}restarting bot...`);
		this.destroy();
		await this.init();
	}

	private asciiArt() {
		console.log(chalk.yellowBright("\n .d8888b.                                  888 d8b ") + chalk.red("888888b.            888"));
		console.log(chalk.yellowBright("d88P  Y88b                                 888 Y8P ") + chalk.red("888  \"88b           888"));
		console.log(chalk.yellowBright("888    888                                 888     ") + chalk.red("888  .88P           888"));
		console.log(chalk.yellowBright("888         .d88b.  88888b.d88b.  88888b.  888 888 ") + chalk.red("8888888K.   .d88b.  888888 "));
		console.log(chalk.yellowBright("888        d88\"\"88b 888 \"888 \"88b 888 \"88b 888 888 ") + chalk.red("888  \"Y88b d88\"\"88b 888"));
		console.log(chalk.yellowBright("888    888 888  888 888  888  888 888  888 888 888 ") + chalk.red("888    888 888  888 888"));
		console.log(chalk.yellowBright("Y88b  d88P Y88..88P 888  888  888 888 d88P 888 888 ") + chalk.red("888   d88P Y88..88P Y88b."));
		console.log(chalk.yellowBright("\"Y8888P\"    \"Y88P\"  888  888  888 88888P\"  888 888 ") + chalk.red("8888888P\"   \"Y88P\"   \"Y888"));
		console.log(chalk.yellowBright("                                  888"));
		console.log(chalk.yellowBright("                                  888                   ")+ chalk.white("Compliance Devs. 2022 ©"));
		console.log(chalk.yellowBright("                                  888\n"));
	}

	public async init() {
		this.asciiArt();

		// login client
		this.login(this.tokens.token)
			.catch((e) => {
				// Allows for showing different errors like missing privaleged gateway intents, this caused me so much pain >:(
				console.log(`${err}${e}`);
				process.exit(1);
			})
			.then(() => {
				// commands counter
				initCommands(this);
				if (this.verbose) console.log(info + `Initialized command counter`);

				// load old commands only if dev server
				if (this.tokens.dev) this.loadCommands();
				this.loadSlashCommands();

				this.loadEvents();
				this.loadButtons();
				this.loadSelectMenus();

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

	private loadCollections = async () => {
		this.loadSubmissions();
		this.loadPolls();
		if (this.verbose) console.log(info + `Loaded collections data`);
	}

	/**
	 * SUBMISSIONS DATA
	 */
	private loadPolls = async () => {
		// read file and load it into the collection
		const submissionsObj = getData({ filename: POLLS_FILENAME, relative_path: JSON_PATH });
		Object.values(submissionsObj).forEach((poll: Poll) => {
			this.polls.set(poll.id, poll);
		});

		// events
		this.polls.events.on("dataSet", (key: string, value: Submission) => {
			this.savePolls();
		});

		this.polls.events.on("dataDeleted", (key: string) => {
			this.savePolls();
		});
	};

	private savePolls = async () => {
		let data = {};
		[...this.polls.values()].forEach((poll: Poll) => {
			data[poll.id] = poll;
		});
		setData({ filename: POLLS_FILENAME, relative_path: JSON_PATH, data: JSON.parse(JSON.stringify(data)) });
	};

	/**
	 * SUBMISSIONS DATA
	 */
	private loadSubmissions = async () => {
		// read file and load it into the collection
		const submissionsObj = getData({ filename: SUBMISSIONS_FILENAME, relative_path: JSON_PATH });
		Object.values(submissionsObj).forEach((submission: Submission) => {
			this.submissions.set(submission.id, submission);
		});

		// events
		this.submissions.events.on("dataSet", (key: string, value: Submission) => {
			this.saveSubmissions();
		});

		this.submissions.events.on("dataDeleted", (key: string) => {
			this.saveSubmissions();
		});
	};

	private saveSubmissions = async () => {
		let data = {};
		[...this.submissions.values()].forEach((submission: Submission) => {
			data[submission.id] = submission;
		});
		setData({ filename: SUBMISSIONS_FILENAME, relative_path: JSON_PATH, data: JSON.parse(JSON.stringify(data)) });
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

				//! sometimes the .find() methods doesn't find the command, needs to be investigated
				//* happens with `/reason` command
				const p = {
					id: guildSlashCommands.find((cmd) => cmd.name === (slashCommand.data as SlashCommandBuilder).name).id,
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
		const commandsArr: Array<RESTPostAPIApplicationCommandsJSONBody> = [];

		const paths: Array<string> = readdirSync(slashCommandsPath);
		// use a classic for loops to force async functions to be fullfilled
		for (let i = 0; i < paths.length; i++) {
			const dir: string = paths[i];

			const commands = readdirSync(`${slashCommandsPath}/${dir}`).filter((file) => file.endsWith(".ts"));
			for (const file of commands) {
				const { command } = require(`${slashCommandsPath}/${dir}/${file}`);

				if (command.data instanceof Function) {
					this.slashCommands.set((await (command.data as AsyncSlashCommandBuilder)(this)).name, command); // AsyncSlashCommandBuilder
					commandsArr.push((await (command.data as AsyncSlashCommandBuilder)(this)).toJSON());
				} else {
					this.slashCommands.set(command.data.name, command); // SyncSlashCommandBuilder
					commandsArr.push(command.data.toJSON());
				}
			}
		}

		const rest = new REST({ version: "9" }).setToken(this.tokens.token);
		const devID = this.config.discords.filter((s) => s.name === "dev")[0].id;

		// deploy commands only for dev discord when in dev mode
		if (this.tokens.dev) {
			rest
				.put(Routes.applicationGuildCommands(this.tokens.appID, devID), { body: commandsArr })
				.then(() => {
					console.log(`${success}Successfully added slash commands to dev server`);
					this.loadSlashCommandsPerms();
				})
				.catch(console.error);
		}
		// deploy commands globally
		else {
			rest
				.put(Routes.applicationCommands(this.tokens.appID), {
					body: commandsArr,
				})
				.then(() => {
					console.log(`${success}Successfully added global slash commands`); 
					this.loadSlashCommandsPerms();
				})
				.catch(console.error);
		}

	}

	/**
	 * CLASSIC COMMAND HANDLER
	 * todo: remove this once all commands are implemented as slash commands
	 */
	private loadCommands = () => {
		const commandPath = path.join(__dirname, "..", "Commands");
		readdirSync(commandPath).forEach((dir) => {
			const commands = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith(".ts"));

			for (const file of commands) {
				const { command } = require(`${commandPath}/${dir}/${file}`);
				this.commands.set(command.name, command);

				if (command.aliases) {
					if (command.aliases.length !== 0) {
						command.aliases.forEach((alias) => {
							this.aliases.set(alias, command);
						});
					}
				}
			}
		});
		
		if (this.verbose) console.log(info + `Loaded classical commands`);
	};

	/**
	 * Read "Events" directory and add them as events
	 * !! broke if dir doesn't exist
	 */
	private loadEvents = (): void => {
		const eventPath = path.join(__dirname, "..", "Events");

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
		const buttonPath = path.join(__dirname, "..", "Buttons");

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
		const menusPath = path.join(__dirname, "..", "Menus");

		readdirSync(menusPath).forEach(async (dir) => {
			const menus = readdirSync(`${menusPath}/${dir}`).filter((file) => file.endsWith(".ts"));

			for (const file of menus) {
				const { menu } = await import(`${menusPath}/${dir}/${file}`);
				this.menus.set(menu.selectMenuId, menu);
			}
		});
	};

	/**
	 * Store last 5 messages to get more context when debugging
	 * @author Juknum
	 */

	public storeMessage(message: Message) {
		this.lastMessages[this.lastMessagesIndex] = message;
		this.lastMessagesIndex = (this.lastMessagesIndex + 1) % 5; // store 5 last messages
	}

	public getLastMessages(): Array<Message> {
		return this.lastMessages;
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
		 * > this below won't fails nor return any erros, the operation is only delayed (not if client is restarted)
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
