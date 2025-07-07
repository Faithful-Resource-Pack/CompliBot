import { Message, ActionRowBuilder, ComponentType, ActionRow } from "discord.js";
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
	// djs v14.19 workaround
	const actionRow = this.components.at(-1) as ActionRow<any>;
	const deleteComponent = hasAuthorID ? deleteMessage : deleteInteraction;
	if (
		this.components[0] != undefined &&
		actionRow.components.length < 5 && // check there aren't 5 buttons
		actionRow.components[0].type === ComponentType.Button // checks there isn't a select menu
	) {
		const deleteRow =
			ActionRowBuilder.from<ButtonBuilder>(actionRow).addComponents(deleteComponent);

		return this.edit({
			components: [...this.components.slice(0, -1), deleteRow],
		});
	}
	return this.edit({
		components: [
			...this.components,
			new ActionRowBuilder<ButtonBuilder>().addComponents(deleteComponent),
		],
	});
}

Message.prototype.deleteButton = deleteButton;
Message.prototype.strings = strings;

export { Message };
