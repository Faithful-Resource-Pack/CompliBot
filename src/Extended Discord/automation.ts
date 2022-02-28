import { Submission } from "@helpers/class/submissions";
import { addMinutes } from "@helpers/dates";
import { ids, parseId } from "@helpers/emojis";
import { Client, MessageEmbed } from "@src/Extended Discord";
import { Message, TextChannel, User } from "discord.js";

export class Automation {
	private ticking: boolean = true;
	private client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public pause() {
		this.ticking = !this.ticking;
	}

	public start() {
		setInterval(() => {
			if (!this.ticking) return;

			// submissions check:
			this.client.submissions.each((s: Submission) => {
				const submission = new Submission(s); // get methods back
				
				if (submission.isTimeout()) {
					const [up, down] = submission.getVotesCount();
					const [upvoters, downvoters] = submission.getVotes();

					switch (submission.getStatus()) {
						case "pending":
							
							let channel: TextChannel;
							let message: Message;
							this.client.channels.fetch(submission.getChannelId())
								.then((c: TextChannel) => {
									channel = c; return c.messages.fetch(submission.getMessageId());
								})
								.then((m: Message) => {
									message = m;
									return m.embeds[0].footer.text.split(' | ')[1];
								})
								.then((userID: string) => this.client.users.fetch(userID))
								.then((user: User) => {
									const embed = new MessageEmbed()
										.setTitle("Votes for your submission")
										.setURL(`https://discord.com/channels/${channel.guildId}/${channel.id}/${message.id}`)
										.addFields(
											{ name: "Upvotes", value: `${parseId(ids.upvote)} ${up > 0 ? `<@!${upvoters.join('>,\n<@!')}>` : "None"}` },
											{ name: "Downvotes", value: `${parseId(ids.downvote)} ${down > 0 ? `<@!${downvoters.join('>,\n<@!')}>` : "None"}` }
										)

									user.send({ embeds: [embed] })
										.catch(null); // DM closed
								})
								.catch(null);
								
							if (up >= down) {
								submission
									.setStatus("council", this.client)
									.setTimeout(addMinutes(new Date(), 1440)); // now + 1 day
								this.client.submissions.set(submission.id, submission)
							}
							else {
								submission.setStatus("no_council", this.client);
								this.client.submissions.delete(submission.id);
							}

							submission.updateSubmissionMessage(this.client, null);
							break;
					
						case "council":
							if (up > down) submission.setStatus("added", this.client).createContribution();
							else submission.setStatus("denied", this.client);

							submission.updateSubmissionMessage(this.client, null);
							this.client.submissions.delete(submission.id);
						default:
							break;
					}
				}
			})
		}, 1000); // each second
	}
}
