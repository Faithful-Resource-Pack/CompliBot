import { Message, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";
import { deleteInteraction, deleteMessage } from "@helpers/buttons";
import { colors } from "@helpers/colors";
import settings from "@json/dynamic/settings.json";
import { ButtonBuilder } from "discord.js";

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

	/**
	 *  Warn the message by replying to it with an embed
	 *  @author Juknum, Nick
	 *  @param text - The text to warn the user with
	 *  @param disappearing - Optional bool. If undefined or false it wont delete the warning. If true it will  delete in 30s.
	 *  @param timeout - Optional number (in seconds). If defined it will delete the warning after the timeout. If not defined it will delete in 30s.
	 */
	async warn(text: string, disappearing?: boolean, timeout?: number) {
		if (!timeout) timeout = 30;

		const embed = new EmbedBuilder()
			.setColor(colors.red)
			.setThumbnail(settings.images.error)
			.setTitle("Action failed!")
			.setDescription(text)
			.setFooter({
				text: disappearing ? `This warning & original message will be deleted in ${timeout}s.` : "",
				iconURL: this.client.user.displayAvatarURL(),
			});

		let replyMsg: Message;

		try {
			replyMsg = await this.reply({ embeds: [embed] });
		} catch {
			replyMsg = await this.channel.send({ embeds: [embed] });
		} // message can't be fetched

		if (disappearing) {
			setTimeout(() => {
				try {
					replyMsg.delete();
					if (this.deletable) this.delete();
				} catch {
					// already deleted
				}
			}, timeout * 1000); // deletes the message after 30s
		} else {
			try {
				replyMsg.deleteButton(true);
			} catch (err) {
				this.channel.send({ embeds: [embed] });
			}
		}
	},
};

Object.keys(ExtendedMessage).forEach((key) => {
	Message.prototype[key] = ExtendedMessage[key];
});

export { Message };
