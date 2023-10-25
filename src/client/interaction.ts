import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Role,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	PermissionFlagsBits,
	InteractionReplyOptions,
	BaseInteraction,
} from "discord.js";
import { strings, AllStrings } from "@helpers/strings";
import { EmbedBuilder } from "@client";
import { colors } from "@utility/colors";
import { ExtendedClient } from "./client";

export type PermissionType = "manager" | "dev" | "moderator" | "council";

declare module "discord.js" {
	// applies to all interaction subtypes, much more convenient
	interface BaseInteraction {
		client: ExtendedClient; // so you don't have to cast it every time
		/**
		 * Load strings for a given interaction
		 * @author Evorp
		 * @param forceEnglish whether to only use english or determine language
		 * @returns all strings in the correct language
		 */
		strings(forceEnglish?: boolean): AllStrings;
		/**
		 * Check whether a user can run a given command
		 * @author Evorp
		 * @param type what role to check for
		 * @returns whether the user has permission or not
		 */
		hasPermission(type: PermissionType): boolean;
		/**
		 * Sends an ephemeral message to an already-deferred interaction
		 * @author Evorp
		 * @param options normal follow up options
		 * @returns sent message
		 */
		ephemeralReply(options: InteractionReplyOptions): Promise<Message>;
	}
}

function hasPermission(type: PermissionType): boolean {
	const hasManager = this.member.permissions.has(PermissionFlagsBits.Administrator);
	const hasModerator = this.member.permissions.has(PermissionFlagsBits.ManageMessages);
	const hasDev = this.client.tokens.developers.includes(this.member.id);
	const hasCouncil = this.member.roles.cache.some((role: Role) =>
		role.name.toLowerCase().includes("council"),
	);

	const noPermission = new EmbedBuilder()
		.setTitle(this.strings().error.permission.title)
		.setDescription(this.strings().error.permission.description.replace("%TYPE%", type))
		.setColor(colors.red);

	let out: boolean;
	switch (type) {
		case "manager":
			out = hasManager;
		case "council":
			out = hasCouncil;
		case "dev":
			out = hasDev;
		case "moderator":
			out = hasModerator;
	}

	if (!out) this.reply({ embeds: [noPermission], ephemeral: true });
	return out;
}

// quick utility method for ephemerally replying to an already-deferred message
async function ephemeralReply(options: InteractionReplyOptions) {
	// it's already deferred so we delete the non-ephemeral message
	await this.deleteReply();
	return await this.followUp({ ...options, ephemeral: true });
}

// add methods to just the base so it applies to all interaction types
BaseInteraction.prototype.hasPermission = hasPermission;
BaseInteraction.prototype.strings = strings;
BaseInteraction.prototype.ephemeralReply = ephemeralReply;

export {
	ChatInputCommandInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
};
