import { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ids, parseId } from "@src/Helpers/emojis";
import { Config, Tokens } from "@src/Interfaces";
import ConfigJson from "@/config.json";
import Menu from "@src/Helpers/menu";
import tokens from "@/tokens.json";

declare module "discord.js" {
	interface Message {
		tokens: Tokens;
		config: Config;
		menu: Menu;

		setMenu(choiceType: "texture" | "imageOptions", id: string): Menu;
		warn(text: string, disappearing?: boolean): void;
		deleteReact(options: Options): void;
		deleteButton(): Promise<Message>;
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

	deleteButton: async function (): Promise<Message> {
		const btnDelete = new MessageButton().setStyle("DANGER").setEmoji(parseId(ids.delete)).setCustomId("deleteMessage");
		const buttons = new MessageActionRow().addComponents([btnDelete]);

		return this.edit({ components: [buttons] });
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
			.setThumbnail(`${this.config.images}warning.png`)
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
				replyMsg.delete();
				this.delete();
			}, 3000); //deletes the message after 30s
		}
	},
};

Object.keys(MessageBody).forEach((key) => {
	Message.prototype[key] = MessageBody[key];
});

export default Message;
