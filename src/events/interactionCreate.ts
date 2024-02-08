import type { Event } from "@interfaces/events";
import type { AnyInteraction } from "@interfaces/interactions";

export default {
	name: "interactionCreate",
	async execute(client, interaction: AnyInteraction) {
		if (!interaction.inGuild()) return;

		const banlist = await import("@json/botbans.json");
		if (banlist.ids.indexOf(interaction.user.id) > -1) {
			// all interactions have the string() and reply() methods
			return interaction.reply({
				content: interaction.strings().error.botbanned,
				ephemeral: true,
			});
		}

		if (interaction.isCommand()) client.emit("slashCommandUsed", interaction);
		if (interaction.isButton()) client.emit("buttonUsed", interaction);
		if (interaction.isStringSelectMenu()) client.emit("selectMenuUsed", interaction);
		if (interaction.isModalSubmit()) client.emit("modalSubmit", interaction);
	},
} as Event;
