import { Message, ActionRowBuilder, ComponentType } from "discord.js";
import { deleteInteraction, deleteMessage } from "@helpers/buttons";
import { ButtonBuilder } from "discord.js";
import { ExtendedClient } from "./client";

declare module "discord.js" {
	interface Message {
		client: ExtendedClient;
		warn(text: string, disappearing?: boolean): void;
		/** @param hasAuthorID whether to search for an author id in the footer or the interaction owner */
		deleteButton(hasAuthorID?: boolean): Promise<Message>;
	}
}

export interface DeleteReactOptions {
	authorMessage: Message;
	deleteAuthorMessage: boolean;
	previousMessage?: Message;
	authorID?: string;
}

const ExtendedMessage = {
	/**
	 * Adds a delete button to a given message
	 * @author Nick, Evorp
	 * @param hasAuthorID whether to check for an author ID in the footer for permission later
	 * @returns edited message
	 */
	async deleteButton(hasAuthorID?: boolean): Promise<Message> {
		if (
			this.components[0] != undefined &&
			this.components.at(-1).components.length < 5 && //check there aren't 5 buttons
			this.components.at(-1).components[0].type === ComponentType.Button //checks there isn't a select menu
		) {
			const deleteRow = ActionRowBuilder.from(this.components.at(-1)).addComponents(
				hasAuthorID === true ? deleteMessage : deleteInteraction,
			);

			return this.edit({
				components: [...this.components.slice(0, -1), deleteRow],
			});
		}
		return this.edit({
			components: [
				...this.components,
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					hasAuthorID === true ? deleteMessage : deleteInteraction,
				]),
			],
		});
	},
};

Object.keys(ExtendedMessage).forEach((key) => {
	Message.prototype[key] = ExtendedMessage[key];
});

export { Message };
