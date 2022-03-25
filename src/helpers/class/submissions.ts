import { magnifyAttachment } from "@functions/canvas/magnify";
import { minecraftSorter } from "@functions/minecraftSorter";
import {
	submissionButtonsClosedEnd,
	submissionButtonsClosed,
	submissionButtonsVotes,
	submissionButtonsVotesCouncil,
} from "@helpers/buttons";
import { addMinutes } from "@helpers/dates";
import { ids, parseId } from "@helpers/emojis";
import { Client, Message, MessageEmbed } from "@client";
import { EmbedField, MessageActionRow, MessageAttachment, TextChannel } from "discord.js";
import axios from "axios";
import { colors } from "@helpers/colors";
import { TimedEmbed } from "./timedEmbed";
import { getCorrespondingCouncilChannel, getSubmissionChannelName } from "@helpers/channels";
import { getResourcePackFromName } from "@functions/getResourcePack";

// where "in" & "out" are both at the ends of the process but "in" -> go to the pack, "out" -> not enough votes
export type SubmissionStatus = "pending" | "instapassed" | "added" | "no_council" | "council" | "denied" | "invalid";

export class Submission extends TimedEmbed {
	constructor(data?: Submission) {
		super(data);

		// new
		if (!data) this.setTimeout(addMinutes(new Date(), 4320));
		// if (!data) this.setTimeout(addMinutes(new Date(), 1)); // for dev
	}

	public setStatus(status: string, client: Client): this {
		super.setStatus(status);

		// send message to inform council members
		switch (status) {
			case "council":
			case "denied":
			case "invalid":
				client.channels
					.fetch(getCorrespondingCouncilChannel(client, this.getChannelId()))
					.then((channel: TextChannel) => {
						const [up, down] = this.getVotesCount();
						const [upvoters, downvoters] = this.getVotes();

						const embed: MessageEmbed = new MessageEmbed()
							.setTitle(`A texture is ${status === "council" ? `in ${status}` : status}`)
							.setURL(`https://discord.com/channels/${channel.guildId}/${this.getChannelId()}/${this.getMessageId()}`)
							.setDescription(
								`${
									status === "council"
										? "Please, vote here!"
										: `Please, give a reason for ${status === "denied" ? "denying" : "invalidating"} the texture.`
								}`,
							);

						if (status === "council")
							embed.addFields(
								{
									name: "Upvotes",
									value: `${parseId(ids.upvote)} ${up > 0 ? `<@!${upvoters.join(">,\n<@!")}>` : "None"}`,
								},
								{
									name: "Downvotes",
									value: `${parseId(ids.downvote)} ${down > 0 ? `<@!${downvoters.join(">,\n<@!")}>` : "None"}`,
								},
							);

						channel.send({ embeds: [embed] }).then((message: Message) => {
							if (status === "council") message.startThread({ name: "Debate about that texture!" });
						});

						this.voidVotes();
					})
					.catch(null); // channel can't be fetched
				break;

			default:
				break;
		}

		return this;
	}

	public getVotesUI(): [string, string] {
		let votes = this.getVotesCount();
		return [
			`${parseId(ids.upvote)} ${votes[0]} Upvote${votes[0] > 1 ? "s" : ""}`,
			`${parseId(ids.downvote)} ${votes[1]} Downvote${votes[1] > 1 ? "s" : ""}`,
		];
	}

	public getStatusUI(): string {
		switch (this.getStatus()) {
			case "council":
				return `${parseId(ids.pending)} Waiting for council votes...`;
			case "instapassed":
				return `${parseId(ids.instapass)} Instapassed by %USER%`;
			case "added":
				return `${parseId(ids.upvote)} This textures will be added in a future version!`;
			case "invalid":
				return `${parseId(ids.invalid)} Invalidated by %USER%`;
			case "denied":
				return `${parseId(ids.downvote)} This texture won't be added.`;
			case "pending":
				return `${parseId(ids.pending)} Waiting for votes...`;
			case "no_council":
				return `${parseId(ids.downvote)} Not enough votes to go to council!`;
			default:
				return super.getStatusUI();
		}
	}

	public async updateSubmissionMessage(client: Client, userId: string): Promise<void> {
		let channel: TextChannel;
		let message: Message;

		// waky method to turns json object to json object with methods (methods aren't saved and needs to be fetched)
		try {
			channel = (await client.channels.fetch(this.getChannelId())) as any;
			message = await channel.messages.fetch(this.getMessageId());
		} catch {
			// message / channel can't be fetched
			return;
		}

		const embed: MessageEmbed = new MessageEmbed(message.embeds[0]);
		let components: Array<MessageActionRow> = message.components;

		switch (this.getStatus()) {
			case "no_council":
			case "added":
				embed.setColor(this.getStatus() === "added" ? colors.green : colors.black);
				embed.fields = embed.fields.map((field: EmbedField) => {
					if (field.name === "Status") field.value = this.getStatusUI();

					return field;
				});
				// remove until field
				embed.fields = embed.fields.filter((field: EmbedField) => field.name !== "Until");
				components = [submissionButtonsClosedEnd];
				break;

			case "council":
				embed.setColor(colors.council);
				embed.fields = embed.fields.map((field: EmbedField) => {
					if (field.name === "Status") field.value = this.getStatusUI();
					if (field.name === "Until") field.value = `<t:${this.getTimeout()}>`;
					if (field.name === "Votes") field.value = this.getVotesUI().join(",\n");
					return field;
				});

				components = [submissionButtonsClosed, submissionButtonsVotesCouncil];
				break;

			case "instapassed":
				embed.setColor(colors.yellow);
				// update status
				embed.fields = embed.fields.map((field: EmbedField) => {
					field.value =
						field.name === "Status"
							? (field.value = this.getStatusUI().replace("%USER%", `<@!${userId}>`))
							: field.value;
					return field;
				});
				// remove until field
				embed.fields = embed.fields.filter((field: EmbedField) => field.name !== "Until");
				components = [submissionButtonsClosedEnd];
				break;

			case "denied":
			case "invalid":
				embed.setColor(this.getStatus() === "denied" ? colors.black : colors.red);
				embed.fields = embed.fields.map((field: EmbedField) => {
					// update status
					if (field.name === "Status") field.value = this.getStatusUI().replace("%USER%", `<@!${userId}>`);
					// change until field for a reason field
					else if (field.name === "Until") {
						field.value = "Use `/reason` to set up a reason!";
						field.name = "Reason";
					}

					return field;
				});
				components = [submissionButtonsClosedEnd];
				break;

			case "pending":
			default:
				break; // nothing
		}

		// always update votes
		embed.fields = embed.fields.map((field: EmbedField) => {
			field.value = field.name === "Votes" ? (field.value = this.getVotesUI().join(",\n")) : field.value;
			return field;
		});
		await message.edit({ embeds: [embed], components: [...components] });
		return;
	}

