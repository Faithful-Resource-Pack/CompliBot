import { TextChannel } from "discord.js";
import { Message } from "@client";

export type Votes = Record<string, string[]>;

export interface AllVotes {
	readonly upvote: number;
	readonly downvote: number;
}

export type EmbedStatus = "pending" | "ended";

/**
 * Base class for polls and other miscellaneous timed embeds
 * @author Juknum
 */
export class TimedEmbed {
	readonly id: string;
	private messageId: string;
	private channelId: string;
	private votes: Votes;
	private status: EmbedStatus = "pending";
	private timeout = 0; // used for end of events (pending until...)
	private anonymous = true;
	private multipleAnswers = false;

	constructor(data?: TimedEmbed) {
		if (data) {
			// set all data equal
			Object.entries(data).forEach(([k, v]) => {
				this[k] = v;
			});
			return;
		}

		this.id = new Date().getTime().toString();
		this.setVotes({ upvote: [], downvote: [] });
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
	 * @param votes the votes to set
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

	public getAllVotes(): AllVotes {
		return Object.entries(this.votes).reduce(
			(acc, [key, value]) => ({ ...acc, [key]: value.length }),
			{ upvote: 0, downvote: 0 },
		);
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
		if (!this.multipleAnswers)
			// remove user vote for all others categories
			Object.keys(this.votes).forEach((key: string) => this.removeVote(key, id));

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
		Object.values(this.votes).forEach((arr) => {
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
		// if there's an id property it's a Message, else string
		this.messageId = message.id ? message.id : message;
		return this;
	}

	/**
	 * Get the Discord channel ID of the embed
	 */
	public getChannelId(): string {
		return this.channelId;
	}

	/**
	 * Set the Discord channel ID of the embed
	 * @param channel Discord channel OR Discord channel ID
	 */
	public setChannelId(channel: string): this;
	public setChannelId(channel: TextChannel): this;
	public setChannelId(channel: any) {
		// if there's an id property it's a TextChannel, else string
		this.channelId = channel.id ? channel.id : channel;
		return this;
	}

	/**
	 * Get embed status
	 */
	public getStatus() {
		return this.status;
	}

	/**
	 * Set embed status
	 */
	public setStatus(status: EmbedStatus) {
		this.status = status;
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
	public setTimeout(value: any) {
		this.timeout =
			value instanceof Date
				? (this.timeout = parseInt((value.getTime() / 1000).toFixed(0)))
				: value;
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
