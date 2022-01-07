// import { Client } from "discord-slash-commands-client";
import { Client, Collection } from 'discord.js';
import Message from '~/Client/message';
import path from 'path';
import { readdirSync } from 'fs';
import { Command, Event, Config, Tokens } from '~/Interfaces';
import ConfigJson from '@/config.json';
import TokensJson from '@/tokens.json';

import * as firestorm from 'firestorm-db';
import { init as initCommands } from '~/Functions/commandProcess';
import { unhandledRejection } from '~/Functions/unhandledRejection';

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import { SlashCommand } from '~/Interfaces/slashCommand';

class ExtendedClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public slashCommands: Collection<string, SlashCommand> = new Collection();
	public aliases: Collection<string, Command> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public config: Config = ConfigJson;
	public tokens: Tokens = TokensJson;
	public ownerIDs: string[];
	public categorys = readdirSync(path.join(__dirname, '..', 'Commands'));

	private lastMessages = [];
	private lastMessagesIndex = 0;

	public storeMessage(message: Message) {
		this.lastMessages[this.lastMessagesIndex] = message;
		this.lastMessagesIndex = (this.lastMessagesIndex + 1) % 5; // store 5 last messages
	}

	public getLastMessages(): Array<Message> {
		return this.lastMessages;
	}

	public async init() {
		this.login(this.tokens.token).catch(() => {
			console.log(
				'='.repeat(105) +
				'\nThe provided bot token is invalid! Please check if the provided token is copied correctly and try again.\n' +
				'='.repeat(105)
			);
			process.exit(1);
		});

		initCommands(this); // commands counter

		firestorm.address(this.config.firestormUrl);
		firestorm.token(this.tokens.firestormToken);

		//slash commands handler
		const slashCommandsPath = path.join(__dirname, '..', 'Slash Commands');
		const commandsArrDevs = []
		const commandsArr = []

		readdirSync(slashCommandsPath).forEach(async (dir) => {
			const commands = readdirSync(`${slashCommandsPath}/${dir}`).filter(file => file.endsWith('.ts'));

			for (const file of commands) {
				const { command } = require(`${slashCommandsPath}/${dir}/${file}`);

				this.slashCommands.set(command.data.name, command);

				if (command.dev == true) commandsArrDevs.push(command.data);
				else commandsArr.push(command.data)
			}
		})

		const rest = new REST({ version: "9" }).setToken(this.tokens.token);
		rest.put(Routes.applicationGuildCommands(this.tokens.appID, "720677267424018526"), { body: commandsArrDevs.map((c: SlashCommandBuilder) => c.toJSON()) })
			.then(() => console.log('succeed dev'))
			.catch(console.error);

		rest.put(Routes.applicationCommands(this.tokens.appID), { body: commandsArr.map((c: SlashCommandBuilder) => c.toJSON()) })
			.then(() => console.log('succeed all'))
			.catch(console.error);

		//command handling
		const commandPath = path.join(__dirname, '..', 'Commands');
		readdirSync(commandPath).forEach((dir) => {
			const commands = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith('.ts'));

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

		//event handling
		const eventPath = path.join(__dirname, '..', 'Events');
		readdirSync(eventPath).forEach(async (file) => {
			const { event } = await import(`${eventPath}/${file}`);
			this.events.set(event.name, event);
			this.on(event.name, event.run.bind(null, this));
		});

		process.on('unhandledRejection', (reason, promise) => {
			unhandledRejection(this, reason)
		})
	}
}
export default ExtendedClient;
