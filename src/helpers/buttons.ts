import { MessageActionRow, MessageButton } from "discord.js";
import { ids, parseId } from "./emojis";

/* TODO: uncomment once compare button is properly made

export const compare = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.compare))
	.setCustomId("compare")
 */
export const palette = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.palette))
	.setCustomId("palette");
export const magnify = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.magnify))
	.setCustomId("magnify");
export const tile = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.tile))
	.setCustomId("tile");

export const deleteMessage = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.delete))
	.setCustomId("deleteMessage");
export const deleteInteraction = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.delete))
	.setCustomId("deleteInteraction");

// ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
export const pollVote1 = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji("1️⃣")
	.setCustomId("pollVote__0");
export const pollVote2 = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji("2️⃣")
	.setCustomId("pollVote__1");
export const pollVote3 = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji("3️⃣")
	.setCustomId("pollVote__2");
export const pollVote4 = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji("4️⃣")
	.setCustomId("pollVote__3");
export const pollVote5 = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji("5️⃣")
	.setCustomId("pollVote__4");

export const pollUpvote = new MessageButton()
	.setStyle("SUCCESS")
	.setEmoji(parseId(ids.upvote))
	.setCustomId("pollVote__upvote");
export const pollDownvote = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.downvote))
	.setCustomId("pollVote__downvote");

export const pollDelete = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.delete))
	.setCustomId("pollDelete");

export const pollVotes = [pollVote1, pollVote2, pollVote3, pollVote4, pollVote5];
export const pollYesNo = new MessageActionRow().addComponents([pollUpvote, pollDownvote]);

export const imageButtons = new MessageActionRow().addComponents([
	magnify,
	tile,
	palette,
	// compare,
]);
