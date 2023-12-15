import { Event } from "@interfaces/events";
import { Client, ChatInputCommandInteraction } from "@client";
import { Interaction } from "discord.js";

export default {
	name: "interactionCreate",
	async execute(client: Client, interaction: Interaction) {
		if (!interaction.inGuild()) return;

		const banlist = require("@json/botbans.json");
		if (banlist.ids.indexOf(interaction.user.id) > -1) {
			// all interactions have the string() and reply() methods
			return (interaction as ChatInputCommandInteraction).reply({
				content: interaction.strings().error.botbanned,
				ephemeral: true,
			});
		}

		if (interaction.isCommand()) client.emit("slashCommandUsed", (client as Client, interaction));
		if (interaction.isButton()) client.emit("buttonUsed", (client as Client, interaction));

		if (interaction.isStringSelectMenu())
			client.emit("selectMenuUsed", (client as Client, interaction));

		if (interaction.isModalSubmit()) client.emit("modalSubmit", (client as Client, interaction));
	},
} as Event;
