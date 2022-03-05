import { Message, MessageActionRow, MessageEmbed } from "discord.js";
import { ids } from "@helpers/emojis";
import { Config, Tokens } from "@helpers/interfaces";
import ConfigJson from "@/config.json";
import Menu from "@helpers/menu";
import tokens from "@/tokens.json";
import { deleteInteraction, deleteMessage } from "@helpers/buttons";

declare module "discord.js" {
	interface Message {
		tokens: Tokens;
		config: Config;
		menu: Menu;

		setMenu(choiceType: "texture" | "imageOptions", id: string): Menu;
		warn(text: string, disappearing?: boolean): void;
		deleteReact(options: Options): void;
		deleteButton(isMessage?: boolean): Promise<Message>;
	}
}

export interface DeleteReactOptions {
	authorMessage: Message;
	deleteAuthorMessage: boolean;
	previousMessage?: Message;
	authorID?: string;
}

const MessageBody = {
	config: ConfigJson,
	tokens: tokens,
	menu: undefined,

	deleteButton: async function (isMessage?: boolean): Promise<Message> {
		if (
			this.components[0] != undefined &&
			this.components.at(-1).components.length < 5 && //check there arent 5 buttons
			this.components.at(-1).components[0].type == "BUTTON" //checks there isnt a select menu
		) {
			this.components.at(-1).addComponents([isMessage === true ? deleteMessage : deleteInteraction]);

			return this.edit({
				components: [...this.components],
			});
		}
		return this.edit({
			components: [
				...this.components,
				new MessageActionRow().addComponents([isMessage === true ? deleteMessage : deleteInteraction]),
			],
		});
	},

	setMenu: function (choiceType: "texture" | "imageOptions", id: string): Menu {
		this.menu = new Menu(this, choiceType, id);
		return this.menu;
	},

	/**
	 * Add a trash can emote and await of user interaction, if used, the message is deleted
	 * - does nothing if it's DM
	 *
	 * @deprecated Use .deleteButton() instead!
	 */
	deleteReact: async function (options: DeleteReactOptions) {
		if (this.channel.type === "DM") return;

		// react using the trash can emoji
		await this.react(ids.delete).catch((err) => {
			console.trace(err);
		});

		// filter to get the right user
		const filter = (reaction, user) => {
			if (options.previousMessage)
				return (
					!user.bot &&
					ids.delete === reaction.emoji.id &&
					(user.id === options.previousMessage.author.id || user.id === options.authorID)
				);
			else
				return (
					!user.bot &&
					ids.delete === reaction.emoji.id &&
					(user.id === options.authorMessage.author.id || user.id === options.authorID)
				);
		};

		// await for reaction for 1 minute long
		this.awaitReactions({ filter: filter, max: 1, time: 60000, errors: ["time"] })
			.then(async () => {
				await this.delete().catch((err) => {
					console.trace(err);
				});

				if (options.deleteAuthorMessage === true) {
					if (options.previousMessage)
						await options.previousMessage.delete().catch((err) => {
							console.trace(err);
						});
					else
						await options.authorMessage.delete().catch((err) => {
							console.trace(err);
						});
				}
			})
			.catch(async () => {
				// on timeout:
				const reaction = this.reactions.cache.get(ids.delete);
				if (reaction)
					await reaction.remove().catch((err) => {
						console.trace(err);
					});
			});
	},

	/**
	 *  Warn the message by replying to it with an embed
	 *  @author Juknum & Nick
	 *  @param {boolean} disappearing Optional bool. If undefined or false it wont delete the warning. If true it will  delete in 30s.
	 */
	warn: async function (text: string, disappearing?: boolean) {
		const embed = new MessageEmbed()
			.setColor(this.config.colors.red)
			.setThumbnail(`${this.config.images}bot/warning.png`)
			.setTitle("Action failed")
			.setDescription(text)
			.setFooter({
				text: `Type ${this.tokens.prefix}help to get more information about commands`,
				iconURL: this.client.user.displayAvatarURL(),
			});

		const replyMsg = await this.reply({ embeds: [embed] });

		if (!disappearing) {
			try {
				replyMsg.deleteReact({ authorMessage: this, deleteAuthorMessage: true });
			} catch (err) {
				this.channel.send({ embeds: [embed] });
			}
		} else {
			setTimeout(() => {
				try {
					replyMsg.delete();
					this.delete();
				} catch {
					/* already deleted */
				}
			}, 30000); //deletes the message after 30s
		}
	},
};

Object.keys(MessageBody).forEach((key) => {
	Message.prototype[key] = MessageBody[key];
});

export { Message };
