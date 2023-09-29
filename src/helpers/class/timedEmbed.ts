import { TextChannel } from "discord.js";
import { Message } from "@client";

export type Votes = {
	[key: string]: string[];
};

interface AllVotes {
	upvote: number;
	downvote: number;
}

/**
 * Base class for polls and other miscellaneous timed embeds
 */
export class TimedEmbed {
	readonly id: string;
	private messageId: string;
	private channelId: string;
	private votes: Votes;
	private status: string = "pending";
	private timeout = 0; // used for end of events (pending until...)
	private anonymous = true;
	private multipleAnswers = false;

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
			this.anonymous = tmp.anonymous;
			this.multipleAnswers = tmp.multipleAnswers;
		}
	}

	public isAnonymous() {
		return this.anonymous;
	}

	/**
	 * Set the embed to be anonymous or not
	 * @param b true if the embed is anonymous
	 */
	public setAnonymous(b: boolean) {
		this.anonymous = b;
		return this;
	}

	/**
	 * Global setter for votes
	 * @param votes - the votes to set
	 */
	public setVotes(votes: Votes) {
		this.votes = votes;
		return this;
	}

	/**
	 * Get Discord voter IDs
	 * @warning this function is not safe, it can return a user that is not in the guild
	 * @warning this function does not takes into account the anonymous option
	 */
	public getVotes() {
		return Object.values(this.votes);
	}

	/**
	 * Get discords voters count
	 */
	public getVotesCount() {
		return this.getVotes().map((arr) => arr.length);
	}

	public getVoteNames() {
		return Object.keys(this.votes);
	}

	public getAllVotes() {
		let total: AllVotes = { upvote: 0, downvote: 0 };
		for (const [key, value] of Object.entries(this.votes)) {
			total[key] = value.length;
		}
		return total;
	}

	/**
	 * Add an upvote to the embed
	 * @param id the user id to add
	 */
	public addUpvote(id: string) {
		return this.addVote("upvote", id);
	}

	/**
	 * Add a downvote to the embed
	 * @param id the user id to add
	 */
	public addDownvote(id: string) {
		return this.addVote("downvote", id);
	}

	/**
	 * Add any vote to the embed
	 * @param id the user id to add
	 */
	public addVote(type: string, id: string) {
		if (!this.multipleAnswers) {
			// remove user vote for all others categories
			Object.keys(this.votes).forEach((key: string) => {
				this.removeVote(key, id);
			});
		}

		if (this.hasVotedFor(type, id)) this.removeVote(type, id);
		else this.votes[type].push(id);

		return this;
	}

	/**
	 * Remove an upvote to the embed
	 * @param id the user id to remove
	 */
	public removeUpvote(id: string) {
		return this.removeVote("upvote", id);
	}

	/**
	 * Remove a downvote to the embed
	 * @param id the user id to remove
	 */
	public removeDownvote(id: string) {
		return this.removeVote("downvote", id);
	}

	/**
	 * Remove any vote to the embed
	 * @param type the type category of vote to remove
	 * @param id the user id to remove
	 */
	public removeVote(type: string, id: string) {
		if (this.hasVotedFor(type, id)) this.votes[type].splice(this.votes[type].indexOf(id), 1);
		return this;
	}

	/**
	 * Void votes from the embed
	 */
	protected voidVotes(): this {
		Object.values(this.votes).map((arr) => {
			arr.length = 0;
		});

		return this;
	}

	/**
	 * Tell if a user is in the array of voters for the given type
	 * @param type the type category of vote to remove
	 * @param id the user id to remove
	 */
	public hasVotedFor(type: string, id: string) {
		if (this.votes[type] === undefined) return false;
		return this.votes[type].includes(id);
	}

	/**
	 * Get the Discord Message Id of the embed
	 */
	public getMessageId(): string {
		return this.messageId;
	}

	/**
	 * Set the Discord Message Id of the embed
	 * @param message Discord Message OR Discord Message Id
	 */
	public setMessageId(message: string): this;
	public setMessageId(message: Message): this;
	public setMessageId(message: any) {
		if (message.id) this.messageId = message.id; // discord message object
		else this.messageId = message; // string
		return this;
	}

	/**
	 * Get the Discord Channel Id of the embed
	 */
	public getChannelId(): string {
		return this.channelId;
	}

	/**
	 * Set the Discord Channel Id of the embed
	 * @param channel - Discord Channel OR Discord Channel Id
	 */
	public setChannelId(channel: string): this;
	public setChannelId(channel: TextChannel): this;
	public setChannelId(channel: any) {
		if (channel.id) this.channelId = channel.id;
		// discord object
		else this.channelId = channel; // string
		return this;
	}

	/**
	 * Get the status of the embed
	 */
	public getStatus(): string {
		return this.status;
	}

	/**
	 * Get the status displayed in the embed of the embed
	 */
	public getStatusUI(): string {
		return this.status;
	}

	/**
	 * This functions needs to be defined here, but it is overwritten in the child classes
	 * @ignore
	 */
	public setStatus(...status: any): this {
		this.status = status[0];
		return this;
	}

	/**
	 * Tell if the time is over or not
	 */
	public isTimeout() {
		if (this.getTimeout() === 0) return false;
		if (this.getTimeout() < new Date().getTime() / 1000) return true;
		return false;
	}

	/**
	 * Get the actual timeout
	 */
	public getTimeout(): number {
		return this.timeout;
	}

	/**
	 * Set the embed timeout
	 * @param number the timeout in seconds
	 */
	public setTimeout(number: number): this;
	public setTimeout(date: Date): this;
	public setTimeout(value: any): this {
		if (value instanceof Date) this.timeout = parseInt((value.getTime() / 1000).toFixed(0));
		else this.timeout = value;
		return this;
	}

	/**
	 * Whether to let people vote on multiple answers
	 * @param bool value
	 */
	public setMultipleAnswers(bool: boolean): this {
		this.multipleAnswers = bool;
		return this;
	}
}
