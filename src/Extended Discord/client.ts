// import { Client } from "discord-slash-commands-client";
import { Channel, Client, Collection, Guild, TextChannel, VoiceChannel } from "discord.js";
import { Message } from "@src/Extended Discord";
import path from "path";
import { readdirSync } from "fs";
import { Command, Event, Config, Tokens, Button, SelectMenu, SlashCommand } from "@src/Interfaces";
import ConfigJson from "@/config.json";
import TokensJson from "@/tokens.json";

import { init as initCommands } from "@src/Functions/commandProcess";
import { errorHandler } from "@src/Functions/errorHandler";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import { err, info, Success } from "@src/Helpers/logger";
import { bot } from "..";
import { Automation } from "./automation";

class ExtendedClient extends Client {
	public verbose: boolean = false;
	public config: Config = ConfigJson;
	public tokens: Tokens = TokensJson;
	public automation: Automation = new Automation(this);

	public async init() {
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

				// load old commands only if not dev server
				//if (this.tokens.dev) this.loadCommands();
				this.loadCommands();
				if (this.verbose) console.log(info + `Loaded classical commands`);

				// load slash commands
				this.loadSlashCommands();
				if (this.verbose) console.log(info + `Loaded slash commands`);
				this.loadSlashCommandsPerms();
				if (this.verbose) console.log(info + `Loaded slash command perms`);

				// load events
				this.loadEvents();
				if (this.verbose) console.log(info + `Loaded events`);

				// load buttons
				this.loadButtons();
				if (this.verbose) console.log(info + `Loaded buttons`);

				// load buttons
				this.loadSelectMenus();
				if (this.verbose) console.log(info + `Loaded select menus`);

				// starts automated functions
				this.automation.start();
				if (this.verbose) console.log(info + `Started automated functions`);

				if (this.verbose) console.log(info + `Init complete`);
			});

		// exit should exit; nothing should ever reach this unless its process.exit() 
		// which should exit >:(  -@nick-1666
		process.on("disconnect", (code: number) => {
			errorHandler(this, code, "disconnect");
		});
		process.on("uncaughtException", (error, origin) => {
			errorHandler(this, error, "uncaughtException", origin);
		});
		process.on("unhandledRejection", (reason, promise) => {
			errorHandler(this, reason, "unhandledRejection");
		});
	}

	public async restart(): Promise<void> {
		console.log(`${info}restarting bot...`);
		this.destroy();
		await bot.init();
	}

	/**
	 * SLASH COMMANDS PERMS
	 */
	public loadSlashCommandsPerms = async () => {
		if (!this.application?.owner) await this.application?.fetch();

		this.guilds.cache.forEach(async (guild: Guild) => {
			const fullPermissions = [];
			const guildSlashCommands = await guild.commands.fetch();

			this.slashCommands.forEach(async (slashCommand: SlashCommand) => {
				if (slashCommand.permissions === undefined) return; // no permission to be checked

				const p = {
					id: guildSlashCommands.find((cmd) => cmd.name === (slashCommand.data as SlashCommandBuilder).name).id,
					permissions: [],
				};

				if (slashCommand.permissions.roles !== undefined)
					for (const id of slashCommand.permissions.roles)
						if (guild.roles.cache.get(id)) p.permissions.push({ id: id, type: "ROLE", permission: true });

				if (slashCommand.permissions.users !== undefined)
					for (const id of slashCommand.permissions.users)
						if (guild.members.cache.get(id)) p.permissions.push({ id: id, type: "USER", permission: true });

				fullPermissions.push(p);
			});

			await guild.commands.permissions.set({ fullPermissions });
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
			return Promise.all(promises).then(() => console.log(`${Success}delete succeed`));
		});
	};

	/**
	 * SLASH COMMANDS HANDLER
	 */
	public slashCommands: Collection<string, SlashCommand> = new Collection();
	public loadSlashCommands = () => {
		const slashCommandsPath = path.join(__dirname, "..", "Slash Commands");

		readdirSync(slashCommandsPath).forEach(async (dir) => {
			const commands = readdirSync(`${slashCommandsPath}/${dir}`).filter((file) => file.endsWith(".ts"));
			for (const file of commands) {
				const { command } = require(`${slashCommandsPath}/${dir}/${file}`);
				this.slashCommands.set(command.data.name, command);
			}
		});

		let commandsArr: any[] = [];
		this.slashCommands.each((c: SlashCommand) => commandsArr.push(c.data));

		const rest = new REST({ version: "9" }).setToken(this.tokens.token);
		const devID = this.config.discords.filter((s) => s.name === "dev")[0].id;

		// deploy commands only for dev discord when in dev mode
		if (this.tokens.dev) {
			rest
				.put(Routes.applicationGuildCommands(this.tokens.appID, devID), { body: commandsArr.map((c) => c.toJSON()) })
				.then(() => console.log(`${Success}succeed dev`))
				.catch(console.error);
		} 
		// deploy commands globally
		else {
			rest
				.put(Routes.applicationCommands(this.tokens.appID), {
					body: commandsArr.map((c) => c.toJSON()),
				})
				.then(() => console.log(`${Success}succeed global commands`))
				.catch(console.error);
		}
	};

	/**
	 * CLASSIC COMMAND HANDLER
	 * todo: remove this once all commands are implemented as slash commands
	 */
	public aliases: Collection<string, Command> = new Collection();
	public commands: Collection<string, Command> = new Collection();
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
	};

	/**
	 * Read "Events" directory and add them as events
	 */
	public events: Collection<string, Event> = new Collection();
	private loadEvents = (): void => {
		const eventPath = path.join(__dirname, "..", "Events");

		//* then make the directory :D
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
	 */
	public buttons: Collection<string, Button> = new Collection();
	private loadButtons = (): void => {
		const buttonPath = path.join(__dirname, "..", "Buttons");

		//* then make the directory :D
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
	 */
	public menus: Collection<string, SelectMenu> = new Collection();
	private loadSelectMenus = (): void => {
		const menusPath = path.join(__dirname, "..", "Menus");

		//* then make the directory :D
		readdirSync(menusPath)
			.forEach(async (dir) => {
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
	private lastMessages = [];
	private lastMessagesIndex = 0;

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
		if (!guildID || !channelID) return;

		let guild: Guild;
		let channel: TextChannel | VoiceChannel;

		try {
			guild = await this.guilds.fetch(guildID);
			channel = (await guild.channels.fetch(channelID)) as any;
		} catch { return; }

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
