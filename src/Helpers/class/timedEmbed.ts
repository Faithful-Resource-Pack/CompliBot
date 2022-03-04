import { ids, parseId } from "@helpers/emojis";
import { TextChannel } from "discord.js";
import { Client, Message, MessageEmbed } from "@src/Extended Discord";

export type Votes = {
	[key: string]: Array<string>;
};

/**
 * Parent class for Poll & Submissions since most of the code here is needed for both classes
 */
export class TimedEmbed {
	readonly id: string;
	private messageId: string;
	private channelId: string;
	private votes: Votes;
	private status: string = "pending";
	private timeout: number = 0; // used for end of events (pending until...)
	private anounymous: boolean = true;

	constructor(data?: TimedEmbed) {
		if (!data) {
			this.id = new Date().getTime().toString();
			this.setVotes({ upvote: [], downvote: [] });
		} else {
			const tmp: TimedEmbed = data;
			this.id = tmp.id;
			this.messageId = tmp.messageId;
			this.channelId = tmp.channelId;
			this.votes = tmp.votes;
			this.status = tmp.status;
			this.timeout = tmp.timeout;
			this.anounymous = tmp.anounymous;
		}
	}

	public isAnonymous(): boolean {
		return this.anounymous;
	}

	public setAnonymous(a: boolean): this {
		this.anounymous = a;
		return this;
	}

	public setVotes(votes: Votes): this {
		this.votes = votes;
		return this;
	}

	public getVotes(): Array<Array<string>> {
		return Object.values(this.votes);
	}
	public getVotesCount(): Array<number> {
		return this.getVotes().map((arr) => arr.length);
	}

	public addUpvote(id: string): this {
		return this.addVote("upvote", id);
	}
	public addDownvote(id: string): this {
		return this.addVote("downvote", id);
	}
	public addVote(type: string, id: string): this {
		// the user can only vote for one side
		if (this.votes[type].includes(id)) {
			this.removeVote(type, id);
			return this;
		}

		this.votes[type].push(id);
		return this;
	}

	public removeUpvote(id: string): this {
		return this.removeVote("upvote", id);
	}
	public removeDownvote(id: string): this {
		return this.removeVote("downvote", id);
	}
	public removeVote(type: string, id: string): this {
		if (this.votes[type].includes(id)) this.votes[type].splice(this.votes[type].indexOf(id), 1);
		return this;
	}

	protected voidVotes(): this {
		this.votes = {
			upvote: [],
			downvote: [],
		};
		return this;
	}

	public getMessageId(): string {
		return this.messageId;
	}
	public setMessageId(message: string): this;
	public setMessageId(message: Message): this;
	public setMessageId(message: any) {
		if (message.id) this.messageId = message.id;
		// discord object
		else this.messageId = message; // string
		return this;
	}

	public getChannelId(): string {
		return this.channelId;
	}
	public setChannelId(channel: string): this;
	public setChannelId(channel: TextChannel): this;
	public setChannelId(channel: any) {
		if (channel.id) this.channelId = channel.id;
		// discord object
		else this.channelId = channel; // string
		return this;
	}

	public getStatus(): string {
		return this.status;
	}

	public getStatusUI(): string {
		return this.status;
	}

	public setStatus(...status: any): this {
		this.status = status[0];
		return this;
	}

	public isTimeout(): boolean {
		if (this.getTimeout() < new Date().getTime() / 1000) return true;
		return false;
	}

	public getTimeout(): number {
		return this.timeout;
	}

	public setTimeout(number: number): this;
	public setTimeout(date: Date): this;
	public setTimeout(value: any): this {
		if (value instanceof Date) this.timeout = parseInt((value.getTime() / 1000).toFixed(0));
		else this.timeout = value;
		return this;
	}
}
