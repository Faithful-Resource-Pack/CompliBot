import { pollDelete, pollVotes, pollYesNo } from "@helpers/buttons";
import { Client, ChatInputCommandInteraction, Message, EmbedBuilder } from "@client";
import {
	ActionRowBuilder,
	ButtonBuilder,
	TextChannel,
	EmbedField,
	MessageActionRowComponentBuilder,
} from "discord.js";
import { TimedEmbed } from "./timedEmbed";

export interface PollOptions {
	question: string;
	yesno: boolean;
	answersArr: string[];
	thread: boolean;
}
export class Poll extends TimedEmbed {
	constructor(data?: Poll) {
		super(data);
	}

	/**
	 * Update the discord message with the poll embed
	 * @param client Discord Client
	 */
	public async updateEmbed(client: Client): Promise<void> {
		let channel: TextChannel;
		let message: Message;

		try {
			channel = (await client.channels.fetch(this.getChannelId())) as any;
			message = await channel.messages.fetch(this.getMessageId());
		} catch {
			// message or channel can't be fetched
			return;
		}

		const embed = EmbedBuilder.from(message.embeds[0]);
		let components = [...message.components];
		let isYesno: boolean = false;

		if (this.getStatus() === "ended") components = [];
		if (this.getVoteNames()[0] == "upvote") isYesno = true;
		let bestOption = [0, ""];

		// djs v14 workaround
		embed.setFields(
			...message.embeds[0].fields.map((field: EmbedField, index: number) => {
				if (index === 0) return field;
				const val: number = parseInt(field.value.substring(2, 3));
				if (!Number.isNaN(val)) {
					// if it can't be casted to a number no votes have been made yet
					if ((bestOption[0] as number) < val) {
						bestOption[0] = val;
						bestOption[1] = isYesno
							? `This vote ${
									this.getAllVotes().upvote > this.getAllVotes().downvote
										? "has passed!"
										: this.getAllVotes().upvote == this.getAllVotes().downvote
										? "has tied!"
										: "has not passed!"
							  }`
							: `Option **${field.name}** won!`;
					} else if ((bestOption[0] as number) === val) {
						bestOption[1] = "This vote was a tie!";
					}
				}
				if (field.name === "Status") {
					if (this.getStatus() === "ended") {
						field.value = "";
						if (bestOption[1] !== "") field.value = `${bestOption[1]}\n\n`;
						field.value += `*Ended <t:${this.getTimeout()}:R>*`;
					}
					return field;
				}

				const votesCount = this.getVotesCount();
				const votes = this.getVotes();

				field.value =
					votesCount[index - 1] === 0
						? this.getStatus() === "ended"
							? "Nobody has voted."
							: "No votes yet."
						: `> ${votesCount[index - 1]} / ${votesCount.reduce(
								(partialSum, a) => partialSum + a,
								0,
						  )} (${(
								(votesCount[index - 1] / votesCount.reduce((partialSum, a) => partialSum + a, 0)) *
								100
						  ).toFixed(2)}%)\n`;

				if (this.isAnonymous() === false) {
					let i = 0;

					while (
						votes[index - 1][i] !== undefined &&
						field.value.length + votes[index - 1][i].length < 1024
					) {
						field.value += `<@!${votes[index - 1][i]}> `;
						i++;
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
		interaction: ChatInputCommandInteraction,
		embed: EmbedBuilder,
		options: PollOptions,
	): Promise<void> {
		embed.setTitle(options.question);
		embed.setFooter({ text: `${this.id} | Use /poll to make a poll!` });
		embed.addFields(
			options.answersArr.map((answer: string) => {
				return { name: `${answer}`, value: `No votes yet.` };
			}),
		);

		// votes options setup
		if (options.yesno) {
			this.setVotes({ upvote: [], downvote: [] });
		} else {
			let tmp = {};
			for (let i = 0; i < options.answersArr.length; i++) tmp[i] = [];
			this.setVotes(tmp);
		}

		if (this.getTimeout() !== 0)
			embed.addFields([
				{ name: "Status", value: `*Will end <t:${this.getTimeout()}:R>*`, inline: true },
			]);

		const components: ActionRowBuilder<ButtonBuilder>[] = [];
		if (options.yesno) components.push(pollYesNo);
		else {
			const btns: ButtonBuilder[] = [];
			options.answersArr.forEach((el, index) => btns.push(pollVotes[index]));
			components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(btns));
		}

		const message: Message = (await interaction.editReply({
			embeds: [embed],
			components: [...components, new ActionRowBuilder<ButtonBuilder>().addComponents(pollDelete)],
		})) as any;

		if (options.question.length > 100) {
			options.question = options.question.substring(0, 96) + "...";
		}

		if (options.thread) {
			message.startThread({ name: `${options.question}` });
		}

		this.setChannelId(interaction.channelId);
		this.setMessageId(message.id);

		(interaction.client as Client).polls.set(this.id, this);
	}
}
