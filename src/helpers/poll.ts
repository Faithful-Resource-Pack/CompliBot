import { pollDelete, pollVotes, pollYesNo } from "@utility/buttons";
import { Client, Message, EmbedBuilder } from "@client";
import { ActionRowBuilder, ButtonBuilder, TextChannel } from "discord.js";
import { AllVotes, TimedEmbed, Votes } from "@helpers/timedEmbed";
import type { AnyInteraction } from "@interfaces/interactions";

export interface PollOptions {
	question: string;
	yesno: boolean;
	answersArr: string[];
	thread: boolean;
}

/**
 * Class for dealing with polls
 * @author Juknum
 */
export class Poll extends TimedEmbed {
	constructor(data?: Poll) {
		super(data);
	}

	/**
	 * More elegant way of getting the timeout string for an outcome option
	 * @author Evorp
	 * @param votes votes to check
	 * @returns appropriate string
	 */
	private getTimeoutString(votes: AllVotes) {
		if (votes.upvote > votes.downvote) return "has passed!";
		if (votes.upvote < votes.downvote) return "has not passed!";
		return "has tied!";
	}

	/**
	 * Another helper method to stop a billion nested ternaries
	 * @author Evorp
	 * @param votesCount data
	 * @param index which field
	 * @returns data in formatted string
	 */
	private getOptionString(votesCount: number[], index: number) {
		const voteCount = votesCount[index - 1];
		const totalVotes = votesCount.reduce((partialSum, a) => partialSum + a, 0);
		return `> ${voteCount} / ${totalVotes} (${((voteCount / totalVotes) * 100).toFixed(2)}%)\n`;
	}

	/**
	 * Update the discord message with the poll embed
	 * @param client Discord Client
	 */
	public async updateEmbed(client: Client) {
		let channel: TextChannel;
		let message: Message;

		try {
			channel = (await client.channels.fetch(this.getChannelId())) as TextChannel;
			message = await channel.messages.fetch(this.getMessageId());
		} catch {
			// message or channel can't be fetched
			return;
		}

		const embed = EmbedBuilder.from(message.embeds[0]);
		const components = this.getStatus() === "ended" ? [] : [...message.components];
		const isYesno = this.getVoteNames()[0] == "upvote";

		const bestOption = {
			value: 0,
			message: "",
		};

		embed.setFields(
			...message.embeds[0].fields.map((field, index) => {
				// information field, never gets changed
				if (index === 0) return field;
				const val = Number(field.value.substring(2, 3));

				// try for higher scoring option every iteration
				if (!isNaN(val)) {
					if (bestOption.value < val) {
						bestOption.value = val;
						bestOption.message = isYesno
							? this.getTimeoutString(this.getAllVotes())
							: `Option **${field.name}** won!`;
					} else if (bestOption.value === val) bestOption.message = "This vote was a tie!";
				}

				// status field is at the end so you can guarantee every option has been counted
				if (field.name === "Status") {
					if (this.getStatus() !== "ended") return field;

					field.value = `${bestOption.message}\n\n`;
					if (bestOption.message === "") field.value = "";

					field.value += `*Ended <t:${this.getTimeout()}:R>*`;
					return field;
				}

				const votesCount = this.getVotesCount();
				const votes = this.getVotes();

				// set formatted percentages in field
				field.value =
					votesCount[index - 1] === 0
						? this.getStatus() === "ended"
							? "Nobody voted."
							: "No votes yet."
						: this.getOptionString(votesCount, index);

				// add people who voted in embed
				if (!this.isAnonymous()) {
					let i = 0;

					while (
						votes[index - 1][i] !== undefined &&
						field.value.length + votes[index - 1][i].length < 1024
					) {
						field.value += `<@!${votes[index - 1][i]}> `;
						++i;
					}

					if (
						votes[index - 1][i] !== undefined &&
						field.value.length + votes[index - 1][i].length > 1024 &&
						field.value.length + ` ...`.length < 1024
					)
						field.value += ` ...`;
				}

				return field;
			}),
		);

		if (message.thread && message.thread.archived) return;
		await message.edit({ embeds: [embed], components: [...components] });
		return;
	}

	/**
	 * Post the poll message to the channel
	 * @param interaction command interaction from where the poll is issued
	 * @param embed the poll embed that will be posted in the message
	 * @param options different options for the poll
	 */
	public async postMessage(
		interaction: AnyInteraction,
		embed: EmbedBuilder,
		options: PollOptions,
	): Promise<void> {
		embed.setTitle(options.question);
		embed.setFooter({ text: `${this.id} | ${interaction.strings(true).command.poll.suggestion}` });
		embed.addFields(
			options.answersArr.map((answer: string) => ({
				name: `${answer}`,
				value: `No votes yet.`,
			})),
		);

		// votes options setup
		if (options.yesno) {
			this.setVotes({ upvote: [], downvote: [] });
		} else {
			const tmp: Votes = {};
			for (let i = 0; i < options.answersArr.length; ++i) tmp[i] = [];
			this.setVotes(tmp);
		}

		if (this.getTimeout() !== 0)
			embed.addFields({
				name: "Status",
				value: `*Will end <t:${this.getTimeout()}:R>*`,
				inline: true,
			});

		const components: ActionRowBuilder<ButtonBuilder>[] = [];
		if (options.yesno) components.push(pollYesNo);
		else {
			const btns: ButtonBuilder[] = [];
			options.answersArr.forEach((_, index) => btns.push(pollVotes[index]));
			components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(btns));
		}

		const message: Message = await interaction.editReply({
			embeds: [embed],
			components: [...components, new ActionRowBuilder<ButtonBuilder>().addComponents(pollDelete)],
		});

		if (options.question.length > 100) {
			options.question = options.question.substring(0, 96) + "...";
		}

		if (options.thread) {
			message.startThread({ name: `${options.question}` });
		}

		this.setChannelId(interaction.channelId);
		this.setMessageId(message.id);

		interaction.client.polls.set(this.id, this);
	}
}
