import { Event } from "@src/Interfaces";
import { Client, Message, MessageEmbed } from "@src/Extended Discord";
import { info } from "@helpers/logger";
import { MessageAttachment } from "discord.js";
import { zipToMA } from "@functions/zipToMessageAttachments";
import axios, { AxiosResponse } from "axios";
import { postSubmitedTextureEmbed } from "@functions/postSubmittedTextureEmbed";

export const event: Event = {
	name: "textureSubmitted",
	run: async (client: Client, message: Message) => {
		if (!client.tokens.dev) return; // only for devs now

		if (client.verbose) console.log(`${info}Texture submitted!`);

		if (message.attachments.size === 0) return message.warn("No images were attached!", true);

		let files: Array<MessageAttachment> = [];
		const currAttch = [...message.attachments.values()];

		for (let i = 0; i < currAttch.length; i++) {
			let attachment = currAttch[i];

			// attachments that are non zip archives
			if (attachment.contentType !== "application/zip") files.push(attachment);
			else {
				let zipFiles: Array<MessageAttachment> = await zipToMA(attachment.url);
				files = [...files, ...zipFiles];
			}
		}

		files.forEach(async (file: MessageAttachment) => {
			let req: AxiosResponse<any, any>;
			try {
				req = await axios.get(`${client.config.apiUrl}textures/${file.name.replace(".png", "")}/all`);
			} catch (_err) {
				return message.warn(
					`An API error occured:\n\`\`\`(${_err.response.data.status}) ${_err.response.data.message}\`\`\``,
					true,
				);
			}

			const textures = req.data.filter((t) => t.name === file.name.replace(".png", ""));

			if (textures.length < 1) return message.warn(`No textures found for \`${file.name.replace(".png", "")}\``, true);

			// todo add select menu
			if (textures.length > 1)
				return message.reply(
					`Multiple results for \`${file.name}\`, please select one below:\n>(WIP add select menu here)`,
				);

			await postSubmitedTextureEmbed(message, textures[0], file);
		});

		// try {
		//   message.delete();
		// } catch { /* message already deleted */ }
	},
};
