import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import { ids, parseId } from "./emojis";

const compare = new MessageButton().setStyle("SECONDARY").setEmoji(parseId(ids.compare)).setCustomId("compare").setDisabled(true); //todo enable once compare button is made
const palette = new MessageButton().setStyle("SECONDARY").setEmoji(parseId(ids.palette)).setCustomId("palette").setDisabled(true); //todo enable once palette button is made
const magnify = new MessageButton().setStyle("SECONDARY").setEmoji(parseId(ids.magnify)).setCustomId("magnify");
const tile = new MessageButton().setStyle("SECONDARY").setEmoji(parseId(ids.tile)).setCustomId("tile");
const imageButtons = new MessageActionRow().addComponents([magnify, tile, palette, compare]);
export default imageButtons;
