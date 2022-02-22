import { Message, MessageEmbed } from "@src/Extended Discord";
import { MessageAttachment } from "discord.js";
import { Config } from "@interfaces/config";
import ConfigJson from "@/config.json";
import { magnifyAttachment } from "./canvas/magnify";
import axios from "axios";
import { minecraftSorter } from "./minecraftSorter";
import { imageButtons, submissionButtonsClosed, submissionButtonsOpen, submissionButtonsVotes } from "@helpers/buttons";
import { ExtendedClient } from "@src/Extended Discord/client";

export const addMinutes = (d: Date, minutes: number): Date => {
	return new Date(d.getTime() + minutes * 60000);
};

export var SID = {};
export const setSid = (loadedSid:number) => { SID["SID"] = loadedSid; };

export const postSubmitedTextureEmbed = async (client: ExtendedClient, message: Message, texture: any, file: MessageAttachment) => {
	// sids are locked to 4 hex digits so it cannot surpass the 16 bit int limit before rolling over
	SID["SID"]++;
	if (SID["SID"] == (2^16)+1) { setSid(0); SID["SID"] = 0; }

	const config: Config = ConfigJson;
	const files: Array<MessageAttachment> = [];
	const mentions = [
		...new Set([...Array.from(message.mentions.users.values()), message.author].map((user) => user.id)),
	];

	let formattedSid: string = SID["SID"].toString(16).toUpperCase() // loads sid as 16 bit hex number
	while (formattedSid.length != 4) formattedSid = "0" + formattedSid; // pads sid out until it is 4 hex numbers long

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
		.setFooter({ text: `${formattedSid} | ${message.author.id}` }); // used to authenticate the submitter (for message deletion)
		//shows SID (submission ID) for easy communication and referencing

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

	message.channel.send({
		embeds: [embed],
		files: [...files],
		components: [submissionButtonsClosed, submissionButtonsVotes],
	});
};