	public async postSubmissionMessage(
		client: Client,
		baseMessage: Message,
		file: MessageAttachment,
		texture: any,
	): Promise<Message> {
		const embed = await this.makeSubmissionMessage(baseMessage, file, texture);
		const submissionMessage: Message = await baseMessage.channel.send({
			embeds: [embed],
			components: [submissionButtonsClosed, submissionButtonsVotes],
		});

		this.setChannelId(baseMessage.channel.id);
		this.setMessageId(submissionMessage);
		client.submissions.set(this.id, this);

		return submissionMessage;
	}

	public async makeSubmissionMessage(
		baseMessage: Message,
		file: MessageAttachment,
		texture: any,
	): Promise<MessageEmbed> {
		const files: Array<MessageAttachment> = [];
		const mentions = [
			...new Set([...Array.from(baseMessage.mentions.users.values()), baseMessage.author].map((user) => user.id)),
		];

		const embed = new MessageEmbed()
			.setTitle(`[#${texture.id}] ${texture.name}`)
			.setAuthor({ iconURL: baseMessage.author.avatarURL(), name: baseMessage.author.username })
			.addField("Tags", texture.tags.join(", "))
			.addField("Contributor(s)", `<@!${mentions.join(">\n<@!")}>`, true)
			.addField(
				"Resource Pack",
				`\`${getSubmissionChannelName(baseMessage.client as Client, baseMessage.channelId)}\``,
				true,
			)
			.addField("Votes", this.getVotesUI().join(",\n"))
			.addField("Status", this.getStatusUI())
			.addField("Until", `<t:${this.getTimeout()}>`, true)
			.setFooter({ text: `${this.id} | ${baseMessage.author.id}` }); // used to authenticate the submitter (for message deletion)

		// add description if there is one
		if (baseMessage.content !== "" || baseMessage.content !== undefined) embed.setDescription(baseMessage.content);

		//* avoid message attachment to be deleted by Discord API when message is edited
		let channel: TextChannel;
		try {
			channel = (await baseMessage.client.channels.fetch("946432206530826240")) as any;
		} catch {
			return embed;
		} // can't fetch channel

		let url: string = "https://raw.githubusercontent.com/Compliance-Resource-Pack/App/main/resources/transparency.png";
		try {
			url = (
				await axios.get(
					`${(baseMessage.client as Client).config.apiUrl}textures/${texture.id}/url/default/${
						texture.paths[0].versions.sort(minecraftSorter).reverse()[0]
					}`,
				)
			).request.res.responseUrl;
		} catch {}

		// magnified x16 texture in thumbnail
		const magnifiedAttachment = (await magnifyAttachment({ url: url, name: "magnified.png", embed: null }))[0];

		// saved attachments in a private message
		const messageAttachment = await channel.send({ files: [file, magnifiedAttachment] });
		messageAttachment.attachments.forEach((ma: MessageAttachment) => files.push(ma));

		// set submitted texture in image
		embed.setImage(files[0].url);
		embed.setThumbnail(files[1].url);

		return embed;
	}

	public async createContribution(client: Client) {
		

		client.channels
			.fetch(this.getChannelId())
			.then((c: TextChannel) => {
				// get the submission message
				return c.messages.fetch(this.getMessageId());
			})
			.then((m: Message) => {
				// collect required information to make the contribution
				let texture: string = m.embeds[0].title.split(' ').filter(el => el.charAt(0) === '[' && el.charAt(1) === '#' && el.slice(-1) == "]").map(el => el.slice(2, el.length - 1))[0];
				let authors: Array<string> = m.embeds[0].fields.filter(f => f.name === "Contributor(s)")[0].value.split('\n').map(auth => auth.replace('<@!', '').replace('>', ''));
				let date: number = m.createdTimestamp;
				let ressourcePack = getResourcePackFromName(client, m.embeds[0].fields.filter(f => f.name === "Resource Pack")[0].value.replaceAll('`', ''));
				let resolution = ressourcePack.resolution;
				let pack = ressourcePack.slug;

				// send the contribution
				return axios.post(`http://localhost:8000/v2/contributions`, { date, pack, resolution, authors, texture }, { headers: { bot: client.tokens.apiPassword } })
			})
			.then((res) => res.data) // axios data response
			.then((contribution) => {
				// todo: GITHUB PUSH TO EACH BRANCHHH + CORRESPONDING REPO
			})
			.catch(console.error)
	}
}
