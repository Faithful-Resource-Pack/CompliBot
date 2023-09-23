import { Event } from "@interfaces";
import {
	Client,
	ChatInputCommandInteraction,
	ButtonInteraction,
	StringSelectMenuInteraction,
} from "@client";
import { Interaction } from "discord.js";

export const event: Event = {
	name: "interactionCreate",
	run: async (client: Client, interaction: Interaction) => {
		if (!interaction.inGuild()) return;

		const banlist = require("@json/botbans.json");
		if (banlist.ids.indexOf(interaction.user.id) > -1) {
			(
				interaction as ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction
			).reply({
				content: await (
					interaction as
						| ChatInputCommandInteraction
						| ButtonInteraction
						| StringSelectMenuInteraction
				).getEphemeralString({
					string: "Command.Botban.isBanned",
				}),
				ephemeral: true,
			});
			return;
		}

		if (interaction.isCommand()) {
			let _ = (interaction as ChatInputCommandInteraction) instanceof ChatInputCommandInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("slashCommandUsed", (client as Client, interaction));
		}
		if (interaction.isButton()) {
			let _ = (interaction as ButtonInteraction) instanceof ButtonInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("buttonUsed", (client as Client, interaction));
		}

		if (interaction.isSelectMenu()) {
			let _ = (interaction as StringSelectMenuInteraction) instanceof StringSelectMenuInteraction; //! do not remove, 'force' interaction to be casted (break if removed)
			client.emit("selectMenuUsed", (client as Client, interaction));
		}
	},
};
