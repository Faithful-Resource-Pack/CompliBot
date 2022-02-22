import { MessageActionRow, MessageButton } from "discord.js";
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

export const deleteMessage = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.delete))
	.setCustomId("deleteMessage");
export const deleteInteraction = new MessageButton()
	.setStyle("DANGER")
	.setEmoji(parseId(ids.delete))
	.setCustomId("deleteInteraction");

export const imageButtons = new MessageActionRow().addComponents([magnify, tile, palette, compare]);