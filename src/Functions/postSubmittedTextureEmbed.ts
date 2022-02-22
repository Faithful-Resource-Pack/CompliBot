import { Message, MessageEmbed } from "@src/Extended Discord";
import { MessageAttachment } from "discord.js";
import { Config } from "@interfaces/config";
import ConfigJson from "@/config.json";
import { magnifyAttachment } from "./canvas/magnify";
import axios from "axios";
import { minecraftSorter } from "./minecraftSorter";

export const addMinutes = (d: Date, minutes: number): Date => {
	return new Date(d.getTime() + minutes * 60000);
};

export const postSubmitedTextureEmbed = async (message: Message, texture: any, file: MessageAttachment) => {
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
		.addField("Status", `Waiting votes`)
		.addField("Until", `<t:${(addMinutes(new Date(), 4320).getTime() / 1000).toFixed(0)}>`, true) // 4320 is 3 days
		.setImage(file.proxyURL)
		.setThumbnail("attachment://magnified.png");

	if (message.content !== "" || message.content !== undefined) embed.setDescription(message.content);

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
	message.channel.send({ embeds: [embed], files: [...files] });
};
