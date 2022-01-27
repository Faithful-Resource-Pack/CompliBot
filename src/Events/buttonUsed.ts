import { ButtonInteraction } from "discord.js";
import { Event } from "@src/Interfaces";
import Client from "@src/Client";

export const event: Event = {
	name: "buttonUsed",
	run: async (client: Client, interaction: ButtonInteraction) => {
		return;
	},
};
