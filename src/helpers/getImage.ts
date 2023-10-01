import { Message } from "@client";
import { Interaction, MessageType } from "discord.js";

/**
 * Get image URL from a given message if possible
 * @author Evorp
 * @param message where to get image from
 * @returns untreated URL (may have metadata)
 */
export async function getImageFromMessage(message: Message) {
	if (message.attachments.size) return message.attachments?.first().url;
	const embed = message.embeds?.[0];
	if (!embed) return "";
	return embed.thumbnail?.url || embed.image?.url || "";
}

/**
 * Get the most recent valid image URL in a channel
 * @author Evorp
 * @param msgOrInteraction for getting the channel
 * @param limit how many messages to check
 * @returns untreated url (may have metadata)
 */
export async function getImageFromChannel(msgOrInteraction: Message | Interaction, limit = 20) {
	let messages: Message[];
	try {
		messages = [...(await msgOrInteraction.channel.messages.fetch({ limit })).values()];
	} catch {
		return "";
	}

	for (const message of messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp)) {
		const url = await getImageFromMessage(message);
		if (url) return url;
	}

	// no image found in last 20 messages
	return "";
}

/**
 * Get an image from an interaction or message
 * @author Evorp
 * @param msgOrInteraction base interaction to start fetching around
 * @returns found image url (removed metadata)
 */
export default async function getImage(msgOrInteraction: Message | Interaction) {
	let url: string;
	let author: string;

	// if it's a message we check if the message itself has an attachment
	if (msgOrInteraction instanceof Message) {
		author = msgOrInteraction.author.id;
		url = await getImageFromMessage(msgOrInteraction);
		if (url) return url.split("?")[0];

		// if there's no attachment we check if it's a reply
		if (msgOrInteraction.type === MessageType.Reply) {
			let original: Message;
			try {
				original = await msgOrInteraction.fetchReference();
			} catch {}
			if (original) url = await getImageFromMessage(original);
			if (url) return url.split("?")[0];
		}
	}

	// no url in message found so we search the channel
	url = await getImageFromChannel(msgOrInteraction);
	if (url) return url.split("?")[0];

	// no URL found at all
	return "";
}