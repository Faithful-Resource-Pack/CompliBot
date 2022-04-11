import { TextChannel } from "discord.js";
import { Message } from "@client";

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
	private anonymous: boolean = true;
	private multipleAnswers: boolean = false;

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

	/**
	 * This function tell if the poll/submission is anonymous or not
	 * @returns {Promise<Boolean>}
	 */
	public isAnonymous(): boolean {
		return this.anonymous;
	}

	/**
	 * Set the poll/submission to be anonymous or not
	 * @param {Boolean} b - true if the poll/submission is anonymous
	 * @returns {this}
	 */
	public setAnonymous(b: boolean): this {
		this.anonymous = b;
		return this;
	}

	/**
	 * Global setter for votes
	 * @param {Votes} votes - the votes to set
	 * @returns {this}
	 */
	public setVotes(votes: Votes): this {
		this.votes = votes;
		return this;
	}

	/**
	 * Get discords voters ids
	 * @warning this function is not safe, it can return a user that is not in the guild
	 * @warning this function does not takes into account the anonymous option
	 * @returns {Array<Array<string>>}
	 */
	public getVotes(): Array<Array<string>> {
		return Object.values(this.votes);
	}

	/**
	 * Get discords voters count
	 * @returns {Array<number>}
	 */
	public getVotesCount(): Array<number> {
		return this.getVotes().map((arr) => arr.length);
	}

	/**
	 * Add an upvote to the poll/submission
	 * @param {User.id} id - the user id to add
	 * @returns {this}
	 */
	public addUpvote(id: string): this {
		return this.addVote("upvote", id);
	}
	
	/**
	 * Add a downvote to the poll/submission
	 * @param {User.id} id - the user id to add
	 * @returns {this}
	 */
	public addDownvote(id: string): this {
		return this.addVote("downvote", id);
	}

	/**
	 * Add any vote to the poll/submission
	 * @param {User.id} id - the user id to add
	 * @returns {this}
	 */
	public addVote(type: string, id: string): this {
		if (!this.multipleAnswers) {
			// remove user vote for all others categories
			Object.keys(this.votes).forEach((key: string) => {
				if (this.votes[key].includes(id)) this.removeVote(key, id);
			})
		}

		if (this.votes[type].includes(id)) this.removeVote(type, id);
		else this.votes[type].push(id);
		
		return this;
	}
	
	/**
	 * Remove an upvote to the poll/submission
	 * @param {User.id} id - the user id to remove
	 * @returns {this}
	 */
	public removeUpvote(id: string): this {
		return this.removeVote("upvote", id);
	}

	/**
	 * Remove a downvote to the poll/submission
	 * @param {User.id} id - the user id to remove
	 * @returns {this}
	 */
	public removeDownvote(id: string): this {
		return this.removeVote("downvote", id);
	}

	/**
	 * Remove any vote to the poll/submission
	 * @param {User.id} id - the user id to remove
	 * @returns {this}
	 */
	public removeVote(type: string, id: string): this {
		if (this.votes[type].includes(id)) this.votes[type].splice(this.votes[type].indexOf(id), 1);
		return this;
	}

	/**
	 * Void votes from the poll/submission
	 * @returns {this}
	 */
	protected voidVotes(): this {
		Object.values(this.votes).map((arr: Array<string>) => {
			arr.length = 0;
		})
		
		return this;
	}

	/**
	 * Get the Discord Message Id of the poll/submission
	 * @returns {String}
	 */
	public getMessageId(): string {
		return this.messageId;
	}

	/**
	 * Set the Discord Message Id of the poll/submission
	 * @param {Message|string} message - Discord Message OR Discord Message Id
	 * @returns {this}
	 */
	public setMessageId(message: string): this;
	public setMessageId(message: Message): this;
	public setMessageId(message: any) {
		if (message.id) this.messageId = message.id; // discord message object
		else this.messageId = message; // string
		return this;
	}

	/**
	 * Get the Discord Channel Id of the poll/submission
	 * @returns {String}
	 */
	public getChannelId(): string {
		return this.channelId;
	}

	/**
	 * Set the Discord Channel Id of the poll/submission
	 * @param {TextChannel|string} channel - Discord Channel OR Discord Channel Id
	 * @returns {this}
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
	 * Get the status of the poll/submission
	 * @returns {String}
	 */
	public getStatus(): string {
		return this.status;
	}

	/**
	 * Get the status displayed in the embed of the poll/submission
	 * @returns {String}
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
	 * @returns {Boolean}
	 */
	public isTimeout(): boolean {
		if (this.getTimeout() === 0) return false;
		if (this.getTimeout() < new Date().getTime() / 1000) return true;
		return false;
	}

	/**
	 * Get the actual timeout
	 * @returns {Number}
	 */
	public getTimeout(): number {
		return this.timeout;
	}

	/**
	 * Set the poll/submission timeout
	 * @param {Number} number - the timeout in seconds
	 */
	public setTimeout(number: number): this;
	public setTimeout(date: Date): this;
	public setTimeout(value: any): this {
		if (value instanceof Date) this.timeout = parseInt((value.getTime() / 1000).toFixed(0));
		else this.timeout = value;
		return this;
	}

	/**
	 * Set the poll/submission multiple answers
	 * @param {Boolean} bool - value
	 * @returns {this}
	 */
	public setMultipleAnswers(bool: boolean): this {
		this.multipleAnswers = bool;
		return this;
	}
}
