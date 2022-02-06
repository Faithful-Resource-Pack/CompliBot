import { Message, MessageEmbed } from "@src/Extended Discord";
import { TextChannel } from "discord.js";

export async function quote(message: Message) {
	let file;
	var embed = new MessageEmbed();

	let matches = /https:\/\/(canary\.)?discord(app)?\.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/g.exec(
		message.content,
	);

	if (matches === null) return;

	let ids = [matches[3], matches[4], matches[5]];

	let channel = message.guild.channels.cache.get(ids[1]) as TextChannel;
	let quotedMsg = await channel.messages.fetch(ids[2]);

	if (quotedMsg.embeds[0] != undefined) {
		embed.setAuthor({
			name: `Embed sent by ${quotedMsg.author.tag}`,
			iconURL: "https://database.compliancepack.net/images/bot/quote.png",
		});

		if (quotedMsg.embeds[0].title != undefined) embed.setTitle(quotedMsg.embeds[0].title);
		if (quotedMsg.embeds[0].url != undefined) embed.setURL(quotedMsg.embeds[0].url);

		if (quotedMsg.embeds[0].thumbnail != undefined) embed.setThumbnail(quotedMsg.embeds[0].thumbnail.url);
		else embed.setThumbnail(quotedMsg.author.displayAvatarURL());
	} else {
		if (quotedMsg.attachments.size > 0 && quotedMsg.attachments.first().url.match(/\.(jpeg|jpg|png|webp|gif)$/))
			embed.setImage(quotedMsg.attachments.first().url);

		embed
			.setAuthor({
				name: `Message sent by ${quotedMsg.author.tag}`,
				iconURL: "https://database.compliancepack.net/images/bot/quote.png",
			})
			.setThumbnail(quotedMsg.author.displayAvatarURL())
			.setDescription(quotedMsg.content);
	}

	embed.setFooter({ text: `Quoted by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
	message.reply({ embeds: [embed] }).then((message: Message) => message.deleteButton());
}
