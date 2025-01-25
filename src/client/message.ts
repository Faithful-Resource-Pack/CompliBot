import { Message, ActionRowBuilder, ComponentType } from "discord.js";
import { deleteInteraction, deleteMessage } from "@utility/buttons";
import { ButtonBuilder } from "discord.js";
import { ExtendedClient } from "./client";
import { strings, AllStrings } from "@helpers/strings";

declare module "discord.js" {
	interface Message {
		readonly client: ExtendedClient<true>; // so you don't have to cast it every time
		/** @param hasAuthorID whether to search for an author id in the footer or the interaction owner */
		deleteButton(hasAuthorID?: boolean): Promise<Message>;
		strings(forceEnglish?: boolean): AllStrings;
	}
}

/**
 * Adds a delete button to a given message
 * @author Nick, Evorp
 * @param hasAuthorID whether to check for an author ID in the footer for permission later
 * @returns edited message
 */
async function deleteButton(this: Message, hasAuthorID?: boolean): Promise<Message> {
	if (
		this.components[0] != undefined &&
		this.components.at(-1).components.length < 5 && //check there aren't 5 buttons
		this.components.at(-1).components[0].type === ComponentType.Button //checks there isn't a select menu
	) {
		// typed as any since we know it's a button row but discord.js doesn't
		const deleteRow = ActionRowBuilder.from<ButtonBuilder>(
			this.components.at(-1) as any,
		).addComponents(hasAuthorID ? deleteMessage : deleteInteraction);

		return this.edit({
			components: [...this.components.slice(0, -1), deleteRow],
		});
	}
	return this.edit({
		components: [
			...this.components,
			new ActionRowBuilder<ButtonBuilder>().addComponents([
				hasAuthorID ? deleteMessage : deleteInteraction,
			]),
		],
	});
}

Message.prototype.deleteButton = deleteButton;
Message.prototype.strings = strings;

export { Message };
