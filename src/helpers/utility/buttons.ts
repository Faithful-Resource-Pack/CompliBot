import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { emojis } from "@utility/emojis";

export const compare = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(emojis.compare)
	.setCustomId("compare");
export const palette = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(emojis.palette)
	.setCustomId("palette");
export const magnify = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(emojis.magnify)
	.setCustomId("magnify");
export const tile = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(emojis.tile)
	.setCustomId("tile");
export const flip = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(emojis.flip)
	.setCustomId("flip");
export const rotate = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(emojis.rotate)
	.setCustomId("rotate");

export const template = new ButtonBuilder()
	.setStyle(ButtonStyle.Primary)
	.setEmoji(emojis.question_mark)
	.setCustomId("comparisonTemplate");

export const deleteMessage = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(emojis.delete)
	.setCustomId("deleteMessage");
export const deleteInteraction = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(emojis.delete)
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
	.setEmoji(emojis.upvote)
	.setCustomId("pollVote__upvote");
export const pollDownvote = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(emojis.downvote)
	.setCustomId("pollVote__downvote");

export const pollDelete = new ButtonBuilder()
	.setStyle(ButtonStyle.Danger)
	.setEmoji(emojis.delete)
	.setCustomId("pollDelete");

export const pollVotes = [pollVote1, pollVote2, pollVote3, pollVote4, pollVote5];
export const pollYesNo = new ActionRowBuilder<ButtonBuilder>().addComponents(
	pollUpvote,
	pollDownvote,
);

export const magnifyButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(tile, palette);

export const imageButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
	magnify,
	tile,
	palette,
);

export const tileButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
	tile,
	rotate,
	flip,
	palette,
);

export const textureButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
	tile,
	palette,
	compare,
);
