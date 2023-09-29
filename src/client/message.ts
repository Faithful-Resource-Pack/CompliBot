import { Message, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";
import { deleteInteraction, deleteMessage } from "@helpers/buttons";
import { colors } from "@helpers/colors";
import { ButtonBuilder } from "discord.js";
import axios from "axios";
import { Client } from "@client";

declare module "discord.js" {
	interface Message {
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
