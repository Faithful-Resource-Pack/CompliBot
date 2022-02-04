import MessageEmbed from "@src/Client/embed";
import { magnifyAttachment } from "@src/Functions/canvas/magnify";
import { tileCanvas } from "@src/Functions/canvas/tile";
import { Command } from "@src/Interfaces";

export const command: Command = {
	name: "tileAndMagnify",
	description: "Magnifies and tiles an image",
	usage: ["magnify (image attachment|reply to message with image attachment)", "magnify (image url)"],
	aliases: ["tm", "tz"],
	run: async (client, message, args) => {
		let attachmentUrl: string;

		if (message.type == "REPLY" && message.channel.type == "GUILD_TEXT") {
			const reply = await message.channel.messages.fetch(message.reference.messageId);

			if (reply.attachments.size > 0) attachmentUrl = reply.attachments.first().url;
			else if (reply.embeds[0].image) attachmentUrl = reply.embeds[0].image.url;
			else if (reply.embeds[0].thumbnail) attachmentUrl = reply.embeds[0].thumbnail.url;
			else return message.warn("This reply doesn't have any image attached!");
		}

		if (args.length != 0) attachmentUrl = args[0];
		if (message.attachments.size == 1) attachmentUrl = message.attachments.first().url;

		if (attachmentUrl == undefined) {
			let messages = await message.channel.messages.fetch({ limit: 10 });

			//gets last message with at least one attachment
			const lastMessage = messages
				.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
				.filter((m) => m.attachments.size > 0 || m.embeds[0] != undefined)
				.first();

			/**
			 * bacically checks if the attachment url ends with an image extension
			 * explanation:
			 * wierd regex trolling, returns true if it contains .jpeg, .jpg, .png or .webp and a string termination ($)
			 */
			if (lastMessage == undefined) return message.warn("Nothing to magnify in the last 10 messages!");
			if (lastMessage.attachments.size > 0 && lastMessage.attachments.first().url.match(/\.(jpeg|jpg|png|webp)$/))
				attachmentUrl = lastMessage.attachments.first().url;
			else if (lastMessage.embeds[0].image) attachmentUrl = lastMessage.embeds[0].image.url;
			else if (lastMessage.embeds[0].thumbnail) attachmentUrl = lastMessage.embeds[0].thumbnail.url;
		}

		if (attachmentUrl != undefined) {
			message
				.reply({ files: [await magnifyAttachment(await tileCanvas({ url: attachmentUrl }))] })
				.then((res) => res.deleteReact({ authorMessage: message, deleteAuthorMessage: true }))
				.catch(() => {
					message.warn("Output exeeds the maximum of 512 x 512px²!");
				});
		} else message.warn("Nothing to tile and magnify in the last 10 messages!");
	},
};
