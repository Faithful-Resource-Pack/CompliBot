import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ids } from "./emojis";

export const compare = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(ids.compare)
	.setCustomId("compare");
export const palette = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(ids.palette)
	.setCustomId("palette");
export const magnify = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(ids.magnify)
	.setCustomId("magnify");
export const tile = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(ids.tile)
	.setCustomId("tile");

export const template = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(ids.flip)
	.setCustomId("comparisonTemplate");

export const deleteMessage = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(ids.delete)
	.setCustomId("deleteMessage");
export const deleteInteraction = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(ids.delete)
	.setCustomId("deleteInteraction");

export const pollVote1 = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji("1️⃣")
	.setCustomId("pollVote__0");
export const pollVote2 = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji("2️⃣")
	.setCustomId("pollVote__1");
export const pollVote3 = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji("3️⃣")
	.setCustomId("pollVote__2");
export const pollVote4 = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji("4️⃣")
	.setCustomId("pollVote__3");
export const pollVote5 = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji("5️⃣")
	.setCustomId("pollVote__4");

export const pollUpvote = new ButtonBuilder()
	.setStyle(ButtonStyle.Success)
	.setEmoji(ids.upvote)
	.setCustomId("pollVote__upvote");
export const pollDownvote = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(ids.downvote)
	.setCustomId("pollVote__downvote");

export const pollDelete = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(ids.delete)
	.setCustomId("pollDelete");

export const pollVotes = [pollVote1, pollVote2, pollVote3, pollVote4, pollVote5];
export const pollYesNo = new ActionRowBuilder<ButtonBuilder>().addComponents([
	pollUpvote,
	pollDownvote,
]);

export const imageButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([
	magnify,
	tile,
	palette,
]);
export const textureButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([
	magnify,
	tile,
	palette,
	compare,
]);
