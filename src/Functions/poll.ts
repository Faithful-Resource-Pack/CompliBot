// todo: to be redone using the API & uncreated yet poll collection


// import Client from "@src/Client";
// import MessageEmbed from "@src/Client/embed";
// import Message from "@src/Client/message";
// import { ids, parseId } from "@src/Helpers/emojis";
// import { EmbedField, Guild, MessageReaction, TextChannel, User } from "discord.js";
// import { getData } from "./getDataFromJSON";
// import { setData } from "./setDataToJSON";

// export interface Poll {
// 	guildId: string;
// 	channelId: string;
// 	messageId: string;
// 	timeout: number | null;
// 	unique: boolean;
// 	votes?: Array<string>;
// 	data?: Array<DataValue>;
// }

// interface DataValue {
// 	key: string;
// 	votes: Array<string>;
// }

// export class Polls {
// 	private poll: Poll;
// 	private client: Client;
// 	public readonly _footer: string = "use /poll to set up a poll!";
// 	public readonly _field: string = "Timeout";
// 	public readonly _results: string = "Results";

// 	constructor(c: Client, p?: Poll) {
// 		if (p) this.poll = p;
// 		else
// 			this.poll = {
// 				guildId: "",
// 				channelId: "",
// 				messageId: "",
// 				unique: false,
// 				timeout: null,
// 				votes: [],
// 				data: [],
// 			};
// 		this.client = c;
// 	}

// 	public setTimeout(t: number): Polls {
// 		this.poll.timeout = t;
// 		return this;
// 	}
// 	public setChannel(id: string): Polls {
// 		this.poll.channelId = id;
// 		return this;
// 	}
// 	public setGuild(id: string): Polls {
// 		this.poll.guildId = id;
// 		return this;
// 	}
// 	public setMessage(id: string): Polls {
// 		this.poll.messageId = id;
// 		return this;
// 	}
// 	public setData(data: Array<DataValue>): Polls {
// 		this.poll.data = data;
// 		return this;
// 	}

// 	/**
// 	 * Check timeout & ends poll if so
// 	 * @returns true if the timeout is passed
// 	 */
// 	public checkTimeout(): boolean {
// 		if (this.poll.timeout !== null && new Date().getTime() >= this.poll.timeout) {
// 			this.endsPoll();
// 			return true;
// 		} else return false;
// 	}

// 	private async fetchMessage(): Promise<Message<boolean>> {
// 		let guild: Guild;
// 		try {
// 			guild = await this.client.guilds.fetch(this.poll.guildId);
// 		} catch (_err) {
// 			return undefined;
// 		}
// 		let channel: TextChannel;
// 		try {
// 			channel = (await guild?.channels.fetch(this.poll.channelId)) as TextChannel;
// 		} catch (_err) {
// 			return undefined;
// 		}
// 		let message: Message;
// 		try {
// 			message = await channel?.messages.fetch(this.poll.messageId);
// 		} catch (_err) {
// 			return undefined;
// 		}

// 		return message;
// 	}

// 	public addVote(reaction: MessageReaction, user: User): void {
// 		let data: JSON = getData({ filename: "polls.json", relative_path: "../json/" });
// 		let k: string = undefined;
// 		for (const [key, poll] of Object.entries(data))
// 			if (
// 				poll.channelId == this.poll.channelId &&
// 				poll.guildId == this.poll.guildId &&
// 				poll.messageId == this.poll.messageId
// 			)
// 				k = key;

// 		if (!k) return; // not found: not a poll message
// 		if (this.poll.data === undefined) this.poll.data = [];
// 		if (this.poll.votes === undefined) this.poll.votes = [];

// 		// if already data in the poll
// 		if (this.poll.data.filter((d: DataValue) => d.key === reaction.emoji.name).length > 0)
// 			this.poll.data.filter((d: DataValue) => d.key === reaction.emoji.name)[0].votes.push(user.id);
// 		else this.poll.data.push({ key: reaction.emoji.name, votes: [user.id] });

// 		data[k] = this.poll;
// 		setData({ filename: "polls.json", relative_path: "../json/", data: data });
// 		console.log(data);
// 	}

// 	/**
// 	 * Ends poll by updating embed
// 	 * @returns true if the message has been found & updated
// 	 */
// 	public async endsPoll(): Promise<boolean> {
// 		console.log(this.poll);

// 		const message = await this.fetchMessage();
// 		message.embeds
// 			.filter((embed: MessageEmbed) => embed.footer.text === this._footer)
// 			.forEach((embed: MessageEmbed) => {
// 				// modify the result field if it exist
// 				if (embed.fields.filter((field: EmbedField) => field.name === this._results).length > 0)
// 					embed.fields
// 						.filter((field: EmbedField) => field.name === this._results)
// 						.forEach((field: EmbedField) => {
// 							field.value = "this.poll.data.join('\n')";
// 						});
// 				// add it otherwise
// 				else embed.fields.push({ name: this._results, value: "this.poll.data.join('\n')", inline: true });
// 			});

// 		message.reactions.removeAll().catch((err) => console.error(err));
// 		message.edit({ embeds: message.embeds });
// 		return true;
// 	}

// 	/**
// 	 * Add poll to local data json file
// 	 */
// 	public async addPoll(): Promise<void> {
// 		let data: JSON = getData({ filename: "polls.json", relative_path: "../json/" });
// 		data[new Date().getTime()] = this.poll;
// 		setData({ filename: "polls.json", relative_path: "../json/", data: data });
// 	}
// }
