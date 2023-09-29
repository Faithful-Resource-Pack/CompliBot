import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, ModalSubmitInteraction } from "@client";

export default {
	id: "suggestionTicket",
	async execute(client: Client, interaction: ModalSubmitInteraction) {
		if (client.verbose) console.log(`${info}Suggestion submitted!`);
	},
} as Component;
