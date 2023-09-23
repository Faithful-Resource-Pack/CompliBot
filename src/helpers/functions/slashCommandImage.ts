import { ChatInputCommandInteraction, Message, EmbedBuilder } from "@client";
import { ActionRowBuilder } from "@discordjs/builders";
import { imageButtons } from "@helpers/buttons";
import {
	Collection,
	AttachmentBuilder,
	User,
	MessageType,
	MessageActionRowComponentBuilder,
} from "discord.js";

/**
 * STEPS:
 *  1. Check if there is a message with an image in last X messages
 * 	2. Apply the given function on that image
 *  3. Construct result embed with result image
 */

/**
 * Check if there is a message with a message within the `limit` of messages in the `channel`
 * Do a await message if the userInteraction.doInteraction is set to true
 * @returns image url
 */
export async function fetchMessageImage(
	interaction: ChatInputCommandInteraction,
	limit: number,
	userInteraction: { doInteraction: boolean; user: User; time?: number },
): Promise<string> {
	// fetch X messages
	let messages: Collection<string, Message<boolean>>;
	try {
		messages = await interaction.channel.messages.fetch({ limit });
	} catch {
		return null;
	} // can't fetch messages

	let message: Message = messages
		.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
		.filter(
			(m) =>
				(m.attachments
					?.first()
					?.url?.split("?")[0]
					?.match(/\.(jpeg|jpg|png)$/) as any) ||
				m.embeds[0]?.thumbnail?.url?.split("?")[0]?.match(/\.(jpeg|jpg|png)$/) ||
				m.embeds[0]?.image?.url?.split("?")[0]?.match(/\.(jpeg|jpg|png)$/),
		)
		.first();

	// no need to await user interaction (a message has been found)
	if (message) return await getImageFromMessage(message);

	// no message found but we don't ask the user to provide an image
	if (!userInteraction.doInteraction) return null;

	// no message found but we wait for user input
	const embed = new EmbedBuilder()
		.setTitle(await interaction.getEphemeralString({ string: "Command.Images.NotFound.Title" }))
		.setDescription(
			await interaction.getEphemeralString({
				string: "Command.Images.NotFound",
				placeholders: { NUMBER: `${limit}` },
			}),
		);

	const embedMessage: Message = (await interaction.editReply({ embeds: [embed] })) as Message;
	const awaitedMessages: Collection<
		string,
		Message<boolean>
	> = await interaction.channel.awaitMessages({
		filter: (m: Message) => m.author.id === userInteraction.user.id,
		max: 1,
		time: 30000, // 30s
	});

	message = awaitedMessages
		.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
		.filter(
			(m) =>
				(m.attachments.size > 0 && (m.attachments.first().url.match(/\.(jpeg|jpg|png)$/) as any)) ||
				(m.embeds[0] !== undefined &&
					(m.embeds[0].thumbnail !== null || m.embeds[0].image !== null)),
		)
		.first();

	try {
		embedMessage.delete();
	} catch {} // waiting embed already gone

	if (message !== undefined) return await getImageFromMessage(message);
	else return null;
}

/**
 * Check if the message has a image attached somewhere
 * @returns image URL
 */
export async function getImageFromMessage(message: Message): Promise<string> {
	// priorities: thumbnail -> image -> attachment
	// thumbnail is prioritized so /texture embeds etc work properly
	const result =
		message.embeds?.[0]?.thumbnail?.url ??
		message.embeds?.[0]?.image?.url ??
		message.attachments?.first()?.url;

	if (result) return result;

	// if no images attached to the first parent reply, check if there is another parent reply (recursive go brr)
	if (message.type === MessageType.Reply) {
		try {
			await message.fetchReference();
		} catch {
			return null;
		}

		return getImageFromMessage(await message.fetchReference());
	}

	return null; // default value
}

export type ImageCommand = (args: any) => Promise<[AttachmentBuilder, EmbedBuilder]>;
export async function generalSlashCommandImage(
	interaction: ChatInputCommandInteraction,
	actionCommand: ImageCommand,
	actionCommandParams: any,
): Promise<void> {
	await interaction.deferReply();

	const attachmentUrl = interaction.options.getAttachment("image", false)?.url?.split("?")[0]; //safe navigation operator.
	const imageURL: string = attachmentUrl
		? attachmentUrl
		: await fetchMessageImage(interaction, 10, {
				doInteraction: true,
				user: interaction.user,
		  });

	if (imageURL === null) {
		await interaction.followUp({
			content: await interaction.getEphemeralString({ string: "Command.Images.NoResponse" }),
			ephemeral: true,
		});
		return;
	}

	const [attachment, embed]: [AttachmentBuilder, EmbedBuilder] = await actionCommand({
		...actionCommandParams,
		url: imageURL,
	});

	if (attachment === null) {
		await interaction.followUp({
			content: await interaction.getEphemeralString({ string: "Command.Images.TooBig" }),
			ephemeral: true,
		});
		return;
	}

	interaction
		.editReply({
			files: [attachment],
			embeds: [embed],
			components: actionCommandParams.hideButtons
				? null
				: [imageButtons as ActionRowBuilder<MessageActionRowComponentBuilder>],
		})
		.then((message: Message) => {
			message.deleteButton();
		});
}
