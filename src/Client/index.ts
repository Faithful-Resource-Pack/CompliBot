// import { Client } from "discord-slash-commands-client";
import { Channel, Client, Collection, Guild, TextChannel, VoiceChannel } from 'discord.js';
import Message from '@src/Client/message';
import path from 'path';
import { readdirSync } from 'fs';
import { Command, Event, Config, Tokens } from '@src/Interfaces';
import ConfigJson from '@/config.json';
import TokensJson from '@/tokens.json';

import { init as initCommands } from '@src/Functions/commandProcess';
import { unhandledRejection } from '@src/Functions/unhandledRejection';

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommand } from '@src/Interfaces/slashCommand';

class ExtendedClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public slashCommands: Collection<string, SlashCommand> = new Collection();
	public aliases: Collection<string, Command> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public config: Config = ConfigJson;
	public tokens: Tokens = TokensJson;

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

		//slash commands handler
		const slashCommandsPath = path.join(__dirname, '..', 'Slash Commands');


		readdirSync(slashCommandsPath).forEach(async (dir) => {
			const commands = readdirSync(`${slashCommandsPath}/${dir}`).filter(file => file.endsWith('.ts'));
			for (const file of commands) {
				const { command } = require(`${slashCommandsPath}/${dir}/${file}`);
				this.slashCommands.set(command.data.name, command);
			}
		})

		let commandsArr: any[] = [];
		this.slashCommands.each((c: SlashCommand) => commandsArr.push(c.data));

		const rest = new REST({ version: "9" }).setToken(this.tokens.token);
		if (this.tokens.dev) {
			rest.put(Routes.applicationGuildCommands(this.tokens.appID, this.config.discords.filter(s => s.name === 'dev')[0].id), { body: commandsArr.map(c => c.toJSON()) })
				.then(() => console.log('succeed dev'))
				.catch(console.error);
		}
		else {
			rest.put(Routes.applicationCommands(this.tokens.appID), { body: commandsArr.map(c => c.toJSON()) })
				.then(() => console.log('succeed all'))
				.catch(console.error);
		}

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
	public updateMembers(guildID: string, channelID: string): void {
		if (!guildID || !channelID) return;

		let guild: Guild;
		let channel: Channel

		try {
			guild = this.guilds.cache.get(guildID);
			channel = guild.channels.cache.get(channelID);
		} catch (_err) { return; }

		if (guild && channel) switch (channel.type) {
			case 'GUILD_VOICE':
				(channel as VoiceChannel).setName(`Members: ${guild.memberCount}`);
				break;
			case 'GUILD_TEXT':
			default:
				(channel as TextChannel).setName(`members-${guild.memberCount}`);
				break;
		}
	}

}
export default ExtendedClient;
