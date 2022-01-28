import Client from "@src/Client";
import { Interaction } from "discord.js";
import { Event } from "@src/Interfaces";
import CommandInteraction from "@src/Client/commandInteraction";

export const event: Event = {
	name: "interactionCreate",
	run: async (client: Client, interaction: Interaction) => {
		if (!interaction.inGuild()) return;

		if (interaction.isCommand()) client.emit("slashCommandUsed", (client as Client, interaction as CommandInteraction));
		if (interaction.isButton()) client.emit("buttonUsed", (client as Client, interaction));
		if (interaction.isSelectMenu()) client.emit("selectMenuUsed", (client as Client, interaction));
	},
};
