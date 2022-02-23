import { Message, MessageEmbed } from "@src/Extended Discord";
import { MessageAttachment } from "discord.js";
import { Config } from "@interfaces/config";
import ConfigJson from "@/config.json";
import { magnifyAttachment } from "./canvas/magnify";
import axios from "axios";
import { minecraftSorter } from "./minecraftSorter";
import { submissionButtonsClosed, submissionButtonsVotes } from "@helpers/buttons";
import { ExtendedClient } from "@src/Extended Discord/client";
import { Submission } from "./submissions";
import { addMinutes } from "@helpers/dates";

export const postSubmission = async (client: ExtendedClient, message: Message, texture: any, file: MessageAttachment) => {
	const submission: Submission = new Submission();
	const config: Config = ConfigJson;
	const files: Array<MessageAttachment> = [];
	const mentions = [
		...new Set([...Array.from(message.mentions.users.values()), message.author].map((user) => user.id)),
	];

	const embed = new MessageEmbed()
		.setTitle(`[#${texture.id}] ${texture.name}`)
		.setAuthor({ iconURL: message.author.avatarURL(), name: message.author.username })
		.addField("Tags", texture.tags.join(", "))
		.addField("Contributor(s)", `<@!${mentions.join(">\n<@!")}>`, true)
		.addField(
			"Resource Pack",
			`\`${Object.keys(config.submitChannels).filter((key) => config.submitChannels[key] === message.channel.id)[0]}\``,
			true,
		)
		.addField("Status", `Waiting for votes...`)
		.addField("Until", `<t:${(addMinutes(new Date(), 4320).getTime() / 1000).toFixed(0)}>`, true) // 4320 min is 3 days
		.setThumbnail("attachment://magnified.png")
		.setFooter({ text: `${submission.id} | ${message.author.id}` }); // used to authenticate the submitter (for message deletion)

	if (message.content !== "" || message.content !== undefined) embed.setDescription(message.content);
	if (file.url) embed.setImage(file.url);
	
	else {
		embed.setImage(`attachment://${file.name}`);
		files.push(file);
	}

	files.push(
		await magnifyAttachment({
			url: (
				await axios.get(
					`${config.apiUrl}textures/${texture.id}/url/default/${
						texture.paths[0].versions.sort(minecraftSorter).reverse()[0]
					}`,
				)
			).request.res.responseUrl,
			name: "magnified.png",
		}),
	);

	const submissionMessage: Message = await message.channel.send({
		embeds: [embed],
		files: [...files],
		components: [submissionButtonsClosed, submissionButtonsVotes],
	});

	submission.setMessage(submissionMessage);
	client.submissions.set(submission.id, submission);
};
