import { Event } from "@src/Interfaces";
import Client from "@src/Client";
import { CommandInteraction, ButtonInteraction } from "@src/Client/interaction";
import { Interaction } from "discord.js";

export const event: Event = {
	name: "interactionCreate",
	run: async (client: Client, interaction: Interaction) => {
		if (!interaction.inGuild()) return;

		if (interaction.isCommand()) {
			let _ = (interaction as CommandInteraction) instanceof CommandInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("slashCommandUsed", (client as Client, interaction));
		}
		if (interaction.isButton()) {
			let _ = (interaction as ButtonInteraction) instanceof ButtonInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("buttonUsed", (client as Client, interaction));
		}
		if (interaction.isSelectMenu()) client.emit("selectMenuUsed", (client as Client, interaction));
	},
};
