import { Image } from "@napi-rs/canvas";
import { Readable } from "stream";
import { Message, ChatInputCommandInteraction } from "@client";
import { Interaction, MessageType } from "discord.js";
import { warnUser } from "@helpers/warnUser";
import type { AnyInteraction } from "@interfaces/interactions";

// remove url metadata to use url itself (discord adds for authentication)
export const removeMetadata = (url: string) => url.split("?")[0];

export const isImage = (url: string) => url && /(png|jpg|jpeg|webp)$/g.test(removeMetadata(url));

// taken from @napi-rs/canvas.loadImage;
export type ImageSource = string | URL | Buffer | ArrayBufferLike | Uint8Array | Image | Readable;

/**
 * Get image URL from a given message if possible
 * @author Evorp
 * @param message where to get image from
 * @returns untreated URL (may have metadata)
 */
export async function getImageFromMessage(message: Message) {
	let url: string;
	if (message.attachments.size) {
		for (const attachment of message.attachments.values()) {
			url = attachment.url;
			if (isImage(url)) return url;
		}
	}

	if (message.embeds.length) {
		for (const embed of message.embeds) {
			url = embed.image?.url;
			if (isImage(url)) return url;
			url = embed.thumbnail?.url;
			if (isImage(url)) return url;
		}
	}

	// search for image urls
	url = message.content?.split(" ").find((i) => i.startsWith("http"));
	// check if url points to valid image
	if (isImage(url)) return url;

	// nothing found
	return "";
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
		const fetched = await msgOrInteraction.channel.messages.fetch({ limit });
		messages = Array.from(fetched.values());
	} catch {
		return "";
	}

	for (const message of messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp)) {
		const url = await getImageFromMessage(message);
		if (isImage(url)) return url;
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
export default async function getImage(msgOrInteraction: Message | AnyInteraction) {
	let url: string;

	// if it's a message we check if the message itself has an attachment
	if (msgOrInteraction instanceof Message) {
		url = await getImageFromMessage(msgOrInteraction);
		if (isImage(url)) return url;

		// if there's no attachment we check if it's a reply
		if (msgOrInteraction.type === MessageType.Reply) {
			let original: Message;
			try {
				original = await msgOrInteraction.fetchReference();
			} catch {}
			if (original) url = await getImageFromMessage(original);
			if (isImage(url)) return url;
		}
	}

	// if it's a slash command we check if the image property exists and use that
	if (msgOrInteraction instanceof ChatInputCommandInteraction) {
		url = msgOrInteraction.options.getAttachment("image", false)?.url;
		if (isImage(url)) return url;
	}

	// no url in message found so we search the channel
	url = await getImageFromChannel(msgOrInteraction);
	if (isImage(url)) return url;

	// no URL found at all
	return "";
}

/**
 * Warn the user that the image could not be found
 * @author Evorp
 * @param interaction interaction to reply to
 */
export async function imageNotFound(interaction: AnyInteraction | Message) {
	return warnUser(
		interaction,
		interaction.strings(interaction instanceof Message).error.image.not_found,
		interaction.strings(interaction instanceof Message).error.image.suggestion,
	);
}
