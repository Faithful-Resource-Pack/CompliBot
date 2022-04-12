import { MessageActionRow, MessageButton } from "discord.js";
import { ids, parseId } from "./emojis";

export const compare = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.compare))
	.setCustomId("compare")
	.setDisabled(true); //todo enable once compare button is made
export const palette = new MessageButton().setStyle("PRIMARY").setEmoji(parseId(ids.palette)).setCustomId("palette");
export const magnify = new MessageButton().setStyle("PRIMARY").setEmoji(parseId(ids.magnify)).setCustomId("magnify");
export const tile = new MessageButton().setStyle("PRIMARY").setEmoji(parseId(ids.tile)).setCustomId("tile");

export const instapass = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.instapass))
	.setCustomId("submissionInstapass");
export const invalidate = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.invalid))
	.setCustomId("submissionInvalidate");

export const view_votes = new MessageButton()
	.setStyle("PRIMARY")
	.setEmoji(parseId(ids.view_votes))
	.setCustomId("submissionViewVotes");

export const see_more = new MessageButton()
	.setStyle("SECONDARY")
	.setEmoji(parseId(ids.see_more))
	.setCustomId("submissionSeeMore");
export const see_more_end = new MessageButton()
	.setStyle("SECONDARY")
	.setEmoji(parseId(ids.see_more))
	.setCustomId("submissionSeeMoreEnd");
export const see_less = new MessageButton()
	.setStyle("SECONDARY")
	.setEmoji(parseId(ids.see_less))
	.setCustomId("submissionSeeLess");
export const see_less_end = new MessageButton()
	.setStyle("SECONDARY")
	.setEmoji(parseId(ids.see_less))
	.setCustomId("submissionSeeLessEnd");

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
	.setCustomId("submissionUpvote");
export const downvote = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.downvote))
	.setCustomId("submissionDownvote");
export const upvoteCouncil = new MessageButton()
	.setStyle("SUCCESS")
	.setEmoji(parseId(ids.upvote))
	.setCustomId("submissionUpvoteCouncil");
export const downvoteCouncil = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.downvote))
	.setCustomId("submissionDownvoteCouncil");

// ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
export const pollVote1 = new MessageButton().setStyle("PRIMARY").setEmoji("1️⃣").setCustomId("pollVote__0");
export const pollVote2 = new MessageButton().setStyle("PRIMARY").setEmoji("2️⃣").setCustomId("pollVote__1");
export const pollVote3 = new MessageButton().setStyle("PRIMARY").setEmoji("3️⃣").setCustomId("pollVote__2");
export const pollVote4 = new MessageButton().setStyle("PRIMARY").setEmoji("4️⃣").setCustomId("pollVote__3");
export const pollVote5 = new MessageButton().setStyle("PRIMARY").setEmoji("5️⃣").setCustomId("pollVote__4");

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

export const imageButtons = new MessageActionRow().addComponents([magnify, tile, palette, compare]);
export const submissionButtonsOpen = new MessageActionRow().addComponents([
	see_less,
	view_votes,
	instapass,
	invalidate,
	deleteMessage,
]);
export const submissionButtonsOpenEnd = new MessageActionRow().addComponents([see_less_end, view_votes, deleteMessage]);
export const submissionButtonsClosed = new MessageActionRow().addComponents([
	magnify,
	tile,
	palette,
	compare,
	see_more,
]);
export const submissionButtonsClosedEnd = new MessageActionRow().addComponents([
	magnify,
	tile,
	palette,
	compare,
	see_more_end,
]);
export const submissionButtonsVotes = new MessageActionRow().addComponents([upvote, downvote]);
export const submissionButtonsVotesCouncil = new MessageActionRow().addComponents([upvoteCouncil, downvoteCouncil]);
