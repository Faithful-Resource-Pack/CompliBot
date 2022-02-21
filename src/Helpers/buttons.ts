import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import { ids, parseId } from "./emojis";

export const compare = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.compare))
	.setCustomId("compare")
	.setDisabled(true); //todo enable once compare button is made
export const palette = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.palette))
	.setCustomId("palette")
	.setDisabled(true); //todo enable once palette button is made
export const magnify = new MessageButton().setStyle("PRIMARY").setEmoji(parseId(ids.magnify)).setCustomId("magnify");
export const tile = new MessageButton().setStyle("PRIMARY").setEmoji(parseId(ids.tile)).setCustomId("tile");

export const instapass = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.instapass))
	.setCustomId("submissionInstapass")
export const invalidate = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.invalid))
	.setCustomId("submissionInvalidate");

export const see_more = new MessageButton()
	.setStyle("SECONDARY")
	.setEmoji(parseId(ids.see_more))
	.setCustomId("submissionSeeMore");
export const see_less = new MessageButton()
	.setStyle("SECONDARY")
	.setEmoji(parseId(ids.see_less))
	.setCustomId("submissionSeeLess");

export const deleteMessage = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.delete))
	.setCustomId("deleteMessage");
export const deleteInteraction = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.delete))
	.setCustomId("deleteInteraction");

export const upvote = new MessageButton()
	.setStyle("SUCCESS")
	.setEmoji(parseId(ids.upvote))
	.setCustomId("submissionUpvote")
	.setDisabled(true); // todo enable once it's done
export const downvote = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.downvote))
	.setCustomId("submissionDownvote")
	.setDisabled(true); // todo enable once it's done

export const imageButtons = new MessageActionRow().addComponents([magnify, tile, palette, compare]);
export const submissionButtonsOpen = new MessageActionRow().addComponents([
	see_less,
	deleteMessage,
	instapass,
	invalidate,
]);
export const submissionButtonsClosed = new MessageActionRow().addComponents([
	magnify,
	tile,
	palette,
	compare,
	see_more,
]);
export const submissionsButtons = new MessageActionRow().addComponents([
	magnify,
	tile,
	palette,
	compare,
	deleteMessage
])
export const submissionButtonsVotes = new MessageActionRow().addComponents([upvote, downvote]);
