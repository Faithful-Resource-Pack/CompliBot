import { CommandInteraction, Message, MessageEmbed } from "@src/Extended Discord";
import imageButtons from "@src/Helpers/imageBtn";
import { MessageActionRow, MessageAttachment, MessageSelectMenu } from "discord.js";

/**
 * Check if the message has a image attached somewhere
 * @param message Discord.Message
 * @returns image URL
 */
export async function checkImage(message: Message): Promise<string> {
	// if image is attached
	if (message.attachments.size > 0 && message.attachments.first().url.match(/\.(jpeg|jpg|png|webp)$/))
		return message.attachments.first().url;
	// else if the message is an embed
	else if (message.embeds[0]) {
		// if the embeds has an image field
		if (message.embeds[0].image) return message.embeds[0].image.url;
		// else if the embed has a thumbnail field
		else if (message.embeds[0].thumbnail) return message.embeds[0].thumbnail.url;
	}

	// if no images attached to the first parent reply, check if there is another parent reply (recursivity go brr)
	if (message.type === "REPLY") return checkImage(await message.fetchReference());

	return null; // default value
}

export interface slashCommandImageOptions {
	interaction: CommandInteraction;
	limit: number;
	response: {
		title: string;
		url: string;
		description?: string;
		attachmentOptions?: any;
		attachment(options: any): Promise<MessageAttachment>;
	};
}

export async function slashCommandImage(options: slashCommandImageOptions) {
	// defer reply as those commands take longer than 3 seconds
	await options.interaction.deferReply();

	let imageURL: string = null;
	let isResponse: boolean = false;

	let message: Message;
	const messages = await options.interaction.channel.messages.fetch({ limit: options.limit });

	message = messages
		.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
		.filter(
			(m) =>
				(m.attachments.size > 0 && (m.attachments.first().url.match(/\.(jpeg|jpg|png|webp)$/) as any)) ||
				(m.embeds[0] !== undefined && (m.embeds[0].thumbnail !== null || m.embeds[0].image !== null)),
		)
		.first();

	// no valid message in the X last messages
	if (message === undefined) {
		const embed = new MessageEmbed()
			.setTitle(await options.interaction.text({ string: "Command.Images.NotFound.Title" }))
			.setDescription(
				(await options.interaction.text({ string: "Command.Images.NotFound" })).replace(
					"%NUMBER%",
					options.limit.toString(),
				),
			);

		options.interaction.editReply({ embeds: [embed] });
		const filter = (m: Message) => m.author.id === options.interaction.member.user.id;
		const collected = await options.interaction.channel.awaitMessages({
			filter: filter,
			max: 1,
			time: 30000,
			errors: ["time"],
		});

		message = collected.first();
		isResponse = true;
	}

	// get the image from the parent reply (recusivity go brr) or from the present message
	if (message) imageURL = await checkImage(message);

	// delete response message (when no images were found in last messages)
	if (isResponse) message.delete();

	if (imageURL === null) {
		options.interaction.deleteReply();
		options.interaction.followUp({
			content: await options.interaction.text({ string: "Command.Images.NoImageAttached" }),
			ephemeral: true,
		});
		return;
	}

	const embed = new MessageEmbed().setTitle(options.response.title).setImage(options.response.url);

	if (options.response.description) embed.setDescription(options.response.description);

	if (!options.response.attachmentOptions) options.response.attachmentOptions = { url: imageURL };
	else options.response.attachmentOptions["url"] = imageURL;

	const file: MessageAttachment = await options.response.attachment(options.response.attachmentOptions);
	if (file === null) {
		options.interaction.deleteReply();
		options.interaction.followUp({
			content: await options.interaction.text({ string: "Command.Images.TooBig" }),
			ephemeral: true,
		});
		return;
	}
	options.interaction
		.editReply({
			files: [file],
			embeds: [embed],
			components: [imageButtons],
		})
		.then((message: Message) => {
			message.deleteButton();
		});
}
