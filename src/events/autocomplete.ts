import { AutocompleteInteraction } from "discord.js";
import type { Event } from "@interfaces/events";
import minecraftSorter from "@utility/minecraftSorter";

export default {
	name: "autocomplete",
	async execute(client, interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);

		// several commands have a version field and this reduces code duplication
		if (focusedOption.name === "version") {
			const filtered = focusedOption.value
				? client.versions.filter((v) => v.startsWith(focusedOption.value))
				: client.versions;

			const mapped = filtered
				.sort(minecraftSorter)
				.reverse() // newest at top
				.map((version) => ({ name: version, value: version }));

			return interaction.respond(mapped.length > 25 ? mapped.slice(0, 25) : mapped);
		}

		const command = client.commands.get(interaction.commandName);
		if (command) return command.autocomplete(interaction);
	},
} as Event;
